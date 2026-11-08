import React from "react";
import MetricCard from "../components/common/MetricCard";
import { useReports } from "../hooks/useReports";
import NoticeBanner from "../components/common/NoticeBanner";

export default function AnalyticsPage({ orders = [] }) {
  const { report, error } = useReports(orders);
  const shipmentVolume = report?.weeklyVolume || [];
  const delivered = orders.filter((order) => order.status === "Delivered").length;

  return (
    <>
      <NoticeBanner message={error} />
      <section className="ops-metrics report-metrics">
        <MetricCard
          label="Delivery success"
          value={report?.performance?.successRate ?? "--"}
          delta="Completed / total recorded shipments"
        />
        <MetricCard
          label="Completed in this view"
          value={delivered}
          delta={`of ${orders.length} orders`}
        />
        <MetricCard
          label="Average delivery time"
          value={report?.performance?.averageDeliveryTime || "--"}
          delta="No timing measurements available"
        />
        <MetricCard
          label="Customer satisfaction"
          value={report?.performance?.customerSatisfaction || "--"}
          delta="No customer ratings recorded"
        />
      </section>

      <section className="ops-card analytics-details">
        <div className="ops-card-heading">
          <div>
            <h3>Weekly performance</h3>
            <p>Shipments created by day</p>
          </div>
          <span className="report-period">Last 7 days</span>
        </div>
        <div className="report-bars">
          {shipmentVolume.map((day) => (
            <div key={day.day}>
              <span>{day.count} deliveries</span>
              <i style={{ width: `${(day.count / Math.max(1, ...shipmentVolume.map((item) => item.count))) * 100}%` }} />
              <strong>{day.day}</strong>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
