# CORTEX

Your biometric command center. WHOOP + Withings in one dashboard.

```
    _____ ____  ____  _____ _______  __
   / ____/ __ \|  _ \|_   _|  ____\ \/ /
  | |   | |  | | |_) | | | | |__   \  /
  | |   | |  | |  _ <  | | |  __|  /  \
  | |___| |__| | |_) | | | | |____/ /\ \
   \_____\____/|____/ |___|______/_/  \_\
```

Cortex aggregates health data from **WHOOP** (recovery, strain, sleep, heart rate, SpO2, skin temperature, respiratory rate) and **Withings** (weight, body composition, BMI) into a unified, real-time dashboard with interactive charts and trend analysis.

## How It Works

```
+-----------+                              +------------------+
|           |  OAuth 2.0                   |                  |
|   WHOOP   |<---------------------------->|                  |
|   API     |  cycles, recovery,           |                  |
|           |  sleep, workouts             |     CORTEX       |
+-----------+                              |                  |
                                           |   Next.js App    |
+-----------+                              |   + Supabase DB  |
|           |  OAuth 2.0                   |                  |
| Withings  |<---------------------------->|                  |
|   API     |  weight, body comp,          |                  |
|           |  fat, muscle, BMI            +--------+---------+
+-----------+                                       |
                                                    |
                                            +-------v-------+
                                            |    Browser     |
                                            |  (Dashboard)   |
                                            +---------------+
```

1. **Sign in** with Google via Supabase Auth
2. **Connect** WHOOP and/or Withings via OAuth
3. **Data syncs** automatically (daily cron) or manually (sync button)
4. **Dashboard** renders 15+ interactive charts with date range filtering

## Tech Stack

| | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS 4 |
| Charts | Recharts 3 |
| State | React Query + Zustand |
| Database | Supabase (PostgreSQL + Auth) |
| Deployment | Vercel |

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url> cortex && cd cortex
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in Supabase, WHOOP, and Withings credentials

# 3. Run database migrations
# (paste contents of supabase/migrations/*.sql into Supabase SQL editor)

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

See [docs/setup.md](docs/setup.md) for the full setup guide.

## Dashboard Preview

The dashboard displays 7 summary metrics with sparklines at the top, followed by categorized chart sections:

```
+------------------------------------------------------------------+
|  CORTEX          Dashboard  Connections    [7D 14D 30D] [sync] [+]|
+------------------------------------------------------------------+
| Recovery | Sleep | Strain | Weight | Muscle | Body Fat |   BMI   |
|   78%    |  85%  |  12.4  | 75.2kg | 35.1kg |  18.5%  |  23.4   |
+------------------------------------------------------------------+
|                                                                  |
|  RECOVERY & VITALS                                               |
|  +------------------+ +----------------+ +-------------------+   |
|  | Recovery Score   | | HRV (RMSSD)    | | Resting Heart Rate|   |
|  |     [chart]      | |    [chart]     | |      [chart]      |   |
|  +------------------+ +----------------+ +-------------------+   |
|                                                                  |
|  SLEEP                                                           |
|  +------------------+ +----------------+ +-------------------+   |
|  | Sleep Performance| | Sleep Stages   | | Sleep Duration    |   |
|  |     [chart]      | |    [chart]     | |      [chart]      |   |
|  +------------------+ +----------------+ +-------------------+   |
|                                                                  |
|  ACTIVITY & STRAIN                                               |
|  +------------------+ +----------------+ +-------------------+   |
|  | Daily Strain     | | Calories       | | SpO2              |   |
|  +------------------+ +----------------+ +-------------------+   |
|                                                                  |
|  WORKOUTS                                                        |
|  +----------------------------------+ +-------------------+      |
|  | Workout Strain                   | | Workout Heart Rate|      |
|  +----------------------------------+ +-------------------+      |
|                                                                  |
|  BODY & METABOLISM                                               |
|  +------------------+ +----------------+ +-------------------+   |
|  | Weight           | | Skin Temp      | | Respiratory Rate  |   |
|  +------------------+ +----------------+ +-------------------+   |
|  +----------------------------------+ +-------------------+      |
|  | Body Composition (fat/muscle/bone)| |       BMI         |     |
|  +----------------------------------+ | 23.4  [Normal]    |     |
|                                       | [====o==========] |     |
|                                       +-------------------+     |
+------------------------------------------------------------------+
```

## Documentation

| Document | Description |
|----------|-------------|
| [docs/setup.md](docs/setup.md) | Full setup guide (Supabase, WHOOP, Withings, environment) |
| [docs/architecture.md](docs/architecture.md) | System architecture, data flows, design decisions |
| [docs/database.md](docs/database.md) | Database schema, ER diagram, RLS policies, indexes |
| [docs/api.md](docs/api.md) | API endpoint reference with request/response examples |
| [docs/components.md](docs/components.md) | Component hierarchy, chart list, data hooks |
| [docs/deployment.md](docs/deployment.md) | Vercel deployment, cron jobs, custom domains |

## Project Structure

```
src/
+-- app/                    # Next.js App Router
|   +-- (auth)/             #   Login, signup, OAuth callback
|   +-- api/                #   API routes (auth, data, sync, cron)
|   +-- dashboard/          #   Dashboard page + connect page
+-- components/
|   +-- charts/             #   15 chart components + BMI card
|   +-- layout/             #   Header, summary strip
|   +-- ui/                 #   Card, Skeleton, DatePicker, Logo
+-- lib/
|   +-- api/                #   WHOOP & Withings API clients
|   +-- hooks/              #   React Query data hooks
|   +-- supabase/           #   Supabase client factories
|   +-- sync/               #   Sync orchestration
+-- types/                  #   TypeScript definitions
```

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

Private project. All rights reserved.
