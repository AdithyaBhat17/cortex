export interface WhoopCycle {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  start: string;
  end: string | null;
  timezone_offset: string | null;
  score_state: string;
  score: {
    strain: number;
    kilojoule: number;
    average_heart_rate: number;
    max_heart_rate: number;
  } | null;
}

export interface WhoopRecovery {
  cycle_id: string;
  sleep_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  score_state: string;
  score: {
    user_calibrating: boolean;
    recovery_score: number;
    resting_heart_rate: number;
    hrv_rmssd_milli: number;
    spo2_percentage: number | null;
    skin_temp_celsius: number | null;
  } | null;
}

export interface WhoopSleep {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  timezone_offset: string | null;
  nap: boolean;
  score_state: string;
  score: {
    stage_summary: {
      total_in_bed_time_milli: number;
      total_awake_time_milli: number;
      total_no_data_time_milli: number;
      total_light_sleep_time_milli: number;
      total_slow_wave_sleep_time_milli: number;
      total_rem_sleep_time_milli: number;
      sleep_cycle_count: number;
      disturbance_count: number;
    };
    sleep_needed: {
      baseline_milli: number;
      need_from_sleep_debt_milli: number;
      need_from_recent_strain_milli: number;
      need_from_recent_nap_milli: number;
    };
    respiratory_rate: number;
    sleep_performance_percentage: number;
    sleep_consistency_percentage: number;
    sleep_efficiency_percentage: number;
  } | null;
}

export interface WhoopWorkout {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  timezone_offset: string | null;
  sport_id: number;
  score_state: string;
  score: {
    strain: number;
    average_heart_rate: number;
    max_heart_rate: number;
    kilojoule: number;
    percent_recorded: number;
    zone_duration: Record<string, number>;
  } | null;
}

export interface WhoopPaginatedResponse<T> {
  records: T[];
  next_token: string | null;
}
