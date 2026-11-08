const ALLOWED_STATUSES = ["Pending", "In transit", "Out for delivery", "Delivered", "Delayed", "Cancelled"];
const VALID_TRANSITIONS = {
  Pending: ["Pending", "In transit", "Delayed", "Cancelled"],
  "In transit": ["In transit", "Out for delivery", "Delivered", "Delayed", "Cancelled"],
  "Out for delivery": ["Out for delivery", "Delivered", "Delayed", "Cancelled"],
  Delayed: ["Delayed", "Pending", "In transit", "Out for delivery", "Delivered", "Cancelled"],
  Delivered: ["Delivered"], Cancelled: ["Cancelled"],
};
const TEXT_FIELDS = { customer: [2, 100], pickup: [1, 500], dropoff: [1, 500], recipientName: [0, 100], recipientPhone: [0, 40], packageDescription: [0, 1000], city: [0, 100] };
const EDITABLE_FIELDS = [...Object.keys(TEXT_FIELDS), "eta", "priority", "weight"];
function validateFields(data, partial = false) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return [{ field: "body", message: "A JSON object is required." }];
  const errors = [];
  for (const [field, [min, max]] of Object.entries(TEXT_FIELDS)) {
    if (data[field] === undefined && (partial || !["customer", "pickup", "dropoff"].includes(field))) continue;
    if (typeof data[field] !== "string" || data[field].trim().length < min || data[field].trim().length > max) {
      errors.push({ field, message: `${field} must be text between ${min} and ${max} characters.` });
    }
  }
  if (data.eta !== undefined && (typeof data.eta !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(data.eta))) errors.push({ field: "eta", message: "Estimated delivery time must use HH:mm (24-hour time)." });
  if (data.priority !== undefined && !["Standard", "Express", "Overnight"].includes(data.priority)) errors.push({ field: "priority", message: "Priority must be Standard, Express or Overnight." });
  if (data.weight !== undefined && (typeof data.weight !== "number" || !Number.isFinite(data.weight) || data.weight < 0 || data.weight > 100000)) errors.push({ field: "weight", message: "Weight must be a number from 0 to 100000 kg." });
  return errors;
}
function validateCreateDelivery(data = {}) {
  const errors = validateFields(data);
  if (data && data.status !== undefined && !ALLOWED_STATUSES.includes(data.status)) errors.push({ field: "status", message: `Status must be one of: ${ALLOWED_STATUSES.join(", ")}` });
  return errors;
}
function validateUpdateDelivery(data = {}) {
  const errors = validateFields(data, true);
  if (!data || typeof data !== "object" || Array.isArray(data)) return errors;
  if (!Object.keys(data).some((key) => EDITABLE_FIELDS.includes(key))) errors.push({ field: "body", message: "At least one editable delivery field is required." });
  for (const field of Object.keys(data)) if (!EDITABLE_FIELDS.includes(field)) errors.push({ field, message: "This field cannot be edited here. Use the dedicated status or driver endpoint where applicable." });
  return errors;
}
function validateStatusUpdate(data = {}, currentStatus = null) {
  const errors = [];
  if (!data || typeof data.status !== "string" || !ALLOWED_STATUSES.includes(data.status)) return [{ field: "status", message: `Status must be one of: ${ALLOWED_STATUSES.join(", ")}` }];
  if (data.remarks !== undefined && (typeof data.remarks !== "string" || data.remarks.length > 1000)) errors.push({ field: "remarks", message: "Remarks must be text no longer than 1000 characters." });
  const status = data.status;
  if (currentStatus === "Delivered" && status !== "Delivered") errors.push({ field: "status", message: "Cannot change status of an already delivered package." });
  else if (currentStatus === "Cancelled" && status !== "Cancelled") errors.push({ field: "status", message: "Cannot change status of a cancelled delivery." });
  else if (currentStatus && !(VALID_TRANSITIONS[currentStatus] || []).includes(status)) errors.push({ field: "status", message: `Invalid transition from '${currentStatus}' to '${status}'.` });
  return errors;
}
function validateAssignDriver(data = {}) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return [{ field: "driver", message: "Driver name or driver ID is required." }];
  const driver = data.driverId !== undefined ? data.driverId : data.driver !== undefined ? data.driver : data.driverName;
  if (typeof driver !== "string" || !driver.trim() || driver.length > 100 || (data.driverId !== undefined && !/^[0-9a-fA-F]{24}$/.test(driver))) return [{ field: "driver", message: "A valid driver name or driver ID is required." }];
  return [];
}
module.exports = { ALLOWED_STATUSES, VALID_TRANSITIONS, EDITABLE_FIELDS, validateCreateDelivery, validateUpdateDelivery, validateStatusUpdate, validateAssignDriver };
