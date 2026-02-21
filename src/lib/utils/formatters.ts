import { format, parseISO } from "date-fns";

export function formatDate(date: string | Date, pattern = "MMM d") {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern);
}

export function formatDateFull(date: string | Date) {
  return formatDate(date, "MMM d, yyyy");
}

export function msToHours(ms: number): number {
  return Math.round((ms / 3_600_000) * 10) / 10;
}

export function kjToKcal(kj: number): number {
  return Math.round(kj * 0.239006);
}

export function formatNumber(value: number, decimals = 1): string {
  return value.toFixed(decimals);
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function withingsValueToActual(value: number, unit: number): number {
  return value * Math.pow(10, unit);
}
