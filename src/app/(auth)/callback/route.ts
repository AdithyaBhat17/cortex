import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function sanitizeRedirectPath(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return "/dashboard";
  }
  return path;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeRedirectPath(searchParams.get("next") ?? "/dashboard");

  if (code) {
    const redirectUrl = `${origin}${next}`;
    let response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.redirect(redirectUrl);
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }
    console.error("Auth code exchange failed:", error.message);
  }

  return NextResponse.redirect(`${origin}/login?error=Could+not+authenticate`);
}
