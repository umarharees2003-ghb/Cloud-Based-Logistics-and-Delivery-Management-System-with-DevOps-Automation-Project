const logger = require("../config/logger");
const environment = require("../config/environment");
const ApiError = require("../utils/ApiError");

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  let error = err;

  // Handle Mongoose Validation Error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((el) => ({
      field: el.path,
      message: el.message,
    }));
    error = ApiError.unprocessable(errors.map(({ field, message }) => `${field}: ${message}`).join(" "), errors);
  }

  // Handle Mongoose Duplicate Key Error
  else if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    error = ApiError.conflict(`Duplicate value for '${field}'. This resource already exists.`);
  }

  // Handle Mongoose Invalid ObjectId
  else if (err.name === "CastError") {
    error = ApiError.badRequest(`Invalid resource identifier for field '${err.path}'`);
  }

  else if (err.name === "VersionError") {
    error = ApiError.conflict("Delivery changed during this request. Reload and try again.");
  }

  // Handle SyntaxError in request body
  else if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    error = ApiError.badRequest("Malformed JSON in request body");
  }

  // Wrap unexpected errors into internal ApiError
  else if (!(error instanceof ApiError)) {
    const suppliedStatus = Number(error.statusCode || error.status);
    const statusCode = Number.isInteger(suppliedStatus) && suppliedStatus >= 400 && suppliedStatus <= 599 ? suppliedStatus : 500;
    const message = error.message || "Internal server error";
    error = new ApiError(statusCode, message, [], false);
  }

  // Log error with Winston
  if (error.statusCode >= 500) {
    logger.error("Request failed", { requestId: req.id, method: req.method, path: req.path, statusCode: error.statusCode, errorMessage: error.message, stack: err.stack });
  } else {
    logger.warn("Request rejected", { requestId: req.id, method: req.method, path: req.path, statusCode: error.statusCode, errorMessage: error.message });
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: environment.isProduction && error.statusCode >= 500 ? "Internal server error" : error.message,
    requestId: req.id || undefined,
    errors: error.errors || [],
  };

  if (!environment.isProduction && err.stack) {
    response.stack = err.stack;
  }

  res.status(error.statusCode).json(response);
}

module.exports = errorHandler;

