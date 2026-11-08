const request = require("supertest");
const mongoose = require("mongoose");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const app = require("../src/app");
const User = require("../src/models/User");
const { provisionLogistics } = require("../scripts/provisionLogistics");
const { verifyToken } = require("../src/utils/generateToken");
let server, baseUrl;
beforeAll(async () => {
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});
afterAll(async () => { if (server) await new Promise((resolve) => server.close(resolve)); });
const password = "ProvisioningTestPassword123!";
async function admin() { return User.create({ name: "Approving Admin", email: "approver@provision.test", password, role: "administrator" }); }
const options = () => ({ baseUrl, adminEmail: "approver@provision.test", adminPassword: password, email: "manager@provision.test", name: "Local Manager", password });
test("public staff signup supplies a specific role error and creates no account", async () => {
  const res = await request(app).post("/api/auth/register").send({ name: "Local Manager", email: "manager@provision.test", password, role: "logistics" });
  expect(res.status).toBe(422);
  expect(res.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: "role", message: expect.stringContaining("administrator approval") })]));
  expect(res.body.message).toContain("role:"); expect(res.body.message).not.toBe("Validation failed");
  expect(await User.countDocuments()).toBe(0);
});
test("registration reports all invalid fields", async () => {
  const res = await request(app).post("/api/auth/register").send({ name: "A", email: "invalid", password: "short", confirmPassword: "different", role: "customer" });
  expect(res.status).toBe(422);
  expect(res.body.errors.map((error) => error.field)).toEqual(expect.arrayContaining(["name", "email", "password", "confirmPassword"]));
});
test("operator bootstrap, approved provisioning, JWT role, access and persistence work end to end", async () => {
  const uri = mongoose.connection.getClient().s.url;
  const bootstrap = spawnSync(process.execPath, [path.resolve(__dirname, "../scripts/seedAdmin.js")], { encoding: "utf8", env: { ...process.env, MONGODB_URI: uri, BOOTSTRAP_ADMIN_EMAIL: "approver@provision.test", BOOTSTRAP_ADMIN_PASSWORD: password } });
  expect(bootstrap.status).toBe(0);
  const manager = await provisionLogistics(options());
  expect(manager.role).toBe("logistics");
  const stored = await User.findById(manager.id).select("+password");
  expect(stored.password).not.toBe(password); expect(await stored.comparePassword(password)).toBe(true);
  const login = await request(app).post("/api/auth/login").send({ email: manager.email, password, roleId: "logistics" });
  expect(login.status).toBe(200); expect(verifyToken(login.body.token).role).toBe("logistics");
  const headers = { Authorization: `Bearer ${login.body.token}` };
  for (const route of ["/api/dashboard/summary", "/api/deliveries", "/api/drivers", "/api/reports/overview"]) await request(app).get(route).set(headers).expect(200);
  await request(app).get("/api/users").set(headers).expect(403);
  const shipment = await request(app).post("/api/deliveries").set(headers).send({ customer: "Test Recipient", pickup: "Colombo", dropoff: "Kandy" }).expect(201);
  await mongoose.disconnect(); await mongoose.connect(uri);
  expect((await User.findById(manager.id)).role).toBe("logistics");
  await request(app).get(`/api/deliveries/${shipment.body.id}`).set(headers).expect(200);
  await request(app).post("/api/auth/login").send({ email: manager.email, password, roleId: "logistics" }).expect(200);
});
test("non-administrator credentials cannot approve logistics provisioning", async () => {
  await User.create({ name: "Merchant", email: "approver@provision.test", password, role: "merchant" });
  await expect(provisionLogistics(options())).rejects.toThrow("Selected role does not match");
  expect(await User.countDocuments({ role: "logistics" })).toBe(0);
});
test("wrong admin password and duplicate email never create or overwrite an account", async () => {
  await admin();
  await expect(provisionLogistics({ ...options(), adminPassword: "WrongPassword123!" })).rejects.toThrow("Invalid email or password");
  const created = await provisionLogistics(options());
  await expect(provisionLogistics({ ...options(), name: "Overwrite" })).rejects.toThrow("already exists");
  expect((await User.findById(created.id)).name).toBe("Local Manager");
});
test("local helper validates fields and refuses remote credential forwarding", async () => {
  await expect(provisionLogistics({ ...options(), email: "bad", password: "short" })).rejects.toThrow("email:");
  await expect(provisionLogistics({ ...options(), baseUrl: "https://example.com/api" })).rejects.toThrow("loopback");
  expect(await User.countDocuments()).toBe(0);
});
