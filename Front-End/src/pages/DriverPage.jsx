import React from "react";
import OrdersTable from "../components/OrdersTable";
import RolePhotoGallery from "../components/RolePhotoGallery";
import StatusBadge from "../components/StatusBadge";
import ProfileForm from "../components/common/ProfileForm";
import MetricCard from "../components/common/MetricCard";

export default function DriverPage({
  activeSection,
  profile,
  account,
  assignedDemoOrders = [],
  onStatusChange,
  onDriverChange,
  onNavigate,
}) {
  if (activeSection === "driver-profile") return <section className="ops-card role-info-panel"><h3>My profile</h3><ProfileForm account={account} /></section>;
  if (activeSection === "deliveries") {
    return (
      <section className="ops-card recent-card">
        <div className="ops-card-heading">
          <div>
            <h3>Assigned deliveries</h3>
            <p>Update delivery statuses for your route.</p>
          </div>
        </div>
        <OrdersTable
          orders={assignedDemoOrders}
          onStatusChange={onStatusChange}
          onDriverChange={onDriverChange}
          canAssignDriver={false}
        />
      </section>
    );
  }

  if (activeSection === "driver-route") {
    return (
      <section className="ops-card driver-route-panel">
        <div className="ops-card-heading">
          <div>
            <h3>Today’s route</h3>
            <p>Your assigned delivery routes</p>
          </div>
          <StatusBadge status="On route" />
        </div>
        <ol className="route-stops">
          {assignedDemoOrders.filter((order) => !["Delivered", "Cancelled"].includes(order.status)).map((order, index) => (
            <li key={order.id}><span>{index + 1}</span><div><strong>{order.route}</strong><small>{order.id} - {order.eta}</small></div></li>
          ))}
          {!assignedDemoOrders.length && <li>No assigned routes.</li>}
        </ol>
      </section>
    );
  }

  return (
    <>
      <section className="ops-metrics" aria-label="My route summary">
        <MetricCard
          label="Assigned deliveries"
          value={assignedDemoOrders.length}
          delta="On your assigned route"
        />
        <MetricCard
          label="Next stop"
          value={assignedDemoOrders.find((order) => !["Delivered", "Cancelled"].includes(order.status))?.eta || "--"}
          delta="Next assigned delivery"
        />
        <MetricCard
          label="Completed"
          value={assignedDemoOrders.filter((order) => order.status === "Delivered").length}
          delta="Keep your route moving"
        />
        <MetricCard
          label="Vehicle"
          value={profile?.vehicle || "--"}
          delta={profile?.zone || "No fleet profile"}
        />
      </section>

      <RolePhotoGallery roleId="driver" />

      <section className="ops-card recent-card">
        <div className="ops-card-heading">
          <div>
            <h3>My deliveries</h3>
            <p>Saved assignments for your account.</p>
          </div>
          <button
            className="ops-text-button"
            type="button"
            onClick={() => onNavigate("deliveries")}
          >
            View route <span>→</span>
          </button>
        </div>
        <OrdersTable
          orders={assignedDemoOrders.slice(0, 3)}
          onStatusChange={onStatusChange}
          onDriverChange={onDriverChange}
          canAssignDriver={false}
        />
      </section>
    </>
  );
}
