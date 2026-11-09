const express = require("express");
const reportController = require("../controllers/reportController");
const { optionalAuthenticate } = require("../middleware/authenticate");

const router = express.Router();

router.use(optionalAuthenticate);

router.get("/overview", reportController.getOverview);
router.get("/deliveries", reportController.getDeliveries);
router.get("/drivers", reportController.getDrivers);

module.exports = router;

