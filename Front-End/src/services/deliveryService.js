import { apiRequest } from "./apiClient.js";

export const deliveryService = {
  async getDeliveries() {
    const all = [];
    for (let page = 1; ; page++) {
      const res = await apiRequest(`/deliveries?limit=500&page=${page}`);
      if (!Array.isArray(res.data)) throw new Error("Invalid delivery response.");
      all.push(...res.data);
      if (all.length >= res.total || res.data.length === 0) return all;
    }
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
