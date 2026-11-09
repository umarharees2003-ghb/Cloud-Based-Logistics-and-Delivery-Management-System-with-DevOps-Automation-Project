const DRIVER_STATUSES = ["Available", "On route", "Unavailable"];

function validateCreateDriver(data = {}) {
  const errors = [];
  const name = String(data.name || "").trim();
  const vehicle = String(data.vehicle || "").trim();
  const zone = String(data.zone || "").trim();

  if (!name || name.length < 2) {
    errors.push({ field: "name", message: "Driver name must be at least 2 characters." });
  }

  if (!vehicle) {
    errors.push({ field: "vehicle", message: "Vehicle details are required." });
  }

  if (!zone) {
    errors.push({ field: "zone", message: "Service zone is required." });
  }

  if (data.status && !DRIVER_STATUSES.includes(data.status)) {
    errors.push({ field: "status", message: `Status must be one of: ${DRIVER_STATUSES.join(", ")}` });
  }

  return errors;
}

function validateDriverStatus(data = {}) {
  const errors = [];
  const status = String(data.status || "").trim();

  if (!status || !DRIVER_STATUSES.includes(status)) {
    errors.push({ field: "status", message: `Status must be one of: ${DRIVER_STATUSES.join(", ")}` });
  }

  return errors;
}

module.exports = {
  validateCreateDriver,
  validateDriverStatus,
};

