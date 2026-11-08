const crypto = require("crypto");

function generateTrackingNumber(prefix = "RF-TRK") {
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
  const timestampPart = Date.now().toString().slice(-4);
  return `${prefix}-${timestampPart}${randomPart}`;
}

function generateDeliveryId() {
  return `SHP-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
}

module.exports = {
  generateTrackingNumber,
  generateDeliveryId,
};

