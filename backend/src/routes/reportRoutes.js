const express = require("express");
const { body } = require("express-validator");

const reportController = require("../controllers/reportController");
const { authenticate } = require("../middlewares/authMiddleware");
const { csrfProtection } = require("../middlewares/csrfMiddleware");
const { validateRequest } = require("../middlewares/validateMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/", reportController.listMyReports);
router.post(
  "/",
  csrfProtection,
  [
    body("reportedUser").isMongoId().withMessage("Reported user id is required."),
    body("chatId").optional().isMongoId().withMessage("Invalid chat id."),
    body("reason")
      .isLength({ min: 3, max: 200 })
      .withMessage("Reason must be between 3 and 200 characters."),
    body("details")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Details must be under 1000 characters.")
  ],
  validateRequest,
  reportController.createReport
);

module.exports = router;

