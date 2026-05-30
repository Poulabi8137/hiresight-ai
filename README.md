<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2-000000?logo=next.js" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-2.48-3FCF8E?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/status-passing-22c55e" alt="Build" />
  <img src="https://img.shields.io/badge/tests-75%20passed-22c55e" alt="Tests" />
  <img src="https://img.shields.io/badge/license-MIT-22c55e" alt="License" />
</p>

# HireSight AI

AI-powered video resume hiring platform. Candidates build video profiles, recruiters review explainable AI match scores, and pipeline management flows end-to-end.

**One-liner:** A full-stack AI hiring platform with deterministic candidate scoring, video review, drag-and-drop pipeline management, and real-time analytics — built with Next.js, Supabase, and Gemini AI.

---

## ✨ Features

| Area | Capabilities |
|------|-------------|
| **Landing** | Cinematic hero, animated stats, AI workflow demo, testimonials, FAQ, theme toggle |
| **Auth** | Email/password signup/signin, role-based redirects, password reset, demo fallback |
| **Candidate** | Profile strength meter, job discovery, apply flow, upload studio (resume/video/avatar) |
| **Recruiter** | AI-ranked candidate list, video spotlight player, explainable match breakdowns, drag-and-drop pipeline with 5 stages, shortlist/reject, notes |
| **Analytics** | Pipeline funnel, conversion rates, application trends, top skills, average AI score, hiring duration, recruiter activity |
| **AI** | Deterministic skill matching, Gemini summaries, caching layer, explainable scores (skill/experience/signal) |
| **Realtime** | Live pipeline updates via Supabase Realtime across 5 tables |
| **Onboarding** | Role-based walkthrough tours with localStorage persistence |

---

## 🧱 Tech Stack

```
Frontend     Next.js 14, React 18, TypeScript, TailwindCSS 3.4, Framer Motion
UI           shadcn-style primitives, Radix UI, Lucide Icons, Recharts
State        Zustand (client), React Server Components (server)
Auth         Supabase Auth + SSR cookies + demo fallback
Database     Supabase PostgreSQL, Row-Level Security, Realtime
AI           Gemini via Vercel AI SDK + deterministic fallback scorer
Storage      Supabase Storage (private buckets, signed URLs)
Queue        Supabase job_queue table + dedicated background worker
Monitoring   Sentry, structured JSON logging, health endpoints
Deploy       Docker, docker-compose (web + worker), Vercel
```

---

## 📂 Architecture

```
app/
├── api/
│   ├── ai/score          POST   Deterministic/Gemini scoring
│   ├── ai/summary        POST   Gemini candidate summary
│   ├── analytics/        GET    Recruiter + candidate dashboards
│   ├── auth/             POST   Signup, signin, reset-password, logout
│   ├── candidates        GET    Candidate list with search/filter
│   ├── health/           GET    System + worker health
│   ├── jobs              GET    Job list with search/filter
│   ├── applications      POST   Apply to job + list
│   ├── recruiter/notes   GET    Recruiter notes CRUD
│   ├── storage/upload    POST   Signed URL upload + cleanup
│   ├── uploads           GET    Upload metadata
│   ├── saved-jobs        POST   Save/unsave jobs
│   └── activity          GET    Activity log
├── auth/                 Auth page (signup, signin, password reset)
├── candidate/            Candidate workspace
├── recruiter/            Recruiter workspace + analytics dashboard
├── upload/               Upload studio
├── jobs/                 Job listing
└── layout.tsx            Root layout with AppShell

components/               UI components, onboarding, match visualization
lib/
├── ai/scoring.ts         Deterministic explainable matching engine
├── db/index.ts           Supabase query layer + analytics aggregations
├── job-queue.ts          Queue persistence + dequeue lifecycle
├── jobs.ts               Job handler registration (AI score, parse resume)
├── auth.ts               Auth state, demo cookie, role guard
├── supabase/             Server + browser SSR clients
└── demo-data.ts          Fallback for local development

scripts/
└── worker.ts             Dedicated background worker process

supabase/
├── schema.sql            Full schema (tables, RLS, auth trigger, storage)
├── migration-001-*.sql   Production tables + indexes
├── migration-002-*.sql   Job queue table
├── migration-003-*.sql   Analytics indexes + worker support
└── seed.sql              Demo data

tests/                    65 unit + 10 component tests
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed diagrams.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker (optional)

### Local development

```bash
git clone https://github.com/your-username/hiresight-ai
cd hiresight-ai
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app runs with demo data — no credentials needed.

### Run the background worker

```bash
# Terminal 2 (separate from dev server)
npx tsx scripts/worker.ts
```

### Run tests

```bash
npm run test          # 65 unit tests
npm run test:components  # 10 component tests
npm run test:e2e      # Playwright E2E tests
npm run ci            # lint + typecheck + test + build
```

---

## 🔐 Environment Variables

```env
# Required for production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key

# Optional
SENTRY_DSN=your-sentry-dsn
HIRESIGHT_DEMO_AUTH=true    # enable demo fallback for local dev
```

---

## 🗄️ Database Setup

```bash
# Migration order
psql "$SUPABASE_DB_URL" -f supabase/schema.sql
psql "$SUPABASE_DB_URL" -f supabase/migration-001-production-tables.sql
psql "$SUPABASE_DB_URL" -f supabase/migration-002-job-queue.sql
psql "$SUPABASE_DB_URL" -f supabase/migration-003-analytics-and-worker.sql
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

---

## 🐳 Docker Deployment

```bash
# Build and start both services
docker compose build
docker compose up -d

# Web:  http://localhost:3000
# Worker processes jobs in background
```

### Services

| Service | Target | Description |
|---------|--------|-------------|
| `web`   | `runner` | Next.js server (port 3000) |
| `worker` | `worker` | Background queue consumer (no HTTP) |

---

## 🧪 Demo Walkthrough

### Recruiter (3 minutes)

| Step | Action | Time |
|------|--------|------|
| 1 | Open `/auth?role=recruiter&mode=signin` | 10s |
| 2 | View AI-ranked candidate list in recruiter workspace | 20s |
| 3 | Play a video interview + examine AI match breakdown | 60s |
| 4 | Drag a candidate between pipeline stages | 15s |
| 5 | View the analytics dashboard (4 metric cards, 4 charts) | 30s |
| 6 | Explore the AI Match Visualization radial chart | 20s |
| 7 | Add a note on a candidate | 15s |

### Candidate (1 minute)

| Step | Action | Time |
|------|--------|------|
| 1 | Open `/auth?role=candidate&mode=signin` | 10s |
| 2 | View profile strength meter + upload progress | 15s |
| 3 | Browse recommended jobs and filter by skill | 20s |
| 4 | Apply to a job | 10s |
| 5 | View onboarding walkthrough tour | 15s |

---

## 📡 API Overview

All API routes are documented in [docs/API.md](docs/API.md).

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Create account |
| POST | `/api/auth/signin` | No | Sign in |
| POST | `/api/auth/reset-password` | No | Send reset email |
| POST | `/api/auth/logout` | No | Clear session |
| GET | `/api/jobs` | No | List jobs |
| GET | `/api/candidates` | Recruiter | List candidates |
| POST | `/api/applications` | Candidate | Apply to job |
| POST | `/api/ai/score` | Recruiter | Score candidate against job |
| GET | `/api/analytics/recruiter` | Recruiter | Dashboard data |
| GET | `/api/analytics/candidate` | Candidate | Dashboard data |
| GET | `/api/health` | No | System health |
| GET | `/api/health/worker` | No | Queue worker health |

---

## 🐛 Troubleshooting

### Supabase Connection
| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| `Supabase not configured` on signin | Missing `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Copy `.env.example` to `.env.local` and fill in your Supabase project credentials. Or set `HIRESIGHT_DEMO_AUTH=true` for local demo without Supabase |
| `Supabase not configured` in logs | Neither env var is set in the runtime environment | Check `.env.local` exists and is not gitignored; verify variables are set in Vercel/Docker env |
| `Database unavailable` on `/api/health` | Supabase project is paused, network blocked, or credentials are wrong | Verify project status in Supabase dashboard; check that URL and anon key match exactly |

### Authentication
| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| `Invalid login credentials` | Wrong email or password, or email not confirmed | Use the exact credentials from signup. If email confirmation is required, check your inbox |
| `Email not confirmed` on signin | User exists but hasn't clicked confirmation link | Check inbox for confirmation email, or enable `HIRESIGHT_DEMO_AUTH=true` |
| Password reset email not arriving | SMTP not configured in Supabase Auth | Go to Supabase dashboard → Authentication → Settings → Configure SMTP provider |
| 409 `already exists` on signup | Email already registered | Sign in instead, or use a different email |

### Environment Variables
| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| AI features return fallback data | `GOOGLE_GENERATIVE_AI_API_KEY` missing | Get a free Gemini API key from Google AI Studio and add it to `.env.local` |
| Upload fails with 403 | Supabase Storage not configured or bucket missing | Create `resumes`, `videos`, `avatars` buckets in Supabase Storage dashboard |
| Analytics return zeros | `SUPABASE_SERVICE_ROLE_KEY` missing | Add the service role key from Supabase Project Settings → API |

### Worker
| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| Jobs not processing | Worker not running | Start with `npx tsx scripts/worker.ts` in a separate terminal, or run `docker compose up worker` |
| `GET /api/health/worker` returns `not_running` | Worker process isn't started or crashed | Check worker terminal for errors; verify `SUPABASE_SERVICE_ROLE_KEY` is set |
| Jobs stuck in `pending` | Worker can't connect to Supabase | Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct |

### Storage
| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| Upload returns 400 | Missing file metadata | Check `kind` is one of: `resume`, `video_resume`, `interview`, `avatar` |
| Signed URL generation fails | Bucket doesn't exist or RLS blocks | Create bucket in Supabase dashboard; run migration-001 for RLS policies |
| Uploaded file not appearing | Owner ID mismatch | Signed URL is tied to the authenticated user — ensure you're signed in |

### Migrations
| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| `relation does not exist` | Migrations not applied | Run migrations in order: schema → 001 → 002 → 003. See Database Setup section |
| RLS policy violations on read | Policies not enabled on table | Run `alter table <name> enable row level security;` for affected tables |
| Realtime subscriptions returning empty | Table not published to `supabase_realtime` | Run migration-001 which publishes 5 tables; verify with `select * from pg_publication_tables;` |

### Realtime
| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| Drag-and-drop not updating other clients | Realtime not subscribed or table not published | Check browser console for Realtime connection logs; ensure `applications` table is in `supabase_realtime` publication |
| `Realtime unavailable` in logs | No Supabase connection | Works without Supabase in demo mode — realtime requires live Supabase project |
| Subscriptions connecting but no events received | RLS policy blocking the change event | Verify the user has SELECT permission on the subscribed table |

---

## ✅ Deployment Checklist

- [ ] Supabase project created, migrations applied
- [ ] Storage buckets: `resumes`, `videos`, `avatars`
- [ ] Auth trigger `handle_new_user` installed
- [ ] SMTP configured for Supabase Auth (password reset emails)
- [ ] `HIRESIGHT_DEMO_AUTH=false` in production
- [ ] Worker running: `GET /api/health/worker` returns `healthy`
- [ ] Sentry DSN configured
- [ ] `npm run ci` passes

---

## 📝 License

MIT

---

## 🤝 Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for setup instructions, branch strategy, commit conventions, PR process, and code style expectations.

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System diagrams, request/auth/realtime/worker flows |
| [API.md](docs/API.md) | All endpoints, request/response schemas, status codes |
| [CASE_STUDY.md](docs/CASE_STUDY.md) | Architecture decisions, challenges, lessons learned |
| [RESUME.md](docs/RESUME.md) | ATS-friendly bullets, project summaries |
| [DEMO_SCRIPTS.md](docs/DEMO_SCRIPTS.md) | Screenshot checklist + timed walkthroughs |
| [AUDIT.md](docs/AUDIT.md) | Feature/technology inventory, scores, honest assessment |
| [CONTRIBUTING.md](docs/CONTRIBUTING.md) | Setup, branch strategy, commit conventions, PR process |
| [DEPLOY.md](DEPLOY.md) | Deployment guide, Docker, production checklist |
