"use client";

import { Card } from "@/components/ui/card";
import { useWithingsData } from "@/lib/hooks/use-withings-data";
import { useMemo } from "react";

const BMI_MIN = 15;
const BMI_MAX = 40;
const BMI_RANGE = BMI_MAX - BMI_MIN;

const zones = [
  { max: 18.5, color: "#14b8a6", label: "Underweight" },
  { max: 25, color: "#4ade80", label: "Normal" },
  { max: 30, color: "#fbbf24", label: "Overweight" },
  { max: 40, color: "#f87171", label: "Obese" },
] as const;

function getBmiCategory(bmi: number) {
  for (const zone of zones) {
    if (bmi < zone.max) return { label: zone.label, color: zone.color };
  }
  return { label: zones[zones.length - 1].label, color: zones[zones.length - 1].color };
}

function BmiGauge({ bmi }: { bmi: number }) {
  const position = Math.max(0, Math.min(100, ((bmi - BMI_MIN) / BMI_RANGE) * 100));
  const category = getBmiCategory(bmi);

  return (
    <div
      className="mt-6"
      role="img"
      aria-label={`BMI gauge showing ${bmi.toFixed(1)}, categorized as ${category.label}`}
    >
      <div className="relative h-2.5 w-full overflow-hidden rounded-full">
        <div className="absolute inset-0 flex">
          {zones.map((zone, i) => {
            const prevMax = i === 0 ? BMI_MIN : zones[i - 1].max;
            const w = ((zone.max - prevMax) / BMI_RANGE) * 100;
            return (
              <div
                key={zone.label}
                style={{ width: `${w}%`, backgroundColor: zone.color, opacity: 0.6 }}
              />
            );
          })}
        </div>
      </div>
      <div className="relative h-0">
        <div
          className="absolute -top-[14px] h-3.5 w-3.5 rounded-full border-2 border-background shadow-sm"
          style={{
            left: `${position}%`,
            transform: "translateX(-50%)",
            backgroundColor: category.color,
            boxShadow: `0 0 8px ${category.color}60`,
          }}
        />
      </div>
      <div className="mt-4 flex justify-between text-[9px] uppercase tracking-wider text-muted-foreground/60">
        <span>15</span>
        <span>25</span>
        <span>40</span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-1.5">
        {zones.map((zone) => {
          const isActive = bmi < zone.max && (zones.indexOf(zone) === 0 || bmi >= zones[zones.indexOf(zone) - 1].max);
          return (
            <div
              key={zone.label}
              className="flex flex-col items-center gap-1 rounded-md px-1 py-1.5"
              style={{
                backgroundColor: isActive ? `${zone.color}15` : "transparent",
                borderWidth: 1,
                borderColor: isActive ? `${zone.color}30` : "transparent",
              }}
            >
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: zone.color, opacity: isActive ? 1 : 0.4 }}
              />
              <span
                className="text-[8px] font-medium uppercase tracking-wider"
                style={{ color: isActive ? zone.color : "var(--muted-foreground)", opacity: isActive ? 1 : 0.5 }}
              >
                {zone.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BmiCard() {
  const { data, isLoading } = useWithingsData();

  const { bmi, source } = useMemo(() => {
    if (!data?.length) return { bmi: null, source: "" };

    const directBmi = data.filter((d) => d.bmi != null).at(-1)?.bmi;
    if (directBmi) return { bmi: directBmi, source: "measured" };

    const latestWeight = data.filter((d) => d.weight_kg != null).at(-1)?.weight_kg;
    const latestHeight = data.filter((d) => d.height_m != null).at(-1)?.height_m;

    if (latestWeight && latestHeight) {
      const calculated = latestWeight / (latestHeight * latestHeight);
      return { bmi: Math.round(calculated * 10) / 10, source: "calculated" };
    }

    return { bmi: null, source: "" };
  }, [data]);

  if (isLoading) {
    return (
      <Card className="flex h-full flex-col justify-center animate-pulse">
        <div className="h-2.5 w-14 rounded bg-muted" />
        <div className="mt-3 h-10 w-16 rounded bg-muted" />
        <div className="mt-3 h-2.5 w-full rounded bg-muted" />
      </Card>
    );
  }

  if (!bmi) {
    return (
      <Card className="flex h-full flex-col justify-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Body Mass Index
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          No weight or height data available.
          <br />
          <span className="text-xs text-muted-foreground/60">
            Connect Withings to track BMI.
          </span>
        </p>
      </Card>
    );
  }

  const category = getBmiCategory(bmi);

  return (
    <Card className="flex h-full flex-col">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        Body Mass Index
        {source === "calculated" && (
          <span className="ml-1.5 text-[9px] normal-case text-muted-foreground/50">
            (calculated)
          </span>
        )}
      </p>
      <div className="mt-3 flex items-baseline gap-2.5">
        <span className="font-heading text-4xl font-bold tabular-nums text-foreground">
          {bmi.toFixed(1)}
        </span>
        <span
          className="rounded-md px-2.5 py-1 text-[10px] font-semibold"
          style={{ backgroundColor: `${category.color}20`, color: category.color }}
        >
          {category.label}
        </span>
      </div>

      <BmiGauge bmi={bmi} />
    </Card>
  );
}
