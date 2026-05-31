# Architecture

## System Overview

HireSight AI is a full-stack Next.js 14 application with a dedicated background worker process, Supabase for database/auth/storage, and Gemini AI for intelligent candidate matching.

```mermaid
graph TB
    subgraph Client
        B[Browser]
    end

    subgraph "Next.js 14 Server"
        A[App Router]
        API[API Route Handlers]
        RSC[React Server Components]
        C[Client Components]
    end

    subgraph "Background Worker"
        W[scripts/worker.ts]
        Q[job_queue polling loop]
    end

    subgraph "Supabase"
        PG[(PostgreSQL)]
        AUTH[Auth Service]
        STORAGE[Storage Buckets]
        RT[Realtime]
    end

    subgraph "External AI"
        GM[Gemini API]
    end

    B --> A
    A --> RSC
    A --> C
    C --> API
    API --> PG
    API --> AUTH
    API --> STORAGE
    API --> GM
    API --> Q
    Q <--> PG
    W --> Q
    RSC --> PG
    C -.-> RT
    RT --> PG
```

---

## Request Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Next as Next.js Server
    participant Supa as Supabase
    participant AI as Gemini

    User->>Browser: Click /recruiter
    Browser->>Next: GET /recruiter
    Next->>Next: AppShell (getAuthState)
    Next->>Supa: getUser() via SSR cookies
    Supa-->>Next: user session
    Next->>Next: render RecruiterWorkspace
    Next-->>Browser: HTML + client JS

    User->>Browser: Drag candidate to "interview"
    Browser->>Next: PATCH /api/applications
    Next->>Supa: update application stage
    Next-->>Browser: { ok: true }
    Browser->>Supa: Realtime subscription fires
    Supa-->>Browser: updated application row

    Note over Browser,Next: AI Score Request
    User->>Browser: Click "Score" button
    Browser->>Next: POST /api/ai/score
    Next->>Supa: check cache (ai_scoring_cache)
    alt Cache hit
        Supa-->>Next: cached score
    else Cache miss
        Next->>Supa: fetch candidate + job
        Next->>AI: generate score via Gemini or deterministic
        Next->>Supa: cache result
    end
    Next-->>Browser: { breakdown }
```

---

## Auth Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Next as Next.js
    participant Supa as Supabase Auth

    User->>Browser: Navigate to /auth

    alt Sign Up
        User->>Browser: email, password, role
        Browser->>Next: POST /api/auth/signup
        Next->>Supa: signUp or admin.createUser
        alt Service role available
            Next->>Supa: admin.createUser (email_confirm:true)
            Supa-->>Next: user created + auto-confirmed
        else No service role
            Next->>Supa: signUp
            Supa-->>Next: user created (email confirmation may be required)
        end
        Next-->>Browser: { user, role, requiresEmailConfirmation }
        Browser->>Browser: store session in cookies (via @supabase/ssr)
        Browser->>User: redirect to workspace
    end

    alt Sign In
        User->>Browser: email, password
        Browser->>Next: POST /api/auth/signin
        Next->>Supa: signInWithPassword
        Supa-->>Next: session
        Next->>Next: set session cookies
        Next-->>Browser: { user, role }
        Browser->>User: redirect to workspace
    end

    alt Password Reset
        User->>Browser: email
        Browser->>Next: POST /api/auth/reset-password
        Next->>Supa: resetPasswordForEmail
        Note over User,Browser: User clicks email link
        Browser->>Browser: hash contains recovery token
        Browser->>Supa: getSession (auto-exchanges code)
        Browser->>User: show "Set new password" form
        User->>Browser: new password
        Browser->>Supa: updateUser({ password })
    end
```

### Session Persistence

- Server-side: `createServerSupabaseClient()` reads the `sb-<project_ref>-auth-token` cookie via Next.js's `cookies()` API
- Client-side: `createBrowserClient()` from `@supabase/ssr` reads the same cookie from the browser
- Cross-tab: all browser tabs share HTTP cookies, so session is automatically available across tabs
- Refresh: the auth cookie persists across page refreshes (server reads it on every request)

### Demo Fallback

When `HIRESIGHT_DEMO_AUTH=true` and Supabase is not configured, the auth page falls back to `/api/auth/demo`, which sets a `hiresight_demo_role` cookie. `getAuthState()` checks demo cookies only when explicitly enabled, preventing silent bypass in production.

---

## AI Pipeline

```mermaid
flowchart LR
    A[Resume Upload] --> B[Parse Resume - Job]
    B --> C{AI Available?}
    C -->|Yes| D[Gemini Summary via Vercel AI SDK]
    C -->|No| E[Fallback: extract text directly]
    D --> F[Save to parsed_resumes]
    E --> F

    G[Recruiter scores candidate] --> H{Already cached?}
    H -->|Yes| I[Return cached score]
    H -->|No| J[Fetch candidate + job from DB]
    J --> K[Deterministic scoring engine]
    K --> L[Skill match: weighted aliases]
    K --> M[Experience comparison]
    K --> N[Signal analysis]
    L & M & N --> O[Aggregate scores]
    O --> P[Cache in ai_scoring_cache]
    P --> I
```

### Deterministic Scoring

The scoring engine (`lib/ai/scoring.ts`) computes:

| Component | Weight | Description |
|-----------|--------|-------------|
| **Skill Score** | 40% | Matched skills with critical-skill bonus and semantic aliases |
| **Experience Score** | 35% | Years-of-experience proximity to job requirements |
| **Signal Score** | 25% | Video presence, profile completeness, confidence signals |

Strengths and weaknesses are derived from matched vs missing skills, with critical missing skills highlighted.

---

## Realtime Flow

Supabase Realtime broadcasts row-level changes to subscribing clients:

```mermaid
sequenceDiagram
    participant Recruiter
    participant Browser
    participant Supa as Supabase Realtime
    participant Other as Other Browsers

    Recruiter->>Browser: Drag candidate to "shortlisted"
    Browser->>Supa: PATCH /api/applications (stage change)
    Supa->>Supa: Update row + emit change event
    Supa-->>Other: Broadcast via WebSocket
    Other->>Other: updateApplications(data) in Zustand store
    Note over Other: UI re-renders with new stage
```

Tables published to `supabase_realtime`:
- `applications`
- `recruiter_notes`
- `uploads`
- `saved_jobs`
- `activity_log`

The `use-realtime` hook (`lib/use-realtime.ts`) wraps Supabase's channel subscription with cleanup and uses the SSR-aware client so auth sessions attach to realtime connections.

---

## Worker Architecture

```mermaid
flowchart TB
    subgraph "Web Server (Next.js)"
        API[API Route]
        EQ[enqueueJob]
    end

    subgraph "job_queue table"
        PENDING[status: pending]
        RUNNING[status: running]
        COMPLETED[status: completed]
        FAILED[status: failed]
        DEAD[status: dead_letter]
    end

    subgraph "Worker Process (scripts/worker.ts)"
        LOOP[Poll every 2s]
        CLAIM[dequeueJob - claim atomic]
        HANDLE[workerProcessJob]
        RETRY{attempts < max?}
    end

    API --> EQ --> PENDING
    LOOP --> PENDING --> CLAIM --> RUNNING
    RUNNING --> HANDLE
    HANDLE --> COMPLETED
    HANDLE --> FAILED
    FAILED --> RETRY
    RETRY -->|Yes| PENDING
    RETRY -->|No| DEAD

    subgraph "Health Monitoring"
        HF[Write /tmp/worker-health.json]
        STATS[getQueueStats]
    end

    LOOP -.-> STATS
    LOOP -.-> HF
```

### Job Handlers

| Handler | Type | Description |
|---------|------|-------------|
| `ai-score` | Registered | Fetches candidate + job, runs deterministic scoring, caches result |
| `parse-resume` | Registered | Placeholder for future async resume parsing |

### Retry Strategy

- Exponential backoff: `2^attempt * 1000ms` (2s, 4s, 8s)
- Max attempts: 3 (configurable via `maxAttempts` parameter)
- Dead-letter: after max attempts, status set to `dead_letter`
- Cleanup: completed/dead jobs older than 1 hour are deleted every 5 minutes

---

## Deployment Architecture

```mermaid
graph TB
    subgraph "Docker Host"
        subgraph "Web Container"
            N1[Node.js 20<br/>Next.js standalone<br/>Port 3000]
        end
        subgraph "Worker Container"
            W1[Node.js 20<br/>tsx scripts/worker.ts<br/>No HTTP port]
        end
    end

    subgraph "Supabase Cloud"
        PG[(PostgreSQL)]
        SU[AUTH]
        SB[Storage]
        RT[Realtime]
    end

    subgraph "Google Cloud"
        GM[Gemini API]
    end

    subgraph "External"
        S[Sentry]
    end

    N1 --> PG
    N1 --> SU
    N1 --> SB
    N1 --> GM
    N1 --> S
    W1 --> PG
    W1 --> GM
    N1 -.-> RT
    RT --> PG

    style W1 fill:#f0f4ff,stroke:#3b82f6
```

### Docker Setup

- **Dockerfile**: Multi-stage with `base` → `deps` → `builder` for Next.js, then two target stages:
  - `runner`: standalone Next.js server (port 3000)
  - `worker`: TypeScript worker via `tsx scripts/worker.ts`
- **docker-compose.yml**: Both services share env vars from `.env.production`. Worker depends on web health check.
