const dotenv = require("dotenv");
const path = require("path");

// Load .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const environment = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
  // Deployment environment is separate from the optimized Node runtime mode.
  // Local Docker demos opt into APP_ENV=development; production remains closed.
  get appEnv() {
    return process.env.APP_ENV || (process.env.NODE_ENV === "production" ? "production" : "development");
  },
  get allowPublicStaffSignup() {
    return this.appEnv === "development" && process.env.ALLOW_PUBLIC_STAFF_SIGNUP === "true";
  },
  trustProxyHops: Math.max(0, parseInt(process.env.TRUST_PROXY_HOPS || "0", 10) || 0),
  port: parseInt(process.env.PORT || "5000", 10),
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/routeflow",
  jwtSecret:
    process.env.JWT_SECRET || (process.env.NODE_ENV === "test" ? "test_only_routeflow_secret_32_characters" : require("crypto").randomBytes(48).toString("hex")),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  frontendOrigins: (
    process.env.FRONTEND_ORIGIN ||
    "http://localhost:5173,http://localhost:8080,http://127.0.0.1:5173,http://127.0.0.1:8080"
  )
    .split(",")
    .map((origin) => origin.trim()),
  logLevel: process.env.LOG_LEVEL || "info",
  prometheusEnabled: process.env.PROMETHEUS_METRICS_ENABLED !== "false",
  bootstrapAdmin: {
    name: process.env.BOOTSTRAP_ADMIN_NAME || "System Administrator",
    email: (process.env.BOOTSTRAP_ADMIN_EMAIL || "admin@routeflow.io").toLowerCase().trim(),
    password: process.env.BOOTSTRAP_ADMIN_PASSWORD,
    phone: process.env.BOOTSTRAP_ADMIN_PHONE || "+1-555-0199",
  },
};

// Fail fast in production if essential configuration is missing
if (environment.isProduction) {
  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET.includes("fallback") ||
    process.env.JWT_SECRET.length < 24
  ) {
    throw new Error(
      "FATAL: In production, JWT_SECRET must be set with at least 24 characters."
    );
  }
}

module.exports = environment;

