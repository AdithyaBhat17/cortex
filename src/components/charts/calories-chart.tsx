"use client";

import { ChartWrapper } from "./chart-wrapper";
import { useCycleData } from "@/lib/hooks/use-whoop-data";
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
import { formatDate } from "@/lib/utils/formatters";
import { useMemo } from "react";

function getCalorieColor(cal: number, avg: number) {
  const ratio = cal / avg;
  if (ratio >= 1.1) return CHART_HEX.green;
  if (ratio >= 0.85) return CHART_HEX.amber;
  return CHART_HEX.red;
}

export function CaloriesChart() {
  const { data, isLoading } = useCycleData();

  const chartData = useMemo(
    () =>
      data?.map((d) => ({
        date: d.start_time,
        calories: d.calories_kcal ? Math.round(d.calories_kcal) : 0,
      })),
    [data]
  );

  const avgCalories = useMemo(() => {
    if (!chartData?.length) return 0;
    const vals = chartData.filter((d) => d.calories > 0);
    return vals.length ? vals.reduce((s, d) => s + d.calories, 0) / vals.length : 0;
  }, [chartData]);

  return (
    <ChartWrapper
      title="Calories Burned"
      subtitle="Daily energy expenditure (kcal)"
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
          <YAxis {...axisProps} />
          <Tooltip
            {...tooltipStyle}
            labelFormatter={(v) => formatDate(v, "MMM d, yyyy")}
            formatter={(value: unknown) => [`${value} kcal`, "Calories"]}
          />
          <Bar dataKey="calories" radius={[4, 4, 0, 0]} fillOpacity={0.85}>
            {chartData?.map((entry, i) => (
              <Cell key={i} fill={getCalorieColor(entry.calories, avgCalories)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
