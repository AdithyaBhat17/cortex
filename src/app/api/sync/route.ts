import { createClient } from "@/lib/supabase/server";
import { syncWhoop } from "@/lib/sync/whoop-sync";
import { syncWithings } from "@/lib/sync/withings-sync";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const initial = searchParams.get("initial") === "true";

  // Check which providers are connected
  const { data: tokens } = await supabase
    .from("oauth_tokens")
    .select("provider")
    .eq("user_id", user.id);

  const providers = new Set(tokens?.map((t) => t.provider) ?? []);

  // Sync connected providers in parallel
  const syncTasks: Promise<[string, unknown]>[] = [];
  if (providers.has("whoop")) {
    syncTasks.push(syncWhoop(supabase, user.id, initial).then((r) => ["whoop", r]));
  }
  if (providers.has("withings")) {
    syncTasks.push(syncWithings(supabase, user.id, initial).then((r) => ["withings", r]));
  }

  const entries = await Promise.all(syncTasks);
  const results = Object.fromEntries(entries);

  return NextResponse.json(results);
}
