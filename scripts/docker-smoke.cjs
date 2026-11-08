// Disposable Compose integration test. Existing Routeflow records/volumes are never changed.
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function docker(args, capture = false) {
  return execFileSync("docker", args, { cwd: root, encoding: "utf8", stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit", timeout: 180000 });
}
async function api(origin, endpoint, options = {}, expected = 200) {
  const response = await fetch(`${origin}/api${endpoint}`, { ...options, signal: AbortSignal.timeout(10000), headers: { "Content-Type": "application/json", ...options.headers } });
  const body = await response.json();
  assert.equal(response.status, expected, `${endpoint}: ${response.status} ${body.message || ""}`);
  return body;
}
async function waitReady(origin) {
  for (let i = 0; i < 90; i++) {
    try { await api(origin, "/health/ready"); return; } catch { await sleep(1000); }
  }
  throw new Error("Stack did not become ready.");
}
async function proxyChecks(origin) {
  await waitReady(origin);
  const remaining = [];
  for (const address of ["198.51.100.10", "203.0.113.20"]) {
    const response = await fetch(`${origin}/api/auth/login`, { method: "POST", signal: AbortSignal.timeout(10000), headers: { "Content-Type": "application/json", "X-Forwarded-For": address }, body: JSON.stringify({ email: "proxy-check@example.test", password: "InvalidPassword123!" }) });
    assert.equal(response.status, 401);
    remaining.push(Number(response.headers.get("ratelimit-remaining")));
  }
  assert.equal(remaining[1], remaining[0] - 1, "Spoofed forwarding headers must share the real client rate limit");
  const missing = await fetch(`${origin}/api/route-that-does-not-exist`, { signal: AbortSignal.timeout(10000) });
  assert.equal(missing.status, 404);
  assert.match(missing.headers.get("content-type"), /application\/json/);
  console.log("PASS: Nginx readiness, JSON API routing, and forwarded-header rate-limit isolation.");
}
async function isolated() {
  const stamp = `${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
  const project = `routeflow-smoke-${stamp}`;
  const volumeName = `${project}_mongodb_data`;
  const artifacts = path.join(root, ".artifacts", "docker-smoke");
  fs.mkdirSync(artifacts, { recursive: true });
  const configFile = path.join(artifacts, `${project}.json`);
  const sourceConfig = JSON.parse(docker(["compose", "config", "--format", "json"], true));
  function localImage(service) {
    // Compose container image IDs can refer to config digests no longer exposed by
    // Docker Desktop's image store. Inspect the built project image tag instead.
    const reference = sourceConfig.services[service].image || `${sourceConfig.name}-${service}:latest`;
    return JSON.parse(docker(["image", "inspect", reference], true))[0].Id;
  }
  const backendImage = localImage("backend");
  const frontendImage = localImage("frontend");
  assert(backendImage && frontendImage, "Build the main frontend/backend images before running the isolated smoke test.");
  const jwtSecret = crypto.randomBytes(48).toString("hex");
  const probe = "const r=require('http').get('http://127.0.0.1:5000/api/health/ready',s=>{s.resume();process.exit(s.statusCode===200?0:1)});r.on('error',()=>process.exit(1));r.setTimeout(3000,()=>r.destroy());";
  const config = {
    name: project,
    services: {
      mongodb: { image: "mongo:6-jammy", volumes: ["mongodb_data:/data/db"], healthcheck: { test: ["CMD", "mongosh", "--quiet", "--eval", "quit(db.adminCommand('ping').ok ? 0 : 1)"], interval: "2s", timeout: "5s", retries: 30 }, logging: { driver: "json-file", options: { "max-size": "5m", "max-file": "1" } } },
      backend: { image: backendImage, pull_policy: "never", init: true, environment: { NODE_ENV: "production", APP_ENV: "development", PORT: "5000", TRUST_PROXY_HOPS: "1", MONGODB_URI: "mongodb://mongodb:27017/routeflow_disposable_smoke", JWT_SECRET: jwtSecret, ALLOW_PUBLIC_STAFF_SIGNUP: "true", LOG_LEVEL: "warn" }, depends_on: { mongodb: { condition: "service_healthy" } }, healthcheck: { test: ["CMD", "node", "-e", probe], interval: "2s", timeout: "5s", retries: 30 }, logging: { driver: "json-file", options: { "max-size": "5m", "max-file": "1" } } },
      frontend: { image: frontendImage, pull_policy: "never", init: true, ports: [{ target: 8080, published: "0", host_ip: "127.0.0.1" }], depends_on: { backend: { condition: "service_healthy" } }, healthcheck: { test: ["CMD-SHELL", "wget --quiet --timeout=3 --tries=1 --spider http://127.0.0.1:8080/ || exit 1"], interval: "2s", timeout: "5s", retries: 30 }, logging: { driver: "json-file", options: { "max-size": "5m", "max-file": "1" } } },
    },
    volumes: { mongodb_data: { name: volumeName } },
  };
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  const compose = (...args) => docker(["compose", "-f", configFile, "-p", project, ...args]);
  let started = false;
  try {
    started = true;
    compose("up", "-d", "--wait", "--wait-timeout", "120");
    const published = docker(["compose", "-f", configFile, "-p", project, "port", "frontend", "8080"], true).trim();
    const origin = `http://${published}`;
    await proxyChecks(origin);
    const sessions = {};
    const password = crypto.randomBytes(24).toString("base64url");
    for (const role of ["customer", "merchant", "driver", "logistics"]) {
      const email = `${role}-${stamp}@example.test`;
      const registration = await api(origin, "/auth/register", { method: "POST", body: JSON.stringify({ name: `Disposable ${role}`, email, password, confirmPassword: password, role }) }, 201);
      assert.equal(registration.user.role, role);
      assert.equal(JSON.parse(Buffer.from(registration.token.split(".")[1], "base64url")).role, role);
      sessions[role] = { ...registration, email, password, headers: { Authorization: `Bearer ${registration.token}` } };
      await api(origin, "/auth/me", { headers: sessions[role].headers });
      await api(origin, "/users", { headers: sessions[role].headers }, 403);
    }
    await api(origin, "/auth/register", { method: "POST", body: JSON.stringify({ name: "Blocked Admin", email: `blocked-${stamp}@example.test`, password, role: "administrator" }) }, 422);
    await api(origin, "/auth/register", { method: "POST", body: JSON.stringify({ name: "Unsupported User", email: `unsupported-${stamp}@example.test`, password, role: "superuser" }) }, 422);
    const headers = sessions.customer.headers;
    const created = await api(origin, "/deliveries", { method: "POST", headers, body: JSON.stringify({ customer: "Disposable recipient", pickup: "Disposable hub", dropoff: "Disposable destination" }) }, 201);
    const id = created.data.id;
    await api(origin, `/deliveries/${id}`, { method: "PATCH", headers, body: JSON.stringify({ dropoff: "Persisted test destination" }) });
    await api(origin, `/deliveries/${id}`, { headers: sessions.merchant.headers }, 403);
    await api(origin, `/deliveries/${id}`, { headers: sessions.driver.headers }, 403);
    const profile = await api(origin, "/drivers", { method: "POST", headers: sessions.logistics.headers, body: JSON.stringify({ userId: sessions.driver.user.id, name: sessions.driver.user.name, vehicle: "Disposable test van", vehicleType: "Van", zone: "Disposable test zone" }) }, 201);
    const driverId = profile.data.id;
    const assigned = await api(origin, `/deliveries/${id}/driver`, { method: "PATCH", headers: sessions.logistics.headers, body: JSON.stringify({ driverId }) });
    assert.equal(assigned.data.assignedDriverId, driverId);
    assert(assigned.data.assignedAt, "Assignment timestamp must persist");
    for (const status of ["In transit", "Out for delivery", "Delivered"]) {
      await api(origin, `/deliveries/${id}/status`, { method: "PATCH", headers: sessions.driver.headers, body: JSON.stringify({ status, remarks: "Disposable integration test event" }) });
    }
    const detail = await api(origin, `/deliveries/${id}`, { headers });
    assert(detail.data.pickedUpAt && detail.data.deliveredAt, "Delivery milestone timestamps must persist");
    assert.equal(detail.data.dropoff, "Persisted test destination");
    assert(detail.data.statusHistory.length >= 5, "History must retain creation, edit, assignment and status events");
    const tracking = await api(origin, `/tracking/${created.data.trackingNumber}`);
    assert.equal(tracking.data.status, "Delivered");
    assert.equal(tracking.data.dropoff, undefined);
    assert.equal(tracking.data.customer, undefined);
    const dashboard = await api(origin, "/dashboard/summary", { headers: sessions.logistics.headers });
    assert.equal(dashboard.data.counts.delivered, 1);
    compose("restart", "mongodb", "backend");
    await waitReady(origin);
    for (const role of ["customer", "merchant", "driver", "logistics"]) {
      const login = await api(origin, "/auth/login", { method: "POST", body: JSON.stringify({ email: sessions[role].email, password, roleId: role }) });
      assert.equal(login.user.role, role);
    }
    const persisted = await api(origin, `/deliveries/${id}`, { headers });
    assert.equal(persisted.data.dropoff, "Persisted test destination");
    assert.equal(persisted.data.status, "Delivered");
    assert.equal(persisted.data.assignedDriverId, driverId);
    assert(persisted.data.deliveredAt && persisted.data.statusHistory.length >= 5);
    console.log("PASS: all permitted role signup/login, authorization, delivery creation/edit/history/tracking, driver assignment/status, dashboard totals, and MongoDB/backend restart persistence.");
  } finally {
    if (started) compose("down", "--remove-orphans");
    try {
      docker(["volume", "inspect", volumeName], true);
      console.log(`Isolated test volume retained without deletion: ${volumeName}`);
    } catch {
      console.log("No isolated test data volume was created.");
    }
    console.log("Existing Routeflow containers, database records and volumes were not modified by this test.");
  }
}
(async () => {
  if (process.argv.includes("--proxy-only")) return proxyChecks(process.env.SMOKE_ORIGIN || "http://127.0.0.1:8080");
  await isolated();
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
