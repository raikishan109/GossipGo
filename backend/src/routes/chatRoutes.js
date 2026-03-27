const express = require("express");
const { param } = require("express-validator");

const chatController = require("../controllers/chatController");
const { authenticate } = require("../middlewares/authMiddleware");
const { validateRequest } = require("../middlewares/validateMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/", chatController.listChats);
router.get(
  "/:chatId",
  [param("chatId").isMongoId().withMessage("Invalid chat id.")],
  validateRequest,
  chatController.getChatById
);

module.exports = router;

