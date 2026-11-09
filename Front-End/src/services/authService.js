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
          password: String(password || ""),
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
      // If the backend actively rejected the request (e.g. 401 Wrong Password, 400 Bad Request),
      // rethrow so the UI displays the error instead of silently bypassing authentication.
      if (err.status) {
        throw err;
      }
      // If network is completely unreachable, fall back to local preview session with explicit warning
      console.warn("Backend auth service unreachable; using local demo preview:", err.message);
      return {
        name: email.trim(),
        roleId: String(roleId),
        isDemoFallback: true,
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
          password: String(password || ""),
          confirmPassword: String(confirmPassword || password || ""),
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
      if (err.status) {
        throw err;
      }
      console.warn("Backend registration unreachable; using local demo preview:", err.message);
      return {
        name: fullName.trim(),
        roleId: String(roleId),
        isDemoFallback: true,
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
