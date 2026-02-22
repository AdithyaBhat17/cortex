import { WITHINGS_API_URL } from "@/lib/utils/constants";
import { WITHINGS_MEASURE_TYPES, type WithingsMeasureResponse } from "@/types/withings";
import { withingsValueToActual } from "@/lib/utils/formatters";

const RATE_LIMIT_DELAY = 500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface ParsedMeasurement {
  grpid: number;
  measured_at: Date;
  category: number;
  weight_kg: number | null;
  height_m: number | null;
  fat_free_mass_kg: number | null;
  fat_ratio_pct: number | null;
  fat_mass_kg: number | null;
  muscle_mass_kg: number | null;
  hydration_kg: number | null;
  bone_mass_kg: number | null;
  vo2max: number | null;
  visceral_fat: number | null;
  raw_json: unknown;
}

export async function fetchMeasurements(
  accessToken: string,
  startDate: Date,
  endDate: Date
): Promise<ParsedMeasurement[]> {
  const allMeasurements: ParsedMeasurement[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const body = new URLSearchParams({
      action: "getmeas",
      category: "1",
      startdate: Math.floor(startDate.getTime() / 1000).toString(),
      enddate: Math.floor(endDate.getTime() / 1000).toString(),
      offset: offset.toString(),
    });

    const res = await fetch(`${WITHINGS_API_URL}/measure`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (res.status === 429) {
      await sleep(60_000);
      continue;
    }

    if (!res.ok) {
      throw new Error(`Withings API error ${res.status}: ${await res.text()}`);
    }

    const data: WithingsMeasureResponse = await res.json();

    if (data.status !== 0) {
      throw new Error(`Withings API error status: ${data.status}`);
    }

    for (const grp of data.body.measuregrps) {
      const parsed: ParsedMeasurement = {
        grpid: grp.grpid,
        measured_at: new Date(grp.date * 1000),
        category: grp.category,
        weight_kg: null,
        height_m: null,
        fat_free_mass_kg: null,
        fat_ratio_pct: null,
        fat_mass_kg: null,
        muscle_mass_kg: null,
        hydration_kg: null,
        bone_mass_kg: null,
        vo2max: null,
        visceral_fat: null,
        raw_json: grp,
      };

      for (const m of grp.measures) {
        const actual = withingsValueToActual(m.value, m.unit);
        switch (m.type) {
          case WITHINGS_MEASURE_TYPES.WEIGHT:
            parsed.weight_kg = actual;
            break;
          case WITHINGS_MEASURE_TYPES.HEIGHT:
            parsed.height_m = actual;
            break;
          case WITHINGS_MEASURE_TYPES.FAT_FREE_MASS:
            parsed.fat_free_mass_kg = actual;
            break;
          case WITHINGS_MEASURE_TYPES.FAT_RATIO:
            parsed.fat_ratio_pct = actual;
            break;
          case WITHINGS_MEASURE_TYPES.FAT_MASS:
            parsed.fat_mass_kg = actual;
            break;
          case WITHINGS_MEASURE_TYPES.MUSCLE_MASS:
            parsed.muscle_mass_kg = actual;
            break;
          case WITHINGS_MEASURE_TYPES.HYDRATION:
            parsed.hydration_kg = actual;
            break;
          case WITHINGS_MEASURE_TYPES.BONE_MASS:
            parsed.bone_mass_kg = actual;
            break;
          case WITHINGS_MEASURE_TYPES.VO2MAX:
            parsed.vo2max = actual;
            break;
          case WITHINGS_MEASURE_TYPES.VISCERAL_FAT:
            parsed.visceral_fat = Math.round(actual);
            break;
        }
      }

      allMeasurements.push(parsed);
    }

    hasMore = data.body.more === 1;
    if (hasMore) {
      offset = data.body.offset;
      await sleep(RATE_LIMIT_DELAY);
    }
  }

  return allMeasurements;
}
