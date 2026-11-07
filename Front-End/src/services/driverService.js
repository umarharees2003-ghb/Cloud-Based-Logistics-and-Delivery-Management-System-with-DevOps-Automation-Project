import { apiRequest } from "./apiClient.js";

export const driverService = {
  async getDrivers() {
    const res = await apiRequest("/drivers");
    return Array.isArray(res.data) ? res.data : [];
  },

  async toggleStatus(driverId, currentStatus) {
    const nextStatus = currentStatus === "Available" ? "On route" : "Available";
    const res = await apiRequest(`/drivers/${encodeURIComponent(driverId)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: nextStatus }),
    });
    return res.data?.status || nextStatus;
  },
};
