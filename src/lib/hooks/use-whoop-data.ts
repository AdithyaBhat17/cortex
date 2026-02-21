"use client";

import { useQuery } from "@tanstack/react-query";
import { useDateRange } from "./use-date-range";
import type {
  DbWhoopRecovery,
  DbWhoopSleep,
  DbWhoopCycle,
  DbWhoopWorkout,
} from "@/types/database";

async function fetchWhoopData<T>(type: string, start: Date, end: Date): Promise<T[]> {
  const params = new URLSearchParams({
    type,
    start: start.toISOString(),
    end: end.toISOString(),
  });
  const res = await fetch(`/api/data/whoop?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch ${type} data`);
  return res.json();
}

export function useRecoveryData() {
  const { startDate, endDate, label } = useDateRange();

  return useQuery({
    queryKey: ["whoop", "recovery", label],
    queryFn: () => fetchWhoopData<DbWhoopRecovery>("recovery", startDate, endDate),
  });
}

export function useSleepData() {
  const { startDate, endDate, label } = useDateRange();

  return useQuery({
    queryKey: ["whoop", "sleep", label],
    queryFn: () => fetchWhoopData<DbWhoopSleep>("sleep", startDate, endDate),
  });
}

export function useCycleData() {
  const { startDate, endDate, label } = useDateRange();

  return useQuery({
    queryKey: ["whoop", "cycles", label],
    queryFn: () => fetchWhoopData<DbWhoopCycle>("cycles", startDate, endDate),
  });
}

export function useWorkoutData() {
  const { startDate, endDate, label } = useDateRange();

  return useQuery({
    queryKey: ["whoop", "workouts", label],
    queryFn: () => fetchWhoopData<DbWhoopWorkout>("workouts", startDate, endDate),
  });
}
