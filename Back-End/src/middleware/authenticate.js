const { verifyToken } = require("../utils/generateToken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Authentication required. Please provide a Bearer token.");
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw ApiError.unauthorized("Token has expired. Please log in again.");
      }
      throw ApiError.unauthorized("Invalid authentication token.");
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw ApiError.unauthorized("User account not found.");
    }

    if (user.status !== "active") {
      throw ApiError.forbidden("Account is inactive or suspended. Contact an administrator.");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

// Optional authentication middleware: if token is present, populate req.user, otherwise proceed as guest
async function optionalAuthenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id);
        if (user && user.status === "active") {
          req.user = user;
        }
      } catch {
        // Ignore token errors for optional auth
      }
    }
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  authenticate,
  optionalAuthenticate,
};

