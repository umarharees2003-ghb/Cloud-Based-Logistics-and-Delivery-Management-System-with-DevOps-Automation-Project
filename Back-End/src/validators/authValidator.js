function validateRegister(data = {}) {
  const errors = [];
  const name = String(data.name || data.fullName || "").trim();
  const email = String(data.email || "").trim().toLowerCase();
  const password = String(data.password || "");
  const confirmPassword = data.confirmPassword !== undefined ? String(data.confirmPassword) : null;
  const role = String(data.role || data.roleId || "").trim();

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

  if (role && !["administrator", "logistics", "driver", "customer", "merchant"].includes(role)) errors.push({ field: "role", message: "Unsupported role." });

  // Prevent privilege escalation in public registration
  const privilegedRoles = ["administrator", "logistics", "driver"];
  if (role && privilegedRoles.includes(role)) {
    const roleLabel = { administrator: "System Administrator", logistics: "Logistics Manager / Operations Staff", driver: "Delivery Driver / Courier" }[role];
    errors.push({
      field: "role",
      message: `Privileged accounts require administrator approval. Ask an administrator to create your ${roleLabel} account in Team & access (role: ${role}), then use Sign in. Public signup cannot grant staff privileges.`,
    });
  }

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

