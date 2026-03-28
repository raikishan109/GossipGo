const mongoose = require("mongoose");

const { USER_ROLES, USER_STATUS } = require("../config/constants");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      select: false
    },
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    avatar: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    friendRequests: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        type: {
          type: String,
          enum: ["sent", "received"]
        },
        requestedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    preferences: {
      theme: {
        type: String,
        enum: ["system", "light", "dark"],
        default: "light"
      },
      privacy: {
        type: String,
        enum: ["standard", "strict"],
        default: "standard"
      },
      chatHistoryEnabled: {
        type: Boolean,
        default: false
      }
    },
    lastSeenAt: Date
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      }
    }
  }
);


userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ lastSeenAt: -1 });


module.exports = mongoose.model("User", userSchema);
