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
  ReferenceArea,
} from "recharts";
import { axisProps, gridProps, tooltipStyle } from "@/lib/utils/chart-theme";
import { CHART_HEX } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/formatters";

function getRecoveryColor(score: number) {
  if (score >= 67) return CHART_HEX.green;
  if (score >= 34) return CHART_HEX.amber;
  return CHART_HEX.red;
}

function RecoveryDot(props: Record<string, unknown>) {
  const { cx, cy, payload } = props as { cx: number; cy: number; payload: { score: number | null } };
  if (!payload?.score) return null;
  return (
    <circle cx={cx} cy={cy} r={3} fill={getRecoveryColor(payload.score)} strokeWidth={0} />
  );
}

export function RecoveryChart() {
  const { data, isLoading } = useRecoveryData();

  const chartData = data?.map((d) => ({
    date: d.created_at,
    score: d.recovery_score,
  }));

  return (
    <ChartWrapper
      title="Recovery Score"
      subtitle="Daily recovery percentage"
      accent="teal"
      isLoading={isLoading}
      isEmpty={!chartData?.length}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid {...gridProps} />
          <ReferenceArea y1={67} y2={100} fill={CHART_HEX.green} fillOpacity={0.04} />
          <ReferenceArea y1={34} y2={67} fill={CHART_HEX.amber} fillOpacity={0.04} />
          <ReferenceArea y1={0} y2={34} fill={CHART_HEX.red} fillOpacity={0.04} />
          <XAxis
            dataKey="date"
            {...axisProps}
            tickFormatter={(v) => formatDate(v)}
          />
          <YAxis domain={[0, 100]} {...axisProps} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            {...tooltipStyle}
            labelFormatter={(v) => formatDate(v, "MMM d, yyyy")}
            formatter={(value: unknown) => [`${Math.round(Number(value))}%`, "Recovery"]}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke={CHART_HEX.teal}
            strokeWidth={2}
            dot={<RecoveryDot />}
            activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card-bg)" }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
