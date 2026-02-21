"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, type ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { useDateRange } from "@/lib/hooks/use-date-range";

function DateRangeHydrator() {
  const hydrate = useDateRange((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <DateRangeHydrator />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
