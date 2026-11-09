const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");

describe("Authentication API", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new customer successfully", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Jane Doe",
        email: "jane.doe@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
        role: "customer",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe("jane.doe@example.com");
      expect(res.body.user.role).toBe("customer");
      expect(res.body.user.password).toBeUndefined(); // Never leak password hash
    });

    it("should register a new merchant successfully", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Acme Retail Store",
        email: "store.merchant@example.com",
        password: "StorePassword123!",
        confirmPassword: "StorePassword123!",
        role: "merchant",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe("store.merchant@example.com");
      expect(res.body.user.role).toBe("merchant");
    });

    it("should reject duplicate email registrations", async () => {
      await User.create({
        name: "Existing User",
        email: "duplicate@example.com",
        password: "Password123!",
        role: "customer",
      });

      const res = await request(app).post("/api/auth/register").send({
        name: "Duplicate User",
        email: "duplicate@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("already registered");
    });

    it("should prevent public self-registration as an administrator", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Hacker User",
        email: "hacker@example.com",
        password: "Password123!",
        role: "administrator",
      });

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toContain("Privileged accounts");
    });

    it("should reject passwords shorter than 8 characters", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Short Pass",
        email: "short@example.com",
        password: "123",
        confirmPassword: "123",
      });

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await User.create({
        name: "Login User",
        email: "login@example.com",
        password: "SecurePassword123!",
        role: "customer",
      });
    });

    it("should log in successfully with valid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "SecurePassword123!",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.name).toBe("Login User");
      expect(res.body.roleId).toBe("customer");
    });

    it("should reject login with wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "WrongPassword999!",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Invalid email or password");
    });

    it("should reject login with non-existent email", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "notfound@example.com",
        password: "AnyPassword123!",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/auth/me", () => {
    let token;
    let userId;

    beforeEach(async () => {
      const user = await User.create({
        name: "Me User",
        email: "me@example.com",
        password: "Password123!",
        role: "logistics",
      });
      userId = user._id.toString();

      const loginRes = await request(app).post("/api/auth/login").send({
        email: "me@example.com",
        password: "Password123!",
      });
      token = loginRes.body.token;
    });

    it("should return the current user profile with valid Bearer token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.id).toBe(userId);
      expect(res.body.roleId).toBe("logistics");
    });

    it("should reject requests without a token", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.statusCode).toBe(401);
    });

    it("should reject requests with an invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid_garbage_token");
      expect(res.statusCode).toBe(401);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should return success on logout", async () => {
      const res = await request(app).post("/api/auth/logout");
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

