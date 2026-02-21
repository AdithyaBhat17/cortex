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

export function HrvChart() {
  const { data, isLoading } = useRecoveryData();

  const chartData = data?.map((d) => ({
    date: d.created_at,
    hrv: d.hrv_rmssd_milli ? Math.round(d.hrv_rmssd_milli) : null,
  }));

  return (
    <ChartWrapper
      title="HRV (RMSSD)"
      subtitle="Heart rate variability in milliseconds"
      accent="teal"
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
          <YAxis {...axisProps} tickFormatter={(v) => `${v}ms`} />
          <Tooltip
            {...tooltipStyle}
            labelFormatter={(v) => formatDate(v, "MMM d, yyyy")}
            formatter={(value: unknown) => [`${value} ms`, "HRV"]}
          />
          <Line
            type="monotone"
            dataKey="hrv"
            stroke={CHART_HEX.teal}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
