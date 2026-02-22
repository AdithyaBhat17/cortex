export interface OAuthToken {
  id: string;
  user_id: string;
  provider: "whoop" | "withings";
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  token_type: string;
  expires_at: string;
  scopes: string[] | null;
  provider_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbWhoopCycle {
  id: string;
  user_id: string;
  whoop_cycle_id: string;
  start_time: string;
  end_time: string | null;
  timezone_offset: string | null;
  score_state: string | null;
  strain: number | null;
  kilojoule: number | null;
  average_heart_rate: number | null;
  max_heart_rate: number | null;
  calories_kcal: number | null;
  synced_at: string;
}

export interface DbWhoopRecovery {
  id: string;
  user_id: string;
  whoop_cycle_id: string;
  whoop_sleep_id: string | null;
  score_state: string | null;
  recovery_score: number | null;
  resting_heart_rate: number | null;
  hrv_rmssd_milli: number | null;
  spo2_percentage: number | null;
  skin_temp_celsius: number | null;
  user_calibrating: boolean;
  created_at: string | null;
  synced_at: string;
}

export interface DbWhoopSleep {
  id: string;
  user_id: string;
  whoop_sleep_id: string;
  whoop_cycle_id: string | null;
  start_time: string;
  end_time: string | null;
  is_nap: boolean;
  score_state: string | null;
  total_in_bed_time_milli: number | null;
  total_awake_time_milli: number | null;
  total_light_sleep_time_milli: number | null;
  total_slow_wave_sleep_time_milli: number | null;
  total_rem_sleep_time_milli: number | null;
  sleep_cycle_count: number | null;
  disturbance_count: number | null;
  respiratory_rate: number | null;
  sleep_performance_percentage: number | null;
  sleep_consistency_percentage: number | null;
  sleep_efficiency_percentage: number | null;
  synced_at: string;
}

export interface DbWhoopWorkout {
  id: string;
  user_id: string;
  whoop_workout_id: string;
  whoop_cycle_id: string | null;
  start_time: string;
  end_time: string | null;
  sport_id: number | null;
  score_state: string | null;
  strain: number | null;
  average_heart_rate: number | null;
  max_heart_rate: number | null;
  kilojoule: number | null;
  calories_kcal: number | null;
  synced_at: string;
}

export interface DbWithingsMeasurement {
  id: string;
  user_id: string;
  withings_grpid: number;
  measured_at: string;
  category: number;
  weight_kg: number | null;
  height_m: number | null;
  fat_free_mass_kg: number | null;
  fat_ratio_pct: number | null;
  fat_mass_kg: number | null;
  muscle_mass_kg: number | null;
  hydration_kg: number | null;
  bone_mass_kg: number | null;
  bmi: number | null;
  vo2max: number | null;
  visceral_fat: number | null;
  bmr_kcal: number | null;
  raw_json: unknown | null;
  synced_at: string;
}

export interface DbUserProfile {
  id: string;
  user_id: string;
  height_cm: number | null;
  date_of_birth: string | null;
  gender: "male" | "female" | null;
  created_at: string;
  updated_at: string;
}

export interface DbSyncLog {
  id: string;
  user_id: string;
  provider: "whoop" | "withings";
  status: "started" | "completed" | "failed";
  records_synced: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}
