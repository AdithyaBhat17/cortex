"use client";

import { ChartWrapper } from "./chart-wrapper";
import { useSleepData } from "@/lib/hooks/use-whoop-data";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
} from "recharts";
import { axisProps, gridProps, tooltipStyle } from "@/lib/utils/chart-theme";
import { CHART_HEX } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/formatters";

export function SleepPerformanceChart() {
  const { data, isLoading } = useSleepData();

  const chartData = data?.map((d) => ({
    date: d.start_time,
    performance: d.sleep_performance_percentage
      ? Math.round(d.sleep_performance_percentage)
      : null,
    efficiency: d.sleep_efficiency_percentage
      ? Math.round(d.sleep_efficiency_percentage)
      : null,
  }));

  return (
    <ChartWrapper
      title="Sleep Performance & Efficiency"
      subtitle="Percentage scores"
      accent="purple"
      isLoading={isLoading}
      isEmpty={!chartData?.length}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_HEX.purple} stopOpacity={0.25} />
              <stop offset="100%" stopColor={CHART_HEX.purple} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_HEX.teal} stopOpacity={0.25} />
              <stop offset="100%" stopColor={CHART_HEX.teal} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...gridProps} />
          <ReferenceArea y1={85} y2={100} fill={CHART_HEX.green} fillOpacity={0.03} />
          <ReferenceArea y1={70} y2={85} fill={CHART_HEX.amber} fillOpacity={0.03} />
          <ReferenceArea y1={0} y2={70} fill={CHART_HEX.red} fillOpacity={0.03} />
          <XAxis
            dataKey="date"
            {...axisProps}
            tickFormatter={(v) => formatDate(v)}
          />
          <YAxis domain={[0, 100]} {...axisProps} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            {...tooltipStyle}
            labelFormatter={(v) => formatDate(v, "MMM d, yyyy")}
            formatter={(value: unknown, name: unknown) => [
              `${value}%`,
              name === "performance" ? "Performance" : "Efficiency",
            ]}
          />
          <Area
            type="monotone"
            dataKey="performance"
            stroke={CHART_HEX.purple}
            fill="url(#perfGrad)"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
          <Area
            type="monotone"
            dataKey="efficiency"
            stroke={CHART_HEX.teal}
            fill="url(#effGrad)"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
