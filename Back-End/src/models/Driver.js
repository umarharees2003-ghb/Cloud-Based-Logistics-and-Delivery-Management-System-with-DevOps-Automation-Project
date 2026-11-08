const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Driver must be linked to a User account"],
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Driver name is required"],
      trim: true,
    },
    initials: {
      type: String,
      trim: true,
      uppercase: true,
      default: function () {
        if (!this.name) return "—";
        return this.name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .toUpperCase();
      },
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    licenseNumber: {
      type: String,
      trim: true,
      default: "",
    },
    vehicle: {
      type: String,
      required: [true, "Vehicle information is required"],
      trim: true,
      default: "Van · V-101",
    },
    vehicleType: {
      type: String,
      enum: ["Van", "Truck", "Motorcycle", "Car"],
      default: "Van",
    },
    zone: {
      type: String,
      required: [true, "Service zone is required"],
      trim: true,
      default: "Central",
      index: true,
    },
    status: {
      type: String,
      enum: ["Available", "On route", "Unavailable"],
      default: "Available",
      index: true,
    },
    deliveries: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

driverSchema.methods.toFrontendObject = function () {
  return {
    id: this._id.toString(),
    _id: this._id.toString(),
    userId: this.user ? this.user.toString() : null,
    name: this.name,
    initials: this.initials,
    vehicle: this.vehicle,
    zone: this.zone,
    status: this.status,
    deliveries: this.deliveries,
    phone: this.phone,
    licenseNumber: this.licenseNumber,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("Driver", driverSchema);

