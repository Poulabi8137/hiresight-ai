-- ============================================================================
-- Migration 001: Production tables + hardening
-- Adds missing tables, triggers, indexes, and policies for production readiness
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. updated_at trigger function (shared across all tables)
-- ---------------------------------------------------------------------------
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply to tables that have updated_at
create trigger if not exists users_updated_at before update on public.users
  for each row execute function public.update_updated_at_column();
create trigger if not exists candidates_updated_at before update on public.candidates
  for each row execute function public.update_updated_at_column();
create trigger if not exists jobs_updated_at before update on public.jobs
  for each row execute function public.update_updated_at_column();
create trigger if not exists applications_updated_at before update on public.applications
  for each row execute function public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 2. saved_jobs table
-- ---------------------------------------------------------------------------
create table if not exists public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(candidate_id, job_id)
);

create index if not exists saved_jobs_candidate_idx on public.saved_jobs (candidate_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 3. activity_log table
-- ---------------------------------------------------------------------------
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_log_user_idx on public.activity_log (user_id, created_at desc);
create index if not exists activity_log_entity_idx on public.activity_log (entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- 4. parsed_resumes table
-- ---------------------------------------------------------------------------
create table if not exists public.parsed_resumes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  raw_text text not null,
  extracted_skills text[] not null default '{}',
  experience text not null default '',
  education text not null default '',
  confidence real not null default 0.0,
  parsed_at timestamptz not null default now()
);

create index if not exists parsed_resumes_candidate_idx on public.parsed_resumes (candidate_id, parsed_at desc);

-- ---------------------------------------------------------------------------
-- 5. ai_scoring_cache table
-- ---------------------------------------------------------------------------
create table if not exists public.ai_scoring_cache (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  score int not null check (score between 0 and 100),
  skill_score int not null check (skill_score between 0 and 100),
  experience_score int not null check (experience_score between 0 and 100),
  signal_score int not null check (signal_score between 0 and 100),
  matched_skills text[] not null default '{}',
  missing_skills text[] not null default '{}',
  summary text not null default '',
  model text not null default 'deterministic',
  created_at timestamptz not null default now(),
  unique(candidate_id, job_id)
);

create index if not exists ai_scoring_cache_lookup_idx on public.ai_scoring_cache (candidate_id, job_id);

-- ---------------------------------------------------------------------------
-- 6. Additional indexes for query performance
-- ---------------------------------------------------------------------------
create index if not exists applications_created_idx on public.applications (created_at desc);
create index if not exists applications_stage_idx on public.applications (stage);
create index if not exists uploads_created_idx on public.uploads (created_at desc);
create index if not exists jobs_employer_idx on public.jobs (employer_id);
create index if not exists candidates_user_idx on public.candidates (user_id);
create index if not exists interviews_application_idx on public.interviews (application_id);
create index if not exists ai_summaries_candidate_idx on public.ai_summaries (candidate_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 7. RLS policies for new tables
-- ---------------------------------------------------------------------------
alter table public.saved_jobs enable row level security;
alter table public.activity_log enable row level security;
alter table public.parsed_resumes enable row level security;
alter table public.ai_scoring_cache enable row level security;

-- saved_jobs: candidates manage own, recruiters can read for their jobs
create policy "candidates manage own saved jobs" on public.saved_jobs
  for all using (
    exists (select 1 from public.candidates where candidates.id = saved_jobs.candidate_id and candidates.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.candidates where candidates.id = saved_jobs.candidate_id and candidates.user_id = auth.uid())
  );

create policy "recruiters read saved jobs" on public.saved_jobs
  for select using (
    exists (
      select 1 from public.jobs
      join public.employers on employers.id = jobs.employer_id
      where jobs.id = saved_jobs.job_id and employers.owner_id = auth.uid()
    )
  );

-- activity_log: users manage own activity
create policy "users manage own activity" on public.activity_log
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- parsed_resumes: candidate owns, recruiter reads for candidates they review
create policy "candidates manage own parsed resume" on public.parsed_resumes
  for all using (
    exists (select 1 from public.candidates where candidates.id = parsed_resumes.candidate_id and candidates.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.candidates where candidates.id = parsed_resumes.candidate_id and candidates.user_id = auth.uid())
  );

create policy "recruiters read parsed resumes" on public.parsed_resumes
  for select using (
    exists (select 1 from public.users where users.id = auth.uid() and users.role = 'recruiter')
  );

-- ai_scoring_cache: candidates read own, recruiters read for own jobs
create policy "candidates read own scoring cache" on public.ai_scoring_cache
  for select using (
    exists (select 1 from public.candidates where candidates.id = ai_scoring_cache.candidate_id and candidates.user_id = auth.uid())
  );

create policy "recruiters manage scoring for own jobs" on public.ai_scoring_cache
  for all using (
    exists (
      select 1 from public.jobs
      join public.employers on employers.id = jobs.employer_id
      where jobs.id = ai_scoring_cache.job_id and employers.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.jobs
      join public.employers on employers.id = jobs.employer_id
      where jobs.id = ai_scoring_cache.job_id and employers.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 8. Storage bucket RLS for cleanup endpoint
-- ---------------------------------------------------------------------------
create policy if not exists "users delete own files from any bucket" on storage.objects
  for delete using (
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---------------------------------------------------------------------------
-- 9. Add content_hash column to uploads for dedup
-- ---------------------------------------------------------------------------
alter table public.uploads add column if not exists content_hash text;
create index if not exists uploads_dedup_idx on public.uploads (owner_id, kind, file_name, size);

-- ---------------------------------------------------------------------------
-- 10. Cascade cleanup: when a user is deleted, clean up storage objects
-- ---------------------------------------------------------------------------
-- Note: Storage object cleanup on user delete is handled by application logic
-- (DELETE /api/storage/upload/cleanup) rather than DB triggers for safety.

-- ---------------------------------------------------------------------------
-- 11. Enable realtime for key tables
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.applications;
alter publication supabase_realtime add table public.recruiter_notes;
alter publication supabase_realtime add table public.uploads;
alter publication supabase_realtime add table public.saved_jobs;
alter publication supabase_realtime add table public.activity_log;
