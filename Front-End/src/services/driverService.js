/**
 * Driver / Fleet Service
 * Communicates with Routeflow Express backend API with graceful offline fallback.
 */

import { initialDrivers } from "../data/demoData.js";
import { apiRequest } from "./apiClient.js";

export const driverService = {
  /**
   * Fetch driver roster
   * @returns {Promise<Array>}
   */
  async getDrivers() {
    try {
      const res = await apiRequest("/drivers");
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return [...initialDrivers];
    } catch (err) {
      console.warn("Backend drivers API unreachable, using local demo roster:", err.message);
      return [...initialDrivers];
    }
  },

  /**
   * Toggle driver availability / route status
   * @param {string} driverName
   * @param {string} currentStatus
   * @returns {Promise<string>}
   */
  async toggleStatus(driverName, currentStatus) {
    const nextStatus = currentStatus === "Available" ? "On route" : "Available";
    try {
      await apiRequest(`/drivers/${encodeURIComponent(driverName)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      return nextStatus;
    } catch (err) {
      console.warn("Backend driver status update failed, updating locally:", err.message);
      return nextStatus;
    }
  },
};
