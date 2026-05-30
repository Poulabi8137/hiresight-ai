-- ============================================================================
-- Migration 002: Persistent job queue table
-- Durable background job processing with retry tracking
-- ============================================================================

create table if not exists public.job_queue (
  id text primary key,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed', 'dead_letter')),
  attempts int not null default 0,
  max_attempts int not null default 3,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists job_queue_status_idx on public.job_queue (status, updated_at desc);
create index if not exists job_queue_type_idx on public.job_queue (type);
create index if not exists job_queue_created_idx on public.job_queue (created_at desc);

alter table public.job_queue enable row level security;

create policy "service role manages job queue" on public.job_queue
  for all using (true)
  with check (true);
