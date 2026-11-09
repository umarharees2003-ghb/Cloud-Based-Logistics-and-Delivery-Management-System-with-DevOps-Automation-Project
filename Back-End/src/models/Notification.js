const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "delivery_created",
        "driver_assigned",
        "status_updated",
        "delayed",
        "delivered",
        "system",
      ],
      default: "system",
      index: true,
    },
    delivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Delivery",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.methods.toFrontendObject = function () {
  return {
    id: this._id.toString(),
    _id: this._id.toString(),
    title: this.title,
    message: this.message,
    type: this.type,
    deliveryId: this.delivery ? this.delivery.toString() : null,
    isRead: this.isRead,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("Notification", notificationSchema);

