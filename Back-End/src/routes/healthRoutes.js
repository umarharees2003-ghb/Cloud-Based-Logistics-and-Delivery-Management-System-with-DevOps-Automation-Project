const express = require("express");
const { isDatabaseReady } = require("../config/database");

const router = express.Router();

/**
 * Basic health check
 */
router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: "routeflow-backend",
  });
});

/**
 * Liveness probe - checks if Express process is responsive
 */
router.get("/live", (req, res) => {
  res.status(200).json({
    status: "alive",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Readiness probe - explicitly verifies database connectivity
 */
router.get("/ready", (req, res) => {
  const dbReady = isDatabaseReady();
  if (dbReady) {
    return res.status(200).json({
      status: "ready",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(503).json({
    status: "not_ready",
    database: "disconnected",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;

