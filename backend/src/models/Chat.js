const mongoose = require("mongoose");

const { CHAT_STATUS } = require("../config/constants");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 1200
    },
    flaggedWords: [String],
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: false
  }
);

const chatSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      unique: true,
      required: true
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    ],
    messages: [messageSchema],
    status: {
      type: String,
      enum: Object.values(CHAT_STATUS),
      default: CHAT_STATUS.ACTIVE
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    endedAt: Date,
    endedReason: String,
    historyEnabled: {
      type: Boolean,
      default: false
    },
    flagged: {
      type: Boolean,
      default: false
    },
    moderation: {
      flagCount: {
        type: Number,
        default: 0
      },
      flaggedWords: [String]
    }
  },
  {
    timestamps: true
  }
);

chatSchema.index({ users: 1, createdAt: -1 });
chatSchema.index({ flagged: 1, createdAt: -1 });

module.exports = mongoose.model("Chat", chatSchema);

