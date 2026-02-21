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
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  try {
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
