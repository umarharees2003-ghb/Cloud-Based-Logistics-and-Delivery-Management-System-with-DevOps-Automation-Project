/**
 * API Client Configuration
 *
 * Centralized fetch client for Routeflow backend API communication.
 * Handles base URL configuration, JSON parsing, error throwing,
 * and automatic Bearer token injection from localStorage.
 */

export const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  "/api";

export function getStoredToken() {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage.getItem("routeflow_token");
  }
  return null;
}

export function setStoredToken(token) {
  if (typeof window !== "undefined" && window.localStorage) {
    if (token) {
      window.localStorage.setItem("routeflow_token", token);
    } else {
      window.localStorage.removeItem("routeflow_token");
    }
  }
}

/**
 * Common fetch helper for authenticated JSON API requests.
 * @param {string} endpoint
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}
