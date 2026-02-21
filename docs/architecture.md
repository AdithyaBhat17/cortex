# Architecture

## System Overview

Cortex is a health data aggregation platform that pulls biometric data from WHOOP and Withings into a unified dashboard. It runs as a Next.js application backed by Supabase (PostgreSQL + Auth).

```
+------------------------------------------------------------------+
|                         CORTEX SYSTEM                            |
+------------------------------------------------------------------+
|                                                                  |
|  +-----------+     +----------------+     +-----------------+    |
|  |  Browser  |<--->| Next.js App    |<--->|    Supabase      |    |
|  |  (React)  |     | (API Routes)   |     |  (PostgreSQL)    |    |
|  +-----------+     +-------+--------+     +-----------------+    |
|                            |                                     |
|                   +--------+--------+                            |
|                   |                 |                             |
|            +------v-----+   +------v------+                      |
|            |  WHOOP API |   | Withings API|                      |
|            +------------+   +-------------+                      |
|                                                                  |
+------------------------------------------------------------------+
```

## Request Flow

```
User Browser
    |
    |  HTTPS
    v
+------------------+
|   Middleware      |  -- Session refresh, auth redirect
+------------------+
    |
    v
+------------------+
|  Next.js Router  |  -- App Router (src/app/)
+--------+---------+
         |
    +----+----+
    |         |
    v         v
  Pages    API Routes
(React)   (Server)
    |         |
    v         v
 Hooks     Supabase
(fetch)    (query)
```

## Data Flow: OAuth Connection

```mermaid
sequenceDiagram
    participant U as User
    participant App as Cortex App
    participant W as WHOOP/Withings
    participant DB as Supabase

    U->>App: Click "Connect WHOOP"
    App->>App: Generate CSRF state token
    App->>App: Store state in httpOnly cookie
    App->>W: Redirect to OAuth authorize URL
    W->>U: Show consent screen
    U->>W: Grant access
    W->>App: Redirect to /api/auth/whoop/callback?code=...&state=...
    App->>App: Validate state matches cookie
    App->>W: Exchange code for tokens
    W-->>App: access_token + refresh_token
    App->>DB: Store tokens (upsert oauth_tokens)
    App->>U: Redirect to /dashboard/connect?success=whoop
    App->>App: Trigger initial data sync
```

## Data Flow: Sync

```mermaid
sequenceDiagram
    participant U as User / Cron
    participant API as /api/sync
    participant TM as Token Manager
    participant Ext as WHOOP/Withings API
    participant DB as Supabase

    U->>API: POST /api/sync
    API->>DB: Check connected providers
    API->>TM: getValidToken(userId, provider)
    TM->>DB: Read oauth_tokens
    alt Token expired
        TM->>Ext: Refresh token
        Ext-->>TM: New tokens
        TM->>DB: Update oauth_tokens
    end
    TM-->>API: Valid access_token

    par Fetch all data types in parallel
        API->>Ext: fetchCycles()
        API->>Ext: fetchRecovery()
        API->>Ext: fetchSleep()
        API->>Ext: fetchWorkouts()
    end

    Ext-->>API: Data arrays
    API->>DB: Upsert all records
    API->>DB: Update sync_log
    API-->>U: { success: true, records: N }
```

## Data Flow: Dashboard Rendering

```mermaid
flowchart LR
    A[Dashboard Page] --> B[Summary Strip]
    A --> C[Chart Components]

    B --> D[useRecoveryData]
    B --> E[useSleepData]
    B --> F[useCycleData]
    B --> G[useWithingsData]

    C --> D
    C --> E
    C --> F
    C --> G

    D --> H["/api/data/whoop?type=recovery"]
    E --> I["/api/data/whoop?type=sleep"]
    F --> J["/api/data/whoop?type=cycles"]
    G --> K["/api/data/withings"]

    H --> L[(Supabase)]
    I --> L
    J --> L
    K --> L
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router) | SSR, API routes, routing |
| UI | React 19, Tailwind CSS 4 | Component rendering, styling |
| Charts | Recharts 3 | Data visualization |
| State | Zustand, React Query | Client state, server state cache |
| Auth | Supabase Auth (Google OAuth) | User authentication |
| Database | Supabase (PostgreSQL) | Data persistence, RLS |
| Icons | Heroicons | UI iconography |
| Deployment | Vercel | Hosting, cron jobs, edge functions |

## Directory Structure

```
src/
+-- app/                    # Next.js App Router
|   +-- (auth)/             # Auth route group (login, signup, callback)
|   +-- api/                # API routes
|   |   +-- auth/           #   OAuth initiation & callbacks
|   |   +-- cron/           #   Vercel cron job endpoint
|   |   +-- data/           #   Data query endpoints
|   |   +-- sync/           #   Manual sync triggers
|   +-- dashboard/          # Main dashboard pages
|   +-- layout.tsx          # Root layout (fonts, providers)
|   +-- globals.css         # Design system tokens & base styles
|
+-- components/
|   +-- cards/              # Standalone metric cards
|   +-- charts/             # Recharts-based chart components
|   +-- layout/             # Header, summary strip
|   +-- providers/          # React Query, theme context
|   +-- ui/                 # Primitives (Card, Skeleton, DatePicker)
|
+-- lib/
|   +-- api/                # External API clients (WHOOP, Withings)
|   +-- hooks/              # React hooks for data fetching
|   +-- supabase/           # Supabase client factories
|   +-- sync/               # Sync orchestration logic
|   +-- utils/              # Formatters, constants, helpers
|
+-- types/                  # TypeScript type definitions
```

## Key Design Decisions

1. **Server-side auth checks in API routes**: Every API route independently validates the user via `supabase.auth.getUser()` rather than relying solely on middleware. This provides defense-in-depth.

2. **Upsert-based sync**: All data sync uses `upsert` with conflict keys (e.g., `user_id,whoop_cycle_id`) so syncs are idempotent and safe to re-run.

3. **Parallel API fetches**: WHOOP data types (cycles, recovery, sleep, workouts) are fetched via `Promise.all()` to eliminate request waterfalls.

4. **React Query for server state**: All dashboard data flows through React Query with a 5-minute `staleTime`, providing automatic caching, deduplication, and background refetching.

5. **Zustand for client state**: Date range selection is managed in Zustand with localStorage persistence, keeping URL-independent UI state simple.

6. **Row-Level Security**: Supabase RLS policies ensure users can only read/write their own data, providing database-level access control regardless of application bugs.
