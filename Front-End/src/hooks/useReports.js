import { useEffect, useState } from "react";
import { apiRequest } from "../services/apiClient";
export function useReports(orders) {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    apiRequest("/reports/overview").then((res) => { if (active) setReport(res.data); })
      .catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [orders]);
  return { report, error };
}
