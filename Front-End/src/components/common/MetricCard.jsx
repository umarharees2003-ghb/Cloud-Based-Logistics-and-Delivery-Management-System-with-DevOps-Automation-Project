import React from "react";

export default function MetricCard({ label, value, delta, icon, tone }) {
  return (
    <article className="ops-metric-card">
      {icon && <span className={`ops-metric-icon ${tone || ""}`}>{icon}</span>}
      <span className="ops-metric-label">{label}</span>
      <strong>{value}</strong>
      {delta && <span className="ops-metric-delta">{delta}</span>}
    </article>
  );
}

