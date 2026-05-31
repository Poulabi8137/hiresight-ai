# Resume Material

## One-Liner

Built a full-stack AI hiring platform with Next.js, Supabase, and Gemini featuring explainable candidate matching, real-time pipeline management, and production-grade authentication.

## Two-Liner

Architected and shipped an AI-powered video resume platform processing candidates through a deterministic scoring engine with skill/experience/signal analysis, real-time drag-and-drop pipeline, and background worker architecture. Implemented complete authentication flow with Supabase SSR, password reset, and role-based access control across 32 API routes.

## Four-Liner

- Designed a deterministic AI matching system scoring candidates across skill overlap (40%), experience proximity (35%), and profile signals (25%) with 145-line TypeScript engine supporting 17 semantic skill aliases and critical-skill weighting
- Built real-time collaborative pipeline management using Supabase Realtime subscriptions across 5 tables, enabling multi-user drag-and-drop stage transitions without polling
- Implemented production auth infrastructure with Supabase SSR cookie-based sessions, service-role auto-confirm, password reset flow, demo fallback isolation, and role guards — replacing a demo-only fallback that blocked production deployment
- Deployed background worker architecture with persistent job queue, exponential backoff retry, dead-letter handling, health monitoring, and Docker multi-service orchestration (web + worker)

## ATS-Friendly Resume Bullets

### Technical
- Determined candidate scores using a weighted NLP-light matching engine (40% skill, 35% experience, 25% signal) with 17 semantic skill aliases across 145 lines of TypeScript
- Built real-time multi-user collaboration layer via Supabase Realtime subscriptions across 5 tables, eliminating polling overhead for pipeline stage transitions
- Implemented SSR cookie-based authentication with Supabase, replacing demo-only fallback with service-role auto-confirm, password reset, and role-based guards across 32 API routes
- Designed a persistent job queue with exponential-backoff retry (2s/4s/8s), dead-letter isolation, and a dedicated TypeScript worker polling every 2 seconds
- Structured 17 UI primitives (Button, Card, Dialog, Drawer, Tabs, Tooltip, etc.) with 5 design variants each, supporting dark/light/system themes via CSS variables
- Built onboarded multi-step walkthrough system with localStorage persistence for candidate and recruiter roles independently

### Architecture
- Deployed multi-stage Dockerfile with separate web (Next.js standalone) and worker (tsx runtime) targets orchestrated via docker-compose
- Containerized with health checks, Sentry error tracking, structured JSON logging, and rate limiting (Upstash + in-memory fallback)
- Written 65 unit tests (db-layer, env, scoring, validation, api-error, utils) and 10 component tests with 100% pass rate; configured Playwright E2E suite
- Integrated Gemini AI via Vercel AI SDK for candidate summaries with deterministic fallback; cached scoring results to avoid redundant API calls
- Applied Row-Level Security policies across 9 tables with per-role access rules (candidate manages own, recruiter reads relevant)

### Quantified Impact
- 32 API routes with full CRUD, auth guards, rate limiting, and error handling
- 75 automated tests all passing with zero lint errors and strict TypeScript
- 17 UI components with 5+ style variants each, 3 data visualization charts (pie, area, bar)
- Docker deployment in under 3 minutes with single `docker compose up -d`
- Readiness score improved from 6/10 to 9/10 by resolving auth, worker, and analytics blockers
