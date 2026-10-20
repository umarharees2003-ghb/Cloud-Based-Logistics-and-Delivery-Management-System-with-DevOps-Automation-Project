import React from "react";
import StatusBadge from "./StatusBadge";
import { initialDrivers } from "../data/demoData";

export default function OrdersTable({
  orders,
  onStatusChange,
  onDriverChange,
  compact = false,
  canAssignDriver = true,
  canUpdateStatus = true,
  drivers = initialDrivers,
}) {
  return (
    <div className="orders-table-wrap">
      <table className={`orders-table ${compact ? "compact-table" : ""}`}>
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Route</th>
            <th>Driver</th>
            <th>Status</th>
            <th>ETA</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>
                <strong className="order-id">{order.id}</strong>
                <span className="order-type">Standard delivery</span>
              </td>
              <td>{order.customer}</td>
              <td>{order.route}</td>
              <td>
                {canAssignDriver ? (
                  <label className="driver-select-wrap">
                    <span className="assigned-driver">
                      <i>
                        {order.driver === "Unassigned"
                          ? "—"
                          : order.driver
                              .split(" ")
                              .map((part) => part[0])
                              .join("")}
                      </i>
                      {order.driver}
                    </span>
                    <select
                      aria-label={`Assign driver for ${order.id}`}
                      value={order.driver}
                      onChange={(event) => onDriverChange(order.id, event.target.value)}
                    >
                      <option>Unassigned</option>
                      {drivers.map((driver) => (
                        <option key={driver.name}>{driver.name}</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <span className="assigned-driver">{order.driver}</span>
                )}
              </td>
              <td>
                {canUpdateStatus ? (
                  <label className="status-select-wrap">
                    <StatusBadge status={order.status} />
                    <select
                      aria-label={`Update ${order.id} status`}
                      value={order.status}
                      onChange={(event) => onStatusChange(order.id, event.target.value)}
                    >
                      <option>Pending</option>
                      <option>In transit</option>
                      <option>Out for delivery</option>
                      <option>Delivered</option>
                      <option>Delayed</option>
                    </select>
                    <span aria-hidden="true">⌄</span>
                  </label>
                ) : (
                  <StatusBadge status={order.status} />
                )}
              </td>
              <td>{order.eta}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
