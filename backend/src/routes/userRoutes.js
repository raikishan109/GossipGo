const express = require("express");
const { body, param } = require("express-validator");

const userController = require("../controllers/userController");
const { authenticate } = require("../middlewares/authMiddleware");
const { csrfProtection } = require("../middlewares/csrfMiddleware");
const { validateRequest } = require("../middlewares/validateMiddleware");

const router = express.Router();
const avatarDataPattern = /^data:image\/(?:png|jpe?g|webp);base64,[a-z0-9+/=]+$/i;
const avatarPresetPattern = /^\/avatars\/[a-z0-9-]+\.(?:svg|png|jpe?g|webp)$/i;

router.use(authenticate);

router.get("/me", userController.getProfile);
router.get("/history", userController.getChatHistory);

router.patch(
  "/me",
  csrfProtection,
  [
    body("username")
      .optional()
      .isLength({ min: 3, max: 10 })
      .withMessage("Username must be between 3 and 10 characters."),
    body("email")
      .optional({ values: "falsy" })
      .isEmail()
      .withMessage("Email must be valid."),
    body("avatar")
      .optional({ values: "falsy" })
      .custom((value) => {
        const avatar = String(value || "").trim();

        if (!avatar) {
          return true;
        }

        if (avatarDataPattern.test(avatar)) {
          if (avatar.length > 350000) {
            throw new Error("Avatar image is too large.");
          }

          return true;
        }

        if (avatarPresetPattern.test(avatar)) {
          return true;
        }

        try {
          const url = new URL(avatar);
          if (["http:", "https:"].includes(url.protocol)) {
            return true;
          }
        } catch (_error) {
          throw new Error("Avatar must be a valid image.");
        }

        throw new Error("Avatar must be a valid image.");
      }),
    body("gender")
      .optional({ values: "falsy" })
      .isIn(["male", "female", "other"])
      .withMessage("Gender must be male, female, or other.")
  ],
  validateRequest,
  userController.updateProfile
);

router.patch(
  "/settings",
  csrfProtection,
  [
    body("theme").optional().isIn(["light", "dark"]),
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
