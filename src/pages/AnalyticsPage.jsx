import React from "react";
import { shipmentVolume } from "../data/demoData";

export default function AnalyticsPage({ orders }) {
  const delivered = orders.filter((order) => order.status === "Delivered").length;

  return (
    <>
      <section className="ops-metrics report-metrics">
        <article className="ops-metric-card">
          <span className="ops-metric-label">Delivery success</span>
          <strong>96.8%</strong>
          <span className="ops-metric-delta">↑ 2.4% vs last week</span>
        </article>

        <article className="ops-metric-card">
          <span className="ops-metric-label">Completed in this view</span>
          <strong>{delivered}</strong>
          <span className="ops-metric-delta">of {orders.length} sample orders</span>
        </article>

        <article className="ops-metric-card">
          <span className="ops-metric-label">Average delivery time</span>
          <strong>2h 18m</strong>
          <span className="ops-metric-delta">↓ 14 min vs last week</span>
        </article>

        <article className="ops-metric-card">
          <span className="ops-metric-label">Customer satisfaction</span>
          <strong>4.9 / 5</strong>
          <span className="ops-metric-delta">From 328 ratings</span>
        </article>
      </section>

      <section className="ops-card analytics-details">
        <div className="ops-card-heading">
          <div>
            <h3>Weekly performance</h3>
            <p>Completed deliveries by day</p>
          </div>
          <span className="report-period">Last 7 days</span>
        </div>
        <div className="report-bars">
          {shipmentVolume.map((day) => (
            <div key={day.day}>
              <span>{day.count} deliveries</span>
              <i style={{ width: `${(day.count / 72) * 100}%` }} />
              <strong>{day.day}</strong>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

