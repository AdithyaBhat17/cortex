import { WHOOP_API_BASE } from "@/lib/utils/constants";
import type {
  WhoopCycle,
  WhoopRecovery,
  WhoopSleep,
  WhoopWorkout,
  WhoopPaginatedResponse,
} from "@/types/whoop";

const RATE_LIMIT_DELAY = 600; // ms between requests

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWhoop<T>(
  endpoint: string,
  accessToken: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${WHOOP_API_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 429) {
    const retryAfter = res.headers.get("retry-after");
    await sleep((retryAfter ? parseInt(retryAfter) : 60) * 1000);
    return fetchWhoop(endpoint, accessToken, params);
  }

  if (!res.ok) {
    throw new Error(`Whoop API error ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

async function fetchAllPages<T>(
  endpoint: string,
  accessToken: string,
  params: Record<string, string>
): Promise<T[]> {
  const allRecords: T[] = [];
  let nextToken: string | null = null;

  do {
    const queryParams: Record<string, string> = { ...params, limit: "25" };
    if (nextToken) queryParams.nextToken = nextToken;

    const response = await fetchWhoop<WhoopPaginatedResponse<T>>(
      endpoint,
      accessToken,
      queryParams
    );

    allRecords.push(...response.records);
    nextToken = response.next_token;

    if (nextToken) await sleep(RATE_LIMIT_DELAY);
  } while (nextToken);

  return allRecords;
}

export async function fetchCycles(
  accessToken: string,
  startDate: string,
  endDate: string
): Promise<WhoopCycle[]> {
  return fetchAllPages<WhoopCycle>("/cycle", accessToken, {
    start: startDate,
    end: endDate,
  });
}

export async function fetchRecovery(
  accessToken: string,
  startDate: string,
  endDate: string
): Promise<WhoopRecovery[]> {
  return fetchAllPages<WhoopRecovery>("/recovery", accessToken, {
    start: startDate,
    end: endDate,
  });
}

export async function fetchSleep(
  accessToken: string,
  startDate: string,
  endDate: string
): Promise<WhoopSleep[]> {
  return fetchAllPages<WhoopSleep>("/activity/sleep", accessToken, {
    start: startDate,
    end: endDate,
  });
}

export async function fetchWorkouts(
  accessToken: string,
  startDate: string,
  endDate: string
): Promise<WhoopWorkout[]> {
  return fetchAllPages<WhoopWorkout>("/activity/workout", accessToken, {
    start: startDate,
    end: endDate,
  });
}
