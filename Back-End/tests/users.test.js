const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const { generateToken } = require("../src/utils/generateToken");

describe("User Management API", () => {
  let adminToken;
  let customerToken;

  beforeEach(async () => {
    const admin = await User.create({
      name: "Admin User",
      email: "admin.test@routeflow.io",
      password: "Password123!",
      role: "administrator",
    });
    adminToken = generateToken(admin);

    const customer = await User.create({
      name: "Customer User",
      email: "cust.test@routeflow.io",
      password: "Password123!",
      role: "customer",
    });
    customerToken = generateToken(customer);
  });

  describe("GET /api/users", () => {
    it("should allow administrators to list users", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it("should forbid customers from listing users", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/users", () => {
    it("should allow administrators to create a logistics staff account", async () => {
      const res = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "New Dispatcher",
          email: "dispatch@routeflow.io",
          password: "DispatchPass2026!",
          role: "logistics",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.role).toBe("logistics");
      expect(res.body.data.email).toBe("dispatch@routeflow.io");
    });
  });

  describe("PATCH /api/users/:id/status", () => {
    it("should allow administrators to suspend a user account", async () => {
      const targetUser = await User.create({
        name: "Bad Actor",
        email: "bad@example.com",
        password: "Password123!",
        role: "customer",
      });

      const res = await request(app)
        .patch(`/api/users/${targetUser._id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "suspended" });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe("suspended");

      // Verify that suspended user cannot log in
      const loginRes = await request(app).post("/api/auth/login").send({
        email: "bad@example.com",
        password: "Password123!",
      });
      expect(loginRes.statusCode).toBe(403);
      expect(loginRes.body.message).toContain("suspended");
    });
  });
});

