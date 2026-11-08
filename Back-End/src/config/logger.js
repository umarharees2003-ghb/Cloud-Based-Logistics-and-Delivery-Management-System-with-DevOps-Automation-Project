const winston = require("winston");
const { format: formatMessage } = require("node:util");
const SPLAT = Symbol.for("splat");
const sensitiveKey = /^(?:password|confirmPassword|token|accessToken|refreshToken|authorization|cookie|set-cookie|jwtSecret|secret|credentials)$/i;
function sanitize(value, key = "", seen = new WeakSet()) {
  if (sensitiveKey.test(key)) return "[REDACTED]";
  if (typeof value === "string") {
    let clean = value.replace(/Bearer\s+[A-Za-z0-9._~+/-]+/gi, "Bearer [REDACTED]")
      .replace(/(mongodb(?:\+srv)?:\/\/)[^@\s]+@/gi, "$1[REDACTED]@");
    for (const [name, secret] of Object.entries(process.env)) {
      if (/(?:PASSWORD|SECRET|TOKEN)$/.test(name) && secret && secret.length >= 8) clean = clean.split(secret).join("[REDACTED]");
    }
    return clean;
  }
  if (value && typeof value === "object") {
    if (seen.has(value)) return "[Circular]";
    seen.add(value);
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return value.map((item) => sanitize(item, "", seen));
    return Object.fromEntries(Object.entries(value).map(([name, item]) => [name, sanitize(item, name, seen)]));
  }
  return value;
}
const normalize = winston.format((info) => {
  const args = info[SPLAT] || [];
  if (args.length && typeof info.message === "string" && /%[sdifjoO%]/.test(info.message)) {
    info.message = formatMessage(info.message, ...args);
  } else {
    for (const item of args) if (item && typeof item === "object") Object.assign(info, item);
  }
  for (const key of Object.keys(info)) {
    if (/^\d+$/.test(key)) delete info[key];
    else info[key] = sanitize(info[key], key);
  }
  delete info[SPLAT];
  return info;
});
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(winston.format.errors({ stack: true }), normalize(), winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
  silent: process.env.NODE_ENV === "test",
});
module.exports = logger;
