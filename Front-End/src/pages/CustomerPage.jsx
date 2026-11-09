import React from "react";
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
  if (activeSection === "customer-profile") {
    return (
      <section className="ops-card role-info-panel">
        <div className="ops-card-heading">
          <div>
            <h3>My profile</h3>
            <p>Contact details for this sample customer account.</p>
          </div>
        </div>
        <div className="secondary-grid">
          <article className="secondary-card">
            <span>Name</span>
            <strong>{account?.name ? account.name.split("@")[0] : "Demo Customer"}</strong>
            <p>Customer / Sender</p>
          </article>
          <article className="secondary-card">
            <span>Email</span>
            <strong>
              {account?.name && account.name.includes("@") ? account.name : "Demo account"}
            </strong>
            <p>Account contact</p>
          </article>
        </div>
      </section>
    );
  }

  const trackedOrder = orders[0] || {
    id: "SHP-10482",
    route: "Newark → Brooklyn",
    status: "In transit",
    eta: "14:30",
  };

  if (activeSection === "customer-history") {
    return (
      <section className="ops-card recent-card">
        <div className="ops-card-heading">
          <div>
            <h3>Sample delivery history</h3>
            <p>Example shipment records for the customer portal preview.</p>
          </div>
        </div>
        <OrdersTable
          orders={orders.slice(0, 3)}
          onStatusChange={onStatusChange}
          onDriverChange={onDriverChange}
          canAssignDriver={false}
          canUpdateStatus={false}
        />
      </section>
    );
  }

  const [origin, destination] = splitRoute(trackedOrder.route);

  return (
    <>
      <RolePhotoGallery roleId="customer" />
      <section className="ops-card customer-tracking-card">
        <div className="ops-card-heading">
          <div>
            <h3>Your sample shipment</h3>
            <p>Track this example delivery from pickup to doorstep.</p>
          </div>
          <StatusBadge status={trackedOrder.status} />
        </div>
        <div className="customer-shipment-id">{trackedOrder.id}</div>
        <div className="customer-shipment-route">
          <span>{origin}</span>
          <i aria-hidden="true" />
          <span>{destination}</span>
        </div>
        <p className="customer-eta">
          Estimated arrival <strong>{trackedOrder.eta}</strong>
        </p>
        <p className="role-demo-note">
          Example shipment data only. A real customer account would only show its own shipments.
        </p>
      </section>
    </>
  );
}

