const Chat = require("../models/Chat");
const User = require("../models/User");
const { CHAT_TYPES } = require("../config/constants");
const { analyzeMessage } = require("./moderationService");
const { HttpError } = require("../utils/httpError");

async function createChatSession({ roomId, userIds, historyEnabled }) {
  return Chat.create({
    type: CHAT_TYPES.ANONYMOUS,
    roomId,
    users: userIds,
    historyEnabled,
    messages: []
  });
}

function hasRelationship(items = [], targetUserId) {
  return items.some((item) => item.toString() === targetUserId);
}

function buildDirectChatKey(userIds) {
  return [...userIds].map((id) => id.toString()).sort().join(":");
}

function buildDirectRoomId(directChatKey) {
  return `direct_${directChatKey.replace(/:/g, "_")}`;
}

async function validateDirectChatParticipants(userId, friendId) {
  if (userId.toString() === friendId.toString()) {
    throw new HttpError(400, "You cannot chat with yourself.");
  }

  const [currentUser, friend] = await Promise.all([
    User.findById(userId).select("friends blockedUsers"),
    User.findById(friendId).select("username avatar status lastSeenAt friends blockedUsers")
  ]);

  if (!currentUser || !friend) {
    throw new HttpError(404, "User not found.");
  }

  // Use the current user's friend list as the source of truth for direct chat access.
  if (!hasRelationship(currentUser.friends, friendId)) {
    throw new HttpError(403, "You can only chat with users in your friend list.");
  }

  if (
    hasRelationship(currentUser.blockedUsers, friendId) ||
    hasRelationship(friend.blockedUsers, userId)
  ) {
    throw new HttpError(403, "This user is unavailable for chat.");
  }

  return { friend };
}

async function getPopulatedChatById(chatId) {
  return Chat.findById(chatId)
    .populate("users", "username avatar status lastSeenAt")
    .populate("messages.sender", "username avatar");
}

async function getOrCreateDirectChat(userId, friendId) {
  const directChatKey = buildDirectChatKey([userId, friendId]);

  const directChat = await Chat.findOneAndUpdate(
    {
      type: CHAT_TYPES.DIRECT,
      directChatKey
    },
    {
      $setOnInsert: {
        type: CHAT_TYPES.DIRECT,
        directChatKey,
        roomId: buildDirectRoomId(directChatKey),
        users: [userId, friendId],
        historyEnabled: true,
        messages: []
      }
    },
    {
      upsert: true,
      new: true
    }
  );

  return getPopulatedChatById(directChat._id);
}

async function appendMessage({
  chatId,
  senderId,
  content,
  flaggedWords = [],
  shouldPersist = false
}) {
  const update = {};

  if (shouldPersist || flaggedWords.length) {
    update.$push = {
      messages: {
        sender: senderId,
        content,
        flaggedWords,
        createdAt: new Date()
      }
    };
  }

  if (flaggedWords.length) {
    update.$set = {
      flagged: true
    };
    update.$inc = {
      "moderation.flagCount": flaggedWords.length
    };
    update.$addToSet = {
      "moderation.flaggedWords": { $each: flaggedWords }
    };
  }

  if (Object.keys(update).length === 0) {
    return Chat.findById(chatId);
  }

  return Chat.findByIdAndUpdate(chatId, update, { new: true });
}

async function endChat(chatId, reason) {
  return Chat.findByIdAndUpdate(
    chatId,
    {
      status: reason === "disconnect" ? "disconnected" : "ended",
      endedAt: new Date(),
      endedReason: reason
    },
    { new: true }
  );
}

async function listRetainedChatsForUser({ userId, limit = 50, populateUsers = false }) {
  let query = Chat.find({
    users: userId,
    type: { $ne: CHAT_TYPES.DIRECT },
    $or: [{ historyEnabled: true }, { flagged: true }]
  })
    .sort({ createdAt: -1 })
    .limit(limit);

  if (populateUsers) {
    query = query.populate("users", "username avatar status");
  }

  return query;
}

async function listEndedChatsForUser(userId, { limit = 50 } = {}) {
  return Chat.find({
    users: userId,
    type: { $ne: CHAT_TYPES.DIRECT },
    status: "ended"
  })
    .sort({ endedAt: -1 })
    .limit(limit)
    .populate("users", "username avatar status");
}

async function getDirectChatForUsers({ userId, friendId }) {
  const { friend } = await validateDirectChatParticipants(userId, friendId);
  const chat = await getOrCreateDirectChat(userId, friendId);

  return { chat, friend };
}

async function sendDirectMessage({ senderId, friendId, content }) {
  const trimmed = String(content || "").trim();

  if (!trimmed) {
    throw new HttpError(400, "Message cannot be empty.");
  }

  const { friend } = await validateDirectChatParticipants(senderId, friendId);
  const chat = await getOrCreateDirectChat(senderId, friendId);
  const moderation = analyzeMessage(trimmed);

  await appendMessage({
    chatId: chat._id,
    senderId,
    content: trimmed,
    flaggedWords: moderation.flaggedWords,
    shouldPersist: true
  });

  const updatedChat = await getPopulatedChatById(chat._id);

  return {
    chat: updatedChat,
    friend
  };
}

module.exports = {
  createChatSession,
  appendMessage,
  endChat,
  listRetainedChatsForUser,
  listEndedChatsForUser,
  getDirectChatForUsers,
  sendDirectMessage
};
