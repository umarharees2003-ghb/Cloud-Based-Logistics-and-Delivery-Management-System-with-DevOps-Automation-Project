const request = require("supertest");
const logger = require("../src/config/logger");
const app = require("../src/app");
test("structured logs redact nested credentials, bearer tokens and connection passwords", () => {
 const secret = process.env.JWT_SECRET;
 const info = { level: "warn", message: `Failure Bearer abc.def.ghi mongodb://user:password@mongo/db ${secret}`, nested: { password: "private-password", authorization: "Bearer private-token", more: [{ token: "private-token" }] } };
 const transformed = logger.format.transform(info, logger.format.options);
 const text = transformed[Symbol.for("message")];
 expect(text).toContain("[REDACTED]");
 for (const value of ["abc.def.ghi", "user:password", secret, "private-password", "private-token"]) expect(text).not.toContain(value);
});
test("printf metadata produces clean structured messages without character keys", () => {
 const info = { level: "info", message: "Delivery %s assigned to %s", [Symbol.for("splat")]: ["SHP-1", "Courier"] };
 const text = logger.format.transform(info, logger.format.options)[Symbol.for("message")];
 expect(JSON.parse(text).message).toBe("Delivery SHP-1 assigned to Courier");
 expect(JSON.parse(text)["0"]).toBeUndefined();
});
test("API errors carry a unique request ID without reflecting caller-controlled values", async () => {
 const first = await request(app).get("/api/deliveries").set("X-Request-ID", "caller-controlled");
 const second = await request(app).get("/api/deliveries");
 expect(first.status).toBe(401); expect(first.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/);
 expect(first.headers["x-request-id"]).not.toBe(second.headers["x-request-id"]);
 expect(first.body.requestId).toBe(first.headers["x-request-id"]);
});
