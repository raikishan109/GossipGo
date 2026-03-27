const mongoose = require("mongoose");

const { REPORT_STATUS } = require("../config/constants");

const reportSchema = new mongoose.Schema(
  {
    reporterUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat"
    },
    reason: {
      type: String,
      required: true,
      maxlength: 200
    },
    details: {
      type: String,
      maxlength: 1000
    },
    status: {
      type: String,
      enum: Object.values(REPORT_STATUS),
      default: REPORT_STATUS.OPEN
    },
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    handledAt: Date,
    resolutionNotes: String
  },
  {
    timestamps: true
  }
);

reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Report", reportSchema);

