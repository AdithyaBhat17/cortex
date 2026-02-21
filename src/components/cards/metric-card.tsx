import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color: string;
  colorName?: "teal" | "orange" | "blue" | "purple";
  loading?: boolean;
}

export function MetricCard({
  label,
  value,
  unit,
  trend,
  trendValue,
  color,
  colorName,
  loading,
}: MetricCardProps) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="mt-3 h-9 w-20 rounded bg-muted" />
      </Card>
    );
  }

  return (
    <Card accent={colorName}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 flex items-baseline gap-1">
        <span
          className="font-heading text-3xl font-bold tabular-nums"
          style={{ color, textShadow: `0 0 28px ${color}30` }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-muted-foreground">{unit}</span>
        )}
      </div>
      {trend && trendValue && (
        <div
          className="mt-1.5 flex items-center gap-1"
          aria-label={`Trend: ${trend} ${trendValue}`}
        >
          {trend === "up" ? (
            <svg width="10" height="10" viewBox="0 0 8 8" fill="currentColor" className="text-teal" aria-hidden="true">
              <path d="M4 1L7 5H1L4 1Z" />
            </svg>
          ) : trend === "down" ? (
            <svg width="10" height="10" viewBox="0 0 8 8" fill="currentColor" className="text-chart-red" aria-hidden="true">
              <path d="M4 7L1 3H7L4 7Z" />
            </svg>
          ) : null}
          <span
            className={cn(
              "text-xs font-medium",
              trend === "up" ? "text-teal" : trend === "down" ? "text-chart-red" : "text-muted-foreground"
            )}
          >
            {trendValue}
          </span>
        </div>
      )}
    </Card>
  );
}
