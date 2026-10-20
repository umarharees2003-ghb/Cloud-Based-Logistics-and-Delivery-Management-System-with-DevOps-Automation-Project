import { useState, useMemo } from "react";
import { initialOrders } from "../data/demoData";
import { deliveryService } from "../services/deliveryService";

export function useDeliveries() {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [notice, setNotice] = useState("");

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const query = search.toLowerCase();
      const matchesSearch = `${order.id} ${order.customer} ${order.route} ${order.driver}`
        .toLowerCase()
        .includes(query);
      return matchesSearch && (statusFilter === "All statuses" || order.status === statusFilter);
    });
  }, [orders, search, statusFilter]);

  async function createOrder({ customer, pickup, dropoff, eta }) {
    const nextOrder = await deliveryService.createDelivery({
      customer,
      pickup,
      dropoff,
      eta,
      count: orders.length,
    });
    setOrders((current) => [nextOrder, ...current]);
    setSearch("");
    setStatusFilter("All statuses");
    setNotice(`Delivery ${nextOrder.id} has been created.`);
    setTimeout(() => setNotice(""), 4000);
    return nextOrder;
  }

  function updateOrderStatus(id, status) {
    deliveryService.updateStatus(id, status);
    setOrders((current) =>
      current.map((order) => (order.id === id ? { ...order, status } : order))
    );
  }

  function assignDriver(id, driver) {
    deliveryService.assignDriver(id, driver);
    setOrders((current) =>
      current.map((order) => (order.id === id ? { ...order, driver } : order))
    );
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("All statuses");
  }

  return {
    orders,
    setOrders,
    filteredOrders,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    notice,
    setNotice,
    createOrder,
    updateOrderStatus,
    assignDriver,
    resetFilters,
  };
}

