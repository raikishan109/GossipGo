const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const { USER_ROLES, USER_STATUS } = require("../config/constants");
const { env } = require("../config/env");
const User = require("../models/User");

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@gossipgo.local";
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";
  const username = process.env.ADMIN_USERNAME || "GossipGoAdmin";

  await mongoose.connect(env.MONGO_URI);

  const hashedPassword = await bcrypt.hash(password, 12);
  const admin = await User.findOneAndUpdate(
    { email },
    {
      email,
      password: hashedPassword,
      username,
      role: USER_ROLES.ADMIN,
      status: USER_STATUS.ACTIVE
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );

  console.log(`Admin ready: ${admin.email} / ${username}`);
  await mongoose.disconnect();
}

seedAdmin().catch((error) => {
  console.error("Failed to seed admin", error);
  process.exit(1);
});

