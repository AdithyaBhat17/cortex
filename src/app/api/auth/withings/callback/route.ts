import { createClient } from "@/lib/supabase/server";
import { storeTokens } from "@/lib/api/token-manager";
import { WITHINGS_TOKEN_URL } from "@/lib/utils/constants";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get("withings_oauth_state")?.value;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${appUrl}/dashboard/connect?error=invalid_state`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/dashboard/connect?error=no_code`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  // Withings code is only valid for 30 seconds - exchange immediately
  const tokenRes = await fetch(WITHINGS_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      action: "requesttoken",
      grant_type: "authorization_code",
      client_id: process.env.WITHINGS_CLIENT_ID!,
      client_secret: process.env.WITHINGS_CLIENT_SECRET!,
      code,
      redirect_uri: `${appUrl}/api/auth/withings/callback`,
    }),
  });

  if (!tokenRes.ok) {
    console.error("Withings token exchange failed:", await tokenRes.text());
    return NextResponse.redirect(`${appUrl}/dashboard/connect?error=token_exchange_failed`);
  }

  const data = await tokenRes.json();

  if (data.status !== 0) {
    console.error("Withings token error status:", data.status, data.error);
    return NextResponse.redirect(`${appUrl}/dashboard/connect?error=withings_error_${data.status}`);
  }

  await storeTokens(supabase, user.id, "withings", {
    access_token: data.body.access_token,
    refresh_token: data.body.refresh_token,
    expires_at: new Date(Date.now() + data.body.expires_in * 1000),
    provider_user_id: String(data.body.userid),
  });

  const response = NextResponse.redirect(`${appUrl}/dashboard/connect?success=withings`);
  response.cookies.delete("withings_oauth_state");
  return response;
}
