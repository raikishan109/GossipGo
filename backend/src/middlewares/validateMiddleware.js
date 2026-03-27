const { validationResult } = require("express-validator");

const { HttpError } = require("../utils/httpError");

function validateRequest(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError(422, errors.array().map((item) => item.msg).join(" ")));
  }

  next();
}

module.exports = { validateRequest };

