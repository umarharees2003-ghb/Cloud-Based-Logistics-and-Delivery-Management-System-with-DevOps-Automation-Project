import React from "react";
import BrandMark from "./BrandMark";

export default function Sidebar({
  isOpen,
  onClose,
  activeSection,
  onSelectSection,
  navigationGroups,
  role,
  account,
  onSignOut,
  onNotice,
  getNavigationCount,
}) {
  return (
    <aside className={`ops-sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <a
        className="brand ops-brand"
        href="#overview"
        onClick={(event) => {
          event.preventDefault();
          onSelectSection("overview");
        }}
      >
        <BrandMark />
        <span>routeflow</span>
      </a>

      <div className="workspace-switch">
        <span className="workspace-avatar">R</span>
        <span>
          <strong>Routeflow Logistics</strong>
          <small>{role.workspace}</small>
        </span>
        <span className="switch-chevron">⌄</span>
      </div>

      <nav className="ops-nav" aria-label="Operations navigation">
        {navigationGroups.map((group) => (
          <div className="nav-group" key={group.label}>
            <span className="nav-group-label">{group.label}</span>
            {group.items.map((item) => {
              const count = getNavigationCount ? getNavigationCount(item) : null;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`ops-nav-link ${activeSection === item.id ? "selected" : ""}`}
                  onClick={() => {
                    onSelectSection(item.id);
                    if (onClose) onClose();
                  }}
                >
                  <span className="nav-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {count !== null && <span className="nav-count">{count}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="support-card">
          <span className="support-icon">✳</span>
          <strong>Need a hand?</strong>
          <p>Our logistics team is here to help.</p>
          <button
            type="button"
            onClick={() => onNotice("Support request noted. Our team will be in touch.")}
          >
            Contact support <span>→</span>
          </button>
        </div>

        <button className="sidebar-profile" type="button" onClick={onSignOut}>
          <span className="profile-avatar">
            {account?.name ? account.name.slice(0, 1).toUpperCase() : "U"}
          </span>
          <span>
            <strong>{account?.name || "Demo user"}</strong>
            <small>{role.label} · Sign out</small>
          </span>
          <span className="profile-more">↗</span>
        </button>
      </div>
    </aside>
  );
}

