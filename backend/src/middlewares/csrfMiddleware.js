const crypto = require("crypto");

const { HttpError } = require("../utils/httpError");

function csrfProtection(req, _res, next) {
  const token = req.headers["x-csrf-token"];
  if (!token) {
    throw new HttpError(403, "Missing CSRF token.");
  }

  const hash = crypto.createHash("sha256").update(token).digest("hex");
  if (hash !== req.session.csrfTokenHash) {
    throw new HttpError(403, "Invalid CSRF token.");
  }

  next();
}

module.exports = { csrfProtection };

