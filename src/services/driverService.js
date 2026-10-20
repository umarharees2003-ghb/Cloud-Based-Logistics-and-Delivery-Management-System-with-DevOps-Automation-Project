/**
 * Driver / Fleet Service
 * Prepares the application for future integration with Node.js/Express backend API and MongoDB.
 * Currently backed by demo data.
 */

import { initialDrivers } from "../data/demoData";

export const driverService = {
  /**
   * Fetch driver roster
   * @returns {Promise<Array>}
   */
  async getDrivers() {
    // In future backend integration:
    // const res = await fetch('/api/drivers');
    // return res.json();
    return [...initialDrivers];
  },

  /**
   * Toggle driver availability / route status
   * @param {string} driverName
   * @param {string} currentStatus
   * @returns {Promise<string>}
   */
  async toggleStatus(driverName, currentStatus) {
    // In future backend integration:
    // const nextStatus = currentStatus === "Available" ? "On route" : "Available";
    // const res = await fetch(`/api/drivers/${driverName}/status`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) });
    // return res.json();
    return currentStatus === "Available" ? "On route" : "Available";
  },
};

