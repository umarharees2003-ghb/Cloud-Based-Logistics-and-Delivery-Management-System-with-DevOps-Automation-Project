import React, { useState } from "react";
import ProfileForm from "../components/common/ProfileForm";
import OrdersTable from "../components/OrdersTable";
import RolePhotoGallery from "../components/RolePhotoGallery";
import StatusBadge from "../components/StatusBadge";
import { splitRoute } from "../utils/formatters";

export default function CustomerPage({
  activeSection,
  account,
  orders,
  onStatusChange,
  onDriverChange,
}) {
  const [selectedId, setSelectedId] = useState("");
  if (activeSection === "customer-profile") {
    return (
      <section className="ops-card role-info-panel">
        <div className="ops-card-heading">
          <div>
            <h3>My profile</h3>
            <p>Contact details for this customer account.</p>
          </div>
        </div>
        <div className="secondary-grid">
          <article className="secondary-card">
            <span>Name</span>
            <strong>{account?.name ? account.name.split("@")[0] : "Customer"}</strong>
            <p>Customer / Sender</p>
          </article>
          <article className="secondary-card">
            <span>Email</span>
            <strong>
              {account?.email || "--"}
            </strong>
            <p>Account contact</p>
          </article>
        </div>
        <ProfileForm account={account} />
      </section>
    );
  }

  const trackedOrder = orders.find((order) => order.id === selectedId) || orders[0];

  if (activeSection === "customer-history") {
    return (
      <section className="ops-card recent-card">
        <div className="ops-card-heading">
          <div>
            <h3>Delivery history</h3>
            <p>Your saved shipment records.</p>
          </div>
        </div>
        <OrdersTable
          orders={orders}
          onStatusChange={onStatusChange}
          onDriverChange={onDriverChange}
          canAssignDriver={false}
          canUpdateStatus={false}
        />
      </section>
    );
  }

  const [origin, destination] = splitRoute(trackedOrder?.route || "--");

  return (
    <>
      <RolePhotoGallery roleId="customer" />
      <section className="ops-card customer-tracking-card">
        <div className="ops-card-heading">
          <div>
            <h3>Your shipment</h3>
            <p>Track your delivery from pickup to doorstep.</p>
          </div>
          <StatusBadge status={trackedOrder?.status || "No shipments"} />
        </div>
        <label className="auth-field"><span>Select delivery</span><select value={trackedOrder?.id || ""} onChange={(event) => setSelectedId(event.target.value)}><option value="" disabled>Select a shipment</option>{orders.map((order) => <option key={order.id} value={order.id}>{order.id}</option>)}</select></label>
        <div className="customer-shipment-id">{trackedOrder?.id || "No deliveries yet"}</div>
        <div className="customer-shipment-route">
          <span>{origin}</span>
          <i aria-hidden="true" />
          <span>{destination}</span>
        </div>
        <p className="customer-eta">
          Estimated arrival <strong>{trackedOrder?.eta || "--"}</strong>
        </p>
        <p>Tracking: {trackedOrder?.trackingNumber || "--"}</p>
        <ol>{trackedOrder?.statusHistory?.map((entry, index) => <li key={index}>{entry.status} - {new Date(entry.timestamp).toLocaleString()}</li>)}</ol>
        <p className="role-demo-note">
          Only shipments linked to your account are shown.
        </p>
      </section>
    </>
  );
}

