// Run against the local Compose stack. Creates a uniquely named smoke-test account and shipment.
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const crypto = require("node:crypto");
const origin = process.env.SMOKE_ORIGIN || "http://127.0.0.1:8080";
async function api(path, options = {}) {
  const res = await fetch(`${origin}/api${path}`, { ...options, headers: { "Content-Type": "application/json", ...options.headers } });
  const data = await res.json();
  assert(res.ok, `${path}: ${res.status} ${data.message || ""}`);
  return data;
}
(async () => {
  await api("/health/ready");
  const stamp = crypto.randomBytes(8).toString("hex");
  const password = crypto.randomBytes(24).toString("base64url");
  const email = `smoke-${stamp}@example.test`;
  const registration = await api("/auth/register", { method: "POST", body: JSON.stringify({ name: "Compose Smoke Test", email, password, role: "merchant" }) });
  assert.equal(registration.user.role, "merchant");
  const headers = { Authorization: `Bearer ${registration.token}` };
  const created = await api("/deliveries", { method: "POST", headers, body: JSON.stringify({ customer: "Smoke Recipient", pickup: "Smoke origin", dropoff: "Smoke destination" }) });
  const saved = await api(`/deliveries/${created.data.id}`, { method: "PATCH", headers, body: JSON.stringify({ dropoff: "Persisted destination" }) });
  assert.equal(saved.data.dropoff, "Persisted destination");
  const tracking = await api(`/tracking/${created.data.trackingNumber}`);
  assert.equal(tracking.data.status, "Pending"); assert.equal(tracking.data.dropoff, undefined);
  execFileSync("docker", ["compose", "restart", "mongodb", "backend"], { stdio: "inherit" });
  let healthy = false;
  for (let i = 0; i < 60; i++) {
    try { await api("/health/ready"); healthy = true; break; } catch { await new Promise((resolve) => setTimeout(resolve, 1000)); }
  }
  assert(healthy, "Stack did not recover after restart");
  const login = await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  const persisted = await api(`/deliveries/${created.data.id}`, { headers: { Authorization: `Bearer ${login.token}` } });
  assert.equal(persisted.data.dropoff, "Persisted destination");
  console.log("PASS: Nginx API proxy, registration/login, tracking, edits, and MongoDB/backend restart persistence.");
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
