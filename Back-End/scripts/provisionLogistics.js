// Administrator-approved local provisioning through the existing protected API.
const { validateCreateUser } = require("../src/validators/userValidator");
async function provisionLogistics({ baseUrl = "http://127.0.0.1:5000/api", adminEmail, adminPassword, name = "Local Logistics Manager", email, password }) {
  const url = new URL(baseUrl);
  if (!["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) || url.username || url.password) throw new Error("Local provisioning requires a loopback API URL.");
  if (!adminEmail || !adminPassword) throw new Error("Administrator email and password are required to approve provisioning.");
  const payload = { name, email, password, role: "logistics" };
  const errors = validateCreateUser(payload);
  if (errors.length) throw new Error(errors.map(({ field, message }) => `${field}: ${message}`).join(" "));
  async function request(path, body, token) {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, { method: "POST", redirect: "error", signal: AbortSignal.timeout(10000), headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.errors?.length ? data.errors.map(({ field, message }) => `${field}: ${message}`).join(" ") : data.message || `Request failed (${response.status})`);
    return data;
  }
  const session = await request("/auth/login", { email: adminEmail, password: adminPassword, roleId: "administrator" });
  if (!session.token || session.user?.role !== "administrator") throw new Error("An active administrator must approve this account.");
  const created = await request("/users", payload, session.token);
  if (created.data?.role !== "logistics") throw new Error("Provisioning returned an unexpected role.");
  return created.data;
}
if (require.main === module) provisionLogistics({
  baseUrl: process.env.LOCAL_API_URL || "http://127.0.0.1:5000/api",
  adminEmail: process.env.ADMIN_EMAIL, adminPassword: process.env.ADMIN_PASSWORD,
  name: process.env.LOGISTICS_NAME || "Local Logistics Manager",
  email: process.env.LOGISTICS_EMAIL, password: process.env.LOGISTICS_PASSWORD,
}).then((user) => console.log(`Created ${user.email} with role logistics. Select Logistics Manager / Operations Staff on Sign in and use the password you supplied.`))
  .catch((error) => { console.error(error.message); process.exitCode = 1; });
module.exports = { provisionLogistics };
