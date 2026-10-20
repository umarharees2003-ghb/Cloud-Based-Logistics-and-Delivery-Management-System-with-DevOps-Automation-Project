import { useState } from "react";
import { initialDrivers } from "../data/demoData";
import { driverService } from "../services/driverService";

export function useFleet() {
  const [drivers, setDrivers] = useState(initialDrivers);

  async function toggleDriverStatus(driverName) {
    const driver = drivers.find((item) => item.name === driverName);
    if (!driver) return;
    const nextStatus = await driverService.toggleStatus(driverName, driver.status);
    setDrivers((current) =>
      current.map((item) =>
        item.name === driverName ? { ...item, status: nextStatus } : item
      )
    );
  }

  return {
    drivers,
    setDrivers,
    toggleDriverStatus,
  };
}

