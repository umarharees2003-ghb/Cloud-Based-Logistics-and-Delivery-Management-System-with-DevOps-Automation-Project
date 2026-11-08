const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const { authenticate } = require("../middleware/authenticate");

const authorize = require("../middleware/authorize");
const router = express.Router();

router.use(authenticate);

router.get("/summary", dashboardController.getSummary);
router.get("/deliveries", dashboardController.getDeliveries);
router.get("/fleet", authorize("administrator", "logistics"), dashboardController.getFleet);

module.exports = router;

