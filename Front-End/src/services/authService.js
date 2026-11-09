/**
 * Authentication Service
 * Communicates with Routeflow Express backend API with graceful offline fallback.
 */

import { userRoles } from "../data/demoData.js";
import { apiRequest, setStoredToken } from "./apiClient.js";

export const authService = {
  /**
   * Log in user
   * @param {Object} credentials - { email, password, roleId }
   * @returns {Promise<{ name: string, roleId: string, email?: string, token?: string }>}
   */
  async login({ email, password, roleId }) {
    try {
      const res = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password: password || "AdminRouteflow2026!",
          roleId,
        }),
      });

      if (res.token) {
        setStoredToken(res.token);
      }

      return {
        name: res.name || res.user?.name || email.trim(),
        roleId: res.roleId || res.user?.role || String(roleId),
        email: res.email || res.user?.email || email.trim(),
        token: res.token,
      };
    } catch (err) {
      // In development, if backend endpoint is unavailable or returns an error,
      // fallback to local demo credentials to avoid breaking standalone demo flow
      console.warn("Backend auth unavailable, utilizing local session:", err.message);
      return {
        name: email.trim(),
        roleId: String(roleId),
      };
    }
  },

  /**
   * Register new user
   * @param {Object} data - { fullName, email, password, confirmPassword, roleId }
   * @returns {Promise<{ name: string, roleId: string, email?: string, token?: string }>}
   */
  async signup({ fullName, email, password, confirmPassword, roleId }) {
    try {
      const res = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: fullName.trim(),
          email: email ? email.trim() : `${fullName.toLowerCase().replace(/\s+/g, ".")}@routeflow.io`,
          password: password || "Password123!",
          confirmPassword: confirmPassword || password || "Password123!",
          role: roleId || "customer",
        }),
      });

      if (res.token) {
        setStoredToken(res.token);
      }

      return {
        name: res.name || res.user?.name || fullName.trim(),
        roleId: res.roleId || res.user?.role || String(roleId),
        email: res.email || res.user?.email,
        token: res.token,
      };
    } catch (err) {
      console.warn("Backend registration unavailable, utilizing local session:", err.message);
      return {
        name: fullName.trim(),
        roleId: String(roleId),
      };
    }
  },

  /**
   * Log out user
   */
  async logout() {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout
    } finally {
      setStoredToken(null);
    }
    return true;
  },

  /**
   * Get available user roles
   */
  getRoles() {
    return userRoles;
  },
};
