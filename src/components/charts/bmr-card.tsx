"use client";

import { Card } from "@/components/ui/card";
import { useWithingsData } from "@/lib/hooks/use-withings-data";
import { useProfile } from "@/lib/hooks/use-profile";
import { calculateBmr, getAgeFromDob } from "@/lib/utils/bmr";
import { useMemo } from "react";
import Link from "next/link";

export function BmrCard() {
  const { data, isLoading: wl } = useWithingsData();
  const { data: profile, isLoading: pl } = useProfile();

  const bmr = useMemo(() => {
    if (!data?.length || !profile) return null;

    // Check for stored BMR from sync
    const storedBmr = data.filter((d) => d.bmr_kcal != null).at(-1)?.bmr_kcal;
    if (storedBmr) return storedBmr;

    // Calculate from latest weight + profile
    const latestWeight = data.filter((d) => d.weight_kg != null).at(-1)?.weight_kg;
    if (!latestWeight || !profile.height_cm || !profile.date_of_birth || !profile.gender) {
      return null;
    }

    const age = getAgeFromDob(profile.date_of_birth);
    return calculateBmr(latestWeight, profile.height_cm, age, profile.gender);
  }, [data, profile]);

  if (wl || pl) {
    return (
      <Card className="flex h-full flex-col justify-center animate-pulse">
        <div className="h-2.5 w-20 rounded bg-muted" />
        <div className="mt-3 h-10 w-20 rounded bg-muted" />
      </Card>
    );
  }

  if (!bmr) {
    return (
      <Card className="flex h-full flex-col justify-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Basal Metabolic Rate
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Missing profile data.
          <br />
          <Link
            href="/dashboard/profile"
            className="text-xs text-accent hover:underline"
          >
            Add height, DOB &amp; gender to calculate BMR.
          </Link>
        </p>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        Basal Metabolic Rate
      </p>
      <div className="mt-3 flex items-baseline gap-2.5">
        <span className="font-heading text-4xl font-bold tabular-nums text-foreground">
          {bmr.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground">kcal/day</span>
      </div>
      <p className="mt-4 text-[10px] text-muted-foreground/60">
        Mifflin-St Jeor equation
      </p>
    </Card>
  );
}
