const ApiError = require("../utils/ApiError");

function notFound(req, res, next) {
  next(ApiError.notFound(`Endpoint not found: ${req.method} ${req.originalUrl}`));
}

module.exports = notFound;

