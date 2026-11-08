import React, { useEffect, useState } from "react";
import { apiRequest } from "../services/apiClient";
import ProfileForm from "../components/common/ProfileForm";
export default function SecondaryPage({ activeSection, account, driverCount = 0 }) {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(null);
  async function loadUsers() {
    const res = await apiRequest("/users?limit=500");
    setUsers(res.data || []);
  }
  useEffect(() => {
    setMessage("");
    if (activeSection === "team") loadUsers().catch((error) => setMessage(error.message));
    if (activeSection === "devops") apiRequest("/health/ready").then((res) => setReady(res)).catch((error) => setMessage(error.message));
  }, [activeSection]);
  async function createUser(event) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      await apiRequest("/users", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      form.reset(); await loadUsers(); setMessage("User created.");
    } catch (error) { setMessage(error.message); }
  }
  async function status(id, value) {
    try { await apiRequest(`/users/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: value }) }); await loadUsers(); }
    catch (error) { setMessage(error.message); }
  }
  const title = { team: "Team & access", settings: "Workspace settings", devops: "DevOps automation", integrations: "Integrations" }[activeSection] || "My profile";
  const cards = activeSection === "team" ? [
    ["Users", users.length, "Registered accounts"], ["Drivers", driverCount, "Fleet profiles"],
    ["Administrator", account.name, "Authenticated account"], ["Access policy", "Role-based access", "Enforced by the API"],
  ] : activeSection === "devops" ? [
    ["Application health", ready?.status || "Unavailable", ready?.database || message],
    ["CI pipeline", "See GitHub Actions", "Pipeline status is not connected to this workspace"],
    ["Deployment", "Operator managed", "No live deployment is performed by this app"],
    ["Monitoring", "Prometheus / Grafana", "Start the optional monitoring profile"],
  ] : activeSection === "integrations" ? [
    ["Database", "MongoDB", "Managed by the backend"], ["Notifications", "In-app", "Delivery and assignment events"],
    ["Maps & routing", "Not configured", "Network map is an illustration"], ["Email", "Not configured", "No email provider connected"],
  ] : [["Account", account.name, account.email], ["Role", account.roleId, "Stored account permissions"]];
  return <section className="ops-card secondary-section">
    <div className="ops-card-heading"><div><h3>{title}</h3><p>Manage your Routeflow workspace.</p></div></div>
    <p className="auth-notice" role="status">{message}</p>
    <div className="secondary-grid">{cards.map(([title, value, detail]) => <article className="secondary-card" key={title}><span>{title}</span><strong>{value}</strong><p>{detail}</p></article>)}</div>
    {activeSection === "team" && <>
      <div className="orders-table-wrap"><table className="orders-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead><tbody>
        {users.map((user) => <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td>{user.role}</td><td><select aria-label={`Status for ${user.email}`} value={user.status} disabled={user.id === account.id} onChange={(event) => status(user.id, event.target.value)}>{["active", "inactive", "suspended"].map((value) => <option key={value}>{value}</option>)}</select></td></tr>)}
      </tbody></table></div>
      <form className="auth-form" onSubmit={createUser}>
        <h3>Create account</h3>
        <label className="auth-field"><span>Name</span><input name="name" minLength="2" required /></label>
        <label className="auth-field"><span>Email</span><input name="email" type="email" required /></label>
        <label className="auth-field"><span>Initial password</span><input name="password" type="password" minLength="8" required autoComplete="new-password" /></label>
        <label className="auth-field"><span>Role</span><select name="role">{["customer", "merchant", "driver", "logistics", "administrator"].map((role) => <option key={role}>{role}</option>)}</select></label>
        <button className="ops-primary-button">Create user</button>
      </form>
    </>}
    {!["team", "devops", "integrations"].includes(activeSection) && <ProfileForm account={account} />}
  </section>;
}
