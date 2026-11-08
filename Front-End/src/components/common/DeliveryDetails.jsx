import React, { useState, useEffect } from "react";
import { apiRequest } from "../../services/apiClient";
export default function DeliveryDetails({ order, onClose, onSaved }) {
  const [delivery, setDelivery] = useState(order);
  const [message, setMessage] = useState("");
  const [role, setRole] = useState(null);
  useEffect(() => {
    apiRequest("/auth/me").then((res) => setRole(res.user.role)).catch((error) => setMessage(error.message));
    apiRequest(`/deliveries/${order.id}`).then((res) => setDelivery(res.data)).catch((error) => setMessage(error.message));
  }, [order.id]);
  const editable = ["administrator", "logistics", "merchant", "customer"].includes(role) && (delivery.status === "Pending" || ["administrator", "logistics"].includes(role));
  async function save(event) {
    event.preventDefault();
    try {
      const res = await apiRequest(`/deliveries/${order.id}`, { method: "PATCH", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
      setDelivery(res.data); setMessage("Delivery saved."); onSaved();
    } catch (error) { setMessage(error.message); }
  }
  async function cancel() {
    try {
      const res = await apiRequest(`/deliveries/${order.id}`, { method: "DELETE" });
      setDelivery(res.data); setMessage("Delivery cancelled."); onSaved();
    } catch (error) { setMessage(error.message); }
  }
  return <div className="modal-backdrop"><section className="order-modal" role="dialog" aria-modal="true" aria-label="Delivery details">
    <div className="modal-heading"><div><span className="modal-eyebrow">DELIVERY DETAILS</span><h2>{delivery.id}</h2><p>Tracking: {delivery.trackingNumber}</p></div><button aria-label="Close details" onClick={onClose}>X</button></div>
    <p className="auth-notice" role="status">{message}</p>
    <form className="order-form" onSubmit={save}>
      <label>Customer name<input name="customer" defaultValue={delivery.customer} disabled={!editable} required minLength="2" /></label>
      <div className="form-row"><label>Pickup location<input name="pickup" defaultValue={delivery.pickup} disabled={!editable} required /></label><label>Drop-off location<input name="dropoff" defaultValue={delivery.dropoff} disabled={!editable} required /></label></div>
      <label>Estimated delivery time<input name="eta" type="time" defaultValue={delivery.eta} disabled={!editable} /></label>
      {editable && <div className="modal-actions"><button className="ops-primary-button">Save changes</button>{delivery.status === "Pending" && <button className="ops-outline-button" type="button" onClick={cancel}>Cancel shipment</button>}</div>}
    </form>
    <h3>Delivery history</h3><ol>{delivery.statusHistory?.map((entry, i) => <li key={i}>{entry.status} - {new Date(entry.timestamp).toLocaleString()} {entry.remarks}</li>)}</ol>
  </section></div>;
}
