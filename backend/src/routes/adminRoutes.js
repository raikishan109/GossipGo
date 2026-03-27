const express = require("express");
const { body, param } = require("express-validator");

const adminController = require("../controllers/adminController");
const { REPORT_STATUS, USER_STATUS } = require("../config/constants");
const { requireAdmin } = require("../middlewares/adminMiddleware");
const { authenticate } = require("../middlewares/authMiddleware");
const { csrfProtection } = require("../middlewares/csrfMiddleware");
const { validateRequest } = require("../middlewares/validateMiddleware");

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get("/dashboard", adminController.getDashboard);
router.get("/users", adminController.listUsers);
router.get("/reports", adminController.listReports);
router.get("/chats/flagged", adminController.listFlaggedChats);

router.patch(
  "/users/:userId/status",
  csrfProtection,
  [
    param("userId").isMongoId().withMessage("Invalid user id."),
    body("status").isIn([USER_STATUS.ACTIVE, USER_STATUS.BANNED, USER_STATUS.GUEST])
  ],
  validateRequest,
  adminController.updateUserStatus
);

router.patch(
  "/reports/:reportId",
  csrfProtection,
  [
    param("reportId").isMongoId().withMessage("Invalid report id."),
    body("status").isIn(Object.values(REPORT_STATUS)),
    body("resolutionNotes").optional().isLength({ max: 1000 })
  ],
  validateRequest,
  adminController.resolveReport
);

module.exports = router;
