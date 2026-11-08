const Driver = require("../models/Driver");
const User = require("../models/User");
const Delivery = require("../models/Delivery");
const ApiError = require("../utils/ApiError");
const notificationService = require("./notificationService");

class DriverService {
  async assertAccess(id, user) {
    const driver = await this.getDriverById(id);
    if (!["administrator", "logistics"].includes(user.role) && driver.userId !== String(user._id)) {
      throw ApiError.forbidden("Access denied to another driver's profile.");
    }
  }

  /**
   * Get all drivers in roster
   */
  async getDrivers(filter = {}) {
    const query = {};
    if (filter.status) query.status = filter.status;
    if (filter.zone) query.zone = filter.zone;

    const drivers = await Driver.find(query).sort({ name: 1 });
    return Promise.all(drivers.map(async (d) => ({
      ...d.toFrontendObject(),
      deliveries: await Delivery.countDocuments({ assignedDriver: d._id, status: { $nin: ["Delivered", "Cancelled"] } }),
    })));
  }

  /**
   * Get driver by ID or name
   */
  async getDriverById(idOrName) {
    let driver;
    if (idOrName.match(/^[0-9a-fA-F]{24}$/)) {
      driver = await Driver.findById(idOrName);
    }
    if (!driver) {
      driver = await Driver.findOne({ name: idOrName });
    }
    if (!driver) {
      throw ApiError.notFound("Driver not found");
    }
    return driver.toFrontendObject();
  }

  /**
   * Create a new driver profile
   */
  async createDriver(data) {
    let user;
    if (data.userId) {
      user = await User.findById(data.userId);
    } else if (data.email) {
      user = await User.findOne({ email: String(data.email).trim().toLowerCase() });
    }

    if (!user) {
      // Auto-create driver user if details supplied
      if (!data.email || !data.password || String(data.password).length < 8) throw ApiError.badRequest("Email and a password of at least 8 characters are required.");
      const driverEmail = data.email;
      user = await User.create({
        name: data.name,
        email: driverEmail,
        password: data.password,
        role: "driver",
        phone: data.phone || "",
      });
    }

    if (user.role !== "driver") throw ApiError.badRequest("User must have the driver role.");
    const existing = await Driver.findOne({ user: user._id });
    if (existing) {
      throw ApiError.conflict("A driver profile already exists for this user.");
    }

    const initials =
      data.initials ||
      data.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase();

    const driver = await Driver.create({
      user: user._id,
      name: data.name,
      initials,
      phone: data.phone || user.phone || "",
      vehicle: data.vehicle || "Van · V-101",
      vehicleType: data.vehicleType || "Van",
      zone: data.zone || "Brooklyn",
      status: data.status || "Available",
      licenseNumber: data.licenseNumber || "",
    });

    return driver.toFrontendObject();
  }

  /**
   * Update driver profile details
   */
  async updateDriver(driverId, updates) {
    const allowed = ["vehicle", "zone", "phone", "licenseNumber", "vehicleType"];
    const payload = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) payload[key] = updates[key];
    }

    const driver = await Driver.findByIdAndUpdate(driverId, payload, {
      new: true,
      runValidators: true,
    });

    if (!driver) {
      throw ApiError.notFound("Driver not found");
    }

    return driver.toFrontendObject();
  }

  /**
   * Toggle or update driver availability status
   * Matches frontend toggleStatus(driverName, currentStatus)
   */
  async toggleDriverStatus(driverIdOrName, requestedStatus = null) {
    let driver;
    if (driverIdOrName.match(/^[0-9a-fA-F]{24}$/)) {
      driver = await Driver.findById(driverIdOrName);
    }
    if (!driver) {
      driver = await Driver.findOne({ name: driverIdOrName });
    }

    if (!driver) {
      throw ApiError.notFound("Driver not found");
    }

    let nextStatus = requestedStatus;
    if (!nextStatus) {
      nextStatus = driver.status === "Available" ? "On route" : "Available";
    }

    driver.status = nextStatus;
    await driver.save();

    return driver.toFrontendObject();
  }

  /**
   * Get deliveries assigned to a driver
   */
  async getDriverDeliveries(driverIdOrName) {
    const driver = await this.getDriverById(driverIdOrName);
    const deliveries = await Delivery.find({ assignedDriver: driver._id }).sort({ createdAt: -1 });
    return deliveries.map((d) => d.toFrontendObject());
  }
}

module.exports = new DriverService();

