"use client";

import { Card } from "@/components/ui/card";
import { HeightInput } from "@/components/ui/height-input";
import { useProfile, useUpdateProfile } from "@/lib/hooks/use-profile";
import { useState } from "react";

function ProfileForm({
  initial,
}: {
  initial: { height_cm: number | null; dob: string; gender: "male" | "female" | "" };
}) {
  const updateProfile = useUpdateProfile();

  const [heightCm, setHeightCm] = useState<number | null>(initial.height_cm);
  const [dob, setDob] = useState(initial.dob);
  const [gender, setGender] = useState<"male" | "female" | "">(initial.gender);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    updateProfile.mutate(
      {
        height_cm: heightCm,
        date_of_birth: dob || null,
        gender: (gender as "male" | "female") || null,
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
      }
    );
  }

  const inputClass =
    "w-full rounded-md border border-card-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1";

  return (
    <>
      <Card>
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Height
        </p>
        <div className="mt-3">
          <HeightInput value={heightCm} onChange={setHeightCm} />
        </div>
      </Card>

      <Card>
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Personal Info
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground/60">
          Used for BMR calculation (Mifflin-St Jeor equation)
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="profile-dob" className="mb-1 block text-[10px] text-muted-foreground">
              Date of Birth
            </label>
            <input
              id="profile-dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="profile-gender" className="mb-1 block text-[10px] text-muted-foreground">
              Biological Sex
            </label>
            <select
              id="profile-gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as "male" | "female" | "")}
              className={inputClass}
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
      </Card>

      <button
        onClick={handleSave}
        disabled={updateProfile.isPending}
        className="w-full rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {updateProfile.isPending ? "Saving..." : saved ? "Saved!" : "Save Profile"}
      </button>

      {updateProfile.isError && (
        <p className="text-xs text-chart-red">
          {updateProfile.error.message}
        </p>
      )}
    </>
  );
}

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-6">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 py-6">
      <h1 className="font-heading text-xl font-bold text-foreground">Profile</h1>
      <ProfileForm
        initial={{
          height_cm: profile?.height_cm ?? null,
          dob: profile?.date_of_birth ?? "",
          gender: profile?.gender ?? "",
        }}
      />
    </div>
  );
}
