const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { randomUUID } = require("node:crypto");
const client = require("prom-client");

const environment = require("./config/environment");
const logger = require("./config/logger");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const ApiError = require("./utils/ApiError");

// Route imports
const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const driverRoutes = require("./routes/driverRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const deliveryController = require("./controllers/deliveryController");

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", environment.trustProxyHops);
app.use((req, res, next) => {
  req.id = randomUUID();
  res.setHeader("X-Request-ID", req.id);
  next();
});

// 1. Prometheus Metrics Setup
const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: "routeflow_" });

const httpRequestDurationMicroseconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "code"],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});
register.registerMetric(httpRequestDurationMicroseconds);

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests made",
  labelNames: ["method", "route", "code"],
});
register.registerMetric(httpRequestsTotal);

// 2. Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow frontend SPA consumption
    crossOriginEmbedderPolicy: false,
  })
);

// 3. CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests or matching configured origins
    if (!origin || environment.frontendOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(ApiError.forbidden("Origin not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};
app.use(cors(corsOptions));

// 4. Request Body Parsing with Size Limits
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// 5. Structured HTTP logs never include request bodies, authorization or raw queries.
app.use((req, res, next) => {
  const started = process.hrtime.bigint();
  res.on("finish", () => {
    const requestPath = req.originalUrl.split("?")[0];
    if (requestPath === "/api/health" || requestPath.startsWith("/api/health/") || requestPath === "/metrics") return;
    logger.info("HTTP request", { requestId: req.id, method: req.method,
      route: `${req.baseUrl || ""}${req.route?.path || "/unmatched"}`,
      statusCode: res.statusCode, durationMs: Number(process.hrtime.bigint() - started) / 1e6 });
  });
  next();
});

// 6. Prometheus Metrics Interceptor
app.use((req, res, next) => {
  const start = process.hrtime();
  res.on("finish", () => {
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;
    const route = req.route ? `${req.baseUrl || ""}${req.route.path}` : "/unmatched";
    httpRequestDurationMicroseconds.labels(req.method, route, res.statusCode).observe(durationInSeconds);
    httpRequestsTotal.labels(req.method, route, res.statusCode).inc();
  });
  next();
});

// 7. Prometheus Metrics Endpoint
app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  try { res.send(await register.metrics()); } catch (error) { res.status(503).send("Metrics unavailable"); }
});

// 8. API Routes Mounting
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

// Direct public tracking endpoint: /api/tracking/:trackingNumber
app.get("/api/tracking/:trackingNumber", deliveryController.trackDelivery);

// 9. 404 & Centralized Error Handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;
