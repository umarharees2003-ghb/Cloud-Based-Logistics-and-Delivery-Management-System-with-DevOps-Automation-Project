const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const Driver = require("../src/models/Driver");
const Delivery = require("../src/models/Delivery");
const { generateToken } = require("../src/utils/generateToken");

describe("Delivery Management API", () => {
  let adminToken;
  let customerUser;
  let customerToken;
  let otherCustomerUser;
  let otherCustomerToken;
  let driverUser;
  let driverToken;
  let driverRecord;

  beforeEach(async () => {
    const admin = await User.create({
      name: "Admin User",
      email: "admin.del.test@routeflow.io",
      password: "Password123!",
      role: "administrator",
    });
    adminToken = generateToken(admin);

    customerUser = await User.create({
      name: "Alice Customer",
      email: "alice.del.test@example.com",
      password: "Password123!",
      role: "customer",
    });
    customerToken = generateToken(customerUser);

    otherCustomerUser = await User.create({
      name: "Bob Customer",
      email: "bob.del.test@example.com",
      password: "Password123!",
      role: "customer",
    });
    otherCustomerToken = generateToken(otherCustomerUser);

    driverUser = await User.create({
      name: "Sam Rivera",
      email: "sam.rivera.test@routeflow.io",
      password: "Password123!",
      role: "driver",
    });
    driverToken = generateToken(driverUser);

    driverRecord = await Driver.create({
      user: driverUser._id,
      name: "Sam Rivera",
      initials: "SR",
      vehicle: "Truck · T-032",
      zone: "Manhattan",
      status: "Available",
    });
  });

  describe("POST /api/deliveries", () => {
    it("should allow creating a new delivery", async () => {
      const res = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          customer: "Alice Customer",
          pickup: "Newark",
          dropoff: "Brooklyn",
          eta: "14:30",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.id).toMatch(/^SHP-/);
      expect(res.body.route).toBe("Newark → Brooklyn");
      expect(res.body.status).toBe("Pending");
      expect(res.body.driver).toBe("Unassigned");
    });

    it("should validate required pickup and dropoff fields", async () => {
      const res = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          customer: "Alice Customer",
          pickup: "",
          dropoff: "",
        });

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/deliveries", () => {
    beforeEach(async () => {
      await Delivery.create([
        {
          deliveryId: "SHP-10482",
          trackingNumber: "RF-TRK-10482",
          customer: "Alice Customer",
          sender: customerUser._id,
          pickup: "Newark",
          dropoff: "Brooklyn",
          route: "Newark → Brooklyn",
          status: "In transit",
          eta: "14:30",
          driverName: "Sam Rivera",
          assignedDriver: driverRecord._id,
        },
        {
          deliveryId: "SHP-10481",
          trackingNumber: "RF-TRK-10481",
          customer: "Bob Customer",
          sender: otherCustomerUser._id,
          pickup: "Jersey City",
          dropoff: "Queens",
          route: "Jersey City → Queens",
          status: "Delayed",
          eta: "14:45",
          driverName: "Unassigned",
        },
      ]);
    });

    it("should filter deliveries by role: customer only sees their deliveries", async () => {
      const res = await request(app)
        .get("/api/deliveries")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].customer).toBe("Alice Customer");
    });

    it("should allow administrators to see all deliveries", async () => {
      const res = await request(app)
        .get("/api/deliveries")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);
    });

    it("should filter deliveries by status", async () => {
      const res = await request(app)
        .get("/api/deliveries?status=Delayed")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].status).toBe("Delayed");
    });

    it("should search deliveries by keyword", async () => {
      const res = await request(app)
        .get("/api/deliveries?search=Queens")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].route).toContain("Queens");
    });
  });

  describe("PATCH /api/deliveries/:id/driver (assign driver)", () => {
    let deliveryId;

    beforeEach(async () => {
      const delivery = await Delivery.create({
        deliveryId: "SHP-10900",
        trackingNumber: "RF-TRK-10900",
        customer: "Alice Customer",
        pickup: "Elizabeth",
        dropoff: "Hoboken",
        status: "Pending",
        driverName: "Unassigned",
      });
      deliveryId = delivery.deliveryId;
    });

    it("should assign driver to shipment", async () => {
      const res = await request(app)
        .patch(`/api/deliveries/${deliveryId}/driver`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ driver: "Sam Rivera" });

      expect(res.statusCode).toBe(200);
      expect(res.body.driver).toBe("Sam Rivera");

      const check = await Delivery.findOne({ deliveryId });
      expect(check.driverName).toBe("Sam Rivera");
      expect(check.assignedDriver.toString()).toBe(driverRecord._id.toString());
    });

    it("should reject driver assignment if driver does not exist", async () => {
      const res = await request(app)
        .patch(`/api/deliveries/${deliveryId}/driver`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ driver: "Ghost Driver" });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain("not found in fleet roster");
    });
  });

  describe("PATCH /api/deliveries/:id/status", () => {
    let deliveryId;

    beforeEach(async () => {
      const delivery = await Delivery.create({
        deliveryId: "SHP-10901",
        trackingNumber: "RF-TRK-10901",
        customer: "Alice Customer",
        pickup: "Elizabeth",
        dropoff: "Hoboken",
        status: "In transit",
        driverName: "Sam Rivera",
        assignedDriver: driverRecord._id,
      });
      deliveryId = delivery.deliveryId;
    });

    it("should update delivery status to Delivered and append to status history", async () => {
      const res = await request(app)
        .patch(`/api/deliveries/${deliveryId}/status`)
        .set("Authorization", `Bearer ${driverToken}`)
        .send({ status: "Delivered", remarks: "Handed over directly to recipient" });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("Delivered");

      const check = await Delivery.findOne({ deliveryId });
      expect(check.status).toBe("Delivered");
      expect(check.statusHistory.length).toBeGreaterThan(0);
      const latestHistory = check.statusHistory[check.statusHistory.length - 1];
      expect(latestHistory.status).toBe("Delivered");
      expect(latestHistory.remarks).toContain("Handed over");
    });

    it("should reject invalid status transitions (e.g. from Delivered to Pending)", async () => {
      await Delivery.updateOne({ deliveryId }, { status: "Delivered" });

      const res = await request(app)
        .patch(`/api/deliveries/${deliveryId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "Pending" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("already delivered");
    });
  });

  describe("GET /api/tracking/:trackingNumber", () => {
    beforeEach(async () => {
      await Delivery.create({
        deliveryId: "SHP-10999",
        trackingNumber: "RF-TRK-99999",
        customer: "Secret Customer",
        pickup: "Warehouse A",
        dropoff: "Customer Home",
        status: "Out for delivery",
        eta: "15:00",
      });
    });

    it("should return safe tracking data without private information", async () => {
      const res = await request(app).get("/api/tracking/RF-TRK-99999");

      expect(res.statusCode).toBe(200);
      expect(res.body.data.trackingNumber).toBe("RF-TRK-99999");
      expect(res.body.data.status).toBe("Out for delivery");
      expect(res.body.data.route).toBeUndefined();
      expect(res.body.data.pickup).toBeUndefined();
      expect(res.body.data.dropoff).toBeUndefined();
      expect(res.body.data.customer).toBeUndefined(); // Safe public tracking: customer details not exposed
    });

    it("should return 404 for invalid tracking number", async () => {
      const res = await request(app).get("/api/tracking/NONEXISTENT");
      expect(res.statusCode).toBe(404);
    });
  });
});
