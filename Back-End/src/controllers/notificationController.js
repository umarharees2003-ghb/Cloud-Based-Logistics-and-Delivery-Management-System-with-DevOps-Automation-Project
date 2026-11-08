const notificationService = require("../services/notificationService");

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const result = await notificationService.getUserNotifications(req.user._id, {
        limit: req.query.limit,
        unreadOnly: req.query.unreadOnly === "true",
      });
      res.status(200).json({
        success: true,
        data: result.notifications,
        unreadCount: result.unreadCount,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(
        req.params.id,
        req.user._id
      );
      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user._id);
      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();

