import React from "react";

export default function OrderModal({ isOpen, onClose, onSubmit, isMerchant = false }) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="order-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-order-title"
      >
        <div className="modal-heading">
          <div>
            <span className="modal-eyebrow">DELIVERY DETAILS</span>
            <h2 id="new-order-title">
              {isMerchant ? "Create a shipment" : "Create a delivery"}
            </h2>
            <p>Add a customer and route to get this order moving.</p>
          </div>
          <button type="button" aria-label="Close form" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="order-form" onSubmit={onSubmit}>
          <label>
            Customer name
            <input name="customer" placeholder="e.g. Jordan Smith" minLength="2" required />
          </label>

          <div className="form-row">
            <label>
              Pickup location
              <input name="pickup" placeholder="City or address" required />
            </label>
            <label>
              Drop-off location
              <input name="dropoff" placeholder="City or address" required />
            </label>
          </div>

          <label>
            Estimated delivery time
            <input name="eta" type="time" defaultValue="16:30" required />
          </label>

          <div className="modal-actions">
            <button type="button" className="ops-outline-button" onClick={onClose}>
              Cancel
            </button>
            <button className="ops-primary-button" type="submit">
              {isMerchant ? "Create shipment" : "Create delivery"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

