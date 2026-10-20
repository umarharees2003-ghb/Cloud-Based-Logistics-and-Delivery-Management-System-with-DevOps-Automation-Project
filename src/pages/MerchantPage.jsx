import React from "react";
import OrdersTable from "../components/OrdersTable";
import RolePhotoGallery from "../components/RolePhotoGallery";

export default function MerchantPage({
  activeSection,
  account,
  orders,
  onStatusChange,
  onDriverChange,
}) {
  if (activeSection === "merchant-profile") {
    return (
      <section className="ops-card role-info-panel">
        <div className="ops-card-heading">
          <div>
            <h3>Business profile</h3>
            <p>Contact information for this sample merchant account.</p>
          </div>
        </div>
        <div className="secondary-grid">
          <article className="secondary-card">
            <span>Business contact</span>
            <strong>{account?.name ? account.name.split("@")[0] : "Demo Merchant"}</strong>
            <p>Business Client / Merchant</p>
          </article>
          <article className="secondary-card">
            <span>Account email</span>
            <strong>
              {account?.name && account.name.includes("@") ? account.name : "Demo account"}
            </strong>
            <p>Merchant contact</p>
          </article>
        </div>
      </section>
    );
  }

  const deliveredCount = orders.filter((order) => order.status === "Delivered").length;

  if (activeSection === "merchant-orders") {
    return (
      <section className="ops-card recent-card">
        <div className="ops-card-heading">
          <div>
            <h3>Sample shipments</h3>
            <p>Example merchant orders. Create a shipment to try the local demo flow.</p>
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

  return (
    <>
      <section className="ops-metrics" aria-label="Merchant shipment summary">
        <article className="ops-metric-card">
          <span className="ops-metric-label">Sample shipments</span>
          <strong>{orders.length}</strong>
          <span className="ops-metric-delta">Across this demo account</span>
        </article>

        <article className="ops-metric-card">
          <span className="ops-metric-label">In transit</span>
          <strong>{orders.filter((order) => order.status === "In transit").length}</strong>
          <span className="ops-metric-delta">On the way to customers</span>
        </article>

        <article className="ops-metric-card">
          <span className="ops-metric-label">Delivered</span>
          <strong>{deliveredCount}</strong>
          <span className="ops-metric-delta">Completed sample orders</span>
        </article>

        <article className="ops-metric-card">
          <span className="ops-metric-label">Needs attention</span>
          <strong>{orders.filter((order) => order.status === "Delayed").length}</strong>
          <span className="ops-metric-delta">Sample delayed orders</span>
        </article>
      </section>

      <RolePhotoGallery roleId="merchant" />

      <section className="ops-card recent-card">
        <div className="ops-card-heading">
          <div>
            <h3>Recent sample shipments</h3>
            <p>Example orders in the merchant workspace.</p>
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
    </>
  );
}

