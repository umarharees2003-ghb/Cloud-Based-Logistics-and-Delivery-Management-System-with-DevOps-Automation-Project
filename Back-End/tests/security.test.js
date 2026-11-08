const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const User = require("../src/models/User");
const Driver = require("../src/models/Driver");
const Delivery = require("../src/models/Delivery");
const { generateToken } = require("../src/utils/generateToken");
const environment = require("../src/config/environment");
const auth = (user) => ({ Authorization: `Bearer ${generateToken(user)}` });
async function user(role, email, name = "Same Name") {
  return User.create({ name, email, role, password: "SecurityPassword123!" });
}
async function shipment(owner, extra = {}) {
  return Delivery.create({ deliveryId: `SHP-${new mongoose.Types.ObjectId()}`, trackingNumber: `RF-${new mongoose.Types.ObjectId()}`, customer: owner.name, sender: owner._id, pickup: "Private address A", dropoff: "Private address B", ...extra });
}
describe("Authorization and persistence regressions", () => {
  test.each(["administrator", "logistics", "driver"])("public signup rejects %s", async (role) => {
    const res = await request(app).post("/api/auth/register").send({ name: "New User", email: `${role}@public.test`, password: "SecurityPassword123!", role });
    expect(res.status).toBe(422); expect(await User.countDocuments()).toBe(0);
  });
  test.each(["/api/dashboard/summary", "/api/dashboard/deliveries", "/api/dashboard/fleet", "/api/reports/overview", "/api/reports/drivers", "/api/drivers/name/deliveries"])("guest cannot read %s", async (path) => {
    expect((await request(app).get(path)).status).toBe(401);
  });
  test("identical customer names never grant read, report, edit or cancel access", async () => {
    const owner = await user("customer", "owner@security.test");
    const stranger = await user("customer", "stranger@security.test");
    const delivery = await shipment(owner);
    const list = await request(app).get("/api/deliveries?search=Private").set(auth(stranger));
    expect(list.body.data).toHaveLength(0);
    expect((await request(app).get(`/api/deliveries/${delivery.deliveryId}`).set(auth(stranger))).status).toBe(403);
    expect((await request(app).patch(`/api/deliveries/${delivery.deliveryId}`).set(auth(stranger)).send({ pickup: "Hacked" })).status).toBe(403);
    expect((await request(app).delete(`/api/deliveries/${delivery.deliveryId}`).set(auth(stranger))).status).toBe(403);
    const summary = await request(app).get("/api/dashboard/summary").set(auth(stranger));
    expect(summary.body.data.counts.total).toBe(0);
    expect((await request(app).get("/api/reports/overview").set(auth(stranger))).body.data.weeklyVolume.reduce((sum, day) => sum + day.count, 0)).toBe(0);
  });
  test("merchant cannot change another merchant's status through cancellation", async () => {
    const owner = await user("merchant", "merchant-owner@security.test");
    const other = await user("merchant", "merchant-other@security.test");
    const delivery = await shipment(owner, { merchant: owner._id });
    expect((await request(app).delete(`/api/deliveries/${delivery.deliveryId}`).set(auth(other))).status).toBe(403);
    expect((await request(app).delete(`/api/deliveries/${delivery.deliveryId}`).set(auth(owner))).status).toBe(200);
    expect((await Delivery.findById(delivery._id)).status).toBe("Cancelled");
  });
  test("identical driver names do not share assignments or profiles", async () => {
    const first = await user("driver", "first-driver@security.test");
    const second = await user("driver", "second-driver@security.test");
    const d1 = await Driver.create({ user: first._id, name: first.name, vehicle: "Van 1", zone: "A" });
    const d2 = await Driver.create({ user: second._id, name: second.name, vehicle: "Van 2", zone: "B" });
    const owner = await user("customer", "sender@security.test");
    const delivery = await shipment(owner, { assignedDriver: d1._id, driverName: first.name, status: "In transit" });
    expect((await request(app).get("/api/deliveries").set(auth(second))).body.data).toHaveLength(0);
    expect((await request(app).patch(`/api/deliveries/${delivery.deliveryId}/status`).set(auth(second)).send({ status: "Delivered" })).status).toBe(403);
    expect((await request(app).patch(`/api/drivers/${d1.id}/status`).set(auth(second)).send({ status: "Unavailable" })).status).toBe(403);
    expect((await request(app).get(`/api/drivers/${d1.id}/deliveries`).set(auth(second))).status).toBe(403);
    expect((await request(app).get(`/api/drivers/${d2.id}`).set(auth(second))).status).toBe(200);
    expect((await request(app).patch(`/api/deliveries/${delivery.deliveryId}/status`).set(auth(first)).send({ status: "Delivered" })).status).toBe(200);
  });
  test("untrusted creation fields cannot inject assignment, owner, ID or status", async () => {
    const merchant = await user("merchant", "creator@security.test");
    const stranger = await user("customer", "fake-owner@security.test");
    const res = await request(app).post("/api/deliveries").set(auth(merchant)).send({ customer: "Recipient", pickup: "Colombo", dropoff: "Kandy", senderId: stranger.id, merchantId: stranger.id, deliveryId: "SHP-CHOSEN", assignedDriverId: stranger.id, driver: "Fake Driver", status: "Delivered" });
    expect(res.status).toBe(201); expect(res.body.data.status).toBe("Pending"); expect(res.body.data.driver).toBe("Unassigned");
    const stored = await Delivery.findById(res.body.data._id);
    expect(String(stored.sender)).toBe(merchant.id); expect(stored.deliveryId).not.toBe("SHP-CHOSEN");
    expect((await request(app).get(`/api/tracking/${stored.trackingNumber}`)).body.data.dropoff).toBeUndefined();
  });
  test("expired tokens and role selection cannot authorize an account", async () => {
    const customer = await user("customer", "expired@security.test");
    const expired = jwt.sign({ id: customer.id, role: "administrator" }, environment.jwtSecret, { expiresIn: -1 });
    expect((await request(app).get("/api/auth/me").set("Authorization", `Bearer ${expired}`)).status).toBe(401);
    const res = await request(app).post("/api/auth/login").send({ email: customer.email, password: "SecurityPassword123!", roleId: "administrator" });
    expect(res.status).toBe(403);
    await request(app).patch("/api/auth/me").set(auth(customer)).send({ name: "Updated Name", company: "Saved Company", role: "administrator", status: "active" }).expect(200);
    const stored = await User.findById(customer.id); expect(stored.role).toBe("customer"); expect(stored.company).toBe("Saved Company");
  });
  test("parallel shipments keep unique IDs and persisted edits after reconnect", async () => {
    const merchant = await user("merchant", "parallel@security.test");
    const results = await Promise.all(Array.from({ length: 6 }, () => request(app).post("/api/deliveries").set(auth(merchant)).send({ customer: "Recipient", pickup: "A", dropoff: "B" })));
    expect(results.every((res) => res.status === 201)).toBe(true);
    expect(new Set(results.map((res) => res.body.id)).size).toBe(6);
    const id = results[0].body.id;
    await request(app).patch(`/api/deliveries/${id}`).set(auth(merchant)).send({ dropoff: "Saved destination" }).expect(200);
    const uri = mongoose.connection.getClient().s.url;
    await mongoose.disconnect(); await mongoose.connect(uri);
    expect((await Delivery.findOne({ deliveryId: id })).dropoff).toBe("Saved destination");
  });
  test("assignment by ID is persisted and repeated assignment does not inflate workload", async () => {
    const admin = await user("administrator", "dispatcher@security.test");
    const courier = await user("driver", "courier@security.test");
    const driver = await Driver.create({ user: courier.id, name: courier.name, vehicle: "Van 1", zone: "A" });
    const delivery = await shipment(admin);
    for (let i = 0; i < 2; i++) await request(app).patch(`/api/deliveries/${delivery.deliveryId}/driver`).set(auth(admin)).send({ driverId: driver.id }).expect(200);
    expect(String((await Delivery.findById(delivery._id)).assignedDriver)).toBe(driver.id);
    const list = await request(app).get("/api/drivers").set(auth(admin)); expect(list.body.data[0].deliveries).toBe(1);
  });
});
