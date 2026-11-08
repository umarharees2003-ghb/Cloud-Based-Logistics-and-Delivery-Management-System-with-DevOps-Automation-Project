const express = require("express");
const reportController = require("../controllers/reportController");
const { authenticate } = require("../middleware/authenticate");

const authorize = require("../middleware/authorize");
const router = express.Router();

router.use(authenticate);

router.get("/overview", reportController.getOverview);
router.get("/deliveries", reportController.getDeliveries);
router.get("/drivers", authorize("administrator", "logistics"), reportController.getDrivers);

module.exports = router;

