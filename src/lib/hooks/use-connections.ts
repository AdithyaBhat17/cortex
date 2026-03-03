"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface ConnectionInfo {
  provider: string;
  created_at: string;
  updated_at: string;
}

interface ConnectionsResponse {
  whoop: ConnectionInfo | null;
  withings: ConnectionInfo | null;
}

export function useConnections() {
  return useQuery<ConnectionsResponse>({
    queryKey: ["connections"],
    queryFn: async () => {
      const res = await fetch("/api/data/connections");
      if (!res.ok) throw new Error("Failed to fetch connections");
      return res.json();
    },
  });
}

export function useDisconnect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (provider: "whoop" | "withings") => {
      const res = await fetch(`/api/data/connections?provider=${provider}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to disconnect");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });
}
