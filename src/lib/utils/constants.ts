export const CHART_COLORS = {
  teal: "var(--chart-teal)",
  orange: "var(--chart-orange)",
  purple: "var(--chart-purple)",
  blue: "var(--chart-blue)",
  red: "var(--chart-red)",
  amber: "var(--chart-amber)",
  green: "var(--chart-green)",
} as const;

export const CHART_HEX = {
  teal: "#14b8a6",
  orange: "#e8933a",
  purple: "#a78bfa",
  blue: "#60a5fa",
  red: "#f87171",
  amber: "#fbbf24",
  green: "#4ade80",
} as const;

export const DATE_RANGES = [
  { label: "7D", days: 7 },
  { label: "14D", days: 14 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "6M", days: 180 },
  { label: "ALL", days: 0 },
] as const;

export const WHOOP_SCOPES = [
  "read:profile",
  "read:body_measurement",
  "read:cycles",
  "read:recovery",
  "read:sleep",
  "read:workout",
  "offline",
] as const;

export const WITHINGS_SCOPES = "user.metrics,user.activity";

export const WHOOP_API_BASE = "https://api.prod.whoop.com/developer/v2";
export const WHOOP_AUTH_URL = "https://api.prod.whoop.com/oauth/oauth2/auth";
export const WHOOP_TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";

export const WITHINGS_AUTH_URL = "https://account.withings.com/oauth2_user/authorize2";
export const WITHINGS_TOKEN_URL = "https://wbsapi.withings.net/v2/oauth2";
export const WITHINGS_API_URL = "https://wbsapi.withings.net";
