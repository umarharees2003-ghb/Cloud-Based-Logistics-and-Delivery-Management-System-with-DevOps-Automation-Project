const express = require("express");
const driverController = require("../controllers/driverController");
const { authenticate, optionalAuthenticate } = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const validateRequest = require("../middleware/validateRequest");
const {
  validateCreateDriver,
  validateDriverStatus,
} = require("../validators/driverValidator");

const router = express.Router();

router.get("/", authenticate, authorize("administrator", "logistics"), driverController.getDrivers);
router.get("/:id", authenticate, driverController.getDriverById);
router.get("/:id/deliveries", optionalAuthenticate, driverController.getDriverDeliveries);

// Protected mutation routes
router.post(
  "/",
  authenticate,
  authorize("administrator", "logistics"),
  validateRequest(validateCreateDriver),
  driverController.createDriver
);

router.patch(
  "/:id",
  authenticate,
  authorize("administrator", "logistics"),
  driverController.updateDriver
);

// Toggle/update status (driver themselves, administrator, or logistics)
router.patch("/:id/availability", authenticate, authorize("administrator", "logistics", "driver"), driverController.updateAvailability);
router.patch("/:id/status", authenticate, authorize("administrator", "logistics", "driver"), driverController.updateAvailability);

module.exports = router;
