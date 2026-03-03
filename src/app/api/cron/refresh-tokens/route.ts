import { createServerClient } from "@supabase/ssr";
import { refreshAllTokens } from "@/lib/api/token-manager";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const results = await refreshAllTokens(supabase);

  const summary = {
    total: results.length,
    fresh: results.filter((r) => r.status === "fresh").length,
    refreshed: results.filter((r) => r.status === "refreshed").length,
    failed: results.filter((r) => r.status === "failed").length,
  };

  if (summary.failed > 0) {
    console.error(
      "[cron/refresh-tokens] Some tokens failed to refresh:",
      results.filter((r) => r.status === "failed")
    );
  }

  return NextResponse.json({ ...summary, results });
}
