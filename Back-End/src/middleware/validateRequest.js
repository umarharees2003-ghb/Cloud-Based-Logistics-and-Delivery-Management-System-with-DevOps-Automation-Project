const ApiError = require("../utils/ApiError");

function validateRequest(validatorFn, source = "body") {
  return (req, res, next) => {
    const data = req[source];
    const errors = validatorFn(data);

    if (errors && errors.length > 0) {
      return next(ApiError.unprocessable("Validation failed", errors));
    }

    next();
  };
}

module.exports = validateRequest;

