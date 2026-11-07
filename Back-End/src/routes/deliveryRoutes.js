const express = require("express");
const deliveryController = require("../controllers/deliveryController");
const { authenticate, optionalAuthenticate } = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const validateRequest = require("../middleware/validateRequest");
const {
  validateCreateDelivery,
  validateAssignDriver,
} = require("../validators/deliveryValidator");

const router = express.Router();

// Public / optional auth reads to support seamless frontend previews and authenticated queries
router.get("/", optionalAuthenticate, deliveryController.getDeliveries);
router.get("/:id", optionalAuthenticate, deliveryController.getDeliveryById);
router.get("/:id/history", optionalAuthenticate, deliveryController.getDeliveryHistory);
router.get("/:id/tracking", deliveryController.trackDelivery);

// Create delivery
router.post(
  "/",
  optionalAuthenticate,
  validateRequest(validateCreateDelivery),
  deliveryController.createDelivery
);

// Update status
router.patch(
  "/:id/status",
  optionalAuthenticate,
  deliveryController.updateStatus
);

// Assign driver (both /assign-driver and /driver for frontend compatibility)
router.patch(
  "/:id/assign-driver",
  optionalAuthenticate,
  validateRequest(validateAssignDriver),
  deliveryController.assignDriver
);

router.patch(
  "/:id/driver",
  optionalAuthenticate,
  validateRequest(validateAssignDriver),
  deliveryController.assignDriver
);

// Cancellation
router.delete("/:id", optionalAuthenticate, deliveryController.cancelDelivery);

module.exports = router;

