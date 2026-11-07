const jwt = require("jsonwebtoken");
const environment = require("../config/environment");

function generateToken(user) {
  const payload = {
    id: user._id ? user._id.toString() : user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  return jwt.sign(payload, environment.jwtSecret, {
    expiresIn: environment.jwtExpiresIn,
  });
}

function verifyToken(token) {
  return jwt.verify(token, environment.jwtSecret);
}

module.exports = {
  generateToken,
  verifyToken,
};

