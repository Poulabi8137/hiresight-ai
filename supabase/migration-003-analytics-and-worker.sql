-- ============================================================================
-- Migration 003: Analytics indexes + job queue trigger
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. updated_at trigger for job_queue (enables worker status time tracking)
-- ---------------------------------------------------------------------------
create trigger if not exists job_queue_updated_at before update on public.job_queue
  for each row execute function public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 2. Analytics-focused indexes
-- ---------------------------------------------------------------------------

-- applications: stage-based reporting (pipeline funnel, conversion rates)
create index if not exists applications_stage_match_idx
  on public.applications (stage, match_score);

-- applications: candidate aggregation (profile completeness track)
create index if not exists applications_candidate_created_idx
  on public.applications (candidate_id, created_at desc);

-- candidates: signup trend analysis (used in applicationOverTime)
create index if not exists candidates_created_idx
  on public.candidates (created_at desc);

-- jobs: skill analysis (used in topSkills aggregation)
create index if not exists jobs_skills_idx
  on public.jobs using gin (skills);

-- uploads: profile completeness queries
create index if not exists uploads_owner_kind_idx
  on public.uploads (owner_id, kind);

-- ---------------------------------------------------------------------------
-- 3. Composite index for job queue worker polling
-- ---------------------------------------------------------------------------
create index if not exists job_queue_poll_idx
  on public.job_queue (status, created_at) where status = 'pending';

-- ---------------------------------------------------------------------------
-- 4. Index for activity_log analytics (recruiter activity tracking)
-- ---------------------------------------------------------------------------
create index if not exists activity_log_action_idx
  on public.activity_log (action);
