# Deployment Guide

## Prerequisites

- Node.js 20+
- Docker (optional, for containerized deploy)
- Supabase project (with service role key)
- Google AI API key (for resume parsing / AI summaries)

## Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Required for DB write operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Required for AI features
GOOGLE_AI_API_KEY=your-gemini-key
# or legacy:
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key

# Optional — Demo mode (no Supabase needed for demo)
HIRESIGHT_DEMO_AUTH=true

# Optional — Monitoring
SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project
```

## Quick Start (Development)

```bash
git clone <repo>
cd hiresight
cp .env.example .env.local
# edit .env.local with your Supabase credentials
npm ci
npm run dev
```

## Database Setup

1. Run `supabase/schema.sql` against your Supabase project (SQL editor or psql)
2. Run `supabase/migration-001-production-tables.sql`
3. Run `supabase/seed.sql` for demo data

### Migration Order

```bash
psql "$SUPABASE_DB_URL" -f supabase/schema.sql
psql "$SUPABASE_DB_URL" -f supabase/migration-001-production-tables.sql
psql "$SUPABASE_DB_URL" -f supabase/migration-002-job-queue.sql
psql "$SUPABASE_DB_URL" -f supabase/migration-003-analytics-and-worker.sql
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

## Background Worker

The worker is a dedicated process that polls the `job_queue` table and processes jobs
(AI scoring, resume parsing) outside the request lifecycle.

### Run locally

```bash
# Terminal 1: web server
npm run dev

# Terminal 2: worker
npx tsx scripts/worker.ts
```

### Verify worker is running

```bash
curl http://localhost:3000/api/health/worker
# {"status":"healthy","worker":{"status":"running",...},"queue":{...}}
```

## Deploy with Docker

```bash
# 1. Build
docker compose build

# 2. Create .env.production with all env vars

# 3. Run (starts both web + worker)
docker compose up -d

# App available at http://localhost:3000
# Worker processes jobs in the background
```

### Docker services

| Service | Target | Description |
|---------|--------|-------------|
| `web` | `runner` | Next.js server on port 3000 |
| `worker` | `worker` | Background job consumer, no HTTP port |

Both services share the same `Dockerfile` but use different build targets.

## Deploy manually

```bash
npm ci
npm run build
npm start
```

## Deploy to Vercel

1. Connect your GitHub repo to Vercel
2. Set all environment variables in Vercel project settings
3. Deploy — no config file needed (Vercel detects Next.js automatically)

## CI/CD

GitHub Actions workflow in `.github/workflows/ci.yml`:
- Runs on push/PR to `main`
- Steps: lint → typecheck → test → build
- Requires secrets: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Demo Scenario (3-minute walkthrough)

### Recruiter demo
1. Open `/auth?role=recruiter&mode=signin` — click "Demo login"
2. View AI-ranked candidate list (10s)
3. Play a video interview + see AI breakdown (60s)
4. Drag a candidate between pipeline stages (15s)
5. View recruiter analytics dashboard (30s)
6. Browse the AI match visualization panel (20s)

### Candidate demo
1. Open `/auth?role=candidate&mode=signin` — click "Demo login"
2. View profile strength meter and upload progress (20s)
3. Browse recommended jobs (30s)
4. Apply to a job (10s)

## Portfolio Audit Scorecard

| Dimension | Score | Notes |
|---|---|---|
| Overall polish | 8/10 | Premium design system, glass morphism, animated counters |
| Architecture | 8/10 | Clean Next.js app router, typed API layer, Zustand store |
| Code quality | 8/10 | Full TS strict, 65 unit + 10 component tests, lint clean |
| UI/UX | 9/10 | Landing page, onboarding walkthrough, responsive, dark mode |
| Performance | 7/10 | 28 routes, lazy-loaded 3D, bundle analyzer ready |
| Accessibility | 7/10 | ARIA labels, roles, reduced-motion, keyboard nav |
| Production readiness | 6/10 | Needs real Supabase, Sentry DSN, rate limiting in prod |
| Differentiator | AI video analysis + explainable scoring + DnD pipeline |

## Rollback Strategy

1. **Code rollback**: Revert the commit and redeploy via CI
2. **Database rollback**: Keep migration files sequential; revert by applying inverse SQL
3. **Data backup**: Supabase provides automated backups (Pro plan+)

## Monitoring

- Structured JSON logging to stdout
- Error tracking via `lib/monitoring.ts` (Sentry-ready via `@sentry/nextjs`)
- Health check at `GET /api/health`

## Production Checklist

- [ ] All environment variables set
- [ ] Database migrations applied (schema → 001 → 002 → 003 → seed)
- [ ] RLS policies enabled on all tables
- [ ] Storage buckets created (resumes, videos, avatars)
- [ ] Auth trigger `handle_new_user` installed
- [ ] `SENTRY_DSN` configured for error monitoring
- [ ] `HIRESIGHT_DEMO_AUTH=false` in production
- [ ] `npm run ci` passes
- [ ] `GET /api/health` returns `healthy`
- [ ] Rate limiter is active (uses @upstash/ratelimit with in-memory fallback)
- [ ] Job queue is wired (uses Supabase table with dedicated worker)
- [ ] Background worker is running (`GET /api/health/worker` returns `healthy`)
- [ ] Analytics indexes applied (migration-003)
- [ ] Worker health directory exists (`WORKER_HEALTH_DIR=/tmp`)
