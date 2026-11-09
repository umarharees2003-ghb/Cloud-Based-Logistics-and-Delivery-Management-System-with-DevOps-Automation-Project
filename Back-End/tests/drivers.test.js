const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const Driver = require("../src/models/Driver");
const { generateToken } = require("../src/utils/generateToken");

describe("Driver Management API", () => {
  let adminToken;
  let driverUser;
  let driverToken;

  beforeEach(async () => {
    const admin = await User.create({
      name: "Admin User",
      email: "admin.driver@routeflow.io",
      password: "Password123!",
      role: "administrator",
    });
    adminToken = generateToken(admin);

    driverUser = await User.create({
      name: "Alex Lee",
      email: "alex.driver@routeflow.io",
      password: "Password123!",
      role: "driver",
    });
    driverToken = generateToken(driverUser);
  });

  describe("POST /api/drivers", () => {
    it("should allow administrators to create a driver profile", async () => {
      const res = await request(app)
        .post("/api/drivers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          userId: driverUser._id.toString(),
          name: "Alex Lee",
          vehicle: "Van · V-204",
          zone: "Brooklyn",
          status: "Available",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Alex Lee");
      expect(res.body.data.initials).toBe("AL");
      expect(res.body.data.zone).toBe("Brooklyn");
    });
  });

  describe("GET /api/drivers", () => {
    beforeEach(async () => {
      await Driver.create({
        user: driverUser._id,
        name: "Alex Lee",
        initials: "AL",
        vehicle: "Van · V-204",
        zone: "Brooklyn",
        status: "Available",
      });
    });

    it("should return the list of drivers in roster", async () => {
      const res = await request(app).get("/api/drivers");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe("Alex Lee");
    });
  });

  describe("PATCH /api/drivers/:id/availability", () => {
    let driverId;

    beforeEach(async () => {
      const driver = await Driver.create({
        user: driverUser._id,
        name: "Alex Lee",
        vehicle: "Van · V-204",
        zone: "Brooklyn",
        status: "Available",
      });
      driverId = driver._id.toString();
    });

    it("should toggle driver status from Available to On route", async () => {
      const res = await request(app)
        .patch(`/api/drivers/${driverId}/availability`)
        .send({ status: "On route" });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe("On route");

      const check = await Driver.findById(driverId);
      expect(check.status).toBe("On route");
    });
  });
});

