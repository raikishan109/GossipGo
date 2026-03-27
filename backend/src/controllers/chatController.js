const Chat = require("../models/Chat");
const { listRetainedChatsForUser } = require("../services/chatService");
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
    users: req.user._id
  }).populate("users", "username avatar status");

  if (!chat) {
    throw new HttpError(404, "Chat not found.");
  }

  res.json({ chat });
});

module.exports = {
  listChats,
  getChatById
};
