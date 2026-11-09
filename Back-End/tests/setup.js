const mongoose = require("mongoose");

let mongoServer;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test_jwt_secret_academic_group_78_devops_tests_2026";
  process.env.JWT_EXPIRES_IN = "1h";

  // Ensure tests never touch the development database
  const isolatedTestDbUri =
    process.env.TEST_MONGODB_URI || "mongodb://127.0.0.1:27017/routeflow_test_suite";

  let connected = false;
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    await mongoose.connect(isolatedTestDbUri, {
      serverSelectionTimeoutMS: 2000,
      autoIndex: true,
    });
    // Drop test database on initial startup to ensure a pristine test environment
    await mongoose.connection.dropDatabase();
    connected = true;
  } catch {
    connected = false;
  }

  // Fallback to in-memory MongoDB if local instance unavailable
  if (!connected) {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { autoIndex: true });
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});
