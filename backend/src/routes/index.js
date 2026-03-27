const express = require("express");

const adminRoutes = require("./adminRoutes");
const authRoutes = require("./authRoutes");
const chatRoutes = require("./chatRoutes");
const reportRoutes = require("./reportRoutes");
const userRoutes = require("./userRoutes");
const socialRoutes = require("./socialRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/chats", chatRoutes);
router.use("/reports", reportRoutes);
router.use("/admin", adminRoutes);
router.use("/social", socialRoutes);

module.exports = router;

