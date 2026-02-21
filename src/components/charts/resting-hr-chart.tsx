"use client";

import { ChartWrapper } from "./chart-wrapper";
import { useRecoveryData } from "@/lib/hooks/use-whoop-data";
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

export function RestingHrChart() {
  const { data, isLoading } = useRecoveryData();

  const chartData = data?.map((d) => ({
    date: d.created_at,
    rhr: d.resting_heart_rate ? Math.round(d.resting_heart_rate) : null,
  }));

  return (
    <ChartWrapper
      title="Resting Heart Rate"
      subtitle="Beats per minute"
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
            formatter={(value: unknown) => [`${value} bpm`, "RHR"]}
          />
          <Line
            type="monotone"
            dataKey="rhr"
            stroke={CHART_HEX.blue}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
