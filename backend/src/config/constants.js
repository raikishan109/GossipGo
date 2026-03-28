const USER_ROLES = {
  USER: "user",
  ADMIN: "admin"
};

const USER_STATUS = {
  ACTIVE: "active",
  BANNED: "banned",
  GUEST: "guest"
};

const REPORT_STATUS = {
  OPEN: "open",
  REVIEWED: "reviewed",
  RESOLVED: "resolved",
  DISMISSED: "dismissed"
};

const CHAT_STATUS = {
  WAITING: "waiting",
  ACTIVE: "active",
  ENDED: "ended",
  DISCONNECTED: "disconnected"
};

const CHAT_TYPES = {
  ANONYMOUS: "anonymous",
  DIRECT: "direct"
};

module.exports = {
  USER_ROLES,
  USER_STATUS,
  REPORT_STATUS,
  CHAT_STATUS,
  CHAT_TYPES
};
