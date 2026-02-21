import { createClient } from "@/lib/supabase/server";
import { WITHINGS_AUTH_URL, WITHINGS_SCOPES } from "@/lib/utils/constants";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = crypto.randomBytes(32).toString("hex");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.WITHINGS_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/withings/callback`,
    scope: WITHINGS_SCOPES,
    state,
  });

  const response = NextResponse.redirect(`${WITHINGS_AUTH_URL}?${params.toString()}`);
  response.cookies.set("withings_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}
