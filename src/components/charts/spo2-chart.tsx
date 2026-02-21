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

export function Spo2Chart() {
  const { data, isLoading } = useRecoveryData();

  const chartData = data
    ?.filter((d) => d.spo2_percentage != null)
    .map((d) => ({
      date: d.created_at,
      spo2: d.spo2_percentage ? Math.round(d.spo2_percentage * 10) / 10 : null,
    }));

  return (
    <ChartWrapper
      title="SpO2"
      subtitle="Blood oxygen saturation"
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
          <YAxis domain={[90, 100]} {...axisProps} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            {...tooltipStyle}
            labelFormatter={(v) => formatDate(v, "MMM d, yyyy")}
            formatter={(value: unknown) => [`${value}%`, "SpO2"]}
          />
          <Line
            type="monotone"
            dataKey="spo2"
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
