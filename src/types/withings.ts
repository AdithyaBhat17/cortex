export interface WithingsMeasureGroup {
  grpid: number;
  attrib: number;
  date: number;
  created: number;
  modified: number;
  category: number;
  deviceid: string | null;
  measures: WithingsMeasure[];
}

export interface WithingsMeasure {
  value: number;
  type: number;
  unit: number;
}

export interface WithingsMeasureResponse {
  status: number;
  body: {
    updatetime: number;
    timezone: string;
    measuregrps: WithingsMeasureGroup[];
    more: number;
    offset: number;
  };
}

// Withings measure type IDs
export const WITHINGS_MEASURE_TYPES = {
  WEIGHT: 1,
  HEIGHT: 4,
  FAT_FREE_MASS: 5,
  FAT_RATIO: 6,
  FAT_MASS: 8,
  MUSCLE_MASS: 76,
  HYDRATION: 77,
  BONE_MASS: 88,
} as const;

export interface WithingsTokenResponse {
  status: number;
  body: {
    userid: string;
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
  };
}
