const mongoose = require("mongoose");

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ["Pending", "In transit", "Out for delivery", "Delivered", "Delayed", "Cancelled"],
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    changedByName: {
      type: String,
      default: "System",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const deliverySchema = new mongoose.Schema(
  {
    deliveryId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    customer: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    pickup: {
      type: String,
      required: [true, "Pickup location is required"],
      trim: true,
    },
    dropoff: {
      type: String,
      required: [true, "Drop-off destination is required"],
      trim: true,
    },
    route: {
      type: String,
      trim: true,
    },
    recipientName: {
      type: String,
      trim: true,
      default: "",
    },
    recipientPhone: {
      type: String,
      trim: true,
      default: "",
    },
    packageDescription: {
      type: String,
      trim: true,
      default: "Standard parcel",
    },
    weight: {
      type: Number,
      default: 1.0,
      min: [0, "Weight cannot be negative"],
    },
    priority: {
      type: String,
      enum: ["Standard", "Express", "Overnight"],
      default: "Standard",
    },
    status: {
      type: String,
      enum: ["Pending", "In transit", "Out for delivery", "Delivered", "Delayed", "Cancelled"],
      default: "Pending",
      index: true,
    },
    eta: {
      type: String,
      default: "16:30",
    },
    city: {
      type: String,
      default: "New York, NY",
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      index: true,
    },
    driverName: {
      type: String,
      default: "Unassigned",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  }
);

deliverySchema.index({ sender: 1, createdAt: -1 });
deliverySchema.index({ merchant: 1, createdAt: -1 });
deliverySchema.index({ assignedDriver: 1, status: 1 });

// Auto-populate route if missing before saving
deliverySchema.pre("save", function (next) {
  if (!this.route && this.pickup && this.dropoff) {
    this.route = `${this.pickup} → ${this.dropoff}`;
  }
  next();
});

deliverySchema.methods.toFrontendObject = function () {
  return {
    id: this.deliveryId, // Matches order.id in frontend
    _id: this._id.toString(),
    deliveryId: this.deliveryId,
    trackingNumber: this.trackingNumber,
    customer: this.customer,
    route: this.route || `${this.pickup} → ${this.dropoff}`,
    pickup: this.pickup,
    dropoff: this.dropoff,
    status: this.status,
    eta: this.eta,
    driver: this.driverName || "Unassigned", // Matches order.driver in frontend
    assignedDriverId: this.assignedDriver ? this.assignedDriver.toString() : null,
    priority: this.priority,
    city: this.city,
    packageDescription: this.packageDescription,
    weight: this.weight,
    statusHistory: this.statusHistory,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("Delivery", deliverySchema);

