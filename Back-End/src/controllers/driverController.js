const driverService = require("../services/driverService");

class DriverController {
  async getDrivers(req, res, next) {
    try {
      const drivers = await driverService.getDrivers(req.query);
      // Directly return the array or wrapped in { success, data }
      // To maintain seamless compatibility with frontend deliveryService/driverService
      res.status(200).json({
        success: true,
        data: drivers,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDriverById(req, res, next) {
    try {
      await driverService.assertAccess(req.params.id, req.user);
      const driver = await driverService.getDriverById(req.params.id);
      res.status(200).json({
        success: true,
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  }

  async createDriver(req, res, next) {
    try {
      const driver = await driverService.createDriver(req.body);
      res.status(201).json({
        success: true,
        message: "Driver profile created successfully",
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDriver(req, res, next) {
    try {
      const driver = await driverService.updateDriver(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: "Driver profile updated successfully",
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAvailability(req, res, next) {
    try {
      await driverService.assertAccess(req.params.id, req.user);
      const driver = await driverService.toggleDriverStatus(
        req.params.id,
        req.body.status
      );
      res.status(200).json({
        success: true,
        message: `Driver status updated to ${driver.status}`,
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDriverDeliveries(req, res, next) {
    try {
      await driverService.assertAccess(req.params.id, req.user);
      const deliveries = await driverService.getDriverDeliveries(req.params.id);
      res.status(200).json({
        success: true,
        data: deliveries,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DriverController();

