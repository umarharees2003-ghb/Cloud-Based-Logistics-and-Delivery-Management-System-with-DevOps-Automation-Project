process.env.NODE_ENV = "test";
process.env.APP_ENV = "development";
process.env.ALLOW_PUBLIC_STAFF_SIGNUP = process.env.DEMO_PUBLIC_STAFF_SIGNUP === "true" ? "true" : "false";
process.env.JWT_SECRET = "browser_tests_only_random_secret_32_chars";
const { createRequire } = require("module");
const path = require("path");
const backend = createRequire(path.resolve(__dirname, "../../Back-End/package.json"));
process.env.MONGOMS_DOWNLOAD_DIR = path.resolve(__dirname, "../../Back-End/node_modules/.cache/mongodb-memory-server");
const { MongoMemoryServer } = backend("mongodb-memory-server");
const mongoose = backend("mongoose");
(async () => {
  const db = await MongoMemoryServer.create();
  await mongoose.connect(db.getUri());
  const User = backend("./src/models/User");
  const Driver = backend("./src/models/Driver");
  for (const role of ["administrator", "logistics", "driver", "customer", "merchant"]) {
    const user = await User.create({ name: `${role} Browser`, email: `${role}@browser.test`, password: "BrowserPassword123!", role });
    if (role === "driver") await Driver.create({ user: user._id, name: user.name, vehicle: "Van V-101", zone: "Test zone" });
  }
  const app = backend("./src/app");
  const server = app.listen(Number(process.env.TEST_API_PORT || 5055), "127.0.0.1");
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close(async () => { await mongoose.disconnect(); await db.stop(); process.exit(0); }));
})().catch((err) => { console.error(err); process.exit(1); });
