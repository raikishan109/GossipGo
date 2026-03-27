const Chat = require("../models/Chat");
const Report = require("../models/Report");
const User = require("../models/User");
const { REPORT_STATUS, USER_STATUS } = require("../config/constants");
const { asyncHandler } = require("../utils/asyncHandler");
const { HttpError } = require("../utils/httpError");

const getDashboard = asyncHandler(async (req, res) => {
  const matchmakingService = req.app.locals.matchmakingService;
  const [totalUsers, guestUsers, openReports, flaggedChats] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: USER_STATUS.GUEST }),
    Report.countDocuments({ status: REPORT_STATUS.OPEN }),
    Chat.countDocuments({ flagged: true })
  ]);

  res.json({
    metrics: {
      totalUsers,
      guestUsers,
      activeChats: await matchmakingService.getActiveCount(),
      waitingUsers: await matchmakingService.getWaitingCount(),
      openReports,
      flaggedChats
    }
  });
});

const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .select("email username role status createdAt lastSeenAt");

  res.json({ users });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new HttpError(404, "User not found.");
  }

  user.status = status;
  await user.save();

  res.json({
    message: "User status updated.",
    user
  });
});

const listReports = asyncHandler(async (_req, res) => {
  const reports = await Report.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("reporterUser", "username email status")
    .populate("reportedUser", "username email status")
    .populate("chat", "roomId flagged createdAt");

  res.json({ reports });
});

const resolveReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.reportId);
  if (!report) {
    throw new HttpError(404, "Report not found.");
  }

  report.status = req.body.status;
  report.resolutionNotes = req.body.resolutionNotes || "";
  report.handledBy = req.user._id;
  report.handledAt = new Date();
  await report.save();

  res.json({
    message: "Report updated.",
    report
  });
});

const listFlaggedChats = asyncHandler(async (_req, res) => {
  const chats = await Chat.find({ flagged: true })
    .sort({ updatedAt: -1 })
    .limit(100)
    .populate("users", "username status");

  res.json({ chats });
});

module.exports = {
  getDashboard,
  listUsers,
  updateUserStatus,
  listReports,
  resolveReport,
  listFlaggedChats
};
