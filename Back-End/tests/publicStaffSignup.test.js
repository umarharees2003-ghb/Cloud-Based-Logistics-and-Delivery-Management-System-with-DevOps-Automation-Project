const request = require("supertest");
const mongoose = require("mongoose");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const app = require("../src/app");
const User = require("../src/models/User");
const Driver = require("../src/models/Driver");
const Delivery = require("../src/models/Delivery");
const environment = require("../src/config/environment");
const { verifyToken } = require("../src/utils/generateToken");
const authService = require("../src/services/authService");
const password = "PublicDemoPassword123!";
const roles = ["customer", "merchant", "driver", "logistics"];
const payload = (role) => ({ name: `Public ${role}`, email: `${role}@public-signup.test`, password, confirmPassword: password, role });
let originalFlag;
beforeEach(() => {
  originalFlag = process.env.ALLOW_PUBLIC_STAFF_SIGNUP;
  process.env.ALLOW_PUBLIC_STAFF_SIGNUP = "true";
});
afterEach(() => {
  if (originalFlag === undefined) delete process.env.ALLOW_PUBLIC_STAFF_SIGNUP;
  else process.env.ALLOW_PUBLIC_STAFF_SIGNUP = originalFlag;
});

describe("Configurable public signup", () => {
  test.each(roles)("demo signup persists %s, hashes its password, and issues role-correct registration/login tokens", async (role) => {
    const registration = await request(app).post("/api/auth/register").send(payload(role));
    expect(registration.status).toBe(201);
    expect(registration.body.user.role).toBe(role);
    expect(registration.body.roleId).toBe(role);
    expect(registration.body.user.password).toBeUndefined();
    expect(verifyToken(registration.body.token).role).toBe(role);
    const stored = await User.findById(registration.body.user.id).select("+password");
    expect(stored.role).toBe(role);
    expect(stored.password).not.toBe(password);
    expect(await stored.comparePassword(password)).toBe(true);
    const login = await request(app).post("/api/auth/login").send({ email: stored.email, password, roleId: role });
    expect(login.status).toBe(200);
    expect(login.body.user.role).toBe(role);
    expect(verifyToken(login.body.token).role).toBe(role);
    const headers = { Authorization: `Bearer ${login.body.token}` };
    const me = await request(app).get("/api/auth/me").set(headers).expect(200);
    expect(me.body.user.role).toBe(role);
    await request(app).get("/api/users").set(headers).expect(403);
    await request(app).get("/api/reports/overview").set(headers).expect(200);
    await request(app).get("/api/drivers").set(headers).expect(role === "logistics" ? 200 : 403);
    await request(app).post("/api/deliveries").set(headers).send({ customer: "Recipient", pickup: "Colombo", dropoff: "Kandy" }).expect(role === "driver" ? 403 : 201);
  });

  test.each([undefined, "false", "TRUE", "1", "yes", " true "])("staff signup is denied unless the setting is exactly true (value %s)", async (value) => {
    if (value === undefined) delete process.env.ALLOW_PUBLIC_STAFF_SIGNUP;
    else process.env.ALLOW_PUBLIC_STAFF_SIGNUP = value;
    expect(environment.allowPublicStaffSignup).toBe(false);
    for (const role of ["driver", "logistics"]) {
      const response = await request(app).post("/api/auth/register").send(payload(role));
      expect(response.status).toBe(422);
      expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: "role" })]));
    }
    expect(await User.countDocuments()).toBe(0);
  });

  test.each(["customer", "merchant"])("ordinary %s signup remains available with demo signup disabled", async (role) => {
    delete process.env.ALLOW_PUBLIC_STAFF_SIGNUP;
    const registration = await request(app).post("/api/auth/register").send(payload(role)).expect(201);
    expect(registration.body.user.role).toBe(role);
  });

  test.each(["true", "false"])("public signup can never create an administrator (setting %s)", async (value) => {
    process.env.ALLOW_PUBLIC_STAFF_SIGNUP = value;
    for (const route of ["/api/auth/register", "/api/auth/signup"]) {
      const response = await request(app).post(route).send(payload("administrator"));
      expect(response.status).toBe(422);
      expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: "role" })]));
    }
    expect(await User.countDocuments()).toBe(0);
    await expect(authService.register(payload("administrator"))).rejects.toThrow();
    expect(await User.countDocuments()).toBe(0);
  });

  test.each(["superuser", "operations", "Logistics", "admin"])("unsupported role %s is rejected rather than silently downgraded", async (role) => {
    const response = await request(app).post("/api/auth/register").send(payload(role));
    expect(response.status).toBe(422);
    expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: "role" })]));
    await expect(authService.register(payload(role))).rejects.toThrow();
    expect(await User.countDocuments()).toBe(0);
  });

  test("client permissions and alternate role fields cannot grant administrator privileges", async () => {
    const registration = await request(app).post("/api/auth/register").send({ ...payload("customer"), roleId: "administrator", permissions: ["*"], isAdmin: true, status: "active" }).expect(201);
    const stored = await User.findById(registration.body.user.id);
    expect(stored.role).toBe("customer");
    expect(verifyToken(registration.body.token).role).toBe("customer");
    await request(app).get("/api/users").set("Authorization", `Bearer ${registration.body.token}`).expect(403);
    await request(app).post("/api/auth/login").send({ email: stored.email, password, roleId: "administrator" }).expect(403);
  });

  test("new driver has an honest unconfigured fleet profile and cannot see name-matched deliveries", async () => {
    const registration = await request(app).post("/api/auth/register").send(payload("driver")).expect(201);
    expect(await Driver.countDocuments()).toBe(0);
    const headers = { Authorization: `Bearer ${registration.body.token}` };
    const profile = await request(app).get("/api/drivers/me/profile").set(headers).expect(200);
    expect(profile.body.data).toBeNull();
    await Delivery.create({ deliveryId: "SHP-UNASSIGNED-PUBLIC", trackingNumber: "RF-UNASSIGNED-PUBLIC", customer: "Recipient", pickup: "Hub A", dropoff: "Hub B", driverName: registration.body.user.name });
    const deliveries = await request(app).get("/api/deliveries").set(headers).expect(200);
    expect(deliveries.body.data).toEqual([]);
    await request(app).patch("/api/deliveries/SHP-UNASSIGNED-PUBLIC/status").set(headers).send({ status: "In transit" }).expect(403);
  });

  test("all four account roles remain persisted and can log in after a MongoDB reconnect", async () => {
    for (const role of roles) await request(app).post("/api/auth/register").send(payload(role)).expect(201);
    const uri = mongoose.connection.getClient().s.url;
    await mongoose.disconnect(); await mongoose.connect(uri);
    expect(await User.countDocuments()).toBe(4);
    for (const role of roles) {
      expect((await User.findOne({ email: payload(role).email })).role).toBe(role);
      const login = await request(app).post("/api/auth/login").send({ email: payload(role).email, password, roleId: role }).expect(200);
      expect(verifyToken(login.body.token).role).toBe(role);
    }
  });

  test("production configuration defaults to rejecting staff signup without explicit opt-in", () => {
    const childEnv = { ...process.env, NODE_ENV: "production", JWT_SECRET: "production_configuration_test_only_32_characters" };
    delete childEnv.ALLOW_PUBLIC_STAFF_SIGNUP;
    const code = 'const config = require("./src/config/environment"); const { validateRegister } = require("./src/validators/authValidator"); if (!config.isProduction || config.allowPublicStaffSignup) process.exit(1); for (const role of ["driver", "logistics", "administrator"]) { const errors = validateRegister({ name: "Production Signup", email: "production@example.test", password: "Password123!", role }); if (!errors.some((error) => error.field === "role")) process.exit(2); }';
    const result = spawnSync(process.execPath, ["-e", code], { cwd: path.resolve(__dirname, ".."), env: childEnv, encoding: "utf8" });
    expect(result.status).toBe(0);
  });
});
