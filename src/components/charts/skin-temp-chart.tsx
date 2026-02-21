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

export function SkinTempChart() {
  const { data, isLoading } = useRecoveryData();

  const chartData = data
    ?.filter((d) => d.skin_temp_celsius != null)
    .map((d) => ({
      date: d.created_at,
      temp: d.skin_temp_celsius ? Math.round(d.skin_temp_celsius * 10) / 10 : null,
    }));

  return (
    <ChartWrapper
      title="Skin Temperature"
      subtitle="Degrees Celsius"
      accent="purple"
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
          <YAxis {...axisProps} tickFormatter={(v) => `${v}°`} />
          <Tooltip
            {...tooltipStyle}
            labelFormatter={(v) => formatDate(v, "MMM d, yyyy")}
            formatter={(value: unknown) => [`${value}°C`, "Skin Temp"]}
          />
          <Line
            type="monotone"
            dataKey="temp"
            stroke={CHART_HEX.purple}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
