const ALLOWED_ROLES = ["administrator", "logistics", "driver", "customer", "merchant"];
const ALLOWED_STATUSES = ["active", "inactive", "suspended"];

function validateCreateUser(data = {}) {
  const errors = [];
  const name = String(data.name || "").trim();
  const email = String(data.email || "").trim().toLowerCase();
  const password = String(data.password || "");
  const role = String(data.role || "customer").trim();

  if (!name || name.length < 2) {
    errors.push({ field: "name", message: "Name must be at least 2 characters." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push({ field: "email", message: "A valid email is required." });
  }

  if (!password || password.length < 8) {
    errors.push({ field: "password", message: "Password must be at least 8 characters." });
  }

  if (role && !ALLOWED_ROLES.includes(role)) {
    errors.push({ field: "role", message: `Role must be one of: ${ALLOWED_ROLES.join(", ")}` });
  }

  return errors;
}

function validateUpdateUser(data = {}) {
  const errors = [];

  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(data.email).trim().toLowerCase())) {
      errors.push({ field: "email", message: "Invalid email format." });
    }
  }

  if (data.role && !ALLOWED_ROLES.includes(data.role)) {
    errors.push({ field: "role", message: `Role must be one of: ${ALLOWED_ROLES.join(", ")}` });
  }

  if (data.status && !ALLOWED_STATUSES.includes(data.status)) {
    errors.push({ field: "status", message: `Status must be one of: ${ALLOWED_STATUSES.join(", ")}` });
  }

  return errors;
}

module.exports = {
  validateCreateUser,
  validateUpdateUser,
};

