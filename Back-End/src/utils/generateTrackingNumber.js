const crypto = require("crypto");

function generateTrackingNumber(prefix = "RF-TRK") {
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
  const timestampPart = Date.now().toString().slice(-4);
  return `${prefix}-${timestampPart}${randomPart}`;
}

function generateDeliveryId(count = 0) {
  // Generates consistent IDs like SHP-10490, matching existing frontend demo data
  const base = 10500 + count;
  return `SHP-${base}`;
}

module.exports = {
  generateTrackingNumber,
  generateDeliveryId,
};

