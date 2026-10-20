import React from "react";
import MetricCard from "../components/common/MetricCard";
import { shipmentVolume } from "../data/demoData";

export default function AnalyticsPage({ orders = [] }) {
  const delivered = orders.filter((order) => order.status === "Delivered").length;

  return (
    <>
      <section className="ops-metrics report-metrics">
        <MetricCard
          label="Delivery success"
          value="96.8%"
          delta="↑ 2.4% vs last week"
        />
        <MetricCard
          label="Completed in this view"
          value={delivered}
          delta={`of ${orders.length} sample orders`}
        />
        <MetricCard
          label="Average delivery time"
          value="2h 18m"
          delta="↓ 14 min vs last week"
        />
        <MetricCard
          label="Customer satisfaction"
          value="4.9 / 5"
          delta="From 328 ratings"
        />
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
