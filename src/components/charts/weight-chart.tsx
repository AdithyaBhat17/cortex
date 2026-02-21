"use client";

import { ChartWrapper } from "./chart-wrapper";
import { useWithingsData } from "@/lib/hooks/use-withings-data";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { axisProps, gridProps, tooltipStyle } from "@/lib/utils/chart-theme";
import { CHART_HEX } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/formatters";

export function WeightChart() {
  const { data, isLoading } = useWithingsData();

  const chartData = data
    ?.filter((d) => d.weight_kg != null)
    .map((d) => ({
      date: d.measured_at,
      weight: d.weight_kg ? Math.round(d.weight_kg * 10) / 10 : null,
    }));

  return (
    <ChartWrapper
      title="Weight"
      subtitle="Body weight tracking (kg)"
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
          <YAxis
            {...axisProps}
            domain={["dataMin - 2", "dataMax + 2"]}
            tickFormatter={(v) => `${v}kg`}
          />
          <Tooltip
            {...tooltipStyle}
            labelFormatter={(v) => formatDate(v, "MMM d, yyyy")}
            formatter={(value: unknown) => [`${value} kg`, "Weight"]}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke={CHART_HEX.blue}
            strokeWidth={2}
            dot={{ r: 3, fill: CHART_HEX.blue }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
