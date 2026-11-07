const mongoose = require("mongoose");
const environment = require("./environment");
const logger = require("./logger");

let isConnected = false;

async function connectDatabase(uri = environment.mongodbUri) {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const options = {
      autoIndex: environment.nodeEnv !== "production",
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    };

    const connection = await mongoose.connect(uri, options);
    isConnected = true;
    logger.info("MongoDB connected successfully to %s", uri.replace(/\/\/.*@/, "//***@"));

    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error: %s", err.message);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
      isConnected = false;
    });

    return connection;
  } catch (error) {
    logger.error("Failed to connect to MongoDB: %s", error.message);
    isConnected = false;
    throw error;
  }
}

async function disconnectDatabase() {
  if (!isConnected && mongoose.connection.readyState === 0) {
    return;
  }
  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info("MongoDB disconnected gracefully");
  } catch (error) {
    logger.error("Error during MongoDB disconnect: %s", error.message);
  }
}

function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
  isDatabaseReady,
};

