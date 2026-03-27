const { USER_ROLES } = require("../config/constants");
const { HttpError } = require("../utils/httpError");

function requireAdmin(req, _res, next) {
  if (req.user.role !== USER_ROLES.ADMIN) {
    throw new HttpError(403, "Administrator access required.");
  }

  next();
}

module.exports = { requireAdmin };

