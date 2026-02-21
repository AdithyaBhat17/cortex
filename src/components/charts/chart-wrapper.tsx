import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReactNode } from "react";

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  height?: number;
  accent?: "teal" | "orange" | "blue" | "purple";
}

export function ChartWrapper({
  title,
  subtitle,
  children,
  isLoading,
  isEmpty,
  height = 280,
}: ChartWrapperProps) {
  return (
    <Card>
      <div className="mb-4">
        <h3 className="font-heading text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {title}
        </h3>
      </div>

      {isLoading ? (
        <Skeleton
          className="w-full"
          style={{ height: Math.min(height, 220) }}
          aria-label={`Loading ${title} chart`}
        />
      ) : isEmpty ? (
        <div
          className="flex items-center justify-center rounded-md border border-dashed border-card-border text-xs text-muted-foreground"
          style={{ height: Math.min(height, 220) }}
          role="status"
        >
          No data available for this period
        </div>
      ) : (
        <div
          role="img"
          aria-label={`${title} chart${subtitle ? `: ${subtitle}` : ""}`}
          style={{ height }}
          className="min-h-[180px]"
        >
          {children}
        </div>
      )}
    </Card>
  );
}
