const Report = require("../models/Report");
const { asyncHandler } = require("../utils/asyncHandler");

const createReport = asyncHandler(async (req, res) => {
  const report = await Report.create({
    reporterUser: req.user._id,
    reportedUser: req.body.reportedUser,
    chat: req.body.chatId,
    reason: req.body.reason,
    details: req.body.details
  });

  res.status(201).json({
    message: "Report submitted.",
    report
  });
});

const listMyReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ reporterUser: req.user._id })
    .sort({ createdAt: -1 })
    .populate("reportedUser", "username status");

  res.json({ reports });
});

module.exports = {
  createReport,
  listMyReports
};

