import { createClient } from "@/lib/supabase/server";
import { storeTokens } from "@/lib/api/token-manager";
import { WHOOP_TOKEN_URL } from "@/lib/utils/constants";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get("whoop_oauth_state")?.value;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  // Validate state
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

  // Exchange code for tokens
  const tokenRes = await fetch(WHOOP_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${appUrl}/api/auth/whoop/callback`,
      client_id: process.env.WHOOP_CLIENT_ID!,
      client_secret: process.env.WHOOP_CLIENT_SECRET!,
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    console.error("Whoop token exchange failed:", errText);
    return NextResponse.redirect(`${appUrl}/dashboard/connect?error=token_exchange_failed`);
  }

  const tokenData = await tokenRes.json();

  await storeTokens(supabase, user.id, "whoop", {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: new Date(Date.now() + tokenData.expires_in * 1000),
  });

  // Clear the state cookie
  const response = NextResponse.redirect(`${appUrl}/dashboard/connect?success=whoop`);
  response.cookies.delete("whoop_oauth_state");
  return response;
}
