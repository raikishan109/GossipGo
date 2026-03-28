const { createAdapter } = require("@socket.io/redis-adapter");
const { Server } = require("socket.io");

const Session = require("../models/Session");
const User = require("../models/User");
const { CHAT_STATUS, USER_STATUS } = require("../config/constants");
const { appendMessage, createChatSession, endChat } = require("../services/chatService");
const { MatchmakingService } = require("../services/matchmakingService");
const { analyzeMessage } = require("../services/moderationService");
const { verifyAccessToken } = require("../services/tokenService");
const { createAnonymousUsername } = require("../utils/anonymousName");
const { logger } = require("../utils/logger");

async function initializeSocketServer(httpServer, redisClient) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*"
    }
  });

  if (redisClient) {
    const pubClient = redisClient.duplicate();
    const subClient = redisClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
  }

  const matchmakingService = new MatchmakingService({ io, redisClient });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication token missing."));
      }

      const payload = verifyAccessToken(token);
      const session = await Session.findOne({
        tokenId: payload.tokenId,
        revokedAt: { $exists: false }
      });

      if (!session) {
        return next(new Error("Session expired."));
      }

      const user = await User.findById(payload.sub);
      if (!user || user.status === USER_STATUS.BANNED) {
        return next(new Error("Account cannot use chat."));
      }

      socket.data.user = {
        userId: user._id.toString(),
        username: user.username,
        role: user.role,
        preferences: user.preferences,
        blockedUsers: user.blockedUsers.map((item) => item.toString())
      };
      socket.data.currentRoomId = null;
      socket.data.currentChatId = null;
      socket.data.messageTimestamps = [];

      next();
    } catch (error) {
      next(error);
    }
  });

  io.on("connection", (socket) => {
    const joinRoom = ({ roomId, chatId }) => {
      socket.join(roomId);
      socket.data.currentRoomId = roomId;
      socket.data.currentChatId = chatId;
    };

    const emitMatch = async (match) => {
      const [first, second] = match.users;
      const historyEnabled =
        Boolean(first.preferences?.chatHistoryEnabled) ||
        Boolean(second.preferences?.chatHistoryEnabled);
      const [firstUser, secondUser] = await Promise.all([
        User.findById(first.userId).select("username"),
        User.findById(second.userId).select("username")
      ]);

      const chat = await createChatSession({
        roomId: match.roomId,
        userIds: [first.userId, second.userId],
        historyEnabled
      });

      await matchmakingService.registerActiveChat(match.roomId, {
        roomId: match.roomId,
        chatId: chat._id.toString(),
        status: CHAT_STATUS.ACTIVE,
        users: [first, second]
      });

      const firstAlias = createAnonymousUsername();
      const secondAlias = createAnonymousUsername();

      const [firstSockets, secondSockets] = await Promise.all([
        io.in(first.socketId).fetchSockets(),
        io.in(second.socketId).fetchSockets()
      ]);

      firstSockets.forEach((client) => {
        client.join(match.roomId);
        client.data.currentRoomId = match.roomId;
        client.data.currentChatId = chat._id.toString();
      });

      secondSockets.forEach((client) => {
        client.join(match.roomId);
        client.data.currentRoomId = match.roomId;
        client.data.currentChatId = chat._id.toString();
      });

      io.to(first.socketId).emit("chat:matched", {
        roomId: match.roomId,
        chatId: chat._id,
        partner: {
          id: second.userId,
          username: secondUser?.username || second.username || secondAlias,
          alias: secondAlias
        }
      });
      io.to(second.socketId).emit("chat:matched", {
        roomId: match.roomId,
        chatId: chat._id,
        partner: {
          id: first.userId,
          username: firstUser?.username || first.username || firstAlias,
          alias: firstAlias
        }
      });
    };

    const leaveCurrentChat = async (reason) => {
      if (!socket.data.currentRoomId || !socket.data.currentChatId) {
        return;
      }

      const roomId = socket.data.currentRoomId;
      const chatId = socket.data.currentChatId;

      await endChat(chatId, reason);
      await matchmakingService.endActiveChat(roomId);

      const roomSockets = await io.in(roomId).fetchSockets();
      roomSockets.forEach((client) => {
        client.leave(roomId);
        client.data.currentRoomId = null;
        client.data.currentChatId = null;
        if (client.id !== socket.id) {
          client.emit("chat:ended", { reason });
        }
      });
    };

    socket.on("chat:queue:join", async () => {
      try {
        if (socket.data.currentRoomId) {
          socket.emit("chat:error", { message: "You are already in a chat." });
          return;
        }

        await matchmakingService.enqueue({
          socketId: socket.id,
          ...socket.data.user
        });

        socket.emit("chat:queue:joined", {
          message: "Searching for a stranger..."
        });

        const match = await matchmakingService.attemptMatch();
        if (match) {
          await emitMatch(match);
        }
      } catch (error) {
        logger.error("Matchmaking failed", error);
        socket.emit("chat:error", { message: "Unable to join matchmaking right now." });
      }
    });

    socket.on("chat:queue:leave", async () => {
      await matchmakingService.removeFromQueue(socket.data.user.userId);
      socket.emit("chat:ended", { reason: "cancelled" });
    });

    socket.on("chat:session:set", joinRoom);

    socket.on("chat:typing", ({ isTyping }) => {
      if (!socket.data.currentRoomId) {
        return;
      }

      socket.to(socket.data.currentRoomId).emit("chat:typing:update", { isTyping });
    });

    socket.on("chat:message:send", async ({ content }) => {
      try {
        if (!socket.data.currentRoomId || !socket.data.currentChatId) {
          socket.emit("chat:error", { message: "No active chat." });
          return;
        }

        const trimmed = String(content || "").trim();
        if (!trimmed) {
          return;
        }

        const now = Date.now();
        socket.data.messageTimestamps = socket.data.messageTimestamps.filter(
          (timestamp) => now - timestamp < 10000
        );
        socket.data.messageTimestamps.push(now);

        if (socket.data.messageTimestamps.length > 12) {
          socket.emit("chat:error", { message: "You are sending messages too quickly." });
          return;
        }

        const moderation = analyzeMessage(trimmed);
        const payload = {
          id: `${socket.data.currentChatId}_${Date.now()}`,
          chatId: socket.data.currentChatId,
          senderId: socket.data.user.userId,
          content: trimmed,
          createdAt: new Date().toISOString(),
          flaggedWords: moderation.flaggedWords
        };

        await appendMessage({
          chatId: socket.data.currentChatId,
          senderId: socket.data.user.userId,
          content: trimmed,
          flaggedWords: moderation.flaggedWords,
          shouldPersist: Boolean(socket.data.user.preferences?.chatHistoryEnabled)
        });

        io.to(socket.data.currentRoomId).emit("chat:message:new", payload);
      } catch (error) {
        logger.error("Message send failed", error);
        socket.emit("chat:error", { message: "Message could not be delivered." });
      }
    });

    socket.on("chat:next", async () => {
      await leaveCurrentChat("next");
      await matchmakingService.enqueue({
        socketId: socket.id,
        ...socket.data.user
      });
      socket.emit("chat:queue:joined", { message: "Finding a new stranger..." });
      const match = await matchmakingService.attemptMatch();
      if (match) {
        await emitMatch(match);
      }
    });

    socket.on("chat:end", async () => {
      await leaveCurrentChat("ended");
    });

    socket.on("disconnect", async () => {
      await matchmakingService.removeFromQueue(socket.data.user.userId);
      await leaveCurrentChat("disconnect");
    });
  });

  return { io, matchmakingService };
}

module.exports = { initializeSocketServer };
