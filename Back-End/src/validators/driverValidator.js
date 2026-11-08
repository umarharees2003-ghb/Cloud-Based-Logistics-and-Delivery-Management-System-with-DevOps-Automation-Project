const DRIVER_STATUSES = ["Available", "On route", "Unavailable"];
const VEHICLE_TYPES = ["Van", "Truck", "Motorcycle", "Car"];
const TEXT_FIELDS = { name: [2, 100], vehicle: [1, 200], zone: [1, 100], phone: [0, 40], licenseNumber: [0, 100] };
function validateDriverFields(data, partial) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return [{ field: "body", message: "A JSON object is required." }];
  const errors = [];
  for (const [field, [min, max]] of Object.entries(TEXT_FIELDS)) {
    if (data[field] === undefined && (partial || !["name", "vehicle", "zone"].includes(field))) continue;
    if (typeof data[field] !== "string" || data[field].trim().length < min || data[field].trim().length > max) errors.push({ field, message: `${field} must be text between ${min} and ${max} characters.` });
  }
  if (data.vehicleType !== undefined && !VEHICLE_TYPES.includes(data.vehicleType)) errors.push({ field: "vehicleType", message: "Vehicle type must be Van, Truck, Motorcycle or Car." });
  if (data.status !== undefined && !DRIVER_STATUSES.includes(data.status)) errors.push({ field: "status", message: `Status must be one of: ${DRIVER_STATUSES.join(", ")}` });
  return errors;
}
function validateCreateDriver(data = {}) {
  const errors = validateDriverFields(data, false);
  if (!data || typeof data !== "object" || Array.isArray(data)) return errors;
  if (data.userId !== undefined && (typeof data.userId !== "string" || !/^[0-9a-fA-F]{24}$/.test(data.userId))) errors.push({ field: "userId", message: "A valid user ID is required." });
  if (data.email !== undefined && (typeof data.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))) errors.push({ field: "email", message: "A valid email is required." });
  if (data.password !== undefined && (typeof data.password !== "string" || data.password.length < 8)) errors.push({ field: "password", message: "Password must be at least 8 characters." });
  return errors;
}
function validateUpdateDriver(data = {}) {
  const errors = validateDriverFields(data, true);
  if (!data || typeof data !== "object" || Array.isArray(data)) return errors;
  const allowed = ["vehicle", "zone", "phone", "licenseNumber", "vehicleType"];
  if (!Object.keys(data).some((key) => allowed.includes(key))) errors.push({ field: "body", message: "At least one editable driver field is required." });
  for (const key of Object.keys(data)) if (!allowed.includes(key)) errors.push({ field: key, message: "This field cannot be changed through the driver profile endpoint." });
  return errors;
}
function validateDriverStatus(data = {}) {
  return typeof data.status === "string" && DRIVER_STATUSES.includes(data.status) ? [] : [{ field: "status", message: `Status must be one of: ${DRIVER_STATUSES.join(", ")}` }];
}
module.exports = { DRIVER_STATUSES, validateCreateDriver, validateUpdateDriver, validateDriverStatus };
