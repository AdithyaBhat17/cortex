# Components Guide

## Component Hierarchy

```
RootLayout
+-- Providers (QueryClient + Theme)
    +-- DashboardLayout
    |   +-- Header
    |   |   +-- CortexLogo
    |   |   +-- Nav (desktop)
    |   |   +-- DateRangePicker
    |   |   +-- Sync Button
    |   |   +-- ThemeToggle
    |   |   +-- Logout Button
    |   |   +-- Mobile Bottom Nav
    |   |
    |   +-- DashboardPage
    |   |   +-- SummaryStrip
    |   |   |   +-- SummaryMetricCard (x7)
    |   |   |       +-- Sparkline (SVG)
    |   |   |
    |   |   +-- Section: Recovery & Vitals
    |   |   |   +-- RecoveryChart
    |   |   |   +-- HrvChart
    |   |   |   +-- RestingHrChart
    |   |   |
    |   |   +-- Section: Sleep
    |   |   |   +-- SleepPerformanceChart
    |   |   |   +-- SleepStagesChart
    |   |   |   +-- SleepDurationChart
    |   |   |
    |   |   +-- Section: Activity & Strain
    |   |   |   +-- StrainChart
    |   |   |   +-- CaloriesChart
    |   |   |   +-- Spo2Chart
    |   |   |
    |   |   +-- Section: Workouts
    |   |   |   +-- WorkoutChart
    |   |   |   +-- WorkoutHrChart
    |   |   |
    |   |   +-- Section: Body & Metabolism
    |   |       +-- WeightChart
    |   |       +-- SkinTempChart
    |   |       +-- RespiratoryChart
    |   |       +-- BodyCompChart
    |   |       +-- BmiCard
    |   |
    |   +-- ConnectPage
    |       +-- Provider Cards (WHOOP, Withings)
    |
    +-- LoginPage
        +-- CortexLogo
        +-- Google Sign-in Button
```

## UI Primitives

### `Card`

Base card component used by all panels.

```tsx
<Card className="optional-classes">
  {children}
</Card>
```

Renders a `div` with `.card-panel` styles (background, border, border-radius, hover effect).

### `Skeleton`

Loading placeholder with pulse animation.

```tsx
<Skeleton className="h-8 w-32" />
```

### `ChartWrapper`

Standard wrapper for all chart components. Handles title, loading state, and empty state.

```tsx
<ChartWrapper
  title="Recovery Score"
  subtitle="Daily recovery percentage"
  isLoading={isLoading}
  isEmpty={!data?.length}
  height={280}
>
  <ResponsiveContainer>
    <LineChart data={data}>...</LineChart>
  </ResponsiveContainer>
</ChartWrapper>
```

### `DateRangePicker`

Date range selector with preset buttons (7D, 14D, 30D, 90D, 6M, ALL) and a custom range popover.

### `ThemeToggle`

Toggles between dark and light mode. Persists to `localStorage`.

### `CortexLogo`

SVG hexagonal logo with optional text. Supports `sm`, `md`, `lg` sizes.

## Chart Components

All charts follow the same pattern:

```tsx
export function SomeChart() {
  const { data, isLoading } = useSomeData();      // React Query hook

  const chartData = data?.map(transform);          // Transform for Recharts

  return (
    <ChartWrapper title="..." isLoading={isLoading} isEmpty={!chartData?.length}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>               // Or BarChart, AreaChart
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="date" {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip {...tooltipStyle} />
          <Line dataKey="value" stroke={CHART_HEX.teal} />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
```

### Chart List

| Chart | Data Source | Type | Metrics |
|-------|-----------|------|---------|
| `RecoveryChart` | WHOOP recovery | Line | Recovery score (0-100%) |
| `HrvChart` | WHOOP recovery | Line | HRV RMSSD (ms) |
| `RestingHrChart` | WHOOP recovery | Line | Resting heart rate (bpm) |
| `SleepPerformanceChart` | WHOOP sleep | Area | Performance & efficiency (%) |
| `SleepStagesChart` | WHOOP sleep | Stacked Area | REM, deep, light, awake (hours) |
| `SleepDurationChart` | WHOOP sleep | Bar | Total sleep time (hours) |
| `StrainChart` | WHOOP cycles | Line | Day strain (0-21) |
| `CaloriesChart` | WHOOP cycles | Bar | Calories burned (kcal) |
| `Spo2Chart` | WHOOP recovery | Line | Blood oxygen (%) |
| `SkinTempChart` | WHOOP recovery | Line | Skin temperature (C) |
| `RespiratoryChart` | WHOOP sleep | Line | Respiratory rate (rpm) |
| `WeightChart` | Withings | Line | Body weight (kg) |
| `BodyCompChart` | Withings | Multi-Line | Fat, muscle, bone mass (kg) |
| `WorkoutChart` | WHOOP workouts | Bar | Workout strain |
| `WorkoutHrChart` | WHOOP workouts | Multi-Line | Avg & max HR (bpm) |
| `BmiCard` | Withings | Gauge | BMI with category zones |

## Shared Chart Theme

All charts use shared styling from `lib/utils/chart-theme.ts`:

- `axisProps` -- Font size, color, tick style
- `gridProps` -- Dashed grid lines, horizontal only
- `tooltipStyle` -- Card-like tooltip with dark mode support
- `CHART_HEX` -- Color palette (teal, orange, purple, blue, red, amber, green)

## Data Hooks

| Hook | Endpoint | Returns |
|------|----------|---------|
| `useRecoveryData()` | `/api/data/whoop?type=recovery` | `DbWhoopRecovery[]` |
| `useSleepData()` | `/api/data/whoop?type=sleep` | `DbWhoopSleep[]` |
| `useCycleData()` | `/api/data/whoop?type=cycles` | `DbWhoopCycle[]` |
| `useWorkoutData()` | `/api/data/whoop?type=workouts` | `DbWhoopWorkout[]` |
| `useWithingsData()` | `/api/data/withings` | `DbWithingsMeasurement[]` |
| `useConnections()` | `/api/data/connections` | `ConnectionsResponse` |
| `useSync()` | `POST /api/sync` | Mutation with cooldown |
| `useDateRange()` | (Zustand store) | Date range state |

All data hooks automatically use the active date range from the `useDateRange` Zustand store and include it in the React Query cache key.
