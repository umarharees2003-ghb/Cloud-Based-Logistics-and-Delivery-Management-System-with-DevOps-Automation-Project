import React, { useState } from "react";
import { apiRequest } from "../services/apiClient";
import StatusBadge from "../components/StatusBadge";

export default function FleetPage({ drivers, onToggleDriverStatus, onSaved }) {
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  async function save(event) {
    event.preventDefault();
    try {
      const data = Object.fromEntries(new FormData(event.currentTarget));
      await apiRequest(editing.id ? `/drivers/${editing.id}` : "/drivers", { method: editing.id ? "PATCH" : "POST", body: JSON.stringify(data) });
      await onSaved(); setEditing(null); setMessage("Driver saved.");
    } catch (error) { setMessage(error.message); }
  }
  return (
    <section className="ops-card fleet-card">
      <div className="ops-card-heading">
        <div>
          <h3>Driver roster</h3>
          <p>Manage drivers and current assignments</p>
        </div>
        <span className="fleet-count">{drivers.length} drivers</span>
      </div>

      <p className="auth-notice" role="status">{message}</p>
      <button className="ops-primary-button" onClick={() => setEditing({})}>Add driver</button>
      {editing && <form className="auth-form" onSubmit={save}>
        <h3>{editing.id ? "Edit driver" : "Create driver account"}</h3>
        {!editing.id && <>
          <label className="auth-field"><span>Name</span><input name="name" minLength="2" required /></label>
          <label className="auth-field"><span>Email</span><input name="email" type="email" required /></label>
          <label className="auth-field"><span>Initial password</span><input name="password" type="password" minLength="8" required /></label>
        </>}
        <label className="auth-field"><span>Vehicle</span><input name="vehicle" defaultValue={editing.vehicle} required /></label>
        <label className="auth-field"><span>Service zone</span><input name="zone" defaultValue={editing.zone} required /></label>
        <label className="auth-field"><span>Phone</span><input name="phone" defaultValue={editing.phone} /></label>
        <label className="auth-field"><span>License number</span><input name="licenseNumber" defaultValue={editing.licenseNumber} /></label>
        <button className="ops-primary-button">Save driver</button>
        <button type="button" className="ops-outline-button" onClick={() => setEditing(null)}>Cancel</button>
      </form>}
      {!drivers.length && <p>No drivers registered.</p>}
      <div className="driver-grid">
        {drivers.map((driver) => (
          <article className="driver-profile" key={driver.name}>
            <div className="driver-profile-top">
              <span className="driver-initials">{driver.initials}</span>
              <StatusBadge status={driver.status} />
            </div>
            <h4>{driver.name}</h4>
            <button type="button" className="ops-text-button" onClick={() => setEditing(driver)}>Edit driver</button>
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
              onClick={() => onToggleDriverStatus(driver.id)}
            >
              {driver.status === "Available" ? "Mark on route" : "Mark available"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

