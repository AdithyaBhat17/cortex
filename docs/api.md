# API Reference

All API routes are under `/api/`. Authentication is required for all endpoints (except the cron route which uses a bearer token).

## Authentication

Every API route calls `supabase.auth.getUser()` to verify the session. Requests without a valid Supabase session cookie receive a `401 Unauthorized` response.

## Endpoints

### OAuth

#### `GET /api/auth/whoop`

Initiates WHOOP OAuth flow. Generates a CSRF state token, stores it in an httpOnly cookie, and redirects to WHOOP's authorization page.

**Response**: `302 Redirect` to WHOOP OAuth

---

#### `GET /api/auth/whoop/callback`

Handles the WHOOP OAuth callback. Validates the state parameter, exchanges the authorization code for tokens, and stores them in the database.

| Param | Source | Description |
|-------|--------|-------------|
| `code` | query | Authorization code from WHOOP |
| `state` | query | CSRF state token |

**Response**: `302 Redirect` to `/dashboard/connect?success=whoop`

---

#### `GET /api/auth/withings`

Initiates Withings OAuth flow. Same pattern as WHOOP.

**Response**: `302 Redirect` to Withings OAuth

---

#### `GET /api/auth/withings/callback`

Handles the Withings OAuth callback. Validates state, exchanges code for tokens.

**Response**: `302 Redirect` to `/dashboard/connect?success=withings`

---

### Data

#### `GET /api/data/whoop`

Fetches WHOOP data from the database for the authenticated user.

| Param | Source | Required | Description |
|-------|--------|----------|-------------|
| `type` | query | Yes | One of: `recovery`, `sleep`, `cycles`, `workouts` |
| `start` | query | Yes | ISO 8601 start date |
| `end` | query | Yes | ISO 8601 end date |

**Response**: `200 OK` with JSON array of records

```json
// Example: /api/data/whoop?type=recovery&start=2024-01-01T00:00:00Z&end=2024-01-31T23:59:59Z
[
  {
    "id": "uuid",
    "recovery_score": 78.5,
    "resting_heart_rate": 52,
    "hrv_rmssd_milli": 85.3,
    "spo2_percentage": 97.2,
    "skin_temp_celsius": 33.1,
    "created_at": "2024-01-15T07:00:00Z"
  }
]
```

---

#### `GET /api/data/withings`

Fetches Withings measurements from the database.

| Param | Source | Required | Description |
|-------|--------|----------|-------------|
| `start` | query | Yes | ISO 8601 start date |
| `end` | query | Yes | ISO 8601 end date |

**Response**: `200 OK` with JSON array of measurements

```json
[
  {
    "id": "uuid",
    "weight_kg": 75.2,
    "fat_ratio_pct": 18.5,
    "muscle_mass_kg": 35.1,
    "bone_mass_kg": 3.2,
    "bmi": 23.4,
    "measured_at": "2024-01-15T08:30:00Z"
  }
]
```

---

#### `GET /api/data/connections`

Returns the connection status for each provider.

**Response**: `200 OK`

```json
{
  "whoop": {
    "provider": "whoop",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T06:00:00Z"
  },
  "withings": null
}
```

---

### Sync

#### `POST /api/sync`

Triggers a sync for all connected providers. Whoop and Withings syncs run in parallel.

| Param | Source | Required | Description |
|-------|--------|----------|-------------|
| `initial` | query | No | Set to `true` for first-time sync (pulls 30 days) |

**Response**: `200 OK`

```json
{
  "whoop": { "success": true, "records": 42 },
  "withings": { "success": true, "records": 15 }
}
```

---

#### `POST /api/sync/whoop`

Triggers a sync for WHOOP only.

---

#### `POST /api/sync/withings`

Triggers a sync for Withings only.

---

### Cron

#### `GET /api/cron/sync`

Automated sync endpoint called by Vercel Cron. Syncs all users with connected providers. Secured by `CRON_SECRET` bearer token.

**Headers**: `Authorization: Bearer <CRON_SECRET>`

**Response**: `200 OK`

```json
{
  "synced": 3,
  "results": {
    "user-id-1": {
      "whoop": { "success": true, "records": 12 },
      "withings": { "success": true, "records": 5 }
    }
  }
}
```

## API Flow Diagram

```
Browser                     Server                    Database
  |                           |                          |
  |  GET /api/data/whoop      |                          |
  |  ?type=recovery           |                          |
  |  &start=...&end=...       |                          |
  |-------------------------->|                          |
  |                           |  auth.getUser()          |
  |                           |------------------------->|
  |                           |<-------------------------|
  |                           |  user verified           |
  |                           |                          |
  |                           |  SELECT * FROM           |
  |                           |  whoop_recovery          |
  |                           |  WHERE user_id = ?       |
  |                           |  AND created_at >= ?     |
  |                           |  AND created_at <= ?     |
  |                           |------------------------->|
  |                           |<-------------------------|
  |                           |  rows[]                  |
  |<--------------------------|                          |
  |  200 OK [...]             |                          |
```
