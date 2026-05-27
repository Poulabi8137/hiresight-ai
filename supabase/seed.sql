insert into public.users (id, role, full_name, email)
values
  ('00000000-0000-0000-0000-000000000001', 'recruiter', 'Mira Chen', 'recruiter@hiresight.ai'),
  ('00000000-0000-0000-0000-000000000002', 'candidate', 'Marcus Lee', 'marcus@hiresight.ai'),
  ('00000000-0000-0000-0000-000000000003', 'candidate', 'Ava Raman', 'ava@hiresight.ai')
on conflict (id) do nothing;

insert into public.employers (id, owner_id, company_name, website, industry)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'NovaWorks', 'https://example.com', 'AI SaaS')
on conflict (id) do nothing;

insert into public.candidates (id, user_id, title, location, skills, experience_years, resume_url, video_url, ai_summary, confidence_score, communication_score, relevance_score)
values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Full-stack AI Engineer', 'Austin, TX', array['Next.js','PostgreSQL','Supabase','LLM Apps','Node.js'], 6, '/demo/marcus-resume.pdf', '/demo-videos/strong-ai-interview.mp4', 'Marcus has shipped AI workflow tools from prototype to revenue.', 88, 86, 94),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'Product Designer turned Frontend Engineer', 'Bengaluru, IN', array['React','Design Systems','TypeScript','Motion','User Research'], 4, '/demo/ava-resume.pdf', '/demo-videos/strong-ai-interview.mp4', 'Ava translates ambiguity into polished product interfaces.', 92, 95, 91)
on conflict (id) do nothing;

insert into public.jobs (id, employer_id, title, company, location, mode, salary, description, skills, seniority, status)
values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'AI Product Engineer', 'NovaWorks', 'San Francisco, CA', 'Hybrid', '$145k - $185k', 'Build human-centered AI workflows for operations teams.', array['Next.js','React','PostgreSQL','LLM Apps','TypeScript'], 'Senior', 'open'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Growth Product Designer', 'NovaWorks', 'Remote', 'Remote', '$120k - $155k', 'Design cinematic onboarding and conversion surfaces.', array['Design Systems','Motion','User Research','Figma','React'], 'Mid-Senior', 'open')
on conflict (id) do nothing;

insert into public.applications (id, candidate_id, job_id, stage, match_score, ai_breakdown)
values
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'shortlisted', 94, '{"matchedSkills":["Next.js","PostgreSQL","LLM Apps"],"signalScore":89}'::jsonb),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'interview', 92, '{"matchedSkills":["Design Systems","Motion","User Research","React"],"signalScore":93}'::jsonb)
on conflict (id) do nothing;
