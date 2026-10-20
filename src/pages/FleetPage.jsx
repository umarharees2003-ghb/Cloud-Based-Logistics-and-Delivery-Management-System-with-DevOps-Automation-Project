import React from "react";
import StatusBadge from "../components/StatusBadge";

export default function FleetPage({ drivers, onToggleDriverStatus }) {
  return (
    <section className="ops-card fleet-card">
      <div className="ops-card-heading">
        <div>
          <h3>Driver roster</h3>
          <p>Manage drivers and current assignments</p>
        </div>
        <span className="fleet-count">{drivers.length} drivers</span>
      </div>

      <div className="driver-grid">
        {drivers.map((driver) => (
          <article className="driver-profile" key={driver.name}>
            <div className="driver-profile-top">
              <span className="driver-initials">{driver.initials}</span>
              <StatusBadge status={driver.status} />
            </div>
            <h4>{driver.name}</h4>
            <p>{driver.vehicle}</p>
            <div className="driver-profile-detail">
              <span>Service zone</span>
              <strong>{driver.zone}</strong>
            </div>
            <div className="driver-profile-detail">
              <span>Active deliveries</span>
              <strong>{driver.deliveries}</strong>
            </div>
            <button
              className="ops-outline-button assign-button"
              type="button"
              onClick={() => onToggleDriverStatus(driver.name)}
            >
              {driver.status === "Available" ? "Assign route" : "Mark available"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

