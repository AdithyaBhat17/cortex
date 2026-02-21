import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function sanitizeRedirectPath(path: string): string {
  // Prevent open redirect: must be a relative path starting with /
  // and must not contain protocol-relative URLs (//) or scheme
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return "/dashboard";
  }
  return path;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeRedirectPath(searchParams.get("next") ?? "/dashboard");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could+not+authenticate`);
}
