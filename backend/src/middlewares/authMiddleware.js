const Session = require("../models/Session");
const User = require("../models/User");
const { verifyAccessToken } = require("../services/tokenService");
const { asyncHandler } = require("../utils/asyncHandler");
const { HttpError } = require("../utils/httpError");

function extractToken(req) {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "");
  }

  return null;
}

const authenticate = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) {
    throw new HttpError(401, "Authentication required.");
  }

  const payload = verifyAccessToken(token);
  const session = await Session.findOne({
    tokenId: payload.tokenId,
    revokedAt: { $exists: false }
  });

  if (!session) {
    throw new HttpError(401, "Session is invalid or expired.");
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new HttpError(401, "User no longer exists.");
  }

  req.user = user;
  req.session = session;
  req.auth = payload;

  next();
});

module.exports = { authenticate };

