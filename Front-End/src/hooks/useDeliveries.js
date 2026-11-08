import { useState, useMemo, useEffect } from "react";
import { deliveryService } from "../services/deliveryService";

export function useDeliveries() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    const load = () => deliveryService
      .getDeliveries()
      .then((items) => {
        if (active && Array.isArray(items)) {
          setOrders(items);
        }
      })
      .catch((error) => {
        if (active) setNotice(error.message || "Unable to load deliveries.");
      });
    load();
    window.addEventListener("routeflow:deliveries-changed", load);
    return () => {
      window.removeEventListener("routeflow:deliveries-changed", load);
      active = false;
    };
  }, []);

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

  async function updateOrderStatus(id, status) {
    const saved = await deliveryService.updateStatus(id, status);
    setOrders((current) =>
      current.map((order) => (order.id === id ? saved : order))
    );
  }

  async function assignDriver(id, driver) {
    const saved = await deliveryService.assignDriver(id, driver);
    setOrders((current) =>
      current.map((order) => (order.id === id ? saved : order))
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
