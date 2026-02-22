"use client";

import { createClient } from "@/lib/supabase/client";
import { CortexLogo } from "@/components/ui/cortex-logo";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  async function handleGoogleSignIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/callback?next=/dashboard`,
      },
    });
  }

  return (
    <main
      id="main-content"
      className="relative flex min-h-screen flex-col items-center justify-center bg-background"
    >
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" aria-hidden="true" />

      {/* Dot grid */}
      <div className="login-dots absolute inset-0 pointer-events-none" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-6">
        {/* Logo mark */}
        <div className="animate-login-reveal">
          <CortexLogo size="lg" showText={false} />
        </div>

        {/* Wordmark */}
        <h1
          className="mt-8 animate-login-reveal font-heading text-4xl font-bold tracking-[0.25em] text-foreground sm:text-5xl"
          style={{ animationDelay: "80ms" }}
        >
          CORTEX
        </h1>

        {/* Subtitle */}
        <p
          className="mt-3 animate-login-reveal text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground"
          style={{ animationDelay: "160ms" }}
        >
          Biometric Command Center
        </p>

        {/* Error message */}
        {error && (
          <p
            className="mt-6 animate-login-reveal rounded-md border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-400"
            style={{ animationDelay: "200ms" }}
            role="alert"
          >
            {error}
          </p>
        )}

        {/* Divider */}
        <div
          className="my-10 h-px w-12 animate-login-reveal bg-card-border"
          style={{ animationDelay: "240ms" }}
          aria-hidden="true"
        />

        {/* Google sign-in button */}
        <button
          onClick={handleGoogleSignIn}
          className="animate-login-reveal flex w-full max-w-[280px] items-center justify-center gap-3 rounded-md border border-card-border bg-card-bg px-5 py-3 text-sm font-medium text-foreground transition-colors duration-150 hover:border-foreground/20 hover:bg-surface-hover"
          style={{ animationDelay: "320ms" }}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>

      {/* Bottom footer */}
      <footer
        className="absolute bottom-6 animate-login-reveal"
        style={{ animationDelay: "500ms" }}
      >
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/30">
          Whoop &middot; Withings &middot; Unified
        </p>
      </footer>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
