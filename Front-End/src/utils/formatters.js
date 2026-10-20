/**
 * Utility formatters for Routeflow
 */

export function getTodayLabel() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date()).toUpperCase();
}

export function getAccountFirstName(name) {
  if (!name) return "there";
  return name.split("@")[0].split(" ")[0] || "there";
}

export function getInitials(name) {
  if (!name || name === "Unassigned") return "—";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function splitRoute(route) {
  if (!route) return ["Origin", "Destination"];
  const parts = route.split(" → ");
  return [parts[0] || "", parts[1] || ""];
}

export function formatStatusClass(status) {
  if (!status) return "";
  return status.toLowerCase().replaceAll(" ", "-");
}

