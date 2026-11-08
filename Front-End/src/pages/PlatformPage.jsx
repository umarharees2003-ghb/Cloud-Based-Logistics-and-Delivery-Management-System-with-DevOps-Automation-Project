import { apiRequest } from "../services/apiClient";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import OrderModal from "../components/common/OrderModal";
import NoticeBanner from "../components/common/NoticeBanner";
import OverviewPage from "./OverviewPage";
import DeliveriesPage from "./DeliveriesPage";
import FleetPage from "./FleetPage";
import AnalyticsPage from "./AnalyticsPage";
import DriverPage from "./DriverPage";
import CustomerPage from "./CustomerPage";
import MerchantPage from "./MerchantPage";
import SecondaryPage from "./SecondaryPage";
import { userRoles, roleSidebarGroups } from "../data/demoData";
import { useDeliveries } from "../hooks/useDeliveries";
import { useFleet } from "../hooks/useFleet";
import { getTodayLabel, getAccountFirstName } from "../utils/formatters";

export default function PlatformPage({ account, onSignOut }) {
  const role = userRoles.find((item) => item.id === account?.roleId) ?? userRoles[0];
  const navigationGroups = roleSidebarGroups[role.id] ?? roleSidebarGroups.administrator;
  const [activeSection, setActiveSection] = useState(() => navigationGroups[0]?.items[0]?.id || "overview");
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    orders,
    filteredOrders,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    notice,
    setNotice,
    createOrder,
    updateOrderStatus,
    assignDriver,
    resetFilters,
  } = useDeliveries();

  const { drivers, toggleDriverStatus, error: fleetError, reload: reloadFleet } = useFleet(["administrator", "logistics"].includes(role.id));
  const handleMutation = (action) => async (...args) => {
    try { return await action(...args); }
    catch (error) { setNotice(error.message); }
  };

  const [driverProfile, setDriverProfile] = useState(null);
  useEffect(() => {
    if (role.id === "driver") apiRequest("/drivers/me/profile").then((res) => setDriverProfile(res.data)).catch((error) => setNotice(error.message));
  }, [role.id]);
  const allItems = navigationGroups.flatMap((group) => group.items);
  const activeItem = allItems.find((item) => item.id === activeSection) ?? allItems[0];
  const accountFirstName = getAccountFirstName(account?.name);
  const assignedDemoOrders = orders;
  const todayLabel = getTodayLabel();

  async function handleCreateOrder(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await createOrder({
      customer: String(formData.get("customer")),
      pickup: String(formData.get("pickup")),
      dropoff: String(formData.get("dropoff")),
      eta: String(formData.get("eta")),
    });
    setShowOrderForm(false);
    setActiveSection(role.id === "merchant" ? "merchant-orders" : "deliveries");
  }

  function getNavigationCount(item) {
    if (item.id === "deliveries" && role.id === "driver") return assignedDemoOrders.length;
    if (item.id === "deliveries" && role.id === "administrator") return orders.length;
    if (item.id === "customer-history") return orders.length;
    if (["deliveries", "merchant-orders"].includes(item.id)) return orders.length;
    return null;
  }

  function renderPageContent() {
    if (role.id === "driver") {
      return (
        <DriverPage
          activeSection={activeSection}
          profile={driverProfile}
          account={account}
          assignedDemoOrders={assignedDemoOrders}
          onStatusChange={handleMutation(updateOrderStatus)}
          onDriverChange={handleMutation(assignDriver)}
          onNavigate={setActiveSection}
        />
      );
    }

    if (role.id === "customer") {
      return (
        <CustomerPage
          activeSection={activeSection}
          account={account}
          orders={orders}
          onStatusChange={handleMutation(updateOrderStatus)}
          onDriverChange={handleMutation(assignDriver)}
        />
      );
    }

    if (role.id === "merchant") {
      if (activeSection === "analytics") {
        return <AnalyticsPage orders={orders} />;
      }
      return (
        <MerchantPage
          activeSection={activeSection}
          account={account}
          orders={orders}
          onStatusChange={handleMutation(updateOrderStatus)}
          onDriverChange={handleMutation(assignDriver)}
        />
      );
    }

    if (activeSection === "overview") {
      return (
        <OverviewPage
          orders={orders}
          onStatusChange={handleMutation(updateOrderStatus)}
          onDriverChange={handleMutation(assignDriver)}
          role={role}
          onNavigate={setActiveSection}
          drivers={drivers}
        />
      );
    }

    if (activeSection === "deliveries") {
      return (
        <DeliveriesPage
          orders={orders}
          filteredOrders={filteredOrders}
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onStatusChange={handleMutation(updateOrderStatus)}
          onDriverChange={handleMutation(assignDriver)}
          onResetFilters={resetFilters}
          drivers={drivers}
        />
      );
    }

    if (activeSection === "fleet") {
      return <FleetPage onSaved={reloadFleet} drivers={drivers} onToggleDriverStatus={handleMutation(toggleDriverStatus)} />;
    }

    if (activeSection === "analytics") {
      return <AnalyticsPage orders={orders} />;
    }

    return (
      <SecondaryPage
        activeSection={activeSection}
        account={account}
        driverCount={drivers.length}
      />
    );
  }

  return (
    <div className="ops-app">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        navigationGroups={navigationGroups}
        role={role}
        account={account}
        onSignOut={onSignOut}
        onNotice={setNotice}
        getNavigationCount={getNavigationCount}
      />

      <div className="ops-main">
        <Topbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeItem={activeItem}
          account={account}
          onSignOut={onSignOut}
          onNotice={setNotice}
        />

        <main className="ops-page">
          <p className="role-demo-banner" role="note">
            Workspace for <strong>{role.label}</strong>. Access is secured by your account permissions.
          </p>

          <div className="ops-page-heading">
            <div>
              <span className="ops-date">{todayLabel}</span>
              <h1>
                {activeSection === "overview"
                  ? `Good morning, ${accountFirstName}`
                  : activeItem.label}
                <span>{activeSection === "overview" ? "." : ""}</span>
              </h1>
              <p>
                {activeSection === "overview"
                  ? role.id === "driver"
                    ? "Your route and delivery assignments for today."
                    : role.id === "customer"
                      ? "Track your shipment and review its latest status."
                      : role.id === "merchant"
                        ? "Your shipments and delivery activity."
                        : "Here’s what’s happening across your delivery network today."
                  : activeSection === "deliveries"
                    ? role.id === "driver"
                      ? "Review your assignments and update delivery status."
                      : "Create, search, assign and track every delivery in one place."
                    : activeSection === "fleet"
                      ? "See driver availability and manage your active routes."
                      : "A clear view of your logistics operation."}
              </p>
            </div>

            <div className="heading-actions">
              {((activeSection === "deliveries" && role.id !== "driver") ||
                activeSection === "merchant-orders") && (
                <button
                  className="ops-primary-button"
                  type="button"
                  onClick={() => setShowOrderForm(true)}
                >
                  <span>＋</span> {role.id === "merchant" ? "New shipment" : "New delivery"}
                </button>
              )}

              {activeSection === "overview" && (
                <button
                  className="ops-outline-button"
                  type="button"
                  onClick={() =>
                    setActiveSection(role.id === "merchant" ? "merchant-orders" : "deliveries")
                  }
                >
                  {role.id === "merchant" ? "View shipments" : "View deliveries"}{" "}
                  <span>→</span>
                </button>
              )}
            </div>
          </div>

          <NoticeBanner message={notice || fleetError} onDismiss={() => setNotice("")} />

          {renderPageContent()}

          <footer className="ops-footer">
            <span>© 2026 Routeflow Logistics</span>
            <span>Routeflow workspace · Changes saved to your account</span>
          </footer>
        </main>
      </div>

      {sidebarOpen && (
        <button
          className="sidebar-scrim"
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <OrderModal
        isOpen={showOrderForm}
        onClose={() => setShowOrderForm(false)}
        onSubmit={handleMutation(handleCreateOrder)}
        isMerchant={role.id === "merchant"}
      />
    </div>
  );
}

