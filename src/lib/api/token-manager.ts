import { WHOOP_TOKEN_URL, WITHINGS_TOKEN_URL } from "@/lib/utils/constants";
import type { SupabaseClient } from "@supabase/supabase-js";

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: Date;
  provider_user_id?: string;
}

export async function getValidToken(
  supabase: SupabaseClient,
  userId: string,
  provider: "whoop" | "withings"
): Promise<string | null> {
  const { data: token } = await supabase
    .from("oauth_tokens")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", provider)
    .single();

  if (!token) return null;

  const expiresAt = new Date(token.expires_at);
  const now = new Date();
  const fiveMinutes = 5 * 60 * 1000;

  // Token is still valid
  if (expiresAt.getTime() - now.getTime() > fiveMinutes) {
    return token.access_token;
  }

  // Token needs refresh
  const refreshed = await refreshToken(provider, token.refresh_token);
  if (!refreshed) return null;

  // Update stored tokens
  await supabase
    .from("oauth_tokens")
    .update({
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token,
      expires_at: refreshed.expires_at.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("provider", provider);

  return refreshed.access_token;
}

async function refreshToken(
  provider: "whoop" | "withings",
  refreshToken: string
): Promise<TokenData | null> {
  if (provider === "whoop") {
    return refreshWhoopToken(refreshToken);
  }
  return refreshWithingsToken(refreshToken);
}

async function refreshWhoopToken(refresh_token: string): Promise<TokenData | null> {
  const res = await fetch(WHOOP_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
      client_id: process.env.WHOOP_CLIENT_ID!,
      client_secret: process.env.WHOOP_CLIENT_SECRET!,
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: new Date(Date.now() + data.expires_in * 1000),
  };
}

async function refreshWithingsToken(refresh_token: string): Promise<TokenData | null> {
  const res = await fetch(WITHINGS_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      action: "requesttoken",
      grant_type: "refresh_token",
      client_id: process.env.WITHINGS_CLIENT_ID!,
      client_secret: process.env.WITHINGS_CLIENT_SECRET!,
      refresh_token,
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  if (data.status !== 0) return null;

  return {
    access_token: data.body.access_token,
    refresh_token: data.body.refresh_token,
    expires_at: new Date(Date.now() + data.body.expires_in * 1000),
    provider_user_id: data.body.userid,
  };
}

export async function storeTokens(
  supabase: SupabaseClient,
  userId: string,
  provider: "whoop" | "withings",
  tokens: TokenData
) {
  await supabase.from("oauth_tokens").upsert(
    {
      user_id: userId,
      provider,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at.toISOString(),
      provider_user_id: tokens.provider_user_id ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,provider" }
  );
}

export async function removeTokens(
  supabase: SupabaseClient,
  userId: string,
  provider: "whoop" | "withings"
) {
  await supabase
    .from("oauth_tokens")
    .delete()
    .eq("user_id", userId)
    .eq("provider", provider);
}
