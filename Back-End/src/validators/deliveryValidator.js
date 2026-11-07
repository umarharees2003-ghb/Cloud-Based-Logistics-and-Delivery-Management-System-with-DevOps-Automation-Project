const ALLOWED_STATUSES = [
  "Pending",
  "In transit",
  "Out for delivery",
  "Delivered",
  "Delayed",
  "Cancelled",
];

const VALID_TRANSITIONS = {
  Pending: ["Pending", "In transit", "Delayed", "Cancelled"],
  "In transit": ["In transit", "Out for delivery", "Delivered", "Delayed", "Cancelled"],
  "Out for delivery": ["Out for delivery", "Delivered", "Delayed", "Cancelled"],
  Delayed: ["Delayed", "Pending", "In transit", "Out for delivery", "Delivered", "Cancelled"],
  Delivered: ["Delivered"],
  Cancelled: ["Cancelled"],
};

function validateCreateDelivery(data = {}) {
  const errors = [];
  const customer = String(data.customer || "").trim();
  const pickup = String(data.pickup || "").trim();
  const dropoff = String(data.dropoff || "").trim();

  if (!customer || customer.length < 2) {
    errors.push({ field: "customer", message: "Customer name must be at least 2 characters." });
  }

  if (!pickup) {
    errors.push({ field: "pickup", message: "Pickup location is required." });
  }

  if (!dropoff) {
    errors.push({ field: "dropoff", message: "Drop-off destination is required." });
  }

  if (data.status && !ALLOWED_STATUSES.includes(data.status)) {
    errors.push({ field: "status", message: `Status must be one of: ${ALLOWED_STATUSES.join(", ")}` });
  }

  return errors;
}

function validateStatusUpdate(data = {}, currentStatus = null) {
  const errors = [];
  const status = String(data.status || "").trim();

  if (!status || !ALLOWED_STATUSES.includes(status)) {
    errors.push({ field: "status", message: `Status must be one of: ${ALLOWED_STATUSES.join(", ")}` });
    return errors;
  }

  if (currentStatus) {
    if (currentStatus === "Delivered" && status !== "Delivered") {
      errors.push({ field: "status", message: "Cannot change status of an already delivered package." });
    } else if (currentStatus === "Cancelled" && status !== "Cancelled") {
      errors.push({ field: "status", message: "Cannot change status of a cancelled delivery." });
    } else {
      const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
      if (!allowedNext.includes(status)) {
        errors.push({
          field: "status",
          message: `Invalid transition from '${currentStatus}' to '${status}'.`,
        });
      }
    }
  }

  return errors;
}

function validateAssignDriver(data = {}) {
  const errors = [];
  const driverName = data.driver || data.driverName;
  const driverId = data.driverId;

  if (!driverName && !driverId) {
    errors.push({ field: "driver", message: "Driver name or driver ID is required." });
  }

  return errors;
}

module.exports = {
  ALLOWED_STATUSES,
  VALID_TRANSITIONS,
  validateCreateDelivery,
  validateStatusUpdate,
  validateAssignDriver,
};

