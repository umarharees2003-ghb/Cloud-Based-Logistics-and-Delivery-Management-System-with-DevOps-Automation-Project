const Notification = require("../models/Notification");
const logger = require("../config/logger");
const ApiError = require("../utils/ApiError");

class NotificationService {
  /**
   * Create an in-app notification
   * @param {Object} data - { recipient, title, message, type, delivery }
   */
  async createNotification({ recipient, title, message, type = "system", delivery = null }) {
    try {
      if (!recipient) return null;
      const notification = await Notification.create({
        recipient,
        title,
        message,
        type,
        delivery,
      });
      return notification.toFrontendObject();
    } catch (err) {
      logger.error("Failed to create notification: %s", err.message);
      return null;
    }
  }

  /**
   * Get notifications for a user
   * @param {string} userId
   * @param {Object} query - { limit, unreadOnly }
   */
  async getUserNotifications(userId, { limit = 20, unreadOnly = false } = {}) {
    const filter = { recipient: userId };
    if (unreadOnly) {
      filter.isRead = false;
    }

    const items = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(100, Math.max(1, parseInt(limit, 10) || 20)));

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return {
      notifications: items.map((item) => item.toFrontendObject()),
      unreadCount,
    };
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) throw ApiError.notFound("Notification not found.");
    return notification.toFrontendObject();
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
    return { success: true };
  }
}

module.exports = new NotificationService();

