-- CORTEX Database Schema
-- Run this in your Supabase SQL editor

-- Enable pgcrypto for token encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- OAuth Tokens (encrypted)
-- ============================================
CREATE TABLE public.oauth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('whoop', 'withings')),
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT[],
  provider_user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- ============================================
-- Whoop Cycles
-- ============================================
CREATE TABLE public.whoop_cycles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  whoop_cycle_id TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  timezone_offset TEXT,
  score_state TEXT,
  strain REAL,
  kilojoule REAL,
  average_heart_rate INTEGER,
  max_heart_rate INTEGER,
  calories_kcal REAL,
  raw_json JSONB,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, whoop_cycle_id)
);

CREATE INDEX idx_whoop_cycles_user_date ON public.whoop_cycles(user_id, start_time DESC);

-- ============================================
-- Whoop Recovery
-- ============================================
CREATE TABLE public.whoop_recovery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  whoop_cycle_id TEXT NOT NULL,
  whoop_sleep_id TEXT,
  score_state TEXT,
  recovery_score REAL,
  resting_heart_rate REAL,
  hrv_rmssd_milli REAL,
  spo2_percentage REAL,
  skin_temp_celsius REAL,
  user_calibrating BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ,
  raw_json JSONB,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, whoop_cycle_id)
);

CREATE INDEX idx_whoop_recovery_user_date ON public.whoop_recovery(user_id, created_at DESC);

-- ============================================
-- Whoop Sleep
-- ============================================
CREATE TABLE public.whoop_sleep (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  whoop_sleep_id TEXT NOT NULL,
  whoop_cycle_id TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  is_nap BOOLEAN DEFAULT FALSE,
  score_state TEXT,
  total_in_bed_time_milli BIGINT,
  total_awake_time_milli BIGINT,
  total_light_sleep_time_milli BIGINT,
  total_slow_wave_sleep_time_milli BIGINT,
  total_rem_sleep_time_milli BIGINT,
  sleep_cycle_count INTEGER,
  disturbance_count INTEGER,
  respiratory_rate REAL,
  sleep_performance_percentage REAL,
  sleep_consistency_percentage REAL,
  sleep_efficiency_percentage REAL,
  raw_json JSONB,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, whoop_sleep_id)
);

CREATE INDEX idx_whoop_sleep_user_date ON public.whoop_sleep(user_id, start_time DESC);

-- ============================================
-- Whoop Workouts
-- ============================================
CREATE TABLE public.whoop_workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  whoop_workout_id TEXT NOT NULL,
  whoop_cycle_id TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  sport_id INTEGER,
  score_state TEXT,
  strain REAL,
  average_heart_rate INTEGER,
  max_heart_rate INTEGER,
  kilojoule REAL,
  calories_kcal REAL,
  raw_json JSONB,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, whoop_workout_id)
);

CREATE INDEX idx_whoop_workouts_user_date ON public.whoop_workouts(user_id, start_time DESC);

-- ============================================
-- Withings Measurements
-- ============================================
CREATE TABLE public.withings_measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  withings_grpid BIGINT NOT NULL,
  measured_at TIMESTAMPTZ NOT NULL,
  category INTEGER DEFAULT 1,
  weight_kg REAL,
  height_m REAL,
  fat_free_mass_kg REAL,
  fat_ratio_pct REAL,
  fat_mass_kg REAL,
  muscle_mass_kg REAL,
  hydration_kg REAL,
  bone_mass_kg REAL,
  bmi REAL,
  raw_json JSONB,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, withings_grpid)
);

CREATE INDEX idx_withings_meas_user_date ON public.withings_measurements(user_id, measured_at DESC);

-- ============================================
-- Sync Log
-- ============================================
CREATE TABLE public.sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('whoop', 'withings')),
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  records_synced INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_sync_log_user ON public.sync_log(user_id, started_at DESC);
