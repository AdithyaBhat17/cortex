"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DbUserProfile } from "@/types/database";

export function useProfile() {
  return useQuery<DbUserProfile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/data/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      profile: Partial<Pick<DbUserProfile, "height_cm" | "date_of_birth" | "gender">>
    ) => {
      const res = await fetch("/api/data/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to save profile");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
