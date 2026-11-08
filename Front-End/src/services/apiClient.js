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

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const token = getStoredToken();
  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch {
    const error = new Error("Unable to connect to the Routeflow service. Check that the API is running.");
    error.status = 0;
    throw error;
  }

  if (!response.ok) {
    if (response.status === 401 && token && !endpoint.startsWith("/auth/login")) {
      setStoredToken(null);
      window.dispatchEvent(new Event("routeflow:unauthorized"));
    }
    const errorData = await response.json().catch(() => ({}));
    const fields = Array.isArray(errorData.errors) ? errorData.errors.filter((item) => item && typeof item.message === "string") : [];
    const labels = { name: "Full name", fullName: "Full name", email: "Work email", password: "Password", confirmPassword: "Confirm password", role: "Role", roleId: "Role" };
    const message = fields.length
      ? fields.map(({ field, message }) => `${labels[field] || field || "Field"}: ${message}`).join(" ")
      : errorData.message || errorData.error?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.fields = fields;
    throw error;
  }

  return response.json();
}
