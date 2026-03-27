const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const socialController = require("../controllers/socialController");
const { authenticate } = require("../middlewares/authMiddleware");
const { csrfProtection } = require("../middlewares/csrfMiddleware");
const { validateRequest } = require("../middlewares/validateMiddleware");

router.use(authenticate);

router.get("/friends", socialController.listFriends);
router.post(
  "/friends/request",
  csrfProtection,
  [body("targetUserId").isMongoId().withMessage("Target user id is required.")],
  validateRequest,
  socialController.sendFriendRequest
);
router.get("/requests", socialController.listFriendRequests);
router.get("/favorites", socialController.listFavorites);
router.post(
  "/favorites",
  csrfProtection,
  [body("targetUserId").isMongoId().withMessage("Target user id is required.")],
  validateRequest,
  socialController.toggleFavorite
);
router.get("/history", socialController.listHistory);
router.get("/find", socialController.listDiscoverableUsers);

module.exports = router;
