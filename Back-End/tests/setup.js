const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
// Always use an ephemeral database. Never connect to or clear a configured developer database.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_jwt_secret_academic_group_78_devops_tests_2026";
process.env.JWT_EXPIRES_IN = "1h";
let mongoServer;
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { autoIndex: true });
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
});
afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    await Promise.all(Object.values(mongoose.connection.collections).map((collection) => collection.deleteMany({})));
  }
});
afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});
