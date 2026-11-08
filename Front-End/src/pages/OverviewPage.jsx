import React from "react";
import OrdersTable from "../components/OrdersTable";
import RolePhotoGallery from "../components/RolePhotoGallery";
import MetricCard from "../components/common/MetricCard";
import { useReports } from "../hooks/useReports";
import NoticeBanner from "../components/common/NoticeBanner";

export default function OverviewPage({
  orders = [],
  onStatusChange,
  onDriverChange,
  role,
  onNavigate,
  drivers,
}) {
  const { report, error } = useReports(orders);
  const overviewMetrics = report?.metrics || [];
  const shipmentVolume = report?.weeklyVolume || [];

  return (
    <>
      <NoticeBanner message={error} />
      <section className="ops-metrics" aria-label="Delivery summary">
        {overviewMetrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            delta={metric.delta}
            icon={metric.icon}
            tone={metric.tone}
          />
        ))}
      </section>

      <RolePhotoGallery roleId={role.id} />

      <div className="ops-content-grid">
        <section className="ops-card activity-card">
          <div className="ops-card-heading">
            <div>
              <h3>Delivery activity</h3>
              <p>Orders processed over the last 7 days</p>
            </div>
            <button
              className="ops-select"
              type="button"
              onClick={() => onNavigate("analytics")}
            >
              This week⌄
            </button>
          </div>
          <div className="activity-chart" aria-label="Weekly delivery volume">
            {shipmentVolume.map(({ day, count }) => (
              <div className="chart-column" key={day}>
                <span className="chart-count">{count}</span>
                <div className="chart-track">
                  <span style={{ height: `${(count / Math.max(1, ...shipmentVolume.map((item) => item.count))) * 100}%` }} />
                </div>
                <span className="chart-day">{day}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="ops-card route-card">
          <div className="ops-card-heading">
            <div>
              <h3>Live network</h3>
              <p>Service area illustration - See deliveries for route status</p>
            </div>
            <span className="live-pill">
              <i /> Network
            </span>
          </div>
          <div className="ops-map">
            <span className="map-grid" />
            <span className="ops-map-route route-alpha" />
            <span className="ops-map-route route-beta" />
            <span className="ops-map-route route-gamma" />
            <i className="ops-map-pin pin-alpha">●</i>
            <i className="ops-map-pin pin-beta">●</i>
            <i className="ops-map-pin pin-gamma">●</i>
            <i className="ops-map-pin pin-delta">●</i>
            <span className="map-city city-newark">Newark</span>
            <span className="map-city city-brooklyn">Brooklyn</span>
            <span className="map-city city-manhattan">Manhattan</span>
          </div>
          <div className="route-summary">
            <span>
              <i className="legend-dot green-dot" />
              {report?.summary?.activeDrivers ?? 0} active drivers
            </span>
            <span>{orders.filter((order) => ["In transit", "Out for delivery"].includes(order.status)).length} routes</span>
          </div>
        </section>
      </div>

      <section className="ops-card recent-card">
        <div className="ops-card-heading">
          <div>
            <h3>Recent deliveries</h3>
            <p>Keep track of your latest orders</p>
          </div>
          <button
            className="ops-text-button"
            type="button"
            onClick={() => onNavigate("deliveries")}
          >
            View all deliveries <span>→</span>
          </button>
        </div>
        <OrdersTable
          orders={orders.slice(0, 5)}
          onStatusChange={onStatusChange}
          onDriverChange={onDriverChange}
          compact
          drivers={drivers}
        />
      </section>
    </>
  );
}
