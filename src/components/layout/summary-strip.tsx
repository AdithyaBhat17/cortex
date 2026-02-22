"use client";

import { useCycleData, useRecoveryData, useSleepData } from "@/lib/hooks/use-whoop-data";
import { useWithingsData } from "@/lib/hooks/use-withings-data";
import { useProfile } from "@/lib/hooks/use-profile";
import { CHART_HEX } from "@/lib/utils/constants";
import { useId, useMemo } from "react";

/* ── Sparkline SVG ─────────────────────────────────────── */

const SPARK_W = 120;
const SPARK_H = 24;

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const id = useId();

  if (data.length < 2) return <div style={{ height: SPARK_H }} />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * SPARK_W,
    y: SPARK_H - pad - ((v - min) / range) * (SPARK_H - pad * 2),
  }));

  function smoothPath(pts: { x: number; y: number }[]): string {
    if (pts.length < 2) return "";
    const t = 0.3;
    let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];
      const cp1x = p1.x + ((p2.x - p0.x) * t) / 3;
      const cp1y = p1.y + ((p2.y - p0.y) * t) / 3;
      const cp2x = p2.x - ((p3.x - p1.x) * t) / 3;
      const cp2y = p2.y - ((p3.y - p1.y) * t) / 3;
      d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return d;
  }

  const linePath = smoothPath(points);
  const areaPath = `${linePath} L ${SPARK_W},${SPARK_H} L 0,${SPARK_H} Z`;

  return (
    <div className="overflow-hidden" style={{ height: SPARK_H }}>
      <svg
        width="100%"
        height={SPARK_H}
        viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
        preserveAspectRatio="none"
        className="block"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`sf-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#sf-${id})`} className="sparkline-area" />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="sparkline-line"
        />
      </svg>
    </div>
  );
}

/* ── Trend calculation ────────────────────────────────── */

function calcTrend(data: number[]): { direction: "up" | "down" | "flat"; pct: string } {
  if (data.length < 4) return { direction: "flat", pct: "0" };

  const mid = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, mid);
  const secondHalf = data.slice(mid);

  const avgFirst = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length;

  if (avgFirst === 0) return { direction: "flat", pct: "0" };

  const change = ((avgSecond - avgFirst) / Math.abs(avgFirst)) * 100;
  const absChange = Math.abs(change);

  if (absChange < 0.5) return { direction: "flat", pct: "0" };

  return {
    direction: change > 0 ? "up" : "down",
    pct: absChange.toFixed(1),
  };
}

/* ── Summary Card ─────────────────────────────────────── */

interface MetricDef {
  label: string;
  value: string | null;
  unit?: string;
  color: string;
  sparkData: number[];
  loading: boolean;
  invertTrend?: boolean;
}

function SummaryMetricCard({ metric, index }: { metric: MetricDef; index: number }) {
  const trend = useMemo(() => calcTrend(metric.sparkData), [metric.sparkData]);

  if (metric.loading) {
    return (
      <div
        role="listitem"
        className="summary-card animate-pulse"
        style={{ animationDelay: `${index * 40}ms` }}
        aria-label={`Loading ${metric.label}`}
      >
        <div className="h-2.5 w-14 rounded bg-muted" />
        <div className="mt-2 h-7 w-12 rounded bg-muted" />
        <div className="mt-2 h-6 w-full rounded bg-muted/50" />
      </div>
    );
  }

  const isGoodTrend =
    trend.direction === "flat"
      ? null
      : metric.invertTrend
        ? trend.direction === "down"
        : trend.direction === "up";

  return (
    <div
      role="listitem"
      className="summary-card animate-fade-up"
      style={{ animationDelay: `${index * 40}ms` }}
      aria-label={`${metric.label}: ${metric.value ?? "no data"}${metric.unit ? ` ${metric.unit}` : ""}`}
    >
      {/* Label */}
      <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {metric.label}
      </span>

      {/* Value + trend inline */}
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span
          className="font-heading text-xl font-bold tabular-nums tracking-tight"
          style={{ color: metric.color }}
        >
          {metric.value ?? "\u2014"}
        </span>
        {metric.unit && (
          <span className="text-[10px] font-medium text-muted-foreground">
            {metric.unit}
          </span>
        )}
        {trend.direction !== "flat" && (
          <span
            className="ml-auto flex items-center gap-0.5 text-[10px] font-semibold"
            style={{
              color: isGoodTrend ? CHART_HEX.green : CHART_HEX.red,
            }}
            aria-label={`${trend.direction === "up" ? "Up" : "Down"} ${trend.pct}%`}
          >
            <svg width="7" height="7" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
              {trend.direction === "up" ? (
                <path d="M4 1L7 5H1L4 1Z" />
              ) : (
                <path d="M4 7L1 3H7L4 7Z" />
              )}
            </svg>
            {trend.pct}%
          </span>
        )}
      </div>

      {/* Sparkline */}
      <div className="mt-2">
        <Sparkline data={metric.sparkData} color={metric.color} />
      </div>
    </div>
  );
}

/* ── Main Strip ───────────────────────────────────────── */

export function SummaryStrip() {
  const { data: recovery, isLoading: rl } = useRecoveryData();
  const { data: sleep, isLoading: sl } = useSleepData();
  const { data: cycles, isLoading: cl } = useCycleData();
  const { data: withings, isLoading: wl } = useWithingsData();
  const { data: profile } = useProfile();

  const recoveryScores = useMemo(
    () => recovery?.map((r) => r.recovery_score).filter((v): v is number => v != null) ?? [],
    [recovery]
  );
  const avgRecovery = recoveryScores.length
    ? Math.round(recoveryScores.reduce((s, v) => s + v, 0) / recoveryScores.length)
    : null;

  const sleepScores = useMemo(
    () => sleep?.map((s) => s.sleep_performance_percentage).filter((v): v is number => v != null) ?? [],
    [sleep]
  );
  const avgSleep = sleepScores.length
    ? Math.round(sleepScores.reduce((s, v) => s + v, 0) / sleepScores.length)
    : null;

  const strainValues = useMemo(
    () => cycles?.map((c) => c.strain).filter((v): v is number => v != null) ?? [],
    [cycles]
  );
  const avgStrain = strainValues.length
    ? (strainValues.reduce((s, v) => s + v, 0) / strainValues.length).toFixed(1)
    : null;

  const weightValues = useMemo(
    () => withings?.filter((w) => w.weight_kg != null).map((w) => w.weight_kg!) ?? [],
    [withings]
  );
  const latestWeight = weightValues.length ? weightValues[weightValues.length - 1] : null;

  const muscleValues = useMemo(
    () => withings?.filter((w) => w.muscle_mass_kg != null).map((w) => w.muscle_mass_kg!) ?? [],
    [withings]
  );
  const latestMuscle = muscleValues.length ? muscleValues[muscleValues.length - 1] : null;

  const { bmiValues, latestBmi } = useMemo(() => {
    const direct = withings?.filter((w) => w.bmi != null).map((w) => w.bmi!) ?? [];
    if (direct.length > 0) return { bmiValues: direct, latestBmi: direct[direct.length - 1] };

    const latestHeight = withings?.filter((w) => w.height_m != null).at(-1)?.height_m;
    const heightM = latestHeight ?? (profile?.height_cm ? profile.height_cm / 100 : null);
    if (!heightM) return { bmiValues: [] as number[], latestBmi: null };

    const calculated = (withings ?? [])
      .filter((w) => w.weight_kg != null)
      .map((w) => Math.round((w.weight_kg! / (heightM * heightM)) * 10) / 10);

    return {
      bmiValues: calculated,
      latestBmi: calculated.length ? calculated[calculated.length - 1] : null,
    };
  }, [withings, profile]);

  const fatValues = useMemo(
    () => withings?.filter((w) => w.fat_ratio_pct != null).map((w) => w.fat_ratio_pct!) ?? [],
    [withings]
  );
  const latestFat = fatValues.length ? fatValues[fatValues.length - 1] : null;

  const metrics: MetricDef[] = [
    {
      label: "Avg Recovery",
      value: avgRecovery?.toString() ?? null,
      unit: "%",
      color: CHART_HEX.teal,
      sparkData: recoveryScores,
      loading: rl,
    },
    {
      label: "Avg Sleep",
      value: avgSleep?.toString() ?? null,
      unit: "%",
      color: CHART_HEX.purple,
      sparkData: sleepScores,
      loading: sl,
    },
    {
      label: "Avg Strain",
      value: avgStrain ?? null,
      color: CHART_HEX.orange,
      sparkData: strainValues,
      loading: cl,
    },
    {
      label: "Weight",
      value: latestWeight ? (Math.round(latestWeight * 10) / 10).toString() : null,
      unit: "kg",
      color: CHART_HEX.blue,
      sparkData: weightValues,
      loading: wl,
      invertTrend: true,
    },
    {
      label: "Muscle Mass",
      value: latestMuscle ? (Math.round(latestMuscle * 10) / 10).toString() : null,
      unit: "kg",
      color: CHART_HEX.teal,
      sparkData: muscleValues,
      loading: wl,
    },
    {
      label: "Body Fat",
      value: latestFat ? latestFat.toFixed(1) : null,
      unit: "%",
      color: CHART_HEX.red,
      sparkData: fatValues,
      loading: wl,
      invertTrend: true,
    },
    {
      label: "BMI",
      value: latestBmi ? latestBmi.toFixed(1) : null,
      color: CHART_HEX.amber,
      sparkData: bmiValues,
      loading: wl,
      invertTrend: true,
    },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7"
      role="list"
      aria-label="Health metrics summary"
    >
      {metrics.map((m, i) => (
        <SummaryMetricCard key={m.label} metric={m} index={i} />
      ))}
    </div>
  );
}
