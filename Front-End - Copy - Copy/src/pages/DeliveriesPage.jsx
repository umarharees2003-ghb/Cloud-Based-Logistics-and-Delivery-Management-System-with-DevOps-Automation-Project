import React from "react";
import OrdersTable from "../components/OrdersTable";

export default function DeliveriesPage({
  orders,
  filteredOrders,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  onStatusChange,
  onDriverChange,
  onResetFilters,
  drivers,
}) {
  const deliveryFilters = [
    { label: "All deliveries", status: "All statuses", count: orders.length, tone: "all" },
    {
      label: "In transit",
      status: "In transit",
      count: orders.filter((order) => order.status === "In transit").length,
      tone: "transit",
    },
    {
      label: "Delivered",
      status: "Delivered",
      count: orders.filter((order) => order.status === "Delivered").length,
      tone: "delivered",
    },
    {
      label: "Delayed",
      status: "Delayed",
      count: orders.filter((order) => order.status === "Delayed").length,
      tone: "delayed",
    },
  ];

  return (
    <>
      <section className="delivery-summary" aria-label="Delivery status summary">
        {deliveryFilters.map((filter) => (
          <button
            className={`delivery-summary-card ${filter.tone}${statusFilter === filter.status ? " active" : ""}`}
            key={filter.label}
            type="button"
            aria-pressed={statusFilter === filter.status}
            onClick={() => setStatusFilter(filter.status)}
          >
            <span>{filter.label}</span>
            <strong>{filter.count}</strong>
            <span className="delivery-summary-indicator">
              <i aria-hidden="true" />
              {filter.status === "All statuses"
                ? "Across your workspace"
                : `View ${filter.label.toLowerCase()}`}
            </span>
          </button>
        ))}
      </section>

      <section className="ops-card deliveries-card">
        <div className="deliveries-card-heading">
          <div>
            <h2>All deliveries</h2>
            <p>Search, assign drivers, and update delivery status.</p>
          </div>
          <span className="delivery-result-count">{filteredOrders.length} results</span>
        </div>

        <div className="delivery-toolbar">
          <label className="ops-search">
            <span aria-hidden="true">⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by order, customer, route, or driver"
              aria-label="Search deliveries"
            />
            {search && (
              <button
                className="search-clear"
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </label>

          <select
            className="ops-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by delivery status"
          >
            {["All statuses", "Pending", "In transit", "Out for delivery", "Delivered", "Delayed"].map(
              (status) => (
                <option key={status}>{status}</option>
              )
            )}
          </select>

          <button
            className="ops-outline-button"
            type="button"
            onClick={onResetFilters || (() => { setSearch(""); setStatusFilter("All statuses"); })}
          >
            Reset
          </button>
        </div>

        <OrdersTable
          orders={filteredOrders}
          onStatusChange={onStatusChange}
          onDriverChange={onDriverChange}
          drivers={drivers}
        />

        {filteredOrders.length === 0 && (
          <p className="empty-state">
            No deliveries match your search. Try a different keyword or status.
          </p>
        )}

        <div className="table-footer">
          Showing {filteredOrders.length} of {orders.length} deliveries{" "}
          <span>Updated just now</span>
        </div>
      </section>
    </>
  );
}

