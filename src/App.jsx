import React, { useState } from "react";

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 36 36" fill="none">
        <path
          d="M18 3.75 31.25 11.4v13.2L18 32.25 4.75 24.6V11.4L18 3.75Z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="m11 22.5 5-9h9l-5 9h-9Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="11" cy="22.5" r="2" fill="currentColor" />
        <circle cx="20" cy="22.5" r="2" fill="currentColor" />
      </svg>
    </span>
  );
}

const shipments = [
  { id: "SHP-10482", customer: "Miriam Patel", route: "Newark → Brooklyn", status: "In transit", eta: "14:30", city: "New York, NY" },
  { id: "SHP-10481", customer: "James Liu", route: "Jersey City → Queens", status: "Delayed", eta: "14:45", city: "Queens, NY" },
  { id: "SHP-10480", customer: "Olivia Martin", route: "Newark → Manhattan", status: "Delivered", eta: "13:12", city: "New York, NY" },
  { id: "SHP-10479", customer: "Ethan Brooks", route: "Elizabeth → Hoboken", status: "Out for delivery", eta: "15:10", city: "Hoboken, NJ" },
  { id: "SHP-10478", customer: "Sophia Chen", route: "Newark → Staten Island", status: "Pending", eta: "16:00", city: "Staten Island, NY" },
  { id: "SHP-10477", customer: "Noah Williams", route: "Newark → Manhattan", status: "In transit", eta: "14:38", city: "New York, NY" },
  { id: "SHP-10476", customer: "Ava Thompson", route: "Brooklyn → Manhattan", status: "Delivered", eta: "12:48", city: "New York, NY" },
  { id: "SHP-10475", customer: "Lucas Garcia", route: "Jersey City → Bronx", status: "Out for delivery", eta: "15:25", city: "Bronx, NY" },
];

const shipmentVolume = [
  { day: "Wed", count: 42 },
  { day: "Thu", count: 58 },
  { day: "Fri", count: 51 },
  { day: "Sat", count: 31 },
  { day: "Sun", count: 26 },
  { day: "Mon", count: 57 },
  { day: "Tue", count: 72 },
];

const sidebarGroups = [
  {
    label: "Workspace",
    items: [
      { id: "overview", label: "Overview", icon: "⌂" },
      { id: "deliveries", label: "Deliveries", icon: "▤", badge: "248" },
      { id: "fleet", label: "Fleet management", icon: "▰" },
      { id: "devops", label: "DevOps automation", icon: "⌘" },
    ],
  },
  {
    label: "Administration",
    items: [
      { id: "analytics", label: "Analytics & reports", icon: "▥" },
      { id: "team", label: "Team & access", icon: "♙" },
      { id: "integrations", label: "Integrations", icon: "⌁" },
      { id: "settings", label: "Settings", icon: "⚙" },
    ],
  },
];

const initialOrders = [
  { id: "SHP-10482", customer: "Miriam Patel", route: "Newark → Brooklyn", status: "In transit", eta: "14:30", driver: "Alex Lee" },
  { id: "SHP-10481", customer: "James Liu", route: "Jersey City → Queens", status: "Delayed", eta: "14:45", driver: "Morgan Reed" },
  { id: "SHP-10480", customer: "Olivia Martin", route: "Newark → Manhattan", status: "Delivered", eta: "13:12", driver: "Sam Rivera" },
  { id: "SHP-10479", customer: "Ethan Brooks", route: "Elizabeth → Hoboken", status: "Out for delivery", eta: "15:10", driver: "Alex Lee" },
  { id: "SHP-10478", customer: "Sophia Chen", route: "Newark → Staten Island", status: "Pending", eta: "16:00", driver: "Unassigned" },
  { id: "SHP-10477", customer: "Noah Williams", route: "Newark → Manhattan", status: "In transit", eta: "14:38", driver: "Jamie Park" },
  { id: "SHP-10476", customer: "Ava Thompson", route: "Brooklyn → Manhattan", status: "Delivered", eta: "12:48", driver: "Sam Rivera" },
  { id: "SHP-10475", customer: "Lucas Garcia", route: "Jersey City → Bronx", status: "Out for delivery", eta: "15:25", driver: "Taylor Morgan" },
];

const initialDrivers = [
  { name: "Alex Lee", initials: "AL", vehicle: "Van · V-204", zone: "Brooklyn", status: "On route", deliveries: 8 },
  { name: "Morgan Reed", initials: "MR", vehicle: "Van · V-118", zone: "Queens", status: "On route", deliveries: 6 },
  { name: "Sam Rivera", initials: "SR", vehicle: "Truck · T-032", zone: "Manhattan", status: "Available", deliveries: 0 },
  { name: "Jamie Park", initials: "JP", vehicle: "Van · V-081", zone: "Newark", status: "On route", deliveries: 5 },
];

const overviewMetrics = [
  { label: "Total deliveries", value: "1,284", delta: "+12.8%", icon: "↗", tone: "mint" },
  { label: "In transit", value: "342", delta: "28 drivers active", icon: "⇢", tone: "blue" },
  { label: "Delivered today", value: "876", delta: "96.8% on time", icon: "✓", tone: "purple" },
  { label: "Needs attention", value: "12", delta: "4 delayed orders", icon: "!", tone: "orange" },
];

const welcomeFeatures = [
  {
    icon: "⌖",
    title: "See every delivery",
    description: "Track orders and route progress from dispatch to the final stop.",
  },
  {
    icon: "↗",
    title: "Plan smarter routes",
    description: "Give your team the context to adapt quickly when plans change.",
  },
  {
    icon: "◎",
    title: "Keep teams in sync",
    description: "Bring drivers, dispatchers, and customer updates into one view.",
  },
];

function StatusBadge({ status }) {
  const className = status.toLowerCase().replaceAll(" ", "-");
  return <span className={`status-badge status-${className}`}>{status}</span>;
}

function OperationsWorkspace({ accountLabel, onSignOut }) {
  const [activeSection, setActiveSection] = useState("overview");
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [drivers, setDrivers] = useState(initialDrivers);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allItems = sidebarGroups.flatMap((group) => group.items);
  const activeItem = allItems.find((item) => item.id === activeSection) ?? allItems[0];
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = `${order.id} ${order.customer} ${order.route} ${order.driver}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesSearch && (statusFilter === "All statuses" || order.status === statusFilter);
  });

  function createOrder(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextOrder = {
      id: `SHP-${10500 + orders.length}`,
      customer: String(formData.get("customer")).trim(),
      route: `${String(formData.get("pickup")).trim()} → ${String(formData.get("dropoff")).trim()}`,
      status: "Pending",
      eta: String(formData.get("eta")),
      driver: "Unassigned",
    };
    setOrders((current) => [nextOrder, ...current]);
    setShowOrderForm(false);
    setActiveSection("deliveries");
    setSearch("");
    setStatusFilter("All statuses");
    setNotice(`Delivery ${nextOrder.id} has been created.`);
    window.setTimeout(() => setNotice(""), 4000);
  }

  function updateOrderStatus(id, status) {
    setOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order));
  }

  function assignDriver(id, driver) {
    setOrders((current) => current.map((order) => order.id === id ? { ...order, driver } : order));
  }

  function renderOverview() {
    const deliveryCount = orders.length;
    return (
      <>
        <section className="ops-metrics" aria-label="Delivery summary">
          {overviewMetrics.map((metric) => (
            <article className="ops-metric-card" key={metric.label}>
              <span className={`ops-metric-icon ${metric.tone}`}>{metric.icon}</span>
              <span className="ops-metric-label">{metric.label}</span>
              <strong>{metric.label === "Total deliveries" ? deliveryCount.toLocaleString() : metric.value}</strong>
              <span className="ops-metric-delta">{metric.delta}</span>
            </article>
          ))}
        </section>
        <div className="ops-content-grid">
          <section className="ops-card activity-card">
            <div className="ops-card-heading">
              <div><h3>Delivery activity</h3><p>Orders processed over the last 7 days</p></div>
              <button className="ops-select" type="button" onClick={() => setActiveSection("analytics")}>This week⌄</button>
            </div>
            <div className="activity-chart" aria-label="Weekly delivery volume">
              {shipmentVolume.map(({ day, count }) => (
                <div className="chart-column" key={day}>
                  <span className="chart-count">{count}</span>
                  <div className="chart-track"><span style={{ height: `${count / 72 * 100}%` }} /></div>
                  <span className="chart-day">{day}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="ops-card route-card">
            <div className="ops-card-heading">
              <div><h3>Live network</h3><p>Active routes across your service area</p></div>
              <span className="live-pill"><i /> Live</span>
            </div>
            <div className="ops-map">
              <span className="map-grid" />
              <span className="ops-map-route route-alpha" />
              <span className="ops-map-route route-beta" />
              <span className="ops-map-route route-gamma" />
              <i className="ops-map-pin pin-alpha">●</i><i className="ops-map-pin pin-beta">●</i>
              <i className="ops-map-pin pin-gamma">●</i><i className="ops-map-pin pin-delta">●</i>
              <span className="map-city city-newark">Newark</span><span className="map-city city-brooklyn">Brooklyn</span>
              <span className="map-city city-manhattan">Manhattan</span>
            </div>
            <div className="route-summary"><span><i className="legend-dot green-dot" />28 active drivers</span><span>18 routes</span></div>
          </section>
        </div>
        <section className="ops-card recent-card">
          <div className="ops-card-heading">
            <div><h3>Recent deliveries</h3><p>Keep track of your latest orders</p></div>
            <button className="ops-text-button" type="button" onClick={() => setActiveSection("deliveries")}>View all deliveries <span>→</span></button>
          </div>
          <OrdersTable orders={orders.slice(0, 5)} onStatusChange={updateOrderStatus} onDriverChange={assignDriver} compact />
        </section>
      </>
    );
  }

  function renderDeliveries() {
    return (
      <section className="ops-card deliveries-card">
        <div className="delivery-toolbar">
          <label className="ops-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order, customer or route" /></label>
          <select className="ops-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by delivery status">
            {["All statuses", "Pending", "In transit", "Out for delivery", "Delivered", "Delayed"].map((status) => <option key={status}>{status}</option>)}
          </select>
          <button className="ops-outline-button" type="button" onClick={() => { setSearch(""); setStatusFilter("All statuses"); }}>Reset</button>
        </div>
        <OrdersTable orders={filteredOrders} onStatusChange={updateOrderStatus} onDriverChange={assignDriver} />
        {filteredOrders.length === 0 && <p className="empty-state">No deliveries match your search. Try a different keyword or status.</p>}
        <div className="table-footer">Showing {filteredOrders.length} of {orders.length} deliveries <span>Updated just now</span></div>
      </section>
    );
  }

  function renderFleet() {
    return (
      <section className="ops-card fleet-card">
        <div className="ops-card-heading"><div><h3>Driver roster</h3><p>Manage drivers and current assignments</p></div><span className="fleet-count">{drivers.length} drivers</span></div>
        <div className="driver-grid">
          {drivers.map((driver) => (
            <article className="driver-profile" key={driver.name}>
              <div className="driver-profile-top"><span className="driver-initials">{driver.initials}</span><StatusBadge status={driver.status} /></div>
              <h4>{driver.name}</h4><p>{driver.vehicle}</p>
              <div className="driver-profile-detail"><span>Service zone</span><strong>{driver.zone}</strong></div>
              <div className="driver-profile-detail"><span>Active deliveries</span><strong>{driver.deliveries}</strong></div>
              <button className="ops-outline-button assign-button" type="button" onClick={() => setDrivers((current) => current.map((item) => item.name === driver.name ? { ...item, status: item.status === "Available" ? "On route" : "Available" } : item))}>
                {driver.status === "Available" ? "Assign route" : "Mark available"}
              </button>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderAnalytics() {
    const delivered = orders.filter((order) => order.status === "Delivered").length;
    return (
      <>
        <section className="ops-metrics report-metrics">
          <article className="ops-metric-card"><span className="ops-metric-label">Delivery success</span><strong>96.8%</strong><span className="ops-metric-delta">↑ 2.4% vs last week</span></article>
          <article className="ops-metric-card"><span className="ops-metric-label">Completed in this view</span><strong>{delivered}</strong><span className="ops-metric-delta">of {orders.length} sample orders</span></article>
          <article className="ops-metric-card"><span className="ops-metric-label">Average delivery time</span><strong>2h 18m</strong><span className="ops-metric-delta">↓ 14 min vs last week</span></article>
          <article className="ops-metric-card"><span className="ops-metric-label">Customer satisfaction</span><strong>4.9 / 5</strong><span className="ops-metric-delta">From 328 ratings</span></article>
        </section>
        <section className="ops-card analytics-details"><div className="ops-card-heading"><div><h3>Weekly performance</h3><p>Completed deliveries by day</p></div><span className="report-period">Last 7 days</span></div><div className="report-bars">{shipmentVolume.map((day) => <div key={day.day}><span>{day.count} deliveries</span><i style={{ width: `${day.count / 72 * 100}%` }} /><strong>{day.day}</strong></div>)}</div></section>
      </>
    );
  }

  function renderSecondary() {
    if (activeSection === "fleet") return renderFleet();
    if (activeSection === "analytics") return renderAnalytics();
    const content = {
      devops: { title: "DevOps automation", description: "Monitor the health of your delivery platform and deployment pipeline.", cards: [["CI pipeline", "All checks passing", "Last run 8 minutes ago"], ["Deployment", "Production is up to date", "Release v1.8.2"], ["Application health", "Healthy", "99.98% uptime this month"], ["Monitoring", "Active", "Logs and alerts are connected"]] },
      team: { title: "Team & access", description: "Manage the people who keep your deliveries moving.", cards: [["Operations team", "12 members", "Dispatch and support"], ["Drivers", `${drivers.length} active profiles`, "Manage from Fleet management"], ["Administrator", accountLabel || "Demo account", "Full workspace access"], ["Access policy", "Role-based access", "Permissions are configurable"]] },
      integrations: { title: "Integrations", description: "Connect the tools your logistics operation relies on.", cards: [["Maps & routing", "Connected", "Route optimization enabled"], ["Email notifications", "Connected", "Delivery updates enabled"], ["Cloud storage", "Ready to connect", "Store proof of delivery"], ["API access", "Available", "Manage keys in settings"]] },
      settings: { title: "Workspace settings", description: "Configure your Routeflow workspace preferences.", cards: [["Organization", "Routeflow Logistics", "Company profile and service area"], ["Notifications", "Email and in-app", "Choose which events to receive"], ["Security", "Two-step verification", "Protect administrator accounts"], ["Preferences", "America / New York", "Time zone and display options"]] },
    }[activeSection];
    return <section className="ops-card secondary-section"><div className="ops-card-heading"><div><h3>{content.title}</h3><p>{content.description}</p></div></div><div className="secondary-grid">{content.cards.map(([title, value, detail]) => <article className="secondary-card" key={title}><span>{title}</span><strong>{value}</strong><p>{detail}</p></article>)}</div></section>;
  }

  return (
    <div className="ops-app">
      <aside className={`ops-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <a className="brand ops-brand" href="#overview" onClick={(event) => { event.preventDefault(); setActiveSection("overview"); }}><BrandMark /><span>routeflow</span></a>
        <div className="workspace-switch"><span className="workspace-avatar">R</span><span><strong>Routeflow Logistics</strong><small>Operations workspace</small></span><span className="switch-chevron">⌄</span></div>
        <nav className="ops-nav" aria-label="Operations navigation">
          {sidebarGroups.map((group) => <div className="nav-group" key={group.label}><span className="nav-group-label">{group.label}</span>{group.items.map((item) => <button key={item.id} type="button" className={`ops-nav-link ${activeSection === item.id ? "selected" : ""}`} onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}><span className="nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span>{item.id === "deliveries" && <span className="nav-count">{orders.length}</span>}</button>)}</div>)}
        </nav>
        <div className="sidebar-bottom"><div className="support-card"><span className="support-icon">✳</span><strong>Need a hand?</strong><p>Our logistics team is here to help.</p><button type="button" onClick={() => setNotice("Support request noted. Our team will be in touch.")}>Contact support <span>→</span></button></div><button className="sidebar-profile" type="button" onClick={onSignOut}><span className="profile-avatar">{(accountLabel || "D").slice(0, 1).toUpperCase()}</span><span><strong>{accountLabel || "Demo account"}</strong><small>Administrator · Sign out</small></span><span className="profile-more">↗</span></button></div>
      </aside>
      <div className="ops-main">
        <header className="ops-topbar">
          <button className="mobile-menu" aria-label="Open navigation" type="button" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{activeItem.label}</strong></div>
          <div className="topbar-tools"><span className="system-status"><i />All systems operational</span><button className="notification-button" type="button" aria-label="Notifications" onClick={() => setNotice("You are all caught up. No new notifications.")}>♧<i /></button><span className="topbar-divider" /><button className="topbar-user" type="button" onClick={onSignOut}><span className="profile-avatar">{(accountLabel || "D").slice(0, 1).toUpperCase()}</span><span>{accountLabel || "Demo account"}</span><span>⌄</span></button></div>
        </header>
        <main className="ops-page">
          <div className="ops-page-heading"><div><span className="ops-date">TUESDAY, OCTOBER 6, 2026</span><h1>{activeSection === "overview" ? "Good morning, " + ((accountLabel || "there").split("@")[0].split(" ")[0]) : activeItem.label}<span>{activeSection === "overview" ? "." : ""}</span></h1><p>{activeSection === "overview" ? "Here’s what’s happening across your delivery network today." : activeSection === "deliveries" ? "Create, search, assign and track every delivery in one place." : activeSection === "fleet" ? "See driver availability and manage your active routes." : "A clear view of your logistics operation."}</p></div><div className="heading-actions">{activeSection === "deliveries" && <button className="ops-primary-button" type="button" onClick={() => setShowOrderForm(true)}><span>＋</span> New delivery</button>}{activeSection === "overview" && <button className="ops-outline-button" type="button" onClick={() => setActiveSection("deliveries")}>View deliveries <span>→</span></button>}</div></div>
          {notice && <div className="ops-notice" role="status"><span>✓</span>{notice}<button type="button" aria-label="Dismiss notification" onClick={() => setNotice("")}>×</button></div>}
          {activeSection === "overview" && renderOverview()}
          {activeSection === "deliveries" && renderDeliveries()}
          {!["overview", "deliveries"].includes(activeSection) && renderSecondary()}
          <footer className="ops-footer"><span>© 2026 Routeflow Logistics</span><span>Demo workspace · Data is stored in this session only</span></footer>
        </main>
      </div>
      {sidebarOpen && <button className="sidebar-scrim" type="button" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      {showOrderForm && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowOrderForm(false); }}><section className="order-modal" role="dialog" aria-modal="true" aria-labelledby="new-order-title"><div className="modal-heading"><div><span className="modal-eyebrow">DELIVERY DETAILS</span><h2 id="new-order-title">Create a delivery</h2><p>Add a customer and route to get this order moving.</p></div><button type="button" aria-label="Close form" onClick={() => setShowOrderForm(false)}>×</button></div><form className="order-form" onSubmit={createOrder}><label>Customer name<input name="customer" placeholder="e.g. Jordan Smith" minLength="2" required /></label><div className="form-row"><label>Pickup location<input name="pickup" placeholder="City or address" required /></label><label>Drop-off location<input name="dropoff" placeholder="City or address" required /></label></div><label>Estimated delivery time<input name="eta" type="time" defaultValue="16:30" required /></label><div className="modal-actions"><button type="button" className="ops-outline-button" onClick={() => setShowOrderForm(false)}>Cancel</button><button className="ops-primary-button" type="submit">Create delivery</button></div></form></section></div>}
    </div>
  );
}

function OrdersTable({ orders, onStatusChange, onDriverChange, compact = false }) {
  return (
    <div className="orders-table-wrap"><table className={`orders-table ${compact ? "compact-table" : ""}`}><thead><tr><th>Order</th><th>Customer</th><th>Route</th><th>Driver</th><th>Status</th><th>ETA</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><strong className="order-id">{order.id}</strong><span className="order-type">Standard delivery</span></td><td>{order.customer}</td><td>{order.route}</td><td><label className="driver-select-wrap"><span className="assigned-driver"><i>{order.driver === "Unassigned" ? "—" : order.driver.split(" ").map((part) => part[0]).join("")}</i>{order.driver}</span><select aria-label={`Assign driver for ${order.id}`} value={order.driver} onChange={(event) => onDriverChange(order.id, event.target.value)}><option>Unassigned</option>{initialDrivers.map((driver) => <option key={driver.name}>{driver.name}</option>)}</select></label></td><td><label className="status-select-wrap"><StatusBadge status={order.status} /><select aria-label={`Update ${order.id} status`} value={order.status} onChange={(event) => onStatusChange(order.id, event.target.value)}><option>Pending</option><option>In transit</option><option>Out for delivery</option><option>Delivered</option><option>Delayed</option></select><span aria-hidden="true">⌄</span></label></td><td>{order.eta}</td></tr>)}</tbody></table></div>
  );
}

function WelcomeScreen({ onAuth }) {
  return (
    <div className="welcome-shell">
      <header className="welcome-topbar">
        <a className="brand home-brand" href="/" aria-label="Routeflow home">
          <BrandMark />
          <span>routeflow</span>
        </a>
        <nav className="welcome-nav" aria-label="Main navigation">
          <a href="#welcome-overview">Platform</a>
          <a href="#welcome-benefits">Benefits</a>
          <a href="#welcome-contact">Get started</a>
        </nav>
        <div className="welcome-actions">
          <button
            className="ghost-btn"
            type="button"
            onClick={() => onAuth("login")}
          >
            Sign in
          </button>
          <button
            className="primary-btn"
            type="button"
            onClick={() => onAuth("signup")}
          >
            Sign up
          </button>
        </div>
      </header>

      <main>
        <section className="welcome-content" id="welcome-overview">
          <div className="welcome-copy">
            <span className="eyebrow dark-eyebrow">
              <span className="eyebrow-dot" />
              LOGISTICS, WITHOUT THE GUESSWORK
            </span>
            <h1>
              Make every mile
              <span> work smarter.</span>
            </h1>
            <p>
              Bring orders, routes, drivers, and customer updates together in one
              clear view—and keep your operation moving when the unexpected happens.
            </p>
            <div className="welcome-cta-row">
              <button
                className="primary-btn welcome-cta"
                type="button"
                onClick={() => onAuth("signup")}
              >
                Get started
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M4 10h12m-5-5 5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <a className="welcome-secondary-link" href="#welcome-benefits">
                Explore the platform
              </a>
            </div>
            <div className="welcome-proof">
              <span className="proof-avatars" aria-hidden="true">
                <span>O</span>
                <span>D</span>
                <span>F</span>
              </span>
              <span>
                <strong>One connected operation</strong>
                <br />
                from the first scan to the final stop
              </span>
            </div>
          </div>

          <aside className="welcome-preview" aria-label="Routeflow operations preview">
            <div className="preview-orbit orbit-one" />
            <div className="preview-orbit orbit-two" />
            <div className="preview-card">
              <div className="preview-heading">
                <span className="preview-indicator" />
                <span>NETWORK OVERVIEW</span>
                <span className="preview-live">LIVE</span>
              </div>
              <div className="preview-map" aria-hidden="true">
                <span className="preview-route preview-route-one" />
                <span className="preview-route preview-route-two" />
                <span className="preview-node node-one" />
                <span className="preview-node node-two" />
                <span className="preview-node node-three" />
                <span className="preview-node node-four" />
              </div>
              <div className="preview-summary">
                <div>
                  <span>Deliveries today</span>
                  <strong>1,284</strong>
                </div>
                <div>
                  <span>On-time rate</span>
                  <strong>96.8%</strong>
                </div>
              </div>
            </div>
            <div className="preview-note">
              <span className="preview-check">✓</span>
              <span>
                <strong>Route optimized</strong>
                <small>Saving 18 minutes</small>
              </span>
            </div>
          </aside>
        </section>

        <section
          className="welcome-benefits"
          id="welcome-benefits"
          aria-labelledby="welcome-benefits-title"
        >
          <div className="welcome-benefits-heading">
            <span className="eyebrow dark-eyebrow">
              <span className="eyebrow-dot" />
              CLARITY AT EVERY STEP
            </span>
            <h2 id="welcome-benefits-title">A better view of your delivery day.</h2>
            <p>Less time chasing updates. More time keeping every delivery on track.</p>
          </div>
          <div className="welcome-feature-grid">
            {welcomeFeatures.map((feature, index) => (
              <article className="welcome-feature-card" key={feature.title}>
                <span className="welcome-feature-number">0{index + 1}</span>
                <span className="welcome-feature-icon" aria-hidden="true">
                  {feature.icon}
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="welcome-contact" id="welcome-contact">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              READY WHEN YOU ARE
            </span>
            <h2>Bring your delivery operation into focus.</h2>
          </div>
          <button
            className="primary-btn welcome-contact-cta"
            type="button"
            onClick={() => onAuth("signup")}
          >
            Create your account <span aria-hidden="true">→</span>
          </button>
        </section>
      </main>
      <footer className="welcome-footer">
        <span>© 2026 Routeflow Logistics</span>
        <a href="#welcome-overview">Back to top ↑</a>
      </footer>
    </div>
  );
}

function AuthScreen({ mode, onModeChange, onBack, onSuccess }) {
  const [notice, setNotice] = useState("");
  const isSignup = mode === "signup";

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (isSignup && formData.get("password") !== formData.get("confirmPassword")) {
      setNotice("The passwords do not match. Please check and try again.");
      return;
    }

    const name = isSignup
      ? String(formData.get("fullName")).trim()
      : String(formData.get("email")).trim();
    onSuccess(name);
  }

  function changeMode(nextMode) {
    setNotice("");
    onModeChange(nextMode);
  }

  return (
    <main className="auth-shell">
      <header className="auth-topbar">
        <a
          className="brand home-brand"
          href="/"
          aria-label="Routeflow home"
          onClick={(event) => {
            event.preventDefault();
            onBack();
          }}
        >
          <BrandMark />
          <span>routeflow</span>
        </a>
        <button type="button" className="auth-back" onClick={onBack}>
          Back to welcome
        </button>
      </header>

      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-symbol" aria-hidden="true">
          <BrandMark />
        </div>
        <span className="auth-eyebrow">YOUR LOGISTICS WORKSPACE</span>
        <h1 id="auth-title">{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p className="auth-description">
          {isSignup
            ? "Sign up to bring your deliveries, routes, and team together."
            : "Sign in to continue to your Routeflow platform."}
        </p>

        <div className="auth-tabs" role="tablist" aria-label="Account access">
          <button
            id="login-tab"
            type="button"
            role="tab"
            aria-selected={!isSignup}
            aria-controls="auth-form"
            className={!isSignup ? "auth-tab active" : "auth-tab"}
            onClick={() => changeMode("login")}
          >
            Sign in
          </button>
          <button
            id="signup-tab"
            type="button"
            role="tab"
            aria-selected={isSignup}
            aria-controls="auth-form"
            className={isSignup ? "auth-tab active" : "auth-tab"}
            onClick={() => changeMode("signup")}
          >
            Sign up
          </button>
        </div>

        <form id="auth-form" className="auth-form" onSubmit={handleSubmit}>
          {isSignup && (
            <label className="auth-field">
              <span>Full name</span>
              <input
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                minLength="2"
                required
              />
            </label>
          )}
          <label className="auth-field">
            <span>Work email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              required
            />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder={isSignup ? "At least 8 characters" : "Enter your password"}
              minLength="8"
              required
            />
          </label>
          {isSignup && (
            <label className="auth-field">
              <span>Confirm password</span>
              <input
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                minLength="8"
                required
              />
            </label>
          )}
          <p className="auth-demo-note">
            Demo frontend only: forms are not connected to real account authentication.
          </p>
          <p className="auth-notice" role="alert" aria-live="polite">
            {notice}
          </p>
          <button className="primary-btn auth-submit" type="submit">
            {isSignup ? "Create account" : "Sign in"}
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M4 10h12m-5-5 5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
        <p className="auth-switch">
          {isSignup ? "Already have an account?" : "New to Routeflow?"}{" "}
          <button
            className="auth-inline-button"
            type="button"
            onClick={() => changeMode(isSignup ? "login" : "signup")}
          >
            {isSignup ? "Sign in" : "Create an account"}
          </button>
        </p>
      </section>
    </main>
  );
}

function App() {
  const [screen, setScreen] = useState("welcome");
  const [authMode, setAuthMode] = useState("login");
  const [accountLabel, setAccountLabel] = useState("");

  function openAuth(mode) {
    setAuthMode(mode);
    setScreen("auth");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function openPlatform(label) {
    setAccountLabel(label);
    setScreen("platform");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function signOut() {
    setAccountLabel("");
    setScreen("welcome");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  if (screen === "welcome") {
    return <WelcomeScreen onAuth={openAuth} />;
  }

  if (screen === "auth") {
    return (
      <AuthScreen
        mode={authMode}
        onModeChange={setAuthMode}
        onBack={() => setScreen("welcome")}
        onSuccess={openPlatform}
      />
    );
  }

  if (screen === "platform") {
    return <OperationsWorkspace accountLabel={accountLabel} onSignOut={signOut} />;
  }

  return (
    <div className="home-shell">
      <header className="topbar">
        <a className="brand home-brand" href="/" aria-label="Routeflow home">
          <BrandMark />
          <span>routeflow</span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="#solutions">Solutions</a>
          <a href="#features">Features</a>
          <a href="#insights">Insights</a>
          <a href="#pricing">Pricing</a>
        </nav>

        <div className="nav-actions">
          <span className="account-label" title={accountLabel}>
            Demo account
          </span>
          <button type="button" className="ghost-btn" onClick={signOut}>
            Sign out
          </button>
          <button type="button" className="primary-btn">
            Book a demo
          </button>
        </div>
      </header>

      <main className="landing-page">
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              SMART LOGISTICS CLOUD
            </span>

            <h1>
              Deliver faster with
              <span> full-route visibility.</span>
            </h1>

            <p>
              Routeflow helps logistics teams plan smarter, cut delays, and keep every
              parcel, van, and customer update in sync from dispatch to doorstep.
            </p>

            <div className="cta-row">
              <button type="button" className="primary-btn large-btn">
                Get started
              </button>
              <button type="button" className="ghost-btn large-btn light-ghost">
                View platform
              </button>
            </div>

            <div className="mini-stats" aria-label="Key metrics">
              {metrics.map((stat) => (
                <div key={stat.label} className="stat-pill">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual" aria-label="Routeflow dashboard preview">
            <div className="dashboard-panel main-panel">
              <div className="panel-header">
                <span className="panel-label">Live operations</span>
                <span className="status-tag">Online</span>
              </div>

              <div className="map-surface">
                <div className="map-route route-one" />
                <div className="map-route route-two" />
                <div className="map-stop stop-a" />
                <div className="map-stop stop-b" />
                <div className="map-stop stop-c" />
              </div>

              <div className="fleet-row">
                <div>
                  <span className="metric-label">Routes active</span>
                  <strong>184</strong>
                </div>
                <div>
                  <span className="metric-label">Avg. ETA</span>
                  <strong>17 min</strong>
                </div>
              </div>
            </div>

            <div className="floating-card metric-card">
              <span className="card-kicker">Today</span>
              <strong>1,284</strong>
              <span>Shipments tracked</span>
            </div>

            <div className="floating-card driver-card">
              <div className="driver-avatar">AL</div>
              <div>
                <strong>Driver check-in</strong>
                <span>Updated 2 mins ago</span>
              </div>
            </div>
          </div>
        </section>

        <section className="logo-strip" aria-label="Client brands">
          <span>VeloCart</span>
          <span>SwiftGrid</span>
          <span>NorthStar</span>
          <span>MetroFleet</span>
          <span>NovaCargo</span>
        </section>

        <section className="features-section" id="features">
          <div className="section-heading">
            <span className="eyebrow dark-eyebrow">
              <span className="eyebrow-dot" />
              WHY TEAMS CHOOSE ROUTEFLOW
            </span>
            <h2>Built for modern delivery operations.</h2>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                <div className="feature-icon" aria-hidden="true">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="solutions-section" id="solutions">
          <div className="solutions-copy">
            <span className="eyebrow dark-eyebrow">
              <span className="eyebrow-dot" />
              END-TO-END DELIVERY CONTROL
            </span>
            <h2>One platform for dispatch, delivery, and service quality.</h2>
            <p>
              From demand spikes to driver shortages, Routeflow gives dispatch teams the
              operational clarity they need to respond quickly and keep customers informed.
            </p>
          </div>

          <div className="operations-stack">
            <div className="operations-card highlight-card">
              <div className="card-topline">
                <span>Warehouse</span>
                <span className="trend-up">+12.4%</span>
              </div>
              <strong>163 orders scheduled</strong>
              <div className="progress-bars">
                <span className="bar bar-1" />
                <span className="bar bar-2" />
                <span className="bar bar-3" />
              </div>
            </div>

            <div className="operations-card compact-card">
              <span className="mini-label">Priority loads</span>
              <strong>28</strong>
              <span className="mini-note">5 requiring reassignment</span>
            </div>

            <div className="operations-card compact-card caution-card">
              <span className="mini-label">Late stops</span>
              <strong>9</strong>
              <span className="mini-note">2 impacted by traffic</span>
            </div>
          </div>
        </section>

        <section className="process-section" id="insights">
          <div className="section-heading">
            <span className="eyebrow dark-eyebrow">
              <span className="eyebrow-dot" />
              HOW IT WORKS
            </span>
            <h2>From planning to proof of delivery.</h2>
          </div>

          <div className="steps-grid">
            {steps.map((step) => (
              <article key={step.number} className="step-card">
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-banner" id="pricing">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              READY TO SCALE?
            </span>
            <h2>Bring your entire delivery operation into one cloud-based command center.</h2>
          </div>

          <button type="button" className="primary-btn large-btn">
            Talk to sales
          </button>
        </section>
      </main>
    </div>
  );
}

export default App;
