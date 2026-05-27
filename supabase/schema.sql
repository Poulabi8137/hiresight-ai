create extension if not exists "pgcrypto";

create type public.user_role as enum ('candidate', 'recruiter');
create type public.job_mode as enum ('Remote', 'Hybrid', 'Onsite');
create type public.job_status as enum ('open', 'paused', 'closed');
create type public.application_stage as enum ('applied', 'screening', 'shortlisted', 'interview', 'offer', 'rejected');
create type public.upload_kind as enum ('resume', 'video_resume', 'interview');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  full_name text not null,
  email text not null unique,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.employers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  company_name text not null,
  website text,
  industry text,
  created_at timestamptz not null default now()
);

create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  title text not null,
  location text not null,
  skills text[] not null default '{}',
  experience_years int not null default 0 check (experience_years >= 0),
  resume_url text,
  video_url text,
  portfolio_url text,
  ai_summary text,
  confidence_score int not null default 0 check (confidence_score between 0 and 100),
  communication_score int not null default 0 check (communication_score between 0 and 100),
  relevance_score int not null default 0 check (relevance_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employers(id) on delete cascade,
  title text not null,
  company text not null,
  location text not null,
  mode public.job_mode not null,
  salary text not null,
  description text not null,
  skills text[] not null default '{}',
  seniority text not null,
  status public.job_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  stage public.application_stage not null default 'applied',
  match_score int not null default 0 check (match_score between 0 and 100),
  ai_breakdown jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(candidate_id, job_id)
);

create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  video_url text not null,
  transcript text,
  keywords text[] not null default '{}',
  reviewer_score int check (reviewer_score between 0 and 100),
  created_at timestamptz not null default now()
);

create table public.ai_summaries (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references public.candidates(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  summary text not null,
  keywords text[] not null default '{}',
  model text not null default 'deterministic',
  score int check (score between 0 and 100),
  created_at timestamptz not null default now()
);

create table public.uploads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  kind public.upload_kind not null,
  file_name text not null,
  bucket text not null default 'videos',
  storage_path text not null default '',
  url text not null,
  content_type text not null,
  size bigint not null check (size > 0),
  created_at timestamptz not null default now()
);

create table public.recruiter_notes (
  id uuid primary key default gen_random_uuid(),
  recruiter_id uuid not null references public.users(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

create index candidates_skills_idx on public.candidates using gin (skills);
create index jobs_skills_idx on public.jobs using gin (skills);
create index jobs_status_created_idx on public.jobs (status, created_at desc);
create index applications_job_stage_idx on public.applications (job_id, stage);
create index applications_candidate_idx on public.applications (candidate_id);
create index uploads_owner_kind_idx on public.uploads (owner_id, kind);
create index uploads_bucket_path_idx on public.uploads (bucket, storage_path);
create index recruiter_notes_candidate_idx on public.recruiter_notes (candidate_id, created_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('resumes', 'resumes', false, 26214400, array['application/pdf']),
  ('videos', 'videos', false, 262144000, array['video/mp4', 'video/webm', 'video/quicktime']),
  ('avatars', 'avatars', false, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.users enable row level security;
alter table public.employers enable row level security;
alter table public.candidates enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.interviews enable row level security;
alter table public.ai_summaries enable row level security;
alter table public.uploads enable row level security;
alter table public.recruiter_notes enable row level security;

create policy "users can read self" on public.users for select using (auth.uid() = id);
create policy "users can update self" on public.users for update using (auth.uid() = id);

create policy "employer owners manage employers" on public.employers for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "recruiters can read employers" on public.employers for select using (
  exists (select 1 from public.users where users.id = auth.uid() and users.role = 'recruiter')
);

create policy "candidates manage own profile" on public.candidates for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "recruiters read candidate profiles" on public.candidates for select using (
  exists (select 1 from public.users where users.id = auth.uid() and users.role = 'recruiter')
);

create policy "published jobs are readable" on public.jobs for select using (status = 'open');
create policy "employers manage own jobs" on public.jobs for all using (
  exists (select 1 from public.employers where employers.id = jobs.employer_id and employers.owner_id = auth.uid())
) with check (
  exists (select 1 from public.employers where employers.id = jobs.employer_id and employers.owner_id = auth.uid())
);

create policy "candidates manage own applications" on public.applications for all using (
  exists (select 1 from public.candidates where candidates.id = applications.candidate_id and candidates.user_id = auth.uid())
) with check (
  exists (select 1 from public.candidates where candidates.id = applications.candidate_id and candidates.user_id = auth.uid())
);
create policy "recruiters read applications for own jobs" on public.applications for select using (
  exists (
    select 1 from public.jobs
    join public.employers on employers.id = jobs.employer_id
    where jobs.id = applications.job_id and employers.owner_id = auth.uid()
  )
);

create policy "application participants read interviews" on public.interviews for select using (
  exists (
    select 1 from public.applications
    left join public.candidates on candidates.id = applications.candidate_id
    left join public.jobs on jobs.id = applications.job_id
    left join public.employers on employers.id = jobs.employer_id
    where applications.id = interviews.application_id
      and (candidates.user_id = auth.uid() or employers.owner_id = auth.uid())
  )
);

create policy "users read relevant ai summaries" on public.ai_summaries for select using (
  candidate_id in (select id from public.candidates where user_id = auth.uid())
  or job_id in (select jobs.id from public.jobs join public.employers on employers.id = jobs.employer_id where employers.owner_id = auth.uid())
);

create policy "users manage own uploads" on public.uploads for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "recruiters manage own notes" on public.recruiter_notes for all using (auth.uid() = recruiter_id) with check (auth.uid() = recruiter_id);

drop policy if exists "users upload own resume files" on storage.objects;
drop policy if exists "users read own resume files" on storage.objects;
drop policy if exists "users update own resume files" on storage.objects;
drop policy if exists "users delete own resume files" on storage.objects;
drop policy if exists "users upload own video files" on storage.objects;
drop policy if exists "users read own video files" on storage.objects;
drop policy if exists "recruiters read candidate video files" on storage.objects;
drop policy if exists "users update own video files" on storage.objects;
drop policy if exists "users delete own video files" on storage.objects;
drop policy if exists "users manage own avatars" on storage.objects;

create policy "users upload own resume files" on storage.objects for insert with check (
  bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "users read own resume files" on storage.objects for select using (
  bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "users update own resume files" on storage.objects for update using (
  bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]
) with check (
  bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "users delete own resume files" on storage.objects for delete using (
  bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "users upload own video files" on storage.objects for insert with check (
  bucket_id = 'videos' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "users read own video files" on storage.objects for select using (
  bucket_id = 'videos' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "recruiters read candidate video files" on storage.objects for select using (
  bucket_id = 'videos' and exists (select 1 from public.users where users.id = auth.uid() and users.role = 'recruiter')
);
create policy "users update own video files" on storage.objects for update using (
  bucket_id = 'videos' and auth.uid()::text = (storage.foldername(name))[1]
) with check (
  bucket_id = 'videos' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "users delete own video files" on storage.objects for delete using (
  bucket_id = 'videos' and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "users manage own avatars" on storage.objects for all using (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
) with check (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, role, full_name, email)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'candidate'),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
