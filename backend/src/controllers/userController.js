const Chat = require("../models/Chat");
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
  const { username, avatar } = req.body;

  if (username && username !== req.user.username) {
    const existing = await User.findOne({ username });
    if (existing && existing.id !== req.user.id) {
      throw new HttpError(409, "Username is already taken.");
    }
    req.user.username = username;
  }

  if (typeof avatar === "string") {
    req.user.avatar = avatar;
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
  blockUser,
  unblockUser
};
