const { getPublicSignupPolicy } = require("../utils/publicSignupPolicy");

function validateRegister(data = {}) {
  const errors = [];
  const name = String(data.name || data.fullName || "").trim();
  const email = String(data.email || "").trim().toLowerCase();
  const password = String(data.password || "");
  const confirmPassword = data.confirmPassword !== undefined ? String(data.confirmPassword) : null;
  const policy = getPublicSignupPolicy(data);

  if (!name || name.length < 2) {
    errors.push({ field: "name", message: "Full name must be at least 2 characters long." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push({ field: "email", message: "Please provide a valid email address." });
  }

  if (typeof data.password !== "string" || !password || password.length < 8) {
    errors.push({ field: "password", message: "Password must be at least 8 characters long." });
  }

  if (confirmPassword !== null && confirmPassword !== password) {
    errors.push({ field: "confirmPassword", message: "Passwords do not match." });
  }

  if (policy.error) errors.push({ field: "role", message: policy.error });

  return errors;
}

function validateLogin(data = {}) {
  const errors = [];
  const email = String(data.email || "").trim().toLowerCase();
  const password = String(data.password || "");

  if (!email) {
    errors.push({ field: "email", message: "Email is required." });
  }

  if (typeof data.password !== "string" || !password) {
    errors.push({ field: "password", message: "Password is required." });
  }

  return errors;
}

module.exports = {
  validateRegister,
  validateLogin,
};

