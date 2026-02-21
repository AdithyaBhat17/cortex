import type { SupabaseClient } from "@supabase/supabase-js";
import { getValidToken } from "@/lib/api/token-manager";
import { fetchCycles, fetchRecovery, fetchSleep, fetchWorkouts } from "@/lib/api/whoop";
import { subDays } from "date-fns";
import { kjToKcal } from "@/lib/utils/formatters";

export async function syncWhoop(
  supabase: SupabaseClient,
  userId: string,
  initialSync = false
): Promise<{ success: boolean; records: number; error?: string }> {
  const accessToken = await getValidToken(supabase, userId, "whoop");
  if (!accessToken) {
    return { success: false, records: 0, error: "No valid token" };
  }

  // Log sync start
  const { data: logEntry } = await supabase
    .from("sync_log")
    .insert({ user_id: userId, provider: "whoop", status: "started" })
    .select("id")
    .single();

  try {
    // Determine date range
    let startDate: Date;
    if (initialSync) {
      startDate = subDays(new Date(), 30);
    } else {
      const { data: lastSync } = await supabase
        .from("sync_log")
        .select("completed_at")
        .eq("user_id", userId)
        .eq("provider", "whoop")
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1)
        .single();

      startDate = lastSync?.completed_at
        ? new Date(lastSync.completed_at)
        : subDays(new Date(), 30);
    }

    const endDate = new Date();
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    let totalRecords = 0;

    // Fetch all data types in parallel to eliminate waterfall
    const [cycles, recovery, sleepRecords, workouts] = await Promise.all([
      fetchCycles(accessToken, startISO, endISO),
      fetchRecovery(accessToken, startISO, endISO),
      fetchSleep(accessToken, startISO, endISO),
      fetchWorkouts(accessToken, startISO, endISO),
    ]);

    // Upsert cycles
    if (cycles.length > 0) {
      const rows = cycles.map((c) => ({
        user_id: userId,
        whoop_cycle_id: c.id,
        start_time: c.start,
        end_time: c.end,
        timezone_offset: c.timezone_offset,
        score_state: c.score_state,
        strain: c.score?.strain ?? null,
        kilojoule: c.score?.kilojoule ?? null,
        average_heart_rate: c.score?.average_heart_rate ?? null,
        max_heart_rate: c.score?.max_heart_rate ?? null,
        calories_kcal: c.score?.kilojoule ? kjToKcal(c.score.kilojoule) : null,
        raw_json: c,
      }));

      const { error } = await supabase.from("whoop_cycles").upsert(rows, {
        onConflict: "user_id,whoop_cycle_id",
      });
      if (error) console.error("Cycles upsert error:", error);
      else totalRecords += rows.length;
    }

    // Upsert recovery
    if (recovery.length > 0) {
      const rows = recovery.map((r) => ({
        user_id: userId,
        whoop_cycle_id: r.cycle_id,
        whoop_sleep_id: r.sleep_id,
        score_state: r.score_state,
        recovery_score: r.score?.recovery_score ?? null,
        resting_heart_rate: r.score?.resting_heart_rate ?? null,
        hrv_rmssd_milli: r.score?.hrv_rmssd_milli ?? null,
        spo2_percentage: r.score?.spo2_percentage ?? null,
        skin_temp_celsius: r.score?.skin_temp_celsius ?? null,
        user_calibrating: r.score?.user_calibrating ?? false,
        created_at: r.created_at || new Date().toISOString(),
        raw_json: r,
      }));

      const { error } = await supabase.from("whoop_recovery").upsert(rows, {
        onConflict: "user_id,whoop_cycle_id",
      });
      if (error) console.error("Recovery upsert error:", error);
      else totalRecords += rows.length;
    }

    // Upsert sleep
    if (sleepRecords.length > 0) {
      const rows = sleepRecords.map((s) => ({
        user_id: userId,
        whoop_sleep_id: s.id,
        start_time: s.start,
        end_time: s.end,
        is_nap: s.nap ?? false,
        score_state: s.score_state,
        total_in_bed_time_milli: s.score?.stage_summary.total_in_bed_time_milli ?? null,
        total_awake_time_milli: s.score?.stage_summary.total_awake_time_milli ?? null,
        total_light_sleep_time_milli: s.score?.stage_summary.total_light_sleep_time_milli ?? null,
        total_slow_wave_sleep_time_milli: s.score?.stage_summary.total_slow_wave_sleep_time_milli ?? null,
        total_rem_sleep_time_milli: s.score?.stage_summary.total_rem_sleep_time_milli ?? null,
        sleep_cycle_count: s.score?.stage_summary.sleep_cycle_count ?? null,
        disturbance_count: s.score?.stage_summary.disturbance_count ?? null,
        respiratory_rate: s.score?.respiratory_rate ?? null,
        sleep_performance_percentage: s.score?.sleep_performance_percentage ?? null,
        sleep_consistency_percentage: s.score?.sleep_consistency_percentage ?? null,
        sleep_efficiency_percentage: s.score?.sleep_efficiency_percentage ?? null,
        raw_json: s,
      }));

      const { error } = await supabase.from("whoop_sleep").upsert(rows, {
        onConflict: "user_id,whoop_sleep_id",
      });
      if (error) console.error("Sleep upsert error:", error);
      else totalRecords += rows.length;
    }

    // Upsert workouts
    if (workouts.length > 0) {
      const rows = workouts.map((w) => ({
        user_id: userId,
        whoop_workout_id: w.id,
        start_time: w.start,
        end_time: w.end,
        sport_id: w.sport_id,
        score_state: w.score_state,
        strain: w.score?.strain ?? null,
        average_heart_rate: w.score?.average_heart_rate ?? null,
        max_heart_rate: w.score?.max_heart_rate ?? null,
        kilojoule: w.score?.kilojoule ?? null,
        calories_kcal: w.score?.kilojoule ? kjToKcal(w.score.kilojoule) : null,
        raw_json: w,
      }));

      const { error } = await supabase.from("whoop_workouts").upsert(rows, {
        onConflict: "user_id,whoop_workout_id",
      });
      if (error) console.error("Workouts upsert error:", error);
      else totalRecords += rows.length;
    }

    // Log success
    if (logEntry) {
      await supabase
        .from("sync_log")
        .update({
          status: "completed",
          records_synced: totalRecords,
          completed_at: new Date().toISOString(),
        })
        .eq("id", logEntry.id);
    }

    return { success: true, records: totalRecords };
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
