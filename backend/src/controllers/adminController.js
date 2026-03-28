const Chat = require("../models/Chat");
const Report = require("../models/Report");
const Session = require("../models/Session");
const User = require("../models/User");
const {
  CHAT_STATUS,
  CHAT_TYPES,
  REPORT_STATUS,
  USER_ROLES,
  USER_STATUS
} = require("../config/constants");
const {
  ensureAdminAccount,
  getMissingBootstrapFields
} = require("../services/adminBootstrapService");
const { asyncHandler } = require("../utils/asyncHandler");
const { HttpError } = require("../utils/httpError");

const DATABASE_ACTIONS = {
  CLEAR_ENDED_CHATS: "clear-ended-chats",
  CLEAR_RESOLVED_REPORTS: "clear-resolved-reports",
  CLEAR_OTHER_SESSIONS: "clear-other-sessions"
};

const DATABASE_ACTION_CONFIRMATIONS = {
  [DATABASE_ACTIONS.CLEAR_ENDED_CHATS]: "CLEAR ENDED CHATS",
  [DATABASE_ACTIONS.CLEAR_RESOLVED_REPORTS]: "CLEAR RESOLVED REPORTS",
  [DATABASE_ACTIONS.CLEAR_OTHER_SESSIONS]: "CLEAR OTHER SESSIONS"
};

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

const getDatabaseOverview = asyncHandler(async (req, res) => {
  const matchmakingService = req.app.locals.matchmakingService;
  const [
    users,
    chats,
    reports,
    sessions,
    adminUsers,
    guestUsers,
    directChats,
    anonymousChats,
    endedChats,
    flaggedChats,
    openReports,
    resolvedReports,
    activeSessions
  ] = await Promise.all([
    User.countDocuments(),
    Chat.countDocuments(),
    Report.countDocuments(),
    Session.countDocuments(),
    User.countDocuments({ role: USER_ROLES.ADMIN }),
    User.countDocuments({ status: USER_STATUS.GUEST }),
    Chat.countDocuments({ type: CHAT_TYPES.DIRECT }),
    Chat.countDocuments({ type: CHAT_TYPES.ANONYMOUS }),
    Chat.countDocuments({ status: { $in: [CHAT_STATUS.ENDED, CHAT_STATUS.DISCONNECTED] } }),
    Chat.countDocuments({ flagged: true }),
    Report.countDocuments({ status: REPORT_STATUS.OPEN }),
    Report.countDocuments({ status: { $in: [REPORT_STATUS.RESOLVED, REPORT_STATUS.DISMISSED] } }),
    Session.countDocuments({ revokedAt: { $exists: false } })
  ]);

  res.json({
    database: {
      collections: {
        users,
        chats,
        reports,
        sessions
      },
      insights: {
        adminUsers,
        guestUsers,
        directChats,
        anonymousChats,
        endedChats,
        flaggedChats,
        openReports,
        resolvedReports,
        activeSessions
      },
      runtime: {
        activeChats: await matchmakingService.getActiveCount(),
        waitingUsers: await matchmakingService.getWaitingCount()
      }
    }
  });
});

const runDatabaseAction = asyncHandler(async (req, res) => {
  const action = String(req.body.action || "").trim();
  const confirmation = String(req.body.confirmation || "").trim();
  const expectedConfirmation = DATABASE_ACTION_CONFIRMATIONS[action];

  if (!expectedConfirmation) {
    throw new HttpError(400, "Database action is invalid.");
  }

  if (confirmation !== expectedConfirmation) {
    throw new HttpError(400, `Type ${expectedConfirmation} to confirm this action.`);
  }

  if (action === DATABASE_ACTIONS.CLEAR_ENDED_CHATS) {
    const result = await Chat.deleteMany({
      status: { $in: [CHAT_STATUS.ENDED, CHAT_STATUS.DISCONNECTED] }
    });

    res.json({
      message: `${result.deletedCount || 0} ended chats deleted.`
    });
    return;
  }

  if (action === DATABASE_ACTIONS.CLEAR_RESOLVED_REPORTS) {
    const result = await Report.deleteMany({
      status: { $in: [REPORT_STATUS.RESOLVED, REPORT_STATUS.DISMISSED] }
    });

    res.json({
      message: `${result.deletedCount || 0} resolved reports deleted.`
    });
    return;
  }

  if (action === DATABASE_ACTIONS.CLEAR_OTHER_SESSIONS) {
    const result = await Session.deleteMany({
      tokenId: { $ne: req.auth.tokenId }
    });

    res.json({
      message: `${result.deletedCount || 0} other sessions revoked.`
    });
  }
});

const resetDatabase = asyncHandler(async (req, res) => {
  const missingFields = getMissingBootstrapFields();
  if (missingFields.length > 0) {
    throw new HttpError(
      400,
      `Database reset is unavailable until admin bootstrap env vars are configured: ${missingFields.join(", ")}.`
    );
  }

  const matchmakingService = req.app.locals.matchmakingService;

  await Promise.all([
    Chat.deleteMany({}),
    Report.deleteMany({}),
    Session.deleteMany({}),
    User.deleteMany({})
  ]);

  if (matchmakingService?.resetState) {
    await matchmakingService.resetState({ disconnectClients: true });
  }

  const admin = await ensureAdminAccount({ resetPassword: true });
  if (!admin) {
    throw new HttpError(500, "Admin account could not be recreated after the reset.");
  }

  res.json({
    message: "Database reset complete. Sign in again with the admin account."
  });
});

module.exports = {
  getDashboard,
  getDatabaseOverview,
  listUsers,
  updateUserStatus,
  listReports,
  resolveReport,
  listFlaggedChats,
  runDatabaseAction,
  resetDatabase
};
