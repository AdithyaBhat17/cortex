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

  if (!token) {
    console.error(`[token-manager] No ${provider} token found for user ${userId}`);
    return null;
  }

  const expiresAt = new Date(token.expires_at);
  const now = new Date();
  const tenMinutes = 10 * 60 * 1000;

  // Token is still valid
  if (expiresAt.getTime() - now.getTime() > tenMinutes) {
    return token.access_token;
  }

  // Token needs refresh
  const refreshed = await refreshToken(provider, token.refresh_token);
  if (!refreshed) {
    console.error(
      `[token-manager] Failed to refresh ${provider} token for user ${userId} (expired at ${expiresAt.toISOString()})`
    );
    return null;
  }

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

  if (!res.ok) {
    const body = await res.text();
    console.error(`[token-manager] Whoop token refresh failed: HTTP ${res.status} — ${body}`);
    return null;
  }

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

  if (!res.ok) {
    const body = await res.text();
    console.error(`[token-manager] Withings token refresh failed: HTTP ${res.status} — ${body}`);
    return null;
  }

  const data = await res.json();
  if (data.status !== 0) {
    console.error(
      `[token-manager] Withings token refresh error: status=${data.status}`,
      JSON.stringify(data)
    );
    return null;
  }

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

export interface TokenRefreshResult {
  user_id: string;
  provider: string;
  status: "fresh" | "refreshed" | "failed";
  error?: string;
}

export async function refreshAllTokens(
  supabase: SupabaseClient
): Promise<TokenRefreshResult[]> {
  const { data: tokens, error } = await supabase
    .from("oauth_tokens")
    .select("*");

  if (error || !tokens) {
    console.error("[token-manager] Failed to fetch tokens for refresh:", error);
    return [];
  }

  const sixHours = 6 * 60 * 60 * 1000;
  const now = Date.now();
  const results: TokenRefreshResult[] = [];

  // Process sequentially to avoid race conditions with single-use refresh tokens
  for (const token of tokens) {
    const expiresAt = new Date(token.expires_at).getTime();
    const provider = token.provider as "whoop" | "withings";

    if (expiresAt - now > sixHours) {
      results.push({ user_id: token.user_id, provider, status: "fresh" });
      continue;
    }

    console.log(
      `[token-manager] Proactively refreshing ${provider} token for user ${token.user_id} (expires ${token.expires_at})`
    );

    const refreshed = await refreshToken(provider, token.refresh_token);
    if (!refreshed) {
      results.push({
        user_id: token.user_id,
        provider,
        status: "failed",
        error: "Refresh returned null",
      });
      continue;
    }

    const { error: updateError } = await supabase
      .from("oauth_tokens")
      .update({
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token,
        expires_at: refreshed.expires_at.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", token.user_id)
      .eq("provider", provider);

    if (updateError) {
      console.error(
        `[token-manager] Failed to store refreshed ${provider} token for user ${token.user_id}:`,
        updateError
      );
      results.push({
        user_id: token.user_id,
        provider,
        status: "failed",
        error: "DB update failed",
      });
    } else {
      results.push({ user_id: token.user_id, provider, status: "refreshed" });
    }
  }

  return results;
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
