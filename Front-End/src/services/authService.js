import { userRoles } from "../data/demoData.js";
import { apiRequest, setStoredToken } from "./apiClient.js";
function accept(res) {
  if (!res.token || !res.user?.role) throw new Error("Invalid authentication response.");
  setStoredToken(res.token);
  return { ...res.user, roleId: res.user.role };
}
export const authService = {
  async login({ email, password, roleId }) {
    return accept(await apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ email: email.trim(), password, roleId }) }));
  },
  async signup({ fullName, email, password, confirmPassword, roleId }) {
    return accept(await apiRequest("/auth/register", { method: "POST", body: JSON.stringify({ name: fullName.trim(), email: email.trim(), password, confirmPassword, role: roleId }) }));
  },
  async me() { const res = await apiRequest("/auth/me"); return { ...res.user, roleId: res.user.role }; },
  async updateProfile(updates) { const res = await apiRequest("/auth/me", { method: "PATCH", body: JSON.stringify(updates) }); return res.user; },
  async logout() { setStoredToken(null); },
  getRoles() { return userRoles; },
};
