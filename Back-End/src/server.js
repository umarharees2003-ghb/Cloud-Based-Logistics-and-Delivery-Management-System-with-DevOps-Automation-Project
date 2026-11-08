const app = require("./app");
const environment = require("./config/environment");
const { connectDatabase, disconnectDatabase } = require("./config/database");
const logger = require("./config/logger");

let server;

async function startServer() {
  try {
    // 1. Connect Database
    await connectDatabase();

    // 2. Start HTTP Server
    server = app.listen(environment.port, () => {
      logger.info(
        "🚀 Routeflow Backend Server listening on port %d [%s mode]",
        environment.port,
        environment.nodeEnv
      );
      logger.info(
        "📊 Health: http://localhost:%d/api/health",
        environment.port
      );
      logger.info(
        "📈 Metrics: http://localhost:%d/metrics",
        environment.port
      );
    });
  } catch (error) {
    logger.error("Failed to start server: %s", error.message);
    process.exit(1);
  }
}

// Graceful Shutdown
async function shutdown(signal) {
  logger.info("%s signal received. Initiating graceful shutdown...", signal);
  if (server) {
    server.close(async () => {
      logger.info("HTTP server closed.");
      await disconnectDatabase();
      logger.info("Process terminating cleanly.");
      process.exit(0);
    });
    // Force exit if shutdown takes too long
    setTimeout(() => {
      logger.error("Graceful shutdown timed out. Forcing termination.");
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise Rejection: %s", reason);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception: %s\n%s", error.message, error.stack);
  process.exit(1);
});

if (require.main === module) {
  startServer();
}

module.exports = { startServer, shutdown };

