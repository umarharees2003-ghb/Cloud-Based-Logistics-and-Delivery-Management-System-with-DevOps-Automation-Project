const Delivery = require("../models/Delivery");
const Driver = require("../models/Driver");
const User = require("../models/User");
const deliveryScope = require("./deliveryScope");
const ApiError = require("../utils/ApiError");
const { generateTrackingNumber, generateDeliveryId } = require("../utils/generateTrackingNumber");
const { ALLOWED_STATUSES, EDITABLE_FIELDS, validateCreateDelivery, validateUpdateDelivery, validateStatusUpdate } = require("../validators/deliveryValidator");
const notificationService = require("./notificationService");
const logger = require("../config/logger");
const OBJECT_ID = /^[0-9a-fA-F]{24}$/;
function validate(errors) {
  if (errors.length) throw ApiError.unprocessable(errors.map(({ field, message }) => `${field}: ${message}`).join(" "), errors);
}
function identity(id) {
  if (typeof id !== "string" || !id.trim() || id.length > 128) throw ApiError.badRequest("Invalid delivery identifier.");
  return { $or: [...(OBJECT_ID.test(id) ? [{ _id: id }] : []), { deliveryId: id }, { trackingNumber: id }] };
}
function audit(delivery, eventType, user, remarks, now = new Date()) {
  delivery.statusHistory.push({ eventType, status: delivery.status, changedBy: user._id, changedByName: user.name, timestamp: now, remarks });
}
class DeliveryService {
  async findAuthorized(id, user) {
    const code = identity(id);
    const scope = await deliveryScope(user);
    const delivery = await Delivery.findOne({ $and: [code, scope] });
    if (!delivery) {
      if (await Delivery.exists(code)) throw ApiError.forbidden("Access denied to this delivery.");
      throw ApiError.notFound(`Delivery '${id}' not found`);
    }
    return delivery;
  }

  async getDeliveries({ user = null, status = null, search = null, limit = 100, page = 1 } = {}) {
    const scope = await deliveryScope(user);
    const conditions = [scope];
    if (status !== null && status !== undefined && status !== "" && status !== "All statuses") {
      if (typeof status !== "string" || !ALLOWED_STATUSES.includes(status)) validate([{ field: "status", message: "Unsupported delivery status." }]);
      conditions.push({ status });
    }
    if (search !== null && search !== undefined) {
      if (typeof search !== "string" || search.length > 200) validate([{ field: "search", message: "Search must be text no longer than 200 characters." }]);
      const q = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (q) conditions.push({ $or: ["deliveryId", "customer", "route", "driverName", "trackingNumber"].map((key) => ({ [key]: { $regex: q, $options: "i" } })) });
    }
    for (const [field, value] of Object.entries({ page, limit })) {
      if (!/^[1-9]\d*$/.test(String(value)) || !Number.isSafeInteger(Number(value))) validate([{ field, message: `${field} must be a positive integer.` }]);
    }
    page = Number(page); limit = Math.min(500, Number(limit));
    if (!Number.isSafeInteger((page - 1) * limit)) validate([{ field: "page", message: "Requested page is out of range." }]);
    const filter = { $and: conditions };
    const [deliveries, total] = await Promise.all([
      Delivery.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit),
      Delivery.countDocuments(filter),
    ]);
    return { deliveries: deliveries.map((delivery) => delivery.toFrontendObject()), total, page, limit };
  }

  async getDeliveryById(id, user) { return (await this.findAuthorized(id, user)).toFrontendObject(); }

  async createDelivery(data, creator) {
    await deliveryScope(creator);
    if (!["administrator", "logistics", "customer", "merchant"].includes(creator.role)) throw ApiError.forbidden("This role cannot create deliveries.");
    validate(validateCreateDelivery(data));
    const now = new Date();
    const delivery = await Delivery.create({
      deliveryId: generateDeliveryId(), trackingNumber: generateTrackingNumber(),
      customer: data.customer.trim(), sender: creator._id,
      merchant: creator.role === "merchant" ? creator._id : undefined,
      pickup: data.pickup.trim(), dropoff: data.dropoff.trim(),
      route: `${data.pickup.trim()} \u2192 ${data.dropoff.trim()}`,
      eta: data.eta || "16:30", priority: data.priority || "Standard",
      recipientName: data.recipientName, recipientPhone: data.recipientPhone,
      packageDescription: data.packageDescription, weight: data.weight,
      city: data.city || "", status: "Pending", assignedDriver: null, driverName: "Unassigned", createdBy: creator._id,
      statusHistory: [{ eventType: "created", status: "Pending", changedBy: creator._id, changedByName: creator.name, timestamp: now, remarks: "Shipment registered in Routeflow system." }],
    });
    logger.info("Delivery created", { deliveryId: delivery.deliveryId, actorId: String(creator._id), actorRole: creator.role });
    await notificationService.createNotification({ recipient: creator._id, title: "Shipment Created", message: `Your shipment ${delivery.deliveryId} has been registered.`, type: "delivery_created", delivery: delivery._id });
    return delivery.toFrontendObject();
  }

  async updateDelivery(id, updates, user) {
    const delivery = await this.findAuthorized(id, user);
    if (!["administrator", "logistics"].includes(user.role) && delivery.status !== "Pending") throw ApiError.forbidden("Only pending shipments can be edited by their owner.");
    if (["Delivered", "Cancelled"].includes(delivery.status)) throw ApiError.badRequest("Closed deliveries cannot be edited.");
    validate(validateUpdateDelivery(updates));
    const changed = [];
    for (const key of EDITABLE_FIELDS) {
      if (updates[key] === undefined) continue;
      const next = typeof updates[key] === "string" ? updates[key].trim() : updates[key];
      if (delivery[key] !== next) { delivery[key] = next; changed.push(key); }
    }
    if (!changed.length) return delivery.toFrontendObject();
    delivery.route = `${delivery.pickup} \u2192 ${delivery.dropoff}`;
    audit(delivery, "updated", user, `Delivery details updated: ${changed.join(", ")}.`);
    await delivery.save();
    logger.info("Delivery details updated", { deliveryId: delivery.deliveryId, actorId: String(user._id), fields: changed });
    return delivery.toFrontendObject();
  }

  async updateStatus(id, status, user, remarks = "") {
    const delivery = await this.findAuthorized(id, user);
    if (["customer", "merchant"].includes(user.role) && (status !== "Cancelled" || delivery.status !== "Pending")) throw ApiError.forbidden("Only pending shipments can be cancelled by their owner.");
    if (user.role === "driver" && status === "Cancelled") throw ApiError.forbidden("Drivers cannot cancel shipments.");
    const errors = validateStatusUpdate({ status, remarks }, delivery.status);
    if (errors.length) throw ApiError.badRequest(errors[0].message);
    if (delivery.status === status) return delivery.toFrontendObject();
    const previousStatus = delivery.status;
    const now = new Date();
    delivery.status = status;
    if (["In transit", "Out for delivery"].includes(status) && !delivery.pickedUpAt) delivery.pickedUpAt = now;
    if (status === "Delivered" && !delivery.deliveredAt) delivery.deliveredAt = now;
    if (status === "Cancelled" && !delivery.cancelledAt) delivery.cancelledAt = now;
    audit(delivery, "status", user, remarks.trim() || `Status updated to ${status}`, now);
    await delivery.save();
    logger.info("Delivery status updated", { deliveryId: delivery.deliveryId, actorId: String(user._id), previousStatus, status });
    if (delivery.sender) await notificationService.createNotification({ recipient: delivery.sender, title: `Shipment ${status}`, message: `Your shipment ${delivery.deliveryId} is now ${status}.`, type: status === "Delivered" ? "delivered" : status === "Delayed" ? "delayed" : "status_updated", delivery: delivery._id });
    return delivery.toFrontendObject();
  }

  async assignDriver(id, driverIdOrName, user) {
    if (!user) throw ApiError.unauthorized("Authentication required.");
    if (!["administrator", "logistics"].includes(user.role)) throw ApiError.forbidden("Only Administrators and Logistics staff can assign drivers.");
    if (typeof driverIdOrName !== "string" || !driverIdOrName.trim() || driverIdOrName.length > 100) validate([{ field: "driver", message: "A valid driver name or driver ID is required." }]);
    const delivery = await this.findAuthorized(id, user);
    if (["Delivered", "Cancelled"].includes(delivery.status)) throw ApiError.badRequest("Cannot assign a closed delivery.");
    const value = driverIdOrName.trim();
    let driver = null;
    if (value !== "Unassigned") {
      if (OBJECT_ID.test(value)) driver = await Driver.findById(value);
      else {
        const matches = await Driver.find({ name: value }).limit(2);
        if (matches.length > 1) throw ApiError.conflict("Multiple drivers have this name. Assign using the driver ID.");
        driver = matches[0];
      }
      if (!driver) throw ApiError.notFound(`Driver '${value}' not found in fleet roster.`);
      if (driver.status === "Unavailable") throw ApiError.badRequest("Driver is unavailable.");
      if (!await User.exists({ _id: driver.user, role: "driver", status: "active" })) throw ApiError.badRequest("Driver account is inactive.");
    }
    if (String(delivery.assignedDriver || "") === String(driver?._id || "")) return delivery.toFrontendObject();
    const now = new Date();
    delivery.assignedDriver = driver?._id || null;
    delivery.driverName = driver?.name || "Unassigned";
    delivery.assignedAt = driver ? now : null;
    audit(delivery, driver ? "assigned" : "unassigned", user, `Driver assigned: ${delivery.driverName}`, now);
    await delivery.save();
    // Notifications describe committed assignments only; a conflicting write cannot notify a driver.
    if (driver) await notificationService.createNotification({ recipient: driver.user, title: "New Delivery Assigned", message: `You have been assigned to delivery ${delivery.deliveryId}.`, type: "driver_assigned", delivery: delivery._id });
    logger.info("Delivery driver assignment updated", { deliveryId: delivery.deliveryId, assignedDriverId: driver ? String(driver._id) : null, actorId: String(user._id) });
    return delivery.toFrontendObject();
  }

  async trackByTrackingNumber(trackingNumber) {
    if (typeof trackingNumber !== "string" || !trackingNumber.trim() || trackingNumber.length > 128) throw ApiError.badRequest("Invalid tracking number.");
    const delivery = await Delivery.findOne({ trackingNumber: trackingNumber.trim() });
    if (!delivery) throw ApiError.notFound(`No shipment found matching tracking number '${trackingNumber}'.`);
    return {
      trackingNumber: delivery.trackingNumber, deliveryId: delivery.deliveryId, status: delivery.status, eta: delivery.eta,
      assignedAt: delivery.assignedAt, pickedUpAt: delivery.pickedUpAt, deliveredAt: delivery.deliveredAt, cancelledAt: delivery.cancelledAt,
      statusHistory: delivery.statusHistory.map((entry) => ({ eventType: entry.eventType, status: entry.status, timestamp: entry.timestamp })),
      lastUpdated: delivery.updatedAt,
    };
  }
}
module.exports = new DeliveryService();
