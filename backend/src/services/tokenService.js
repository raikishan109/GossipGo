const crypto = require("crypto");

const jwt = require("jsonwebtoken");

const { env } = require("../config/env");
const Session = require("../models/Session");

function createHash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

async function issueAuthArtifacts({ user, ipAddress, userAgent }) {
  const tokenId = crypto.randomUUID();
  const csrfToken = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await Session.create({
    user: user._id,
    tokenId,
    csrfTokenHash: createHash(csrfToken),
    ipAddress,
    userAgent,
    expiresAt
  });

  const token = jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      status: user.status,
      tokenId
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return {
    token,
    csrfToken
  };
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

async function revokeSessionByTokenId(tokenId) {
  await Session.findOneAndUpdate(
    { tokenId },
    {
      revokedAt: new Date()
    }
  );
}

module.exports = {
  issueAuthArtifacts,
  verifyAccessToken,
  revokeSessionByTokenId
};

