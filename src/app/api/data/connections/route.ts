import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from("oauth_tokens")
      .select("provider, created_at, updated_at")
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({
      whoop: data?.find((t) => t.provider === "whoop") ?? null,
      withings: data?.find((t) => t.provider === "withings") ?? null,
    });
  } catch (err) {
    console.error("Connections fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch connections" }, { status: 500 });
  }
}
