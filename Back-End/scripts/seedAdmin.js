// Explicit operator-only bootstrap. Never overwrites an existing account or creates demo records.
const { connectDatabase, disconnectDatabase } = require("../src/config/database");
const User = require("../src/models/User");
async function seed() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) throw new Error("Set BOOTSTRAP_ADMIN_EMAIL and a BOOTSTRAP_ADMIN_PASSWORD of at least 12 characters.");
  try {
    await connectDatabase();
    if (await User.exists({ email: email.trim().toLowerCase() })) throw new Error("Account already exists; no changes made.");
    await User.create({ name: process.env.BOOTSTRAP_ADMIN_NAME || "System Administrator", email, password, role: "administrator" });
    console.log("Administrator created. Use authenticated /api/users to provision other staff.");
  } finally { await disconnectDatabase(); }
}
if (require.main === module) seed().catch((err) => { console.error(err.message); process.exitCode = 1; });
module.exports = seed;
