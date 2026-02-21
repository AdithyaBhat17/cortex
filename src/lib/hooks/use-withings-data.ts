"use client";

import { useQuery } from "@tanstack/react-query";
import { useDateRange } from "./use-date-range";
import type { DbWithingsMeasurement } from "@/types/database";

export function useWithingsData() {
  const { startDate, endDate, label } = useDateRange();

  return useQuery<DbWithingsMeasurement[]>({
    queryKey: ["withings", "measurements", label],
    queryFn: async () => {
      const params = new URLSearchParams({
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      });
      const res = await fetch(`/api/data/withings?${params}`);
      if (!res.ok) throw new Error("Failed to fetch withings data");
      return res.json();
    },
  });
}
