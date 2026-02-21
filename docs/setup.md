# Setup Guide

## Prerequisites

- **Node.js** >= 18
- **npm** (comes with Node.js)
- A **Supabase** project ([supabase.com](https://supabase.com))
- A **WHOOP** developer account ([developer.whoop.com](https://developer.whoop.com))
- A **Withings** developer account ([developer.withings.com](https://developer.withings.com))
- (Optional) A **Vercel** account for deployment

## 1. Clone and Install

```bash
git clone <your-repo-url> cortex
cd cortex
npm install
```

## 2. Supabase Setup

### Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project
2. Note your **Project URL** and **anon (public) key** from Settings > API
3. Note your **Service Role key** from Settings > API (keep this secret)

### Run Database Migrations

In the Supabase SQL Editor, run the migrations in order:

```
supabase/migrations/001_create_tables.sql
supabase/migrations/002_enable_rls.sql
```

Or if using the Supabase CLI:

```bash
npx supabase db push
```

This creates the following tables:

```
+---------------------+     +---------------------+
| oauth_tokens        |     | sync_log            |
|---------------------|     |---------------------|
| user_id (FK)        |     | user_id (FK)        |
| provider            |     | provider            |
| access_token        |     | status              |
| refresh_token       |     | records_synced      |
| expires_at          |     | error_message       |
+---------------------+     +---------------------+

+---------------------+     +---------------------+
| whoop_cycles        |     | whoop_recovery      |
|---------------------|     |---------------------|
| user_id (FK)        |     | user_id (FK)        |
| whoop_cycle_id      |     | whoop_cycle_id      |
| strain              |     | recovery_score      |
| kilojoule           |     | resting_heart_rate  |
| average_heart_rate  |     | hrv_rmssd_milli     |
| max_heart_rate      |     | spo2_percentage     |
| calories_kcal       |     | skin_temp_celsius   |
+---------------------+     +---------------------+

+---------------------+     +---------------------+
| whoop_sleep         |     | whoop_workouts      |
|---------------------|     |---------------------|
| user_id (FK)        |     | user_id (FK)        |
| whoop_sleep_id      |     | whoop_workout_id    |
| total_*_time_milli  |     | sport_id            |
| respiratory_rate    |     | strain              |
| sleep_performance_% |     | average_heart_rate  |
| sleep_efficiency_%  |     | calories_kcal       |
+---------------------+     +---------------------+

+---------------------+
| withings_measure... |
|---------------------|
| user_id (FK)        |
| withings_grpid      |
| weight_kg           |
| fat_ratio_pct       |
| muscle_mass_kg      |
| bone_mass_kg        |
| bmi                 |
+---------------------+
```

### Enable Google Auth

1. In Supabase Dashboard, go to **Authentication > Providers**
2. Enable **Google** provider
3. Add your Google OAuth Client ID and Secret
4. Set the redirect URL to: `https://<your-supabase-project>.supabase.co/auth/v1/callback`

## 3. WHOOP Developer Setup

1. Go to [developer.whoop.com](https://developer.whoop.com)
2. Create a new application
3. Set the **Redirect URI** to: `http://localhost:3000/api/auth/whoop/callback`
   (and your production URL when deploying)
4. Note the **Client ID** and **Client Secret**
5. Required scopes: `read:profile`, `read:body_measurement`, `read:cycles`, `read:recovery`, `read:sleep`, `read:workout`, `offline`

## 4. Withings Developer Setup

1. Go to [developer.withings.com](https://developer.withings.com)
2. Create a new application
3. Set the **Callback URL** to: `http://localhost:3000/api/auth/withings/callback`
   (and your production URL when deploying)
4. Note the **Client ID** and **Client Secret**
5. Required scopes: `user.metrics`, `user.activity`

## 5. Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# WHOOP OAuth
WHOOP_CLIENT_ID=your-whoop-client-id
WHOOP_CLIENT_SECRET=your-whoop-client-secret

# Withings OAuth
WITHINGS_CLIENT_ID=your-withings-client-id
WITHINGS_CLIENT_SECRET=your-withings-client-secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron (generate a random secret for production)
CRON_SECRET=your-random-secret
```

## 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to the login page.

## 7. First Use

1. **Sign in** with Google on the login page
2. Go to **Connections** page
3. **Connect WHOOP** - you'll be redirected to WHOOP to authorize
4. **Connect Withings** - you'll be redirected to Withings to authorize
5. After connecting, an **initial sync** runs automatically (pulls last 30 days)
6. Your dashboard will populate with charts and metrics

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Unauthorized" on connect | Make sure you're logged in first |
| OAuth redirect fails | Check your redirect URIs match exactly in the provider dashboards |
| No data after connecting | Click the sync button in the header, or wait for the sync to complete |
| Supabase RLS errors | Make sure you ran both migration files (001 and 002) |
| Token refresh fails | Verify your client secrets are correct in `.env.local` |
| Build fails | Run `npm install` to ensure all dependencies are installed |
