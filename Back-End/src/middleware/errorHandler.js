const logger = require("../config/logger");
const environment = require("../config/environment");
const ApiError = require("../utils/ApiError");

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
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
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal server error";
    error = new ApiError(statusCode, message, [], false);
  }

  // Log error with Winston
  if (error.statusCode >= 500) {
    logger.error("Unhandled Server Error: %s\n%s", error.message, err.stack);
  } else {
    logger.warn("Client Error [%d %s]: %s", error.statusCode, req.path, error.message);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors || [],
  };

  if (!environment.isProduction && err.stack) {
    response.stack = err.stack;
  }

  res.status(error.statusCode).json(response);
}

module.exports = errorHandler;

