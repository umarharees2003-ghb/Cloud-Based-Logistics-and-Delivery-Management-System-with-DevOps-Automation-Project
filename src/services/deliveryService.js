/**
 * Delivery Service
 * Prepares the application for future integration with Node.js/Express backend API and MongoDB.
 * Currently backed by demo data.
 */

import { initialOrders } from "../data/demoData";

export const deliveryService = {
  /**
   * Fetch initial deliveries
   * @returns {Promise<Array>}
   */
  async getDeliveries() {
    // In future backend integration:
    // const res = await fetch('/api/deliveries');
    // return res.json();
    return [...initialOrders];
  },

  /**
   * Create a new shipment / delivery
   * @param {Object} orderData - { customer, pickup, dropoff, eta, totalCount }
   * @returns {Promise<Object>}
   */
  async createDelivery({ customer, pickup, dropoff, eta, count = 0 }) {
    // In future backend integration:
    // const res = await fetch('/api/deliveries', { method: 'POST', body: JSON.stringify(orderData) });
    // return res.json();
    const newOrder = {
      id: `SHP-${10500 + count}`,
      customer: customer.trim(),
      route: `${pickup.trim()} → ${dropoff.trim()}`,
      status: "Pending",
      eta: String(eta),
      driver: "Unassigned",
    };
    return newOrder;
  },

  /**
   * Update shipment status
   * @param {string} id
   * @param {string} status
   */
  async updateStatus(id, status) {
    // In future backend integration:
    // const res = await fetch(`/api/deliveries/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    // return res.json();
    return { id, status };
  },

  /**
   * Assign driver to shipment
   * @param {string} id
   * @param {string} driver
   */
  async assignDriver(id, driver) {
    // In future backend integration:
    // const res = await fetch(`/api/deliveries/${id}/driver`, { method: 'PATCH', body: JSON.stringify({ driver }) });
    // return res.json();
    return { id, driver };
  },
};

