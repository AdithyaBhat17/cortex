"use client";

import { ChartWrapper } from "./chart-wrapper";
import { useSleepData } from "@/lib/hooks/use-whoop-data";
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
import { formatDate, msToHours } from "@/lib/utils/formatters";

function getSleepColor(hours: number) {
  if (hours >= 7) return CHART_HEX.green;
  if (hours >= 5.5) return CHART_HEX.amber;
  return CHART_HEX.red;
}

export function SleepDurationChart() {
  const { data, isLoading } = useSleepData();

  const chartData = data?.map((d) => ({
    date: d.start_time,
    hours: d.total_in_bed_time_milli
      ? msToHours(d.total_in_bed_time_milli - (d.total_awake_time_milli ?? 0))
      : 0,
  }));

  return (
    <ChartWrapper
      title="Sleep Duration"
      subtitle="Total sleep time in hours"
      accent="purple"
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
          <YAxis {...axisProps} tickFormatter={(v) => `${v}h`} />
          <Tooltip
            {...tooltipStyle}
            labelFormatter={(v) => formatDate(v, "MMM d, yyyy")}
            formatter={(value: unknown) => [`${value}h`, "Sleep"]}
          />
          <Bar dataKey="hours" radius={[4, 4, 0, 0]} fillOpacity={0.85}>
            {chartData?.map((entry, i) => (
              <Cell key={i} fill={getSleepColor(entry.hours)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
