const express = require("express");
const { body } = require("express-validator");

const authController = require("../controllers/authController");
const { env } = require("../config/env");
const { authenticate } = require("../middlewares/authMiddleware");
const { csrfProtection } = require("../middlewares/csrfMiddleware");
const { authRateLimiter } = require("../middlewares/rateLimiter");
const { validateRequest } = require("../middlewares/validateMiddleware");

const router = express.Router();

router.post(
  "/register",
  authRateLimiter,
  [
    body("email").isEmail().withMessage("A valid email is required."),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long."),
    body("username")
      .isLength({ min: 3, max: 10 })
      .withMessage("Username must be between 3 and 10 characters.")
  ],
  validateRequest,
  authController.register
);

router.post(
  "/login",
  authRateLimiter,
  [
    body("email").isEmail().withMessage("A valid email is required."),
    body("password").notEmpty().withMessage("Password is required.")
  ],
  validateRequest,
  authController.login
);

router.post("/guest", authRateLimiter, (req, res, next) => {
  if (!env.GUEST_MODE_ENABLED) {
    return res.status(403).json({ message: "Guest mode is disabled." });
  }

  return authController.loginGuest(req, res, next);
});

router.get("/me", authenticate, authController.me);
router.post("/logout", authenticate, csrfProtection, authController.logout);

module.exports = router;
