const bcrypt = require("bcryptjs");

const { USER_STATUS } = require("../config/constants");
const User = require("../models/User");
const { issueAuthArtifacts, revokeSessionByTokenId } = require("../services/tokenService");
const { createAnonymousUsername } = require("../utils/anonymousName");
const { asyncHandler } = require("../utils/asyncHandler");
const { HttpError } = require("../utils/httpError");

const register = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body;

  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    throw new HttpError(409, "Email or username is already in use.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    email,
    password: hashedPassword,
    username
  });

  const auth = await issueAuthArtifacts({
    user,
    ipAddress: req.ip,
    userAgent: req.get("user-agent")
  });

  res.status(201).json({
    message: "Account created successfully.",
    ...auth,
    user
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new HttpError(401, "Invalid email or password.");
  }

  if (user.status === USER_STATUS.BANNED) {
    throw new HttpError(403, "Your account has been banned.");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new HttpError(401, "Invalid email or password.");
  }

  user.lastSeenAt = new Date();
  await user.save();

  const auth = await issueAuthArtifacts({
    user,
    ipAddress: req.ip,
    userAgent: req.get("user-agent")
  });

  res.json({
    message: "Logged in successfully.",
    ...auth,
    user
  });
});

const loginGuest = asyncHandler(async (req, res) => {
  const username = createAnonymousUsername();
  const user = await User.create({
    username,
    status: USER_STATUS.GUEST
  });

  const auth = await issueAuthArtifacts({
    user,
    ipAddress: req.ip,
    userAgent: req.get("user-agent")
  });

  res.status(201).json({
    message: "Guest session created.",
    ...auth,
    user
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({
    user: req.user
  });
});


const logout = asyncHandler(async (req, res) => {
  await revokeSessionByTokenId(req.auth.tokenId);
  res.json({
    message: "Logged out successfully."
  });
});

module.exports = {
  register,
  login,
  loginGuest,
  me,
  logout
};

