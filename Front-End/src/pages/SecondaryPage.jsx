import React from "react";
import { secondarySectionsContent } from "../data/demoData";

export default function SecondaryPage({ activeSection, account, driverCount = 4 }) {
  const defaultContent = {
    title: "Operations section",
    description: "Detailed view of your logistics settings and operational tools.",
    cards: [],
  };

  const sectionData = secondarySectionsContent[activeSection] || defaultContent;

  // Dynamically tailor team cards if viewing the team section
  const cards =
    activeSection === "team"
      ? [
          ["Operations team", "12 members", "Dispatch and support"],
          ["Drivers", `${driverCount} active profiles`, "Manage from Fleet management"],
          ["Administrator", account?.name || "Demo account", "Full workspace access"],
          ["Access policy", "Role-based access", "Permissions are configurable"],
        ]
      : sectionData.cards;

  return (
    <section className="ops-card secondary-section">
      <div className="ops-card-heading">
        <div>
          <h3>{sectionData.title}</h3>
          <p>{sectionData.description}</p>
        </div>
      </div>
      <div className="secondary-grid">
        {cards.map(([title, value, detail]) => (
          <article className="secondary-card" key={title}>
            <span>{title}</span>
            <strong>{value}</strong>
            <p>{detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

