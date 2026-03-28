const { USER_ROLES, USER_STATUS } = require("../config/constants");
const Chat = require("../models/Chat");
const Report = require("../models/Report");
const Session = require("../models/Session");
const User = require("../models/User");
const { listRetainedChatsForUser } = require("../services/chatService");
const { asyncHandler } = require("../utils/asyncHandler");
const { HttpError } = require("../utils/httpError");

const getProfile = asyncHandler(async (req, res) => {
  res.json({
    user: req.user
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { username, avatar, email, gender } = req.body;

  if (username && username !== req.user.username) {
    const existing = await User.findOne({ username });
    if (existing && existing.id !== req.user.id) {
      throw new HttpError(409, "Username is already taken.");
    }
    req.user.username = username;
  }

  if (typeof avatar === "string") {
    req.user.avatar = avatar.trim();
  }

  if (typeof email === "string") {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      req.user.email = undefined;
    } else {
      if (req.user.status === USER_STATUS.GUEST) {
        throw new HttpError(400, "Guest accounts cannot add an email.");
      }

      const existing = await User.findOne({ email: normalizedEmail });
      if (existing && existing.id !== req.user.id) {
        throw new HttpError(409, "Email is already in use.");
      }

      req.user.email = normalizedEmail;
    }
  }

  if (typeof gender === "string") {
    req.user.gender = gender.trim().toLowerCase();
  }

  await req.user.save();

  res.json({
    message: "Profile updated.",
    user: req.user
  });
});

const updateSettings = asyncHandler(async (req, res) => {
  const { theme, privacy, chatHistoryEnabled } = req.body;

  if (theme) {
    req.user.preferences.theme = theme;
  }

  if (privacy) {
    req.user.preferences.privacy = privacy;
  }

  if (typeof chatHistoryEnabled === "boolean") {
    req.user.preferences.chatHistoryEnabled = chatHistoryEnabled;
  }

  await req.user.save();

  res.json({
    message: "Settings saved.",
    user: req.user
  });
});

const deleteAccount = asyncHandler(async (req, res) => {
  if (req.user.role === USER_ROLES.ADMIN) {
    throw new HttpError(403, "Admin accounts cannot be deleted from the user panel.");
  }

  const userId = req.user._id;
  const userIdString = userId.toString();
  const io = req.app.locals.io;
  const matchmakingService = req.app.locals.matchmakingService;

  if (matchmakingService?.removeFromQueue) {
    await matchmakingService.removeFromQueue(userIdString);
  }

  if (io?.fetchSockets) {
    const sockets = await io.fetchSockets();
    const userSockets = sockets.filter((socket) => socket.data?.user?.userId === userIdString);
    await Promise.all(userSockets.map((socket) => socket.disconnect(true)));
  }

  await Promise.all([
    User.updateMany(
      { _id: { $ne: userId } },
      {
        $pull: {
          blockedUsers: userId,
          friends: userId,
          favorites: userId,
          friendRequests: { user: userId }
        }
      }
    ),
    Chat.deleteMany({ users: userId }),
    Report.deleteMany({
      $or: [{ reporterUser: userId }, { reportedUser: userId }]
    }),
    Session.deleteMany({ user: userId })
  ]);

  await req.user.deleteOne();

  res.json({
    message: "Account deleted."
  });
});

const getChatHistory = asyncHandler(async (req, res) => {
  const chats = await listRetainedChatsForUser({
    userId: req.user._id,
    limit: 25,
    populateUsers: true
  });

  res.json({
    chats
  });
});

const blockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (req.user.blockedUsers.some((blockedId) => blockedId.toString() === userId)) {
    return res.json({ message: "User already blocked." });
  }

  req.user.blockedUsers.push(userId);
  await req.user.save();

  res.json({
    message: "User blocked."
  });
});

const unblockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  req.user.blockedUsers = req.user.blockedUsers.filter(
    (blockedId) => blockedId.toString() !== userId
  );
  await req.user.save();

  res.json({
    message: "User unblocked."
  });
});

module.exports = {
  getProfile,
  updateProfile,
  updateSettings,
  getChatHistory,
  deleteAccount,
  blockUser,
  unblockUser
};
