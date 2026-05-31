# Contributing

## Setup

```bash
# 1. Fork and clone
git clone https://github.com/your-username/hiresight-ai
cd hiresight-ai

# 2. Install dependencies
npm ci

# 3. Copy environment file
cp .env.example .env.local

# 4. Start development server
npm run dev
```

The app runs with demo data — no Supabase or API keys needed for local development.

To run the background worker alongside the dev server:

```bash
# Terminal 2
npx tsx scripts/worker.ts
```

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready, deployable. Protected — no direct pushes |
| `feat/*` | New features. Branch from `main`, merge via PR |
| `fix/*` | Bug fixes. Branch from `main`, merge via PR |
| `docs/*` | Documentation changes. Branch from `main`, merge via PR |

## Commit Conventions

Use conventional commits:

```
type(scope): description

feat(auth): add password reset endpoint
fix(pipeline): correct stage transition optimistic update
docs(readme): add troubleshooting section
refactor(job-queue): extract worker lifecycle to separate module
test(scoring): add edge case for empty skills array
chore(deps): upgrade @supabase/ssr to 0.5.2
```

Allowed types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`, `perf`, `ci`, `build`

## Pull Request Process

1. Ensure your branch is up to date with `main`
2. Run full CI locally: `npm run ci` (lint + typecheck + test + build)
3. Keep PRs focused — one feature/fix per PR
4. Write a clear description covering:
   - What the change does
   - Why it's needed
   - How to test it
5. Add or update tests if changing logic
6. Update documentation if changing public APIs or architecture
7. Request review from at least one contributor

## Code Style

- **TypeScript**: Strict mode required. No `any` without explicit justification
- **Components**: Use existing UI primitives in `components/ui/` — avoid raw HTML elements for interactive controls
- **Forms**: Use `react-hook-form` with `zod` schemas from `lib/validation.ts`
- **API routes**: Always validate input with zod. Return consistent error shapes (`{ error: string, issues?: ... }`)
- **Database queries**: Use the `queryOrFallback` / `mutateOrIgnore` helpers in `lib/db/index.ts` for resilience
- **State**: Client state in Zustand stores; server state in React Server Components or SWR
- **CSS**: TailwindCSS utility classes. Use `cn()` from `lib/utils.ts` for conditional classes. No CSS modules unless necessary

## Testing

```bash
npm run test               # Unit tests (vitest)
npm run test:components    # Component tests (vitest + jsdom)
npm run test:e2e           # E2E tests (Playwright)
npm run ci                 # Full CI pipeline
```

- Unit tests go in `tests/unit/`
- Component tests go in `tests/components/`
- Test files should mirror the source structure
- Aim for >80% coverage on new logic

## Documentation

- All public API routes must be documented in `docs/API.md`
- Architecture changes should update `docs/ARCHITECTURE.md` with Mermaid diagrams
- New dependencies should be justified in the PR description
- User-facing changes should update the demo scripts in `docs/DEMO_SCRIPTS.md`
