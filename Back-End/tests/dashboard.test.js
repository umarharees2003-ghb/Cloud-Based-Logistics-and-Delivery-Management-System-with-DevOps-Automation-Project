const request = require("supertest");
const app = require("../src/app");
const Delivery = require("../src/models/Delivery");
const Driver = require("../src/models/Driver");
const User = require("../src/models/User");

describe("Dashboard & Reports API", () => {
  beforeEach(async () => {
    const driverUser = await User.create({
      name: "Driver One",
      email: "d1@example.com",
      password: "Password123!",
      role: "driver",
    });

    await Driver.create({
      user: driverUser._id,
      name: "Driver One",
      vehicle: "Van · V-101",
      zone: "Queens",
      status: "On route",
    });

    await Delivery.create([
      {
        deliveryId: "SHP-D1",
        trackingNumber: "RF-D1",
        customer: "Client A",
        pickup: "Loc A",
        dropoff: "Loc B",
        status: "Delivered",
      },
      {
        deliveryId: "SHP-D2",
        trackingNumber: "RF-D2",
        customer: "Client B",
        pickup: "Loc B",
        dropoff: "Loc C",
        status: "In transit",
      },
      {
        deliveryId: "SHP-D3",
        trackingNumber: "RF-D3",
        customer: "Client C",
        pickup: "Loc C",
        dropoff: "Loc D",
        status: "Delayed",
      },
    ]);
  });

  describe("GET /api/dashboard/summary", () => {
    it("should return accurate dashboard metrics based on real database records", async () => {
      const res = await request(app).get("/api/dashboard/summary");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.counts.total).toBe(3);
      expect(res.body.data.counts.delivered).toBe(1);
      expect(res.body.data.counts.inTransit).toBe(1);
      expect(res.body.data.counts.delayed).toBe(1);
      expect(res.body.data.counts.activeDrivers).toBe(1);
      expect(res.body.data.metrics.length).toBe(4);
    });
  });

  describe("GET /api/reports/overview", () => {
    it("should return weekly volume and performance metrics", async () => {
      const res = await request(app).get("/api/reports/overview");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.weeklyVolume.length).toBe(7);
      expect(res.body.data.performance.successRate).toBeDefined();
    });
  });

  describe("GET /api/dashboard/fleet", () => {
    it("should return active fleet information", async () => {
      const res = await request(app).get("/api/dashboard/fleet");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe("Driver One");
    });
  });
});

