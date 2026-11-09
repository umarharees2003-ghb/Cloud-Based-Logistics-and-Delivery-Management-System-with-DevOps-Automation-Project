const Delivery = require("../models/Delivery");
const Driver = require("../models/Driver");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { generateTrackingNumber, generateDeliveryId } = require("../utils/generateTrackingNumber");
const { validateStatusUpdate } = require("../validators/deliveryValidator");
const notificationService = require("./notificationService");
const logger = require("../config/logger");

class DeliveryService {
  /**
   * List deliveries with filtering, search, and role isolation
   */
  async getDeliveries({
    user = null,
    status = null,
    search = null,
    limit = 100,
    page = 1,
  } = {}) {
    const filter = {};

    // Role-based data isolation
    if (user) {
      if (user.role === "customer") {
        filter.$or = [{ sender: user._id }, { customer: user.name }];
      } else if (user.role === "merchant") {
        filter.$or = [{ merchant: user._id }, { sender: user._id }, { customer: user.name }];
      } else if (user.role === "driver") {
        filter.driverName = user.name;
      }
      // Administrator and logistics can see all deliveries
    }

    if (status && status !== "All statuses") {
      filter.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      const searchConditions = [
        { deliveryId: { $regex: q, $options: "i" } },
        { customer: { $regex: q, $options: "i" } },
        { route: { $regex: q, $options: "i" } },
        { driverName: { $regex: q, $options: "i" } },
        { trackingNumber: { $regex: q, $options: "i" } },
      ];

      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [deliveries, total] = await Promise.all([
      Delivery.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Delivery.countDocuments(filter),
    ]);

    return {
      deliveries: deliveries.map((d) => d.toFrontendObject()),
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };
  }

  /**
   * Get single delivery by ID, deliveryId (e.g. SHP-10482), or trackingNumber
   */
  async getDeliveryById(idOrCode, user = null) {
    let delivery;
    if (idOrCode.match(/^[0-9a-fA-F]{24}$/)) {
      delivery = await Delivery.findById(idOrCode);
    }
    if (!delivery) {
      delivery = await Delivery.findOne({
        $or: [{ deliveryId: idOrCode }, { trackingNumber: idOrCode }],
      });
    }

    if (!delivery) {
      throw ApiError.notFound(`Delivery '${idOrCode}' not found`);
    }

    // Authorization check for non-privileged roles
    if (user && !["administrator", "logistics"].includes(user.role)) {
      if (user.role === "driver" && delivery.driverName !== user.name) {
        throw ApiError.forbidden("Access denied to unassigned delivery.");
      }
      if (
        user.role === "customer" &&
        delivery.customer !== user.name &&
        String(delivery.sender) !== String(user._id)
      ) {
        throw ApiError.forbidden("Access denied to another customer's delivery.");
      }
      if (
        user.role === "merchant" &&
        String(delivery.merchant) !== String(user._id) &&
        delivery.customer !== user.name
      ) {
        throw ApiError.forbidden("Access denied to another merchant's delivery.");
      }
    }

    return delivery.toFrontendObject();
  }

  /**
   * Create a new shipment / delivery
   */
  async createDelivery(data, creator = null) {
    const totalCount = await Delivery.countDocuments();
    const deliveryId = data.deliveryId || generateDeliveryId(totalCount);
    const trackingNumber = data.trackingNumber || generateTrackingNumber();

    const pickup = String(data.pickup).trim();
    const dropoff = String(data.dropoff).trim();
    const route = data.route || `${pickup} → ${dropoff}`;
    const customer = String(data.customer).trim();
    const eta = data.eta || "16:30";

    const initialHistory = {
      status: "Pending",
      changedBy: creator ? creator._id : null,
      changedByName: creator ? creator.name : "System",
      timestamp: new Date(),
      remarks: "Shipment registered in Routeflow system.",
    };

    const delivery = await Delivery.create({
      deliveryId,
      trackingNumber,
      customer,
      sender: creator && creator.role === "customer" ? creator._id : data.senderId,
      merchant: creator && creator.role === "merchant" ? creator._id : data.merchantId,
      pickup,
      dropoff,
      route,
      eta,
      status: data.status || "Pending",
      priority: data.priority || "Standard",
      driverName: data.driver || "Unassigned",
      assignedDriver: data.assignedDriverId || null,
      city: data.city || "New York, NY",
      createdBy: creator ? creator._id : null,
      statusHistory: [initialHistory],
    });

    logger.info("Delivery created: %s (%s)", delivery.deliveryId, delivery.route);

    // Notify customer
    if (creator) {
      await notificationService.createNotification({
        recipient: creator._id,
        title: "Shipment Created",
        message: `Your shipment ${delivery.deliveryId} (${delivery.route}) has been registered.`,
        type: "delivery_created",
        delivery: delivery._id,
      });
    }

    return delivery.toFrontendObject();
  }

  /**
   * Update shipment status
   */
  async updateStatus(idOrCode, status, user = null, remarks = "") {
    let delivery;
    if (idOrCode.match(/^[0-9a-fA-F]{24}$/)) {
      delivery = await Delivery.findById(idOrCode);
    }
    if (!delivery) {
      delivery = await Delivery.findOne({ deliveryId: idOrCode });
    }
    if (!delivery) {
      throw ApiError.notFound(`Delivery '${idOrCode}' not found`);
    }

    // Role permissions check
    if (user) {
      if (user.role === "customer") {
        throw ApiError.forbidden("Customers cannot update delivery status.");
      }
      if (user.role === "driver" && delivery.driverName !== user.name) {
        throw ApiError.forbidden("Drivers can only update their assigned deliveries.");
      }
    }

    // Transition validation
    const transitionErrors = validateStatusUpdate({ status }, delivery.status);
    if (transitionErrors.length > 0) {
      throw ApiError.badRequest(transitionErrors[0].message);
    }

    delivery.status = status;
    delivery.statusHistory.push({
      status,
      changedBy: user ? user._id : null,
      changedByName: user ? user.name : "System",
      timestamp: new Date(),
      remarks: remarks || `Status updated to ${status}`,
    });

    await delivery.save();
    logger.info("Delivery %s status updated to %s", delivery.deliveryId, status);

    // If sender exists, send status notification
    if (delivery.sender) {
      await notificationService.createNotification({
        recipient: delivery.sender,
        title: `Shipment ${status}`,
        message: `Your shipment ${delivery.deliveryId} is now ${status}.`,
        type: status === "Delivered" ? "delivered" : status === "Delayed" ? "delayed" : "status_updated",
        delivery: delivery._id,
      });
    }

    return delivery.toFrontendObject();
  }

  /**
   * Assign driver to shipment
   */
  async assignDriver(idOrCode, driverNameOrId, user = null) {
    if (user && !["administrator", "logistics"].includes(user.role)) {
      throw ApiError.forbidden("Only Administrators and Logistics staff can assign drivers.");
    }

    let delivery;
    if (idOrCode.match(/^[0-9a-fA-F]{24}$/)) {
      delivery = await Delivery.findById(idOrCode);
    }
    if (!delivery) {
      delivery = await Delivery.findOne({ deliveryId: idOrCode });
    }
    if (!delivery) {
      throw ApiError.notFound(`Delivery '${idOrCode}' not found`);
    }

    if (driverNameOrId === "Unassigned") {
      delivery.driverName = "Unassigned";
      delivery.assignedDriver = null;
    } else {
      let driver = await Driver.findOne({ name: driverNameOrId });
      if (!driver && driverNameOrId.match(/^[0-9a-fA-F]{24}$/)) {
        driver = await Driver.findById(driverNameOrId);
      }

      if (!driver) {
        throw ApiError.notFound(`Driver '${driverNameOrId}' not found in fleet roster.`);
      }

      delivery.driverName = driver.name;
      delivery.assignedDriver = driver._id;

      // Update driver active delivery count
      driver.deliveries = (driver.deliveries || 0) + 1;
      await driver.save();

      // Notify the driver
      if (driver.user) {
        await notificationService.createNotification({
          recipient: driver.user,
          title: "New Delivery Assigned",
          message: `You have been assigned to delivery ${delivery.deliveryId} (${delivery.route}).`,
          type: "driver_assigned",
          delivery: delivery._id,
        });
      }
    }

    delivery.statusHistory.push({
      status: delivery.status,
      changedBy: user ? user._id : null,
      changedByName: user ? user.name : "System",
      timestamp: new Date(),
      remarks: `Driver assigned: ${delivery.driverName}`,
    });

    await delivery.save();
    logger.info("Delivery %s assigned to %s", delivery.deliveryId, delivery.driverName);

    return delivery.toFrontendObject();
  }

  /**
   * Safe public tracking by trackingNumber
   */
  async trackByTrackingNumber(trackingNumber) {
    const cleanNumber = String(trackingNumber).trim();
    const delivery = await Delivery.findOne({
      $or: [{ trackingNumber: cleanNumber }, { deliveryId: cleanNumber }],
    });

    if (!delivery) {
      throw ApiError.notFound(`No shipment found matching tracking number '${cleanNumber}'.`);
    }

    return {
      trackingNumber: delivery.trackingNumber,
      deliveryId: delivery.deliveryId,
      status: delivery.status,
      route: delivery.route,
      pickup: delivery.pickup,
      dropoff: delivery.dropoff,
      eta: delivery.eta,
      statusHistory: delivery.statusHistory.map((h) => ({
        status: h.status,
        timestamp: h.timestamp,
        remarks: h.remarks,
      })),
      lastUpdated: delivery.updatedAt,
    };
  }
}

module.exports = new DeliveryService();

