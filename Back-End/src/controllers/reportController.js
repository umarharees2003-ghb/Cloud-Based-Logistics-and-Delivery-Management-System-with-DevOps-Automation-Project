const reportService = require("../services/reportService");
const driverService = require("../services/driverService");

class ReportController {
  async getOverview(req, res, next) {
    try {
      const overview = await reportService.getAnalyticsOverview(req.user);
      res.status(200).json({
        success: true,
        data: overview,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDeliveries(req, res, next) {
    try {
      const weeklyVolume = await reportService.getWeeklyVolume(req.user);
      res.status(200).json({
        success: true,
        data: weeklyVolume,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDrivers(req, res, next) {
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

module.exports = new ReportController();

