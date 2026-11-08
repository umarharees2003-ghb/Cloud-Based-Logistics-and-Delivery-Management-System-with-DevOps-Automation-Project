import React from "react";
import ProfileForm from "../components/common/ProfileForm";
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
            <p>Contact information for this merchant account.</p>
          </div>
        </div>
        <div className="secondary-grid">
          <article className="secondary-card">
            <span>Business contact</span>
            <strong>{account?.name ? account.name.split("@")[0] : "Merchant"}</strong>
            <p>Business Client / Merchant</p>
          </article>
          <article className="secondary-card">
            <span>Account email</span>
            <strong>
              {account?.email || "--"}
            </strong>
            <p>Merchant contact</p>
          </article>
        </div>
        <ProfileForm account={account} />
      </section>
    );
  }

  const deliveredCount = orders.filter((order) => order.status === "Delivered").length;

  if (activeSection === "merchant-orders") {
    return (
      <section className="ops-card recent-card">
        <div className="ops-card-heading">
          <div>
            <h3>Shipments</h3>
            <p>Create a shipment to add it to your account.</p>
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
          label="Shipments"
          value={orders.length}
          delta="Across your account"
        />
        <MetricCard
          label="In transit"
          value={orders.filter((order) => order.status === "In transit").length}
          delta="On the way to customers"
        />
        <MetricCard
          label="Delivered"
          value={deliveredCount}
          delta="Completed orders"
        />
        <MetricCard
          label="Needs attention"
          value={orders.filter((order) => order.status === "Delayed").length}
          delta="Delayed orders"
        />
      </section>

      <RolePhotoGallery roleId="merchant" />

      <section className="ops-card recent-card">
        <div className="ops-card-heading">
          <div>
            <h3>Recent shipments</h3>
            <p>Latest orders in your merchant workspace.</p>
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
