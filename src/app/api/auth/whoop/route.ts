import { createClient } from "@/lib/supabase/server";
import { WHOOP_AUTH_URL, WHOOP_SCOPES } from "@/lib/utils/constants";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = crypto.randomBytes(32).toString("hex");

  // Store state in a cookie for CSRF validation
  const params = new URLSearchParams({
    client_id: process.env.WHOOP_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/whoop/callback`,
    response_type: "code",
    scope: WHOOP_SCOPES.join(" "),
    state,
  });

  const response = NextResponse.redirect(`${WHOOP_AUTH_URL}?${params.toString()}`);
  response.cookies.set("whoop_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}
