import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!type || !start || !end) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  try {
    switch (type) {
      case "recovery": {
        // Use synced_at as fallback when created_at is null
        const { data, error } = await supabase
          .from("whoop_recovery")
          .select("*")
          .eq("user_id", user.id)
          .or(`created_at.gte.${start},created_at.is.null`)
          .or(`created_at.lte.${end},created_at.is.null`)
          .order("created_at", { ascending: true, nullsFirst: false });
        if (error) throw error;
        return NextResponse.json(data ?? []);
      }
      case "sleep": {
        // Use or() to include rows where is_nap is null (not just false)
        const { data, error } = await supabase
          .from("whoop_sleep")
          .select("*")
          .eq("user_id", user.id)
          .or("is_nap.eq.false,is_nap.is.null")
          .gte("start_time", start)
          .lte("start_time", end)
          .order("start_time", { ascending: true });
        if (error) throw error;
        return NextResponse.json(data ?? []);
      }
      case "cycles": {
        const { data, error } = await supabase
          .from("whoop_cycles")
          .select("*")
          .eq("user_id", user.id)
          .gte("start_time", start)
          .lte("start_time", end)
          .order("start_time", { ascending: true });
        if (error) throw error;
        return NextResponse.json(data ?? []);
      }
      case "workouts": {
        const { data, error } = await supabase
          .from("whoop_workouts")
          .select("*")
          .eq("user_id", user.id)
          .gte("start_time", start)
          .lte("start_time", end)
          .order("start_time", { ascending: true });
        if (error) throw error;
        return NextResponse.json(data ?? []);
      }
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (err) {
    console.error("Whoop data fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
