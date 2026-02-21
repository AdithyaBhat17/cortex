"use client";

import { ChartWrapper } from "./chart-wrapper";
import { useWorkoutData } from "@/lib/hooks/use-whoop-data";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { axisProps, gridProps, tooltipStyle } from "@/lib/utils/chart-theme";
import { CHART_HEX } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/formatters";
import { useMemo } from "react";

export function WorkoutHrChart() {
  const { data, isLoading } = useWorkoutData();

  const chartData = useMemo(
    () =>
      data
        ?.filter((d) => d.average_heart_rate != null || d.max_heart_rate != null)
        .map((d) => ({
          date: d.start_time,
          avg: d.average_heart_rate,
          max: d.max_heart_rate,
        })) ?? [],
    [data]
  );

  return (
    <ChartWrapper
      title="Workout Heart Rate"
      subtitle="Average & max HR per session (bpm)"
      accent="blue"
      isLoading={isLoading}
      isEmpty={!chartData?.length}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid {...gridProps} />
          <XAxis
            dataKey="date"
            {...axisProps}
            tickFormatter={(v) => formatDate(v)}
          />
          <YAxis {...axisProps} tickFormatter={(v) => `${v}`} />
          <Tooltip
            {...tooltipStyle}
            labelFormatter={(v) => formatDate(v, "MMM d, yyyy")}
            formatter={(value: unknown, name: unknown) => [
              `${value} bpm`,
              name === "avg" ? "Avg HR" : "Max HR",
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value: unknown) =>
              String(value) === "avg" ? "Avg HR" : "Max HR"
            }
          />
          <Line
            type="monotone"
            dataKey="avg"
            stroke={CHART_HEX.blue}
            strokeWidth={2}
            dot={{ r: 2.5, fill: CHART_HEX.blue }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="max"
            stroke={CHART_HEX.red}
            strokeWidth={2}
            dot={{ r: 2.5, fill: CHART_HEX.red }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
