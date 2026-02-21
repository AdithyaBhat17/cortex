import { createClient } from "@/lib/supabase/server";
import { syncWithings } from "@/lib/sync/withings-sync";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncWithings(supabase, user.id);
  return NextResponse.json(result);
}
