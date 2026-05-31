# Case Study: HireSight AI

## Problem

Traditional hiring platforms present two problems: (1) recruiters must manually review dozens of resumes to find qualified candidates, and (2) candidates lack a medium to convey personality and communication skills beyond a static PDF. The goal was to build a platform where candidates upload video profiles, AI scores their match against job requirements with explainable reasoning, and recruiters manage the pipeline in real-time.

## Architecture Decisions

### Next.js 14 App Router
Chosen for the unified server/client model, React Server Components for data-fetching without waterfall, and API route handlers collocated with the frontend. This eliminated the need for a separate backend service for the MVP while keeping the option to extract services later.

### Supabase over Custom Backend
Supabase provided PostgreSQL, Auth, Storage, and Realtime out of the box — replacing what would have required four separate services. The trade-off was vendor lock-in, but the productivity gain justified it. The `@supabase/ssr` package made cookie-based session management straightforward.

### Deterministic over ML-Based Scoring
A rule-based scoring engine (skill aliases, experience proximity, signal weighting) was chosen over training a custom ML model. This made scores explainable ("matched React as a critical skill worth 1.2x weight") and eliminated the cold-start problem where ML models need labelled data. The deterministic engine runs in <5ms vs. 500ms+ for an API call, and requires zero ML infrastructure.

### Background Worker
Jobs were initially processed inline during request handling. For production, a dedicated worker process polls a `job_queue` table, claims jobs atomically (status → `running`), executes the handler, and updates status (`completed` / `failed` / `dead_letter`). This decouples request latency from job duration and survives server restarts.

## AI Integration

The AI pipeline has two layers:

1. **Deterministic Scorer** (`lib/ai/scoring.ts`, 145 lines): Matches candidate skills against job requirements using semantic aliases (e.g., "Next.js" matches "next", "nextjs", "next js"). Each skill has a configurable weight; critical skills get a 1.2x multiplier. Returns scores across three dimensions: skill (40%), experience (35%), signal (25%).

2. **Gemini Integration** (`app/api/ai/summary`): For a richer narrative, the platform calls Gemini via the Vercel AI SDK to generate a prose summary of a candidate's profile. This runs asynchronously — results are cached in `ai_scoring_cache` to avoid redundant API calls and cost.

Key design: the deterministic scorer always runs first (fast, predictable, free). Gemini summaries are an enhancement layer, not a dependency. If Gemini is unavailable, the app works without it.

## Scaling Decisions

| Decision | Why |
|----------|-----|
| Rate limiting via Upstash + in-memory fallback | Prevents abuse without hard dependency on Redis |
| Job queue separation (web vs worker) | AI scoring under load doesn't block HTTP responses |
| Realtime via Supabase channels | No polling, no custom WebSocket server, under 1MB per connection |
| Demo data fallback pattern | Every DB access function wraps queries in `queryOrFallback` — the app never crashes due to missing Supabase |
| Service-role auto-confirming users | Eliminates email confirmation friction for signed-up users during demos and deployments |

## Challenges

### 1. Supabase SSR Cookie Confusion
Early versions used `@supabase/supabase-js` on the client and `@supabase/ssr` on the server inconsistently. Sessions created by the server weren't readable on the client because different cookie names were used. **Fix:** Unified to `createBrowserClient` / `createServerClient` from `@supabase/ssr` exclusively, ensuring symmetric cookie handling.

### 2. Demo Auth Bypassing Production
The original `/api/auth/demo` endpoint was the ONLY auth endpoint. It set a `hiresight_demo_role` cookie that `getAuthState()` checked before Supabase sessions. In production, this would silently bypass real authentication. **Fix:** Created dedicated `/api/auth/signin` and `/api/auth/signup` endpoints with zero demo code. The auth page calls these first, and only falls back to `/api/auth/demo` when Supabase returns "not configured."

### 3. Realtime Subscriptions Without Auth
Realtime channels were created with a raw `@supabase/supabase-js` client that had no session. Subscriptions for user-specific data returned empty. **Fix:** Switched to the SSR-aware `createBrowserClient()` from `@/lib/supabase/client`, which attaches the auth session cookie to the realtime connection.

### 4. Standalone Build Missing
The Next.js Docker build was missing `output: "standalone"`. The Docker image built but the container crashed because `node server.js` didn't exist. **Fix:** Added `output: "standalone"` to `next.config.mjs`.

## Lessons Learned

1. **Build the production path first.** The demo-first approach caused cascading issues: demo-centered auth, demo-optimized queries, and demo data assumptions that all had to be untangled for deployment. The next project will start with a production auth endpoint and layer demo support on top.

2. **Test database queries with real data volumes.** The analytics queries that work on 10 rows behave differently on 10,000. The candidate analytics fetches ALL applications and processes in-memory — fine at launch, but needs a SQL-level aggregation before scale.

3. **Worker-first job processing.** Inline job processing seemed simple but made response times unpredictable. Moving to a dedicated worker was easier than expected because the queue persistence layer already existed — it just needed a poll loop on the other end.

4. **TypeScript strict pays off at migration time.** When refactoring the auth system from demo-first to production-first, the strict TypeScript configuration caught every mismatched import, every unchecked nullable, and every wrong path alias. Zero runtime surprises.

5. **Docker compose simplifies the developer experience.** Adding a worker service was a single `docker-compose.yml` addition. New team members can run the entire stack (web + worker + database) with one command and understand the architecture from the compose file.
