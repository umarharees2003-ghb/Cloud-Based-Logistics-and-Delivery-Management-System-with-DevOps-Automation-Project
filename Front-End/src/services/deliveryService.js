/**
 * Delivery Service
 * Communicates with Routeflow Express backend API with graceful offline fallback.
 */

import { initialOrders } from "../data/demoData.js";
import { apiRequest } from "./apiClient.js";

export const deliveryService = {
  /**
   * Fetch initial deliveries
   * @returns {Promise<Array>}
   */
  async getDeliveries() {
    try {
      const res = await apiRequest("/deliveries");
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return [...initialOrders];
    } catch (err) {
      console.warn("Backend deliveries API unreachable, using local demo data:", err.message);
      return [...initialOrders];
    }
  },

  /**
   * Create a new shipment / delivery
   * @param {Object} orderData - { customer, pickup, dropoff, eta, count }
   * @returns {Promise<Object>}
   */
  async createDelivery({ customer, pickup, dropoff, eta, count = 0 }) {
    try {
      const res = await apiRequest("/deliveries", {
        method: "POST",
        body: JSON.stringify({ customer, pickup, dropoff, eta }),
      });
      return (
        res.data || {
          id: res.id || `SHP-${10500 + count}`,
          customer: res.customer || customer.trim(),
          route: res.route || `${pickup.trim()} → ${dropoff.trim()}`,
          status: res.status || "Pending",
          eta: String(res.eta || eta),
          driver: res.driver || "Unassigned",
        }
      );
    } catch (err) {
      console.warn("Backend create delivery failed, using local creation:", err.message);
      return {
        id: `SHP-${10500 + count}`,
        customer: customer.trim(),
        route: `${pickup.trim()} → ${dropoff.trim()}`,
        status: "Pending",
        eta: String(eta),
        driver: "Unassigned",
      };
    }
  },

  /**
   * Update shipment status
   * @param {string} id
   * @param {string} status
   */
  async updateStatus(id, status) {
    try {
      await apiRequest(`/deliveries/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      return { id, status };
    } catch (err) {
      console.warn("Backend status update failed, updating locally:", err.message);
      return { id, status };
    }
  },

  /**
   * Assign driver to shipment
   * @param {string} id
   * @param {string} driver
   */
  async assignDriver(id, driver) {
    try {
      await apiRequest(`/deliveries/${id}/driver`, {
        method: "PATCH",
        body: JSON.stringify({ driver }),
      });
      return { id, driver };
    } catch (err) {
      console.warn("Backend assign driver failed, updating locally:", err.message);
      return { id, driver };
    }
  },
};
