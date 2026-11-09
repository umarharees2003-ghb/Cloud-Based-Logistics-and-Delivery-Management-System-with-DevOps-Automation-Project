const reportService = require("../services/reportService");
const deliveryService = require("../services/deliveryService");
const driverService = require("../services/driverService");

class DashboardController {
  async getSummary(req, res, next) {
    try {
      const summary = await reportService.getDashboardSummary(req.user);
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDeliveries(req, res, next) {
    try {
      const result = await deliveryService.getDeliveries({
        user: req.user,
        limit: 10,
      });
      res.status(200).json({
        success: true,
        data: result.deliveries,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFleet(req, res, next) {
    try {
      const drivers = await driverService.getDrivers();
      res.status(200).json({
        success: true,
        data: drivers,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();

