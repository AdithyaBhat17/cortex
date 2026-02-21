"use client";

import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CortexLogo } from "@/components/ui/cortex-logo";
import { useSync } from "@/lib/hooks/use-sync";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowPathIcon,
  ArrowRightStartOnRectangleIcon,
  Squares2X2Icon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export function Header() {
  const sync = useSync();
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: Squares2X2Icon },
    { label: "Connections", href: "/dashboard/connect", icon: LinkIcon },
  ];

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b border-card-border bg-header-bg backdrop-blur-md"
        role="banner"
      >
        {sync.isPending && (
          <div
            className="sync-progress-bar absolute inset-x-0 top-0 h-0 overflow-visible"
            role="status"
            aria-label="Syncing data"
          />
        )}

        <div className="mx-auto flex h-12 max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-5">
            <Link href="/dashboard" aria-label="CORTEX home">
              <CortexLogo size="sm" />
            </Link>
            <nav aria-label="Main navigation" className="hidden items-center gap-0.5 sm:flex">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative px-3 py-1.5 text-[13px] font-medium transition-colors duration-150",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-foreground" aria-hidden="true" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="hidden sm:block">
              <DateRangePicker />
            </div>

            <button
              onClick={() => sync.mutate(false)}
              disabled={sync.isPending || sync.isCoolingDown}
              className={cn(
                "relative rounded-md p-2 text-muted-foreground transition-colors duration-150",
                sync.isPending
                  ? "text-accent"
                  : sync.isCoolingDown
                    ? "cursor-not-allowed opacity-40"
                    : "hover:text-foreground hover:bg-surface-hover"
              )}
              aria-label={
                sync.isPending
                  ? "Syncing data"
                  : sync.isCoolingDown
                    ? `Sync cooldown, wait ${sync.cooldownRemaining} seconds`
                    : "Sync data"
              }
              title={
                sync.isPending
                  ? "Syncing..."
                  : sync.isCoolingDown
                    ? `Wait ${sync.cooldownRemaining}s`
                    : "Sync data"
              }
            >
              <ArrowPathIcon
                className={cn("h-4 w-4", sync.isPending && "sync-spinning")}
                aria-hidden="true"
              />
              {sync.isPending && (
                <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              )}
              {sync.isCoolingDown && !sync.isPending && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-muted text-[8px] font-bold text-muted-foreground" aria-hidden="true">
                  {sync.cooldownRemaining}
                </span>
              )}
            </button>

            <ThemeToggle />

            <button
              onClick={handleLogout}
              className="rounded-md p-2 text-muted-foreground transition-colors duration-150 hover:text-chart-red hover:bg-surface-hover"
              aria-label="Sign out"
              title="Sign out"
            >
              <ArrowRightStartOnRectangleIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Mobile date range picker */}
        <div className="border-t border-card-border px-4 py-2 sm:hidden">
          <DateRangePicker />
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-card-border bg-header-bg backdrop-blur-md sm:hidden"
      >
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-md px-4 py-1.5 text-[10px] font-medium transition-colors duration-150",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
