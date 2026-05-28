# HireSight AI

AI-powered video resume hiring platform for candidate storytelling, recruiter review, deterministic matching, uploads, and Supabase-backed workflows.

## Features

- Cinematic landing page with React Three Fiber depth, Framer Motion reveals, animated AI match counters, and light/dark/system theme support.
- Candidate studio for onboarding progress, resume/video/interview signals, job discovery, and application flow.
- Recruiter workspace with video spotlight review, explainable AI match breakdowns, candidate ranking, pipeline stages, shortlist/reject actions, and recruiter insight panels.
- Upload studio with drag/drop validation, progress animation, preview states, and Supabase Storage-backed metadata API.
- Next.js Route Handlers for auth demo, jobs, candidates, applications, uploads, AI scoring, AI summaries, and recruiter notes.
- Supabase PostgreSQL schema with relationships, constraints, indexes, RLS policies, auth trigger, and seed data.
- Gemini integration through Vercel AI SDK with deterministic fallback scoring for local demos.

## Tech Stack

- Frontend: Next.js 14, React 18, TypeScript, TailwindCSS 3.4, shadcn-style UI primitives, Framer Motion, React Three Fiber, Zustand, React Hook Form, Zod.
- Backend: Next.js App Router route handlers.
- Database: Supabase PostgreSQL with Row-Level Security.
- Authentication: Supabase Auth, with local demo fallback when env vars are absent.
- AI: Vercel AI SDK, Gemini Free Tier, deterministic scoring logic.
- Storage: Supabase Storage (private buckets + signed URLs).
- Deployment: Vercel.

## Architecture

```text
app/
  api/                 Route handlers for auth, jobs, uploads, AI, notes
  candidate/           Candidate product workflow
  recruiter/           Recruiter review workflow
  upload/              Upload studio
components/            UI primitives and product surfaces
lib/
  ai/scoring.ts        Deterministic explainable matching
  supabase/            Browser/server Supabase clients
  demo-data.ts         Local judge-friendly seed data
supabase/
  schema.sql           Tables, constraints, indexes, RLS, auth trigger
  seed.sql             Demo data
```

## Local Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app runs without service credentials using demo data. To enable production services, copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
```

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Run `supabase/seed.sql` for demo data.
4. Add the Supabase URL, anon key, and service role key to Vercel environment variables.

The schema includes `users`, `employers`, `candidates`, `jobs`, `applications`, `interviews`, `ai_summaries`, `uploads`, and `recruiter_notes`.

## Demo Flow

1. Open the landing page and review the AI match visualization.
2. Go to `/auth` and continue with the demo recruiter identity.
3. Open `/recruiter` to review video spotlights and match breakdowns.
4. Open `/candidate` to see the profile and job discovery experience.
5. Open `/upload` to test drag/drop validation, previews, and upload metadata.

## Validation

```bash
npm run dev
npm run build
npm run lint
npx tsc --noEmit
```

## Deployment

Deploy to Vercel with the included `vercel.json`. Set the environment variables above in the Vercel dashboard. The app can run in local demo mode when explicitly enabled, but production auth, database writes, storage, and Gemini summaries require Supabase keys.
