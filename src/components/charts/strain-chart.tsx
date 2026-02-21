"use client";

import { ChartWrapper } from "./chart-wrapper";
import { useCycleData } from "@/lib/hooks/use-whoop-data";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
} from "recharts";
import { axisProps, gridProps, tooltipStyle } from "@/lib/utils/chart-theme";
import { CHART_HEX } from "@/lib/utils/constants";
import { formatDate, formatNumber } from "@/lib/utils/formatters";

function getStrainColor(strain: number) {
  if (strain >= 14) return CHART_HEX.red;
  if (strain >= 7) return CHART_HEX.amber;
  return CHART_HEX.green;
}

function StrainDot(props: Record<string, unknown>) {
  const { cx, cy, payload } = props as { cx: number; cy: number; payload: { strain: number | null } };
  if (!payload?.strain) return null;
  return (
    <circle cx={cx} cy={cy} r={3} fill={getStrainColor(payload.strain)} strokeWidth={0} />
  );
}

export function StrainChart() {
  const { data, isLoading } = useCycleData();

  const chartData = data?.map((d) => ({
    date: d.start_time,
    strain: d.strain ? Number(formatNumber(d.strain)) : null,
  }));

  return (
    <ChartWrapper
      title="Daily Strain"
      subtitle="0-21 scale"
      accent="orange"
      isLoading={isLoading}
      isEmpty={!chartData?.length}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid {...gridProps} />
          <ReferenceArea y1={0} y2={7} fill={CHART_HEX.green} fillOpacity={0.03} />
          <ReferenceArea y1={7} y2={14} fill={CHART_HEX.amber} fillOpacity={0.03} />
          <ReferenceArea y1={14} y2={21} fill={CHART_HEX.red} fillOpacity={0.03} />
          <XAxis
            dataKey="date"
            {...axisProps}
            tickFormatter={(v) => formatDate(v)}
          />
          <YAxis domain={[0, 21]} {...axisProps} />
          <Tooltip
            {...tooltipStyle}
            labelFormatter={(v) => formatDate(v, "MMM d, yyyy")}
            formatter={(value: unknown) => [Number(value).toFixed(1), "Strain"]}
          />
          <Line
            type="monotone"
            dataKey="strain"
            stroke={CHART_HEX.orange}
            strokeWidth={2}
            dot={<StrainDot />}
            activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card-bg)" }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
