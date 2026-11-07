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

router.get("/", authenticate, deliveryController.getDeliveries);
router.get("/:id/history", authenticate, deliveryController.getDeliveryHistory);
router.get("/:id", authenticate, deliveryController.getDeliveryById);
router.get("/:id/tracking", deliveryController.trackDelivery);

// Create delivery
router.post(
  "/",
  authenticate,
  authorize("administrator", "logistics", "merchant", "customer"),
  validateRequest(validateCreateDelivery),
  deliveryController.createDelivery
);

// Update status
router.patch(
  "/:id/status",
  authenticate,
  authorize("administrator", "logistics", "driver"),
  deliveryController.updateStatus
);

// Assign driver (both /assign-driver and /driver for frontend compatibility)
router.patch(
  "/:id/assign-driver",
  authenticate,
  authorize("administrator", "logistics"),
  validateRequest(validateAssignDriver),
  deliveryController.assignDriver
);

router.patch(
  "/:id/driver",
  authenticate,
  authorize("administrator", "logistics"),
  validateRequest(validateAssignDriver),
  deliveryController.assignDriver
);

// Cancellation
router.delete("/:id", authenticate, deliveryController.cancelDelivery);

module.exports = router;
