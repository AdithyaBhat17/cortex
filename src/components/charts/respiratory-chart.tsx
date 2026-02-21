"use client";

import { ChartWrapper } from "./chart-wrapper";
import { useSleepData } from "@/lib/hooks/use-whoop-data";
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

export function RespiratoryChart() {
  const { data, isLoading } = useSleepData();

  const chartData = data
    ?.filter((d) => d.respiratory_rate != null)
    .map((d) => ({
      date: d.start_time,
      rate: d.respiratory_rate ? Math.round(d.respiratory_rate * 10) / 10 : null,
    }));

  return (
    <ChartWrapper
      title="Respiratory Rate"
      subtitle="Breaths per minute during sleep"
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
          <YAxis {...axisProps} tickFormatter={(v) => `${v}`} />
          <Tooltip
            {...tooltipStyle}
            labelFormatter={(v) => formatDate(v, "MMM d, yyyy")}
            formatter={(value: unknown) => [`${value} rpm`, "Resp Rate"]}
          />
          <Line
            type="monotone"
            dataKey="rate"
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
