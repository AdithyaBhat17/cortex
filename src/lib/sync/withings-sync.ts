import type { SupabaseClient } from "@supabase/supabase-js";
import { getValidToken } from "@/lib/api/token-manager";
import { fetchMeasurements } from "@/lib/api/withings";
import { calculateBmr, getAgeFromDob } from "@/lib/utils/bmr";
import { subDays } from "date-fns";

export async function syncWithings(
  supabase: SupabaseClient,
  userId: string,
  initialSync = false
): Promise<{ success: boolean; records: number; error?: string }> {
  const accessToken = await getValidToken(supabase, userId, "withings");
  if (!accessToken) {
    return { success: false, records: 0, error: "No valid token" };
  }

  const { data: logEntry } = await supabase
    .from("sync_log")
    .insert({ user_id: userId, provider: "withings", status: "started" })
    .select("id")
    .single();

  try {
    let startDate: Date;
    if (initialSync) {
      startDate = subDays(new Date(), 30);
    } else {
      const { data: lastSync } = await supabase
        .from("sync_log")
        .select("completed_at")
        .eq("user_id", userId)
        .eq("provider", "withings")
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1)
        .single();

      startDate = lastSync?.completed_at
        ? new Date(lastSync.completed_at)
        : subDays(new Date(), 30);
    }

    const endDate = new Date();
    const measurements = await fetchMeasurements(accessToken, startDate, endDate);

    if (measurements.length > 0) {
      // Get most recent height for BMI calculation
      const { data: heightRow } = await supabase
        .from("withings_measurements")
        .select("height_m")
        .eq("user_id", userId)
        .not("height_m", "is", null)
        .order("measured_at", { ascending: false })
        .limit(1)
        .single();

      let latestHeight = heightRow?.height_m ?? null;

      // Fetch user profile for height fallback + BMR calculation
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("height_cm, date_of_birth, gender")
        .eq("user_id", userId)
        .single();

      const profileHeightM = profile?.height_cm ? profile.height_cm / 100 : null;
      const profileAge =
        profile?.date_of_birth ? getAgeFromDob(profile.date_of_birth) : null;
      const profileGender = profile?.gender as "male" | "female" | null;

      const rows = measurements.map((m) => {
        // Use height from this measurement if available, otherwise use latest known, then profile fallback
        const height = m.height_m ?? latestHeight ?? profileHeightM;
        if (m.height_m) latestHeight = m.height_m;

        const bmi = m.weight_kg && height ? m.weight_kg / (height * height) : null;

        // Calculate BMR when we have weight + profile data
        let bmrKcal: number | null = null;
        const heightCm = height ? height * 100 : profile?.height_cm ?? null;
        if (m.weight_kg && heightCm && profileAge && profileGender) {
          bmrKcal = calculateBmr(m.weight_kg, heightCm, profileAge, profileGender);
        }

        return {
          user_id: userId,
          withings_grpid: m.grpid,
          measured_at: m.measured_at.toISOString(),
          category: m.category,
          weight_kg: m.weight_kg,
          height_m: m.height_m,
          fat_free_mass_kg: m.fat_free_mass_kg,
          fat_ratio_pct: m.fat_ratio_pct,
          fat_mass_kg: m.fat_mass_kg,
          muscle_mass_kg: m.muscle_mass_kg,
          hydration_kg: m.hydration_kg,
          bone_mass_kg: m.bone_mass_kg,
          bmi: bmi ? Math.round(bmi * 10) / 10 : null,
          vo2max: m.vo2max,
          visceral_fat: m.visceral_fat,
          bmr_kcal: bmrKcal,
          raw_json: m.raw_json,
        };
      });

      await supabase.from("withings_measurements").upsert(rows, {
        onConflict: "user_id,withings_grpid",
      });

      if (logEntry) {
        await supabase
          .from("sync_log")
          .update({
            status: "completed",
            records_synced: rows.length,
            completed_at: new Date().toISOString(),
          })
          .eq("id", logEntry.id);
      }

      return { success: true, records: rows.length };
    }

    if (logEntry) {
      await supabase
        .from("sync_log")
        .update({ status: "completed", records_synced: 0, completed_at: new Date().toISOString() })
        .eq("id", logEntry.id);
    }

    return { success: true, records: 0 };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (logEntry) {
      await supabase
        .from("sync_log")
        .update({ status: "failed", error_message: message, completed_at: new Date().toISOString() })
        .eq("id", logEntry.id);
    }
    return { success: false, records: 0, error: message };
  }
}
