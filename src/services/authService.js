/**
 * Authentication Service
 * Prepares the application for future integration with Node.js/Express backend API.
 * Currently backed by demo session state.
 */

import { userRoles } from "../data/demoData";

export const authService = {
  /**
   * Log in user
   * @param {Object} credentials - { email, password, roleId }
   * @returns {Promise<{ name: string, roleId: string }>}
   */
  async login({ email, roleId }) {
    // In future backend integration:
    // const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password, roleId }) });
    // return res.json();
    return {
      name: email.trim(),
      roleId: String(roleId),
    };
  },

  /**
   * Register new user
   * @param {Object} data - { fullName, email, password, roleId }
   * @returns {Promise<{ name: string, roleId: string }>}
   */
  async signup({ fullName, roleId }) {
    // In future backend integration:
    // const res = await fetch('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) });
    // return res.json();
    return {
      name: fullName.trim(),
      roleId: String(roleId),
    };
  },

  /**
   * Log out user
   */
  async logout() {
    // In future backend integration:
    // await fetch('/api/auth/logout', { method: 'POST' });
    return true;
  },

  /**
   * Get available user roles
   */
  getRoles() {
    return userRoles;
  },
};

