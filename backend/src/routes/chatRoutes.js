const express = require("express");
const { body, param } = require("express-validator");

const chatController = require("../controllers/chatController");
const { authenticate } = require("../middlewares/authMiddleware");
const { csrfProtection } = require("../middlewares/csrfMiddleware");
const { validateRequest } = require("../middlewares/validateMiddleware");

const router = express.Router();

router.use(authenticate);

router.get(
  "/direct/:friendId",
  [param("friendId").isMongoId().withMessage("Invalid friend id.")],
  validateRequest,
  chatController.getDirectChat
);
router.post(
  "/direct/:friendId/messages",
  csrfProtection,
  [
    param("friendId").isMongoId().withMessage("Invalid friend id."),
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Message is required.")
      .isLength({ max: 1200 })
      .withMessage("Message must be 1200 characters or fewer.")
  ],
  validateRequest,
  chatController.postDirectMessage
);
router.get("/", chatController.listChats);
router.get(
  "/:chatId",
  [param("chatId").isMongoId().withMessage("Invalid chat id.")],
  validateRequest,
  chatController.getChatById
);

module.exports = router;
