"use client";

import { useQuery } from "@tanstack/react-query";

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
