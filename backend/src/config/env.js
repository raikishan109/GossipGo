const dotenv = require("dotenv");

dotenv.config();

function parseBoolean(value, fallback = false) {
  if (value === undefined) {
    return fallback;
  }

  return String(value).trim().toLowerCase() === "true";
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/gossipgo",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  USERPANEL_URL: process.env.USERPANEL_URL || "http://localhost:3000",
  ADMINPANEL_URL: process.env.ADMINPANEL_URL || "http://localhost:3001",
  BOOTSTRAP_ADMIN_ON_STARTUP: parseBoolean(
    process.env.BOOTSTRAP_ADMIN_ON_STARTUP,
    false
  ),
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || "",
  JWT_SECRET: process.env.JWT_SECRET || "replace-me-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 200),
  AUTH_RATE_LIMIT_MAX: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
  GUEST_MODE_ENABLED: parseBoolean(process.env.GUEST_MODE_ENABLED, true)
};

module.exports = { env };
