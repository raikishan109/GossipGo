const express = require("express");
const { body, param } = require("express-validator");

const userController = require("../controllers/userController");
const { authenticate } = require("../middlewares/authMiddleware");
const { csrfProtection } = require("../middlewares/csrfMiddleware");
const { validateRequest } = require("../middlewares/validateMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/me", userController.getProfile);
router.get("/history", userController.getChatHistory);

router.patch(
  "/me",
  csrfProtection,
  [
    body("username")
      .optional()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters."),
    body("avatar")
      .optional({ values: "falsy" })
      .isURL()
      .withMessage("Avatar must be a valid URL.")
  ],
  validateRequest,
  userController.updateProfile
);

router.patch(
  "/settings",
  csrfProtection,
  [
    body("theme").optional().isIn(["system", "light", "dark"]),
    body("privacy").optional().isIn(["standard", "strict"]),
    body("chatHistoryEnabled").optional().isBoolean()
  ],
  validateRequest,
  userController.updateSettings
);

router.post(
  "/block/:userId",
  csrfProtection,
  [param("userId").isMongoId().withMessage("Invalid user id.")],
  validateRequest,
  userController.blockUser
);

router.delete(
  "/block/:userId",
  csrfProtection,
  [param("userId").isMongoId().withMessage("Invalid user id.")],
  validateRequest,
  userController.unblockUser
);

module.exports = router;
