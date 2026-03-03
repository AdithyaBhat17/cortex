import { createClient } from "@/lib/supabase/server";
import { syncWithings } from "@/lib/sync/withings-sync";
import { NextRequest, NextResponse } from "next/server";

const STALE_THRESHOLD_MS = 18 * 60 * 60 * 1000; // 18 hours

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  try {
    // Trigger a sync if the last successful one is older than the threshold
    const { data: lastSync } = await supabase
      .from("sync_log")
      .select("completed_at")
      .eq("user_id", user.id)
      .eq("provider", "withings")
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .single();

    const lastSyncTime = lastSync?.completed_at
      ? new Date(lastSync.completed_at).getTime()
      : 0;

    if (Date.now() - lastSyncTime > STALE_THRESHOLD_MS) {
      await syncWithings(supabase, user.id);
    }

    const { data, error } = await supabase
      .from("withings_measurements")
      .select("*")
      .eq("user_id", user.id)
      .gte("measured_at", start)
      .lte("measured_at", end)
      .order("measured_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("Withings data fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
