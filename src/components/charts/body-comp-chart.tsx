"use client";

import { ChartWrapper } from "./chart-wrapper";
import { useWithingsData } from "@/lib/hooks/use-withings-data";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { axisProps, gridProps, tooltipStyle, bodyCompColors } from "@/lib/utils/chart-theme";
import { formatDate } from "@/lib/utils/formatters";

export function BodyCompChart() {
  const { data, isLoading } = useWithingsData();

  const chartData = data
    ?.filter(
      (d) =>
        d.fat_mass_kg != null || d.muscle_mass_kg != null || d.bone_mass_kg != null
    )
    .map((d) => ({
      date: d.measured_at,
      fat: d.fat_mass_kg ? Math.round(d.fat_mass_kg * 10) / 10 : null,
      muscle: d.muscle_mass_kg ? Math.round(d.muscle_mass_kg * 10) / 10 : null,
      bone: d.bone_mass_kg ? Math.round(d.bone_mass_kg * 10) / 10 : null,
    }));

  return (
    <ChartWrapper
      title="Body Composition"
      subtitle="Fat, muscle, and bone mass (kg)"
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
          <YAxis {...axisProps} tickFormatter={(v) => `${v}kg`} />
          <Tooltip
            {...tooltipStyle}
            labelFormatter={(v) => formatDate(v, "MMM d, yyyy")}
            formatter={(value: unknown, name: unknown) => [
              `${value} kg`,
              String(name).charAt(0).toUpperCase() + String(name).slice(1) + " Mass",
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value: unknown) =>
              String(value).charAt(0).toUpperCase() + String(value).slice(1)
            }
          />
          <Line
            type="monotone"
            dataKey="fat"
            stroke={bodyCompColors.fat}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="muscle"
            stroke={bodyCompColors.muscle}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="bone"
            stroke={bodyCompColors.bone}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
