import React from "react";
import OrdersTable from "../components/OrdersTable";
import RolePhotoGallery from "../components/RolePhotoGallery";
import StatusBadge from "../components/StatusBadge";
import MetricCard from "../components/common/MetricCard";

export default function DriverPage({
  activeSection,
  assignedDemoOrders = [],
  onStatusChange,
  onDriverChange,
  onNavigate,
}) {
  if (activeSection === "deliveries") {
    return (
      <section className="ops-card recent-card">
        <div className="ops-card-heading">
          <div>
            <h3>Assigned demo deliveries</h3>
            <p>Update delivery statuses for your sample route.</p>
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
            <p>Sample route · Brooklyn delivery zone</p>
          </div>
          <StatusBadge status="On route" />
        </div>
        <ol className="route-stops">
          <li>
            <span>1</span>
            <div>
              <strong>Newark distribution hub</strong>
              <small>Pickup · 12:15</small>
            </div>
          </li>
          <li>
            <span>2</span>
            <div>
              <strong>Williamsburg, Brooklyn</strong>
              <small>Delivery · 14:30</small>
            </div>
          </li>
          <li>
            <span>3</span>
            <div>
              <strong>Brooklyn Heights</strong>
              <small>Next stop · 14:55</small>
            </div>
          </li>
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
          delta="On today’s sample route"
        />
        <MetricCard
          label="Next stop"
          value="14:30"
          delta="Brooklyn, NY"
        />
        <MetricCard
          label="Completed today"
          value={assignedDemoOrders.filter((order) => order.status === "Delivered").length}
          delta="Keep your route moving"
        />
        <MetricCard
          label="Vehicle"
          value="V-204"
          delta="Van · Brooklyn zone"
        />
      </section>

      <RolePhotoGallery roleId="driver" />

      <section className="ops-card recent-card">
        <div className="ops-card-heading">
          <div>
            <h3>My deliveries</h3>
            <p>Sample assignments for the driver demo.</p>
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
