import React from "react";

export default function Topbar({
  onToggleSidebar,
  activeItem,
  account,
  onSignOut,
  onNotice,
}) {
  return (
    <header className="ops-topbar">
      <button
        className="mobile-menu"
        aria-label="Open navigation"
        type="button"
        onClick={onToggleSidebar}
      >
        ☰
      </button>

      <div className="breadcrumb">
        <span>Workspace</span>
        <b>/</b>
        <strong>{activeItem?.label || "Overview"}</strong>
      </div>

      <div className="topbar-tools">
        <span className="system-status">
          <i />
          All systems operational
        </span>

        <button
          className="notification-button"
          type="button"
          aria-label="Notifications"
          onClick={() => onNotice("You are all caught up. No new notifications.")}
        >
          ♧<i />
        </button>

        <span className="topbar-divider" />

        <button className="topbar-user" type="button" onClick={onSignOut}>
          <span className="profile-avatar">
            {account?.name ? account.name.slice(0, 1).toUpperCase() : "U"}
          </span>
          <span>{account?.name || "Demo user"}</span>
          <span>⌄</span>
        </button>
      </div>
    </header>
  );
}

