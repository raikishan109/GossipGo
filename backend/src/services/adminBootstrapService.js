const bcrypt = require("bcryptjs");

const { USER_ROLES, USER_STATUS } = require("../config/constants");
const { env } = require("../config/env");
const User = require("../models/User");
const { logger } = require("../utils/logger");

function getMissingBootstrapFields() {
  return [
    ["ADMIN_EMAIL", env.ADMIN_EMAIL],
    ["ADMIN_PASSWORD", env.ADMIN_PASSWORD],
    ["ADMIN_USERNAME", env.ADMIN_USERNAME]
  ]
    .filter(([, value]) => !String(value || "").trim())
    .map(([name]) => name);
}

async function ensureAdminAccount({ resetPassword = false } = {}) {
  const missingFields = getMissingBootstrapFields();
  if (missingFields.length > 0) {
    logger.warn(
      `Skipping admin bootstrap. Missing required env vars: ${missingFields.join(", ")}`
    );
    return null;
  }

  const email = env.ADMIN_EMAIL.trim().toLowerCase();
  const username = env.ADMIN_USERNAME.trim();
  const password = env.ADMIN_PASSWORD;

  const existingAdmin = await User.findOne({ email }).select("+password");

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const admin = await User.create({
      email,
      password: hashedPassword,
      username,
      role: USER_ROLES.ADMIN,
      status: USER_STATUS.ACTIVE
    });

    logger.info(`Admin account created for ${admin.email}`);
    return admin;
  }

  let shouldSave = false;

  if (existingAdmin.username !== username) {
    existingAdmin.username = username;
    shouldSave = true;
  }

  if (existingAdmin.role !== USER_ROLES.ADMIN) {
    existingAdmin.role = USER_ROLES.ADMIN;
    shouldSave = true;
  }

  if (existingAdmin.status !== USER_STATUS.ACTIVE) {
    existingAdmin.status = USER_STATUS.ACTIVE;
    shouldSave = true;
  }

  if (resetPassword) {
    existingAdmin.password = await bcrypt.hash(password, 12);
    shouldSave = true;
  }

  if (shouldSave) {
    await existingAdmin.save();
  }

  logger.info(`Admin account ready for ${existingAdmin.email}`);
  return existingAdmin;
}

async function bootstrapAdminOnStartup() {
  if (!env.BOOTSTRAP_ADMIN_ON_STARTUP) {
    return null;
  }

  return ensureAdminAccount();
}

module.exports = {
  getMissingBootstrapFields,
  ensureAdminAccount,
  bootstrapAdminOnStartup
};
