const Driver = require("../models/Driver");
const ApiError = require("../utils/ApiError");
module.exports = async function deliveryScope(user) {
  if (!user) throw ApiError.unauthorized("Authentication required.");
  if (["administrator", "logistics"].includes(user.role)) return {};
  if (user.role === "driver") {
    const driver = await Driver.findOne({ user: user._id });
    return { assignedDriver: driver ? driver._id : null, ...(driver ? {} : { _id: null }) };
  }
  return { $or: [{ sender: user._id }, { merchant: user._id }, { createdBy: user._id }] };
};
