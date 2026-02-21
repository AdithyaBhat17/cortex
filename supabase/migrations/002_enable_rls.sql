-- Enable RLS on all tables
ALTER TABLE public.oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whoop_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whoop_recovery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whoop_sleep ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whoop_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withings_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_log ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users access own oauth_tokens"
  ON public.oauth_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users access own whoop_cycles"
  ON public.whoop_cycles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users access own whoop_recovery"
  ON public.whoop_recovery FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users access own whoop_sleep"
  ON public.whoop_sleep FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users access own whoop_workouts"
  ON public.whoop_workouts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users access own withings_measurements"
  ON public.withings_measurements FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users access own sync_log"
  ON public.sync_log FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
