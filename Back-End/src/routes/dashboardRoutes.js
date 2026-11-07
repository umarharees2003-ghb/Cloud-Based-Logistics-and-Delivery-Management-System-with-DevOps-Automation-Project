const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const { optionalAuthenticate } = require("../middleware/authenticate");

const router = express.Router();

router.use(optionalAuthenticate);

router.get("/summary", dashboardController.getSummary);
router.get("/deliveries", dashboardController.getDeliveries);
router.get("/fleet", dashboardController.getFleet);

module.exports = router;

