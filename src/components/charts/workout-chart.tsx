"use client";

import { ChartWrapper } from "./chart-wrapper";
import { useWorkoutData } from "@/lib/hooks/use-whoop-data";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { axisProps, gridProps, tooltipStyle } from "@/lib/utils/chart-theme";
import { CHART_HEX } from "@/lib/utils/constants";
import { formatDate, formatNumber } from "@/lib/utils/formatters";
import { useMemo } from "react";

function getWorkoutStrainColor(strain: number) {
  if (strain >= 14) return CHART_HEX.red;
  if (strain >= 8) return CHART_HEX.amber;
  return CHART_HEX.green;
}

export function WorkoutChart() {
  const { data, isLoading } = useWorkoutData();

  const chartData = useMemo(
    () =>
      data?.map((d) => ({
        date: d.start_time,
        strain: d.strain ? Number(formatNumber(d.strain)) : 0,
        calories: d.calories_kcal ? Math.round(d.calories_kcal) : 0,
        avgHr: d.average_heart_rate ?? 0,
        maxHr: d.max_heart_rate ?? 0,
      })) ?? [],
    [data]
  );

  return (
    <ChartWrapper
      title="Workout Strain"
      subtitle="Strain per workout session"
      accent="orange"
      isLoading={isLoading}
      isEmpty={!chartData?.length}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid {...gridProps} />
          <XAxis
            dataKey="date"
            {...axisProps}
            tickFormatter={(v) => formatDate(v)}
          />
          <YAxis domain={[0, 21]} {...axisProps} />
          <Tooltip
            {...tooltipStyle}
            labelFormatter={(v) => formatDate(v, "MMM d, yyyy")}
            formatter={(value: unknown) => [`${Number(value).toFixed(1)}`, "Strain"]}
          />
          <Bar dataKey="strain" radius={[4, 4, 0, 0]} fillOpacity={0.85}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={getWorkoutStrainColor(entry.strain)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
