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
} from "recharts";
import { axisProps, gridProps, tooltipStyle, sleepStageColors } from "@/lib/utils/chart-theme";
import { formatDate, msToHours } from "@/lib/utils/formatters";

export function SleepStagesChart() {
  const { data, isLoading } = useSleepData();

  const chartData = data?.map((d) => ({
    date: d.start_time,
    rem: d.total_rem_sleep_time_milli ? msToHours(d.total_rem_sleep_time_milli) : 0,
    deep: d.total_slow_wave_sleep_time_milli ? msToHours(d.total_slow_wave_sleep_time_milli) : 0,
    light: d.total_light_sleep_time_milli ? msToHours(d.total_light_sleep_time_milli) : 0,
    awake: d.total_awake_time_milli ? msToHours(d.total_awake_time_milli) : 0,
  }));

  return (
    <ChartWrapper
      title="Sleep Stages"
      subtitle="Hours breakdown by stage"
      accent="purple"
      isLoading={isLoading}
      isEmpty={!chartData?.length}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
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
            formatter={(value: unknown, name: unknown) => [
              `${value}h`,
              String(name).charAt(0).toUpperCase() + String(name).slice(1),
            ]}
          />
          <Area
            type="monotone"
            dataKey="deep"
            stackId="1"
            stroke={sleepStageColors.deep}
            fill={sleepStageColors.deep}
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="rem"
            stackId="1"
            stroke={sleepStageColors.rem}
            fill={sleepStageColors.rem}
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="light"
            stackId="1"
            stroke={sleepStageColors.light}
            fill={sleepStageColors.light}
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="awake"
            stackId="1"
            stroke={sleepStageColors.awake}
            fill={sleepStageColors.awake}
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
