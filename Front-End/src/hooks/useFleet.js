import { useState, useEffect } from "react";
import { driverService } from "../services/driverService";

export function useFleet(enabled = true) {
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!enabled) return;
    driverService
      .getDrivers()
      .then((items) => {
        if (active && Array.isArray(items) && items.length > 0) {
          setDrivers(items);
        }
      })
      .catch((error) => { if (active) setError(error.message); });
    return () => {
      active = false;
    };
  }, [enabled]);

  async function toggleDriverStatus(driverName) {
    const driver = drivers.find((item) => item.id === driverName);
    if (!driver) return;
    const nextStatus = await driverService.toggleStatus(driver.id, driver.status);
    setDrivers((current) =>
      current.map((item) =>
        item.id === driverName ? { ...item, status: nextStatus } : item
      )
    );
  }

  return {
    reload: async () => setDrivers(await driverService.getDrivers()),
    error,
    drivers,
    setDrivers,
    toggleDriverStatus,
  };
}
