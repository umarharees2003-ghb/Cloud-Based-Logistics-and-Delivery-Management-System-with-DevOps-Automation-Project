const environment = require("../config/environment");

// A role selected in the browser is accepted only within this server-side policy.
function getPublicSignupPolicy(data = {}) {
  const input = data.role !== undefined ? data.role : data.roleId;
  const role = input === undefined ? "customer" : typeof input === "string" ? input.trim() : null;

  if (!["administrator", "customer", "merchant", "driver", "logistics"].includes(role)) {
    return { role, error: "Unsupported role. Choose Customer, Merchant, Driver or Logistics Manager." };
  }
  if (role === "administrator") {
    return { role, error: "Privileged accounts require secure administrator provisioning. Public signup can never create a System Administrator account." };
  }
  if (["driver", "logistics"].includes(role) && !environment.allowPublicStaffSignup) {
    return {
      role,
      error: "Privileged accounts require administrator approval while public staff signup is disabled. Ask an administrator to provision this account, or enable ALLOW_PUBLIC_STAFF_SIGNUP=true in the local demo configuration, then register again.",
    };
  }
  return { role, error: null };
}

module.exports = { getPublicSignupPolicy };
