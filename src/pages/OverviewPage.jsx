import React from "react";
import OrdersTable from "../components/OrdersTable";
import RolePhotoGallery from "../components/RolePhotoGallery";
import { overviewMetrics, shipmentVolume } from "../data/demoData";

export default function OverviewPage({
  orders,
  onStatusChange,
  onDriverChange,
  role,
  onNavigate,
  drivers,
}) {
  const deliveryCount = orders.length;

  return (
    <>
      <section className="ops-metrics" aria-label="Delivery summary">
        {overviewMetrics.map((metric) => (
          <article className="ops-metric-card" key={metric.label}>
            <span className={`ops-metric-icon ${metric.tone}`}>{metric.icon}</span>
            <span className="ops-metric-label">{metric.label}</span>
            <strong>
              {metric.label === "Total deliveries"
                ? deliveryCount.toLocaleString()
                : metric.value}
            </strong>
            <span className="ops-metric-delta">{metric.delta}</span>
          </article>
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
                  <span style={{ height: `${(count / 72) * 100}%` }} />
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
              <p>Active routes across your service area</p>
            </div>
            <span className="live-pill">
              <i /> Live
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
              28 active drivers
            </span>
            <span>18 routes</span>
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

