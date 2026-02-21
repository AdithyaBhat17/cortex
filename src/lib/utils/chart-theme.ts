import { CHART_HEX } from "./constants";

export const axisProps = {
  tick: { fontSize: 10, fill: "var(--chart-text)", fontFamily: "var(--font-body), Plus Jakarta Sans, system-ui" },
  axisLine: { stroke: "var(--chart-grid)" },
  tickLine: false,
} as const;

export const gridProps = {
  stroke: "var(--chart-grid)",
  strokeDasharray: "3 3",
  vertical: false,
} as const;

export const tooltipStyle = {
  contentStyle: {
    backgroundColor: "var(--chart-tooltip-bg)",
    borderColor: "var(--chart-tooltip-border)",
    borderRadius: "8px",
    fontSize: 12,
    fontFamily: "var(--font-body), Plus Jakarta Sans, system-ui",
  },
  labelStyle: {
    fontWeight: 600,
    marginBottom: 4,
  },
  itemStyle: {
    fontSize: 12,
    fontWeight: 500,
  },
} as const;

export const sleepStageColors = {
  rem: CHART_HEX.purple,
  deep: CHART_HEX.blue,
  light: CHART_HEX.teal,
  awake: CHART_HEX.red,
} as const;

export const bodyCompColors = {
  fat: CHART_HEX.red,
  muscle: CHART_HEX.teal,
  bone: CHART_HEX.blue,
} as const;
