import React, { useState } from "react";
import DeliveryDetails from "./common/DeliveryDetails";
import StatusBadge from "./StatusBadge";
import { getInitials } from "../utils/formatters";

export default function OrdersTable({
  orders = [],
  onStatusChange,
  onDriverChange,
  compact = false,
  canAssignDriver = true,
  canUpdateStatus = true,
  drivers = [],
}) {
  const [selected, setSelected] = useState(null);
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
          {!orders.length && <tr><td colSpan="6">No deliveries found.</td></tr>}
          {(orders || []).map((order) => (
            <tr key={order.id}>
              <td>
                <strong className="order-id" role="button" tabIndex={0} onClick={() => setSelected(order)} onKeyDown={(event) => { if (event.key === "Enter") setSelected(order); }}>{order.id}</strong>
                <span className="order-type">Standard delivery</span>
              </td>
              <td>{order.customer}</td>
              <td>{order.route}</td>
              <td>
                {canAssignDriver ? (
                  <label className="driver-select-wrap">
                    <span className="assigned-driver">
                      <i>{getInitials(order.driver)}</i>
                      {order.driver}
                    </span>
                    <select
                      aria-label={`Assign driver for ${order.id}`}
                      value={order.assignedDriverId || "Unassigned"}
                      onChange={(event) => onDriverChange(order.id, event.target.value)}
                    >
                      <option>Unassigned</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id} disabled={driver.status === "Unavailable"}>{driver.name}</option>
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
                      <option>Cancelled</option>
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
      {selected && <DeliveryDetails order={selected} onClose={() => setSelected(null)} onSaved={() => window.dispatchEvent(new Event("routeflow:deliveries-changed"))} />}
    </div>
  );
}
