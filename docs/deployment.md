# Deployment

## Deploying to Vercel

### 1. Connect Repository

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Vercel auto-detects Next.js and configures the build

### 2. Set Environment Variables

In the Vercel project dashboard, go to **Settings > Environment Variables** and add:

```
NEXT_PUBLIC_SUPABASE_URL      = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
SUPABASE_SERVICE_ROLE_KEY     = your-service-role-key
WHOOP_CLIENT_ID               = your-whoop-client-id
WHOOP_CLIENT_SECRET           = your-whoop-client-secret
WITHINGS_CLIENT_ID            = your-withings-client-id
WITHINGS_CLIENT_SECRET        = your-withings-client-secret
NEXT_PUBLIC_APP_URL           = https://your-app.vercel.app
CRON_SECRET                   = <generate-a-random-secret>
```

Generate a cron secret:

```bash
openssl rand -hex 32
```

### 3. Update OAuth Redirect URIs

Update the redirect URIs in both provider dashboards:

- **WHOOP**: `https://your-app.vercel.app/api/auth/whoop/callback`
- **Withings**: `https://your-app.vercel.app/api/auth/withings/callback`

Also update the Supabase auth redirect URL:

- **Supabase**: Add `https://your-app.vercel.app/callback` to the allowed redirect URLs in Authentication > URL Configuration

### 4. Cron Job

The `vercel.json` configures an automatic daily sync:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync",
      "schedule": "0 6 * * *"
    }
  ]
}
```

This runs at 6:00 AM UTC daily and syncs all connected users. The cron endpoint is secured by the `CRON_SECRET` environment variable -- Vercel automatically sends the `Authorization: Bearer <CRON_SECRET>` header.

### 5. Deploy

```bash
vercel --prod
```

Or push to your main branch and Vercel deploys automatically.

## Deployment Architecture

```
+---------------------------+
|         Vercel             |
|  +---------------------+  |
|  | Next.js (Edge/Node) |  |
|  |   - Pages (SSR/SSG) |  |
|  |   - API Routes      |  |
|  |   - Middleware       |  |
|  +----------+----------+  |
|             |              |
|  +----------v----------+  |
|  | Vercel Cron          |  |
|  | (daily sync @ 6 AM) |  |
|  +---------------------+  |
+------------+---------------+
             |
    +--------v--------+
    |    Supabase      |
    |  (PostgreSQL)    |
    |  (Auth)          |
    +--------+---------+
             |
    +--------v--------+
    | External APIs    |
    | - WHOOP          |
    | - Withings       |
    +-----------------+
```

## Custom Domain

1. In Vercel, go to **Settings > Domains**
2. Add your custom domain
3. Update `NEXT_PUBLIC_APP_URL` to your custom domain
4. Update OAuth redirect URIs in WHOOP and Withings dashboards
5. Update Supabase allowed redirect URLs
