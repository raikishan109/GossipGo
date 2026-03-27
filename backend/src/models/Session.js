const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    tokenId: {
      type: String,
      required: true,
      unique: true
    },
    csrfTokenHash: {
      type: String,
      required: true
    },
    userAgent: String,
    ipAddress: String,
    expiresAt: {
      type: Date,
      required: true
    },
    revokedAt: Date
  },
  {
    timestamps: true
  }
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Session", sessionSchema);

