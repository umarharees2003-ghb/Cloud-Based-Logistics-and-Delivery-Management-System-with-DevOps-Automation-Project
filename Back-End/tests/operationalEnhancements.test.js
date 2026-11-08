const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/User");
const Driver = require("../src/models/Driver");
const Delivery = require("../src/models/Delivery");
const Notification = require("../src/models/Notification");
const service = require("../src/services/deliveryService");
const { generateToken } = require("../src/utils/generateToken");
let logistics, customer, courier, driver;
const headers = (user) => ({ Authorization: `Bearer ${generateToken(user)}` });
const parcel = (extra = {}) => ({ customer: "Test Recipient", pickup: "Colombo", dropoff: "Kandy", eta: "14:30", ...extra });
beforeEach(async () => {
  [logistics, customer, courier] = await Promise.all([
    User.create({ name: "Dispatcher", email: "dispatcher@operations.test", password: "Password123!", role: "logistics" }),
    User.create({ name: "Sender", email: "sender@operations.test", password: "Password123!", role: "customer" }),
    User.create({ name: "Courier", email: "courier@operations.test", password: "Password123!", role: "driver" }),
  ]);
  driver = await Driver.create({ user: courier._id, name: courier.name, vehicle: "Van V-001", zone: "Central" });
});
async function create(extra = {}) { return (await request(app).post("/api/deliveries").set(headers(customer)).send(parcel(extra)).expect(201)).body.data; }
test("timeline records real milestones, safe tracking and idempotent retries", async () => {
  const delivery = await create(); const path = `/api/deliveries/${delivery.id}`;
  expect(delivery.statusHistory[0].eventType).toBe("created"); expect(delivery.deliveredAt).toBeNull();
  const assigned = await request(app).patch(`${path}/driver`).set(headers(logistics)).send({ driverId: driver.id }).expect(200);
  expect(assigned.body.data.assignedAt).toBeTruthy(); const assignmentTime = assigned.body.data.assignedAt;
  await request(app).patch(`${path}/driver`).set(headers(logistics)).send({ driverId: driver.id }).expect(200);
  expect(await Notification.countDocuments({ recipient: courier._id, type: "driver_assigned" })).toBe(1);
  for (const status of ["In transit", "Out for delivery", "Delivered"]) await request(app).patch(`${path}/status`).set(headers(courier)).send({ status }).expect(200);
  const completed = (await request(app).get(path).set(headers(customer)).expect(200)).body.data;
  expect(completed.assignedAt).toBe(assignmentTime);
  expect(new Date(completed.deliveredAt).getTime()).toBeGreaterThanOrEqual(new Date(completed.pickedUpAt).getTime());
  expect(completed.statusHistory.map((event) => event.eventType)).toEqual(["created", "assigned", "status", "status", "status"]);
  await request(app).patch(`${path}/status`).set(headers(courier)).send({ status: "Delivered" }).expect(200);
  const saved = await Delivery.findById(delivery._id); expect(saved.statusHistory).toHaveLength(5); expect(saved.deliveredAt.toISOString()).toBe(completed.deliveredAt);
  const tracking = (await request(app).get(`/api/tracking/${delivery.trackingNumber}`).expect(200)).body.data;
  expect(tracking.deliveredAt).toBe(completed.deliveredAt); expect(tracking.statusHistory[0].timestamp).toBeTruthy();
  for (const field of ["changedBy", "remarks"]) expect(tracking.statusHistory[0][field]).toBeUndefined();
  expect(tracking.senderId).toBeUndefined(); expect(tracking.dropoff).toBeUndefined();
});
test("edits and cancellation append audit events without changing relationships", async () => {
  const delivery = await create(); const path = `/api/deliveries/${delivery.id}`;
  const edit = await request(app).patch(path).set(headers(customer)).send({ dropoff: "Galle", recipientName: "Actual Recipient", weight: 2.5 }).expect(200);
  expect(edit.body.data.route).toContain("Galle"); expect(edit.body.data.senderId).toBe(customer.id); expect(edit.body.data.recipientName).toBe("Actual Recipient");
  expect(edit.body.data.statusHistory.at(-1).eventType).toBe("updated");
  const cancelled = await request(app).delete(path).set(headers(customer)).send({ reason: "Order withdrawn" }).expect(200);
  expect(cancelled.body.data.cancelledAt).toBeTruthy(); expect(cancelled.body.data.statusHistory.at(-1).remarks).toBe("Order withdrawn");
  await request(app).patch(path).set(headers(logistics)).send({ customer: "Changed" }).expect(400);
});
test.each([{ customer: { $ne: "" } }, { pickup: ["Hub"] }, { dropoff: "" }, { eta: "99:99" }, { weight: "2.5" }, { weight: -1 }, { priority: "Instant" }, { packageDescription: "x".repeat(1001) }])("invalid creation fields fail before persistence (%j)", async (invalid) => {
  const response = await request(app).post("/api/deliveries").set(headers(customer)).send(parcel(invalid));
  expect(response.status).toBe(422); expect(response.body.errors.length).toBeGreaterThan(0); expect(await Delivery.countDocuments()).toBe(0);
});
test("malformed updates, query operators, empty edits and object remarks fail clearly", async () => {
  const delivery = await create(); const path = `/api/deliveries/${delivery.id}`;
  for (const payload of [{}, { status: "Delivered" }, { sender: logistics.id }, { pickup: { $set: "Injected" } }]) await request(app).patch(path).set(headers(customer)).send(payload).expect(422);
  for (const query of ["status[$ne]=Pending", "page=-1", "limit=0", "search[$ne]=anything"]) await request(app).get(`/api/deliveries?${query}`).set(headers(logistics)).expect(422);
  await request(app).patch(`${path}/status`).set(headers(logistics)).send({ status: "In transit", remarks: { private: "invalid" } }).expect(400);
  expect((await Delivery.findById(delivery._id)).status).toBe("Pending");
});
test("duplicate driver names require an ID and inactive drivers cannot be assigned", async () => {
  const other = await User.create({ name: "Courier", email: "duplicate@operations.test", password: "Password123!", role: "driver" });
  const duplicate = await Driver.create({ user: other.id, name: "Courier", vehicle: "Van V-002", zone: "West" });
  const delivery = await create(); const path = `/api/deliveries/${delivery.id}/driver`;
  await request(app).patch(path).set(headers(logistics)).send({ driver: "Courier" }).expect(409);
  await request(app).patch(path).set(headers(logistics)).send({ driverId: duplicate.id }).expect(200);
  await User.updateOne({ _id: courier.id }, { status: "suspended" });
  await request(app).patch(path).set(headers(logistics)).send({ driverId: driver.id }).expect(400);
  expect(String((await Delivery.findById(delivery._id)).assignedDriver)).toBe(duplicate.id); expect(await Notification.countDocuments({ recipient: courier.id })).toBe(0);
});
test("optimistic concurrency rejects stale assignments without false notifications", async () => {
  const delivery = await create(); const stale = await service.findAuthorized(delivery.id, logistics);
  await service.updateStatus(delivery.id, "In transit", logistics);
  const lookup = jest.spyOn(service, "findAuthorized").mockResolvedValueOnce(stale);
  try { await expect(service.assignDriver(delivery.id, driver.id, logistics)).rejects.toMatchObject({ name: "VersionError" }); } finally { lookup.mockRestore(); }
  expect(await Notification.countDocuments({ recipient: courier.id, type: "driver_assigned" })).toBe(0);
  const saved = await Delivery.findById(delivery._id); expect(saved.status).toBe("In transit"); expect(saved.assignedDriver).toBeNull(); expect(saved.statusHistory).toHaveLength(2);
});
test("concurrent valid status requests never lose committed history", async () => {
  const delivery = await create();
  const responses = await Promise.all(["In transit", "Delayed"].map((status) => request(app).patch(`/api/deliveries/${delivery.id}/status`).set(headers(logistics)).send({ status })));
  expect(responses.every((response) => [200, 409].includes(response.status))).toBe(true);
  const saved = await Delivery.findById(delivery._id); expect(saved.statusHistory).toHaveLength(1 + responses.filter((response) => response.status === 200).length); expect(saved.status).toBe(saved.statusHistory.at(-1).status);
});
test("reports average only actual completed timestamps and preserve customer isolation", async () => {
  const now = Date.now();
  await Delivery.create({ deliveryId: "SHP-MEASURED", trackingNumber: "RF-MEASURED", customer: customer.name, sender: customer.id, pickup: "A", dropoff: "B", status: "Delivered", pickedUpAt: new Date(now - 7200000), deliveredAt: new Date(now - 3600000) });
  await Delivery.create({ deliveryId: "SHP-NO-TIMING", trackingNumber: "RF-NO-TIMING", customer: customer.name, sender: customer.id, pickup: "A", dropoff: "B", status: "Delivered" });
  const own = (await request(app).get("/api/reports/overview").set(headers(customer)).expect(200)).body.data;
  expect(own.performance.averageDeliveryTime).toBe("1h 0m"); expect(own.performance.measuredDeliveries).toBe(1);
  const stranger = await User.create({ name: customer.name, email: "stranger@operations.test", password: "Password123!", role: "customer" });
  const theirs = (await request(app).get("/api/reports/overview").set(headers(stranger)).expect(200)).body.data;
  expect(theirs.performance.averageDeliveryTime).toBeNull(); expect(theirs.performance.measuredDeliveries).toBe(0); expect(theirs.summary.total).toBe(0);
});
test("driver validation prevents orphan accounts and invalid relationship fallback", async () => {
  await request(app).post("/api/drivers").set(headers(logistics)).send({ name: "New Courier", email: "bad-vehicle@operations.test", password: "Password123!", vehicle: "Van 3", zone: "Central", vehicleType: "Spaceship" }).expect(422);
  expect(await User.exists({ email: "bad-vehicle@operations.test" })).toBeNull();
  await request(app).post("/api/drivers").set(headers(logistics)).send({ name: "New Courier", userId: String(new mongoose.Types.ObjectId()), email: "missing-user@operations.test", password: "Password123!", vehicle: "Van 3", zone: "Central" }).expect(404);
  expect(await User.exists({ email: "missing-user@operations.test" })).toBeNull();
  await request(app).patch(`/api/drivers/${driver.id}`).set(headers(logistics)).send({ user: customer.id }).expect(422);
  await request(app).patch(`/api/drivers/${driver.id}/status`).set(headers(courier)).send({ status: "Busy" }).expect(422);
});
