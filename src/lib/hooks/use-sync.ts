"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useRef, useEffect } from "react";

const COOLDOWN_SECONDS = 60;

export function useSync() {
  const queryClient = useQueryClient();
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startCooldown = useCallback(() => {
    setCooldownRemaining(COOLDOWN_SECONDS);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const mutation = useMutation({
    mutationFn: async (initial: boolean = false) => {
      const res = await fetch(`/api/sync${initial ? "?initial=true" : ""}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Sync failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whoop"] });
      queryClient.invalidateQueries({ queryKey: ["withings"] });
      startCooldown();
    },
    onError: () => {
      startCooldown();
    },
  });

  return {
    ...mutation,
    cooldownRemaining,
    isCoolingDown: cooldownRemaining > 0,
  };
}
