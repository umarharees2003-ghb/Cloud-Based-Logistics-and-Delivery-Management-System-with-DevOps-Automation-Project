const winston = require("winston");

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `[${timestamp}] ${level}: ${message}`;
    if (Object.keys(meta).length > 0) {
      // Redact potential sensitive fields
      const cleanMeta = { ...meta };
      delete cleanMeta.password;
      delete cleanMeta.token;
      delete cleanMeta.authorization;
      log += ` ${JSON.stringify(cleanMeta)}`;
    }
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

const transports = [
  new winston.transports.Console({
    format: process.env.NODE_ENV === "production" ? format : consoleFormat,
  }),
];

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format,
  transports,
  silent: process.env.NODE_ENV === "test",
});

module.exports = logger;

