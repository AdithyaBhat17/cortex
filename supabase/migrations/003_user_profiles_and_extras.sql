-- User profiles for height, DOB, gender (needed for BMI fallback + BMR calculation)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  height_cm REAL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Add extra columns to withings_measurements
ALTER TABLE withings_measurements
  ADD COLUMN IF NOT EXISTS vo2max REAL,
  ADD COLUMN IF NOT EXISTS visceral_fat INTEGER,
  ADD COLUMN IF NOT EXISTS bmr_kcal REAL,
  ADD COLUMN IF NOT EXISTS raw_json JSONB;
