import React from "react";
import OrdersTable from "../components/OrdersTable";
import RolePhotoGallery from "../components/RolePhotoGallery";
import MetricCard from "../components/common/MetricCard";

export default function MerchantPage({
  activeSection,
  account,
  orders = [],
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
        <MetricCard
          label="Sample shipments"
          value={orders.length}
          delta="Across this demo account"
        />
        <MetricCard
          label="In transit"
          value={orders.filter((order) => order.status === "In transit").length}
          delta="On the way to customers"
        />
        <MetricCard
          label="Delivered"
          value={deliveredCount}
          delta="Completed sample orders"
        />
        <MetricCard
          label="Needs attention"
          value={orders.filter((order) => order.status === "Delayed").length}
          delta="Sample delayed orders"
        />
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
