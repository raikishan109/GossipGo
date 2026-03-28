const Chat = require("../models/Chat");
const { CHAT_TYPES } = require("../config/constants");
const {
  getDirectChatForUsers,
  listRetainedChatsForUser,
  sendDirectMessage
} = require("../services/chatService");
const { asyncHandler } = require("../utils/asyncHandler");
const { HttpError } = require("../utils/httpError");

const listChats = asyncHandler(async (req, res) => {
  const chats = await listRetainedChatsForUser({
    userId: req.user._id,
    limit: 50
  });

  res.json({ chats });
});

const getChatById = asyncHandler(async (req, res) => {
  const chat = await Chat.findOne({
    _id: req.params.chatId,
    users: req.user._id,
    type: { $ne: CHAT_TYPES.DIRECT }
  }).populate("users", "username avatar status");

  if (!chat) {
    throw new HttpError(404, "Chat not found.");
  }

  res.json({ chat });
});

const getDirectChat = asyncHandler(async (req, res) => {
  const result = await getDirectChatForUsers({
    userId: req.user._id,
    friendId: req.params.friendId
  });

  res.json(result);
});

const postDirectMessage = asyncHandler(async (req, res) => {
  const result = await sendDirectMessage({
    senderId: req.user._id,
    friendId: req.params.friendId,
    content: req.body.content
  });

  res.status(201).json(result);
});

module.exports = {
  listChats,
  getChatById,
  getDirectChat,
  postDirectMessage
};
