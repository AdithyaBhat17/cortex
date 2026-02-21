"use client";

import { Card } from "@/components/ui/card";
import { useConnections } from "@/lib/hooks/use-connections";
import { useSync } from "@/lib/hooks/use-sync";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { formatDateFull } from "@/lib/utils/formatters";
import { useQueryClient } from "@tanstack/react-query";

function WhoopLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M2 7l3.5 10L9 9l3.5 8L16 9l3.5 8L22 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WithingsLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5.5 12h3.5l1.5-3.5 2 7 2-7 1.5 3.5h3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ConnectPageContent() {
  const { data: connections, isLoading, isError } = useConnections();
  const sync = useSync();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (success) {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      sync.mutate(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);

  const providers = [
    {
      id: "whoop" as const,
      name: "WHOOP",
      description: "Recovery, strain, sleep, HRV, heart rate, SpO2, skin temperature, respiratory rate, calories",
      connected: !!connections?.whoop,
      connectedAt: connections?.whoop?.created_at,
      connectUrl: "/api/auth/whoop",
      brandColor: "#44d62c",
      logo: WhoopLogo,
    },
    {
      id: "withings" as const,
      name: "Withings",
      description: "Weight, body composition, muscle mass, fat mass, bone mass, BMI",
      connected: !!connections?.withings,
      connectedAt: connections?.withings?.created_at,
      connectUrl: "/api/auth/withings",
      brandColor: "#00b4d8",
      logo: WithingsLogo,
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-xl font-bold tracking-wide text-foreground">
          Connections
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect your health devices to sync data to your dashboard.
        </p>
      </div>

      {success && (
        <Card className="px-4 py-3">
          <div className="flex items-center gap-2" role="status" aria-live="polite">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />
            <span className="text-sm text-accent">
              Successfully connected {success === "whoop" ? "WHOOP" : "Withings"}! Initial sync is running&hellip;
            </span>
          </div>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {providers.map((provider) => {
          const Logo = provider.logo;

          return (
            <Card key={provider.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
                    style={{ backgroundColor: `${provider.brandColor}12`, color: provider.brandColor }}
                  >
                    <Logo className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="font-heading text-base font-semibold tracking-wide text-foreground">
                      {provider.name}
                    </h2>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                      {provider.description}
                    </p>
                  </div>
                </div>
                {isLoading ? (
                  <div className="h-5 w-5 shrink-0 animate-pulse rounded-full bg-muted" aria-label="Loading status" />
                ) : provider.connected ? (
                  <CheckCircleIcon className="h-5 w-5 shrink-0 text-teal" aria-label="Connected" />
                ) : (
                  <XCircleIcon className="h-5 w-5 shrink-0 text-muted-foreground/40" aria-label="Not connected" />
                )}
              </div>

              <div className="mt-4">
                {isLoading ? (
                  <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
                ) : provider.connected ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Connected {provider.connectedAt ? formatDateFull(provider.connectedAt) : ""}
                    </span>
                    <span className="rounded-md bg-teal/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-teal">
                      Active
                    </span>
                  </div>
                ) : isError ? (
                  <p className="text-xs text-chart-red" role="alert">
                    Failed to check connection status. Try refreshing.
                  </p>
                ) : (
                  <a
                    href={provider.connectUrl}
                    className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity duration-150 hover:opacity-90"
                    style={{ background: provider.brandColor }}
                  >
                    <Logo className="h-4 w-4" />
                    <span>Connect {provider.name}</span>
                  </a>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function ConnectPage() {
  return (
    <Suspense>
      <ConnectPageContent />
    </Suspense>
  );
}
