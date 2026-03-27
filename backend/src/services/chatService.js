const Chat = require("../models/Chat");

async function createChatSession({ roomId, userIds, historyEnabled }) {
  return Chat.create({
    roomId,
    users: userIds,
    historyEnabled,
    messages: []
  });
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
    status: "ended"
  })
    .sort({ endedAt: -1 })
    .limit(limit)
    .populate("users", "username avatar status");
}

module.exports = {
  createChatSession,
  appendMessage,
  endChat,
  listRetainedChatsForUser,
  listEndedChatsForUser
};
