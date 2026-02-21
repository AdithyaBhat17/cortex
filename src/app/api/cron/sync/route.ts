import { createServerClient } from "@supabase/ssr";
import { syncWhoop } from "@/lib/sync/whoop-sync";
import { syncWithings } from "@/lib/sync/withings-sync";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use service role client for cron (bypasses RLS)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  // Get all users with connected providers
  const { data: tokens } = await supabase
    .from("oauth_tokens")
    .select("user_id, provider");

  if (!tokens || tokens.length === 0) {
    return NextResponse.json({ message: "No connected users" });
  }

  // Group by user
  const userProviders = new Map<string, string[]>();
  for (const t of tokens) {
    const existing = userProviders.get(t.user_id) ?? [];
    existing.push(t.provider);
    userProviders.set(t.user_id, existing);
  }

  // Sync all users in parallel
  const syncPromises = Array.from(userProviders.entries()).map(
    async ([userId, providers]) => {
      const userResult: Record<string, unknown> = {};
      const providerPromises = providers.map(async (provider) => {
        if (provider === "whoop") {
          userResult.whoop = await syncWhoop(supabase, userId);
        } else if (provider === "withings") {
          userResult.withings = await syncWithings(supabase, userId);
        }
      });
      await Promise.all(providerPromises);
      return [userId, userResult] as const;
    }
  );

  const entries = await Promise.all(syncPromises);
  const results = Object.fromEntries(entries);

  return NextResponse.json({ synced: userProviders.size, results });
}
