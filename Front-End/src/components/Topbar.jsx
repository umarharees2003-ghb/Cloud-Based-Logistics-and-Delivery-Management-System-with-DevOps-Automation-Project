import React, { useEffect, useState } from "react";
import { apiRequest } from "../services/apiClient";

export default function Topbar({
  onToggleSidebar,
  activeItem,
  account,
  onSignOut,
  onNotice,
}) {
  const [health, setHealth] = useState("Checking service");
  useEffect(() => { let active = true; apiRequest("/health/ready").then(() => { if (active) setHealth("Service connected"); }).catch(() => { if (active) setHealth("Service unavailable"); }); return () => { active = false; }; }, []);
  async function notifications() {
    try {
      const res = await apiRequest("/notifications");
      const items = res.data || [];
      onNotice(items.length ? items.map((item) => `${item.title}: ${item.message}`).join(" | ") : "No notifications.");
    } catch (error) { onNotice(error.message); }
  }
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
          {health}
        </span>

        <button
          className="notification-button"
          type="button"
          aria-label="Notifications"
          onClick={notifications}
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

