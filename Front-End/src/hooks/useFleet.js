import { useState, useEffect } from "react";
import { initialDrivers } from "../data/demoData";
import { driverService } from "../services/driverService";

export function useFleet() {
  const [drivers, setDrivers] = useState(initialDrivers);

  useEffect(() => {
    let active = true;
    driverService
      .getDrivers()
      .then((items) => {
        if (active && Array.isArray(items) && items.length > 0) {
          setDrivers(items);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

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
