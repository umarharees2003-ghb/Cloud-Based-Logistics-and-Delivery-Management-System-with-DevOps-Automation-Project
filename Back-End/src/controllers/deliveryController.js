const deliveryService = require("../services/deliveryService");

class DeliveryController {
  async getDeliveries(req, res, next) {
    try {
      const result = await deliveryService.getDeliveries({
        user: req.user,
        status: req.query.status,
        search: req.query.search,
        limit: req.query.limit,
        page: req.query.page,
      });

      // Response contains both .data array and pagination for clean consumption
      res.status(200).json({
        success: true,
        data: result.deliveries,
        deliveries: result.deliveries,
        total: result.total,
        page: result.page,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDeliveryById(req, res, next) {
    try {
      const delivery = await deliveryService.getDeliveryById(req.params.id, req.user);
      res.status(200).json({
        success: true,
        data: delivery,
      });
    } catch (error) {
      next(error);
    }
  }

  async createDelivery(req, res, next) {
    try {
      const delivery = await deliveryService.createDelivery(req.body, req.user);
      res.status(201).json({
        success: true,
        message: "Delivery created successfully",
        data: delivery,
        // Match top-level keys for direct assignment
        id: delivery.id,
        customer: delivery.customer,
        route: delivery.route,
        status: delivery.status,
        eta: delivery.eta,
        driver: delivery.driver,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const delivery = await deliveryService.updateStatus(
        req.params.id,
        req.body.status,
        req.user,
        req.body.remarks
      );
      res.status(200).json({
        success: true,
        message: `Delivery status updated to ${delivery.status}`,
        data: delivery,
        id: delivery.id,
        status: delivery.status,
      });
    } catch (error) {
      next(error);
    }
  }

  async assignDriver(req, res, next) {
    try {
      const driverName = req.body.driver || req.body.driverName;
      const delivery = await deliveryService.assignDriver(
        req.params.id,
        driverName,
        req.user
      );
      res.status(200).json({
        success: true,
        message: `Driver '${delivery.driver}' assigned to delivery`,
        data: delivery,
        id: delivery.id,
        driver: delivery.driver,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDeliveryHistory(req, res, next) {
    try {
      const delivery = await deliveryService.getDeliveryById(req.params.id, req.user);
      res.status(200).json({
        success: true,
        data: delivery.statusHistory,
      });
    } catch (error) {
      next(error);
    }
  }

  async trackDelivery(req, res, next) {
    try {
      const tracking = await deliveryService.trackByTrackingNumber(
        req.params.trackingNumber || req.params.id
      );
      res.status(200).json({
        success: true,
        data: tracking,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelDelivery(req, res, next) {
    try {
      const delivery = await deliveryService.updateStatus(
        req.params.id,
        "Cancelled",
        req.user,
        req.body.reason || "Shipment cancelled by user request"
      );
      res.status(200).json({
        success: true,
        message: "Delivery safely cancelled",
        data: delivery,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DeliveryController();
