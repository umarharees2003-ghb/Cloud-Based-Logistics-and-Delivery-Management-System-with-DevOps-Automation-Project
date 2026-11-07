import { apiRequest } from "./apiClient.js";

export const deliveryService = {
  async getDeliveries() {
    const res = await apiRequest("/deliveries");
    return Array.isArray(res.data) ? res.data : [];
  },

  async createDelivery({ customer, pickup, dropoff, eta }) {
    const res = await apiRequest("/deliveries", {
      method: "POST",
      body: JSON.stringify({ customer, pickup, dropoff, eta }),
    });
    return res.data || res;
  },

  async updateStatus(id, status) {
    const res = await apiRequest(`/deliveries/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return res.data || res;
  },

  async assignDriver(id, driver) {
    const res = await apiRequest(`/deliveries/${id}/driver`, {
      method: "PATCH",
      body: JSON.stringify({ driver }),
    });
    return res.data || res;
  },

  async cancelDelivery(id) {
    return apiRequest(`/deliveries/${id}`, { method: "DELETE" });
  },
};
