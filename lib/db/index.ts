import { candidates as fallbackCandidates, jobs as fallbackJobs, applications as fallbackApplications } from "@/lib/demo-data";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { track } from "@/lib/monitoring";
import type { Application, Candidate, Job } from "@/lib/types";

const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------

function normalizeCandidate(raw: any): Candidate {
  return {
    id: raw.id,
    name: raw.users?.full_name ?? raw.name ?? raw.id,
    title: raw.title ?? "",
    location: raw.location ?? "",
    avatar: raw.users?.avatar_url ?? raw.avatar ?? raw.id.slice(0, 2).toUpperCase(),
    skills: raw.skills ?? [],
    experienceYears: raw.experience_years ?? 0,
    videoUrl: raw.video_url ?? undefined,
    resumeUrl: raw.resume_url ?? undefined,
    summary: raw.summary ?? "",
    confidence: raw.confidence ?? 80,
    communication: raw.communication ?? 80,
    relevance: raw.relevance ?? 80
  };
}

function normalizeJob(raw: any): Job {
  return {
    id: raw.id,
    employerId: raw.employer_id ?? "",
    title: raw.title,
    company: raw.company,
    location: raw.location,
    mode: raw.mode as Job["mode"],
    salary: raw.salary,
    description: raw.description,
    skills: raw.skills ?? [],
    seniority: raw.seniority ?? "",
    status: raw.status as Job["status"]
  };
}

function normalizeApplication(raw: any): Application {
  return {
    id: raw.id,
    candidateId: raw.candidate_id,
    jobId: raw.job_id,
    stage: raw.stage as Application["stage"],
    matchScore: raw.match_score ?? 0,
    createdAt: raw.created_at ?? new Date().toISOString()
  };
}

function normalizeNote(raw: any) {
  return {
    id: raw.id,
    candidateId: raw.candidate_id,
    recruiterId: raw.recruiter_id,
    note: raw.note,
    createdAt: raw.created_at ?? new Date().toISOString()
  };
}

// ---------------------------------------------------------------------------
// Supabase client + resilient query helper
// ---------------------------------------------------------------------------

function getClient() {
  return createServiceSupabaseClient();
}

/** Wraps a Supabase query so any error (missing table, network, etc.)
 *  causes a graceful fallback to demo data instead of throwing.
 *  In production, logs a warning so the issue is visible. */
async function queryOrFallback<T>(
  query: (supabase: NonNullable<ReturnType<typeof getClient>>) => any,
  fallback: T,
  label = "query"
): Promise<{ data: T; source: "supabase" | "demo" }> {
  const supabase = getClient();
  if (!supabase) {
    if (!isDev) logger.warn(`[DB] Supabase not configured — ${label} falling back to demo`);
    return { data: fallback, source: "demo" };
  }
  try {
    const { data, error } = await query(supabase);
    if (error) {
      track.db(label, error);
      if (!isDev) logger.warn(`[DB] ${label} query failed: ${error.message} — falling back to demo`);
      return { data: fallback, source: "demo" };
    }
    return { data: data ?? fallback, source: "supabase" };
  } catch (e) {
    track.db(label, e);
    if (!isDev) logger.warn(`[DB] ${label} threw: ${e} — falling back to demo`);
    return { data: fallback, source: "demo" };
  }
}

async function getOrFallback<T>(
  query: (supabase: NonNullable<ReturnType<typeof getClient>>) => any,
  fallback: T,
  label = "get"
): Promise<T> {
  const supabase = getClient();
  if (!supabase) {
    if (!isDev) logger.warn(`[DB] Supabase not configured — ${label} falling back`);
    return fallback;
  }
  try {
    const { data } = await query(supabase);
    return data ?? fallback;
  } catch (e) {
    track.db(label, e);
    if (!isDev) logger.warn(`[DB] ${label} threw: ${e} — falling back`);
    return fallback;
  }
}

async function mutateOrIgnore(
  mutation: (supabase: NonNullable<ReturnType<typeof getClient>>) => any,
  label = "mutate"
): Promise<boolean> {
  const supabase = getClient();
  if (!supabase) {
    if (!isDev) logger.warn(`[DB] Supabase not configured — ${label} skipped`);
    return false;
  }
  try {
    const { error } = await mutation(supabase);
    if (error) {
      track.db(label, error);
      if (!isDev) logger.warn(`[DB] ${label} failed: ${error.message}`);
    }
    return !error;
  } catch (e) {
    track.db(label, e);
    if (!isDev) logger.warn(`[DB] ${label} threw: ${e}`);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Candidates
// ---------------------------------------------------------------------------

export async function listCandidates(page = 1, limit = 20, search?: string, skill?: string): Promise<{ data: Candidate[]; total: number; source: "supabase" | "demo" }> {
  const offset = (page - 1) * limit;
  const supabase = getClient();
  if (!supabase) return { data: fallbackCandidates, total: fallbackCandidates.length, source: "demo" };
  try {
    let query = supabase
      .from("candidates").select("*, users(full_name, avatar_url)", { count: "exact" });
    if (search) query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%`);
    if (skill) query = query.contains("skills", [skill]);
    const { data, error, count } = await query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);
    if (error) return { data: fallbackCandidates, total: fallbackCandidates.length, source: "demo" };
    return { data: (data ?? []).map(normalizeCandidate), total: count ?? data?.length ?? 0, source: "supabase" };
  } catch {
    return { data: fallbackCandidates, total: fallbackCandidates.length, source: "demo" };
  }
}

export async function getCandidate(id: string): Promise<Candidate> {
  return getOrFallback(
    (s) => s.from("candidates").select("*, users(full_name, avatar_url)").eq("id", id).single(),
    null
  ).then((data) => data ? normalizeCandidate(data) : (fallbackCandidates.find((c) => c.id === id) ?? fallbackCandidates[0]));
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export async function listJobs(page = 1, limit = 20, search?: string, skill?: string, mode?: string): Promise<{ data: Job[]; total: number; source: "supabase" | "demo" }> {
  const offset = (page - 1) * limit;
  const supabase = getClient();
  if (!supabase) return { data: fallbackJobs.map(normalizeJob), total: fallbackJobs.length, source: "demo" };
  try {
    let query = supabase.from("jobs").select("*", { count: "exact" });
    if (search) query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%,description.ilike.%${search}%`);
    if (mode) query = query.eq("mode", mode);
    if (skill) query = query.contains("skills", [skill]);
    const { data, error, count } = await query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);
    if (error) return { data: fallbackJobs.map(normalizeJob), total: fallbackJobs.length, source: "demo" };
    return { data: (data ?? []).map(normalizeJob), total: count ?? data?.length ?? 0, source: "supabase" };
  } catch {
    return { data: fallbackJobs.map(normalizeJob), total: fallbackJobs.length, source: "demo" };
  }
}

export async function getJob(id: string): Promise<Job> {
  return getOrFallback(
    (s) => s.from("jobs").select("*").eq("id", id).single(),
    null
  ).then((data) => data ? normalizeJob(data) : (fallbackJobs.find((j) => j.id === id) ?? fallbackJobs[0]));
}

export async function createJob(input: {
  title: string;
  company: string;
  location: string;
  mode: string;
  salary: string;
  description: string;
  skills: string[];
  seniority: string;
  employerId?: string;
}): Promise<{ job: Job; source: "supabase" | "demo" }> {
  const record = {
    title: input.title,
    company: input.company,
    location: input.location,
    mode: input.mode,
    salary: input.salary,
    description: input.description,
    skills: input.skills,
    seniority: input.seniority,
    employer_id: input.employerId ?? "00000000-0000-0000-0000-000000000001",
    status: "open" as const
  };

  return queryOrFallback(
    (s) => s.from("jobs").insert(record).select("*").single(),
    normalizeJob({ id: `demo-${Date.now()}`, ...record })
  ).then((r) => ({ job: r.source === "supabase" ? normalizeJob(r.data) : r.data, source: r.source }));
}

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------

export async function listApplications(page = 1, limit = 20): Promise<{ data: Application[]; total: number; source: "supabase" | "demo" }> {
  const offset = (page - 1) * limit;
  const supabase = getClient();
  if (!supabase) return { data: fallbackApplications, total: fallbackApplications.length, source: "demo" };
  try {
    const { data, error, count } = await supabase
      .from("applications").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(offset, offset + limit - 1);
    if (error) return { data: fallbackApplications, total: fallbackApplications.length, source: "demo" };
    return { data: (data ?? []).map(normalizeApplication), total: count ?? data?.length ?? 0, source: "supabase" };
  } catch {
    return { data: fallbackApplications, total: fallbackApplications.length, source: "demo" };
  }
}

export async function createApplication(input: {
  candidateId: string;
  jobId: string;
  stage?: string;
  matchScore?: number;
}): Promise<{ application: Application; source: "supabase" | "demo" }> {
  const record = {
    candidate_id: input.candidateId,
    job_id: input.jobId,
    stage: input.stage ?? "applied",
    match_score: input.matchScore ?? 0
  };

  return queryOrFallback(
    (s) => s.from("applications").insert(record).select("*").single(),
    normalizeApplication({ id: `demo-${Date.now()}`, ...record })
  ).then((r) => ({ application: r.source === "supabase" ? normalizeApplication(r.data) : r.data, source: r.source }));
}

export async function updateApplicationStage(
  applicationId: string,
  stage: Application["stage"]
): Promise<{ application: Application; source: "supabase" | "demo" }> {
  const fallback = { id: applicationId, candidateId: "", jobId: "", stage, matchScore: 0, createdAt: new Date().toISOString() };
  return queryOrFallback(
    (s) => s.from("applications").update({ stage }).eq("id", applicationId).select("*").single(),
    fallback
  ).then((r) => ({ application: normalizeApplication(r.data), source: r.source }));
}

// ---------------------------------------------------------------------------
// Recruiter Notes
// ---------------------------------------------------------------------------

export async function listNotes(candidateId: string) {
  return getOrFallback(
    (s) => s.from("recruiter_notes").select("*").eq("candidate_id", candidateId).order("created_at", { ascending: false }),
    [] as any[]
  ).then((data) => (data ?? []).map(normalizeNote));
}

export async function createNote(input: {
  candidateId: string;
  recruiterId: string;
  note: string;
}): Promise<{ source: "supabase" | "demo" }> {
  const ok = await mutateOrIgnore((s) =>
    s.from("recruiter_notes").insert({
      candidate_id: input.candidateId,
      recruiter_id: input.recruiterId,
      note: input.note.slice(0, 4000)
    })
  );
  return { source: ok ? "supabase" : "demo" };
}

// ---------------------------------------------------------------------------
// Uploads metadata
// ---------------------------------------------------------------------------

export async function listUploads(ownerId: string): Promise<{ data: any[]; source: "supabase" | "demo" }> {
  return queryOrFallback(
    (s) => s.from("uploads").select("*").eq("owner_id", ownerId).order("id", { ascending: false }),
    []
  );
}

// ---------------------------------------------------------------------------
// Saved Jobs
// ---------------------------------------------------------------------------

export async function listSavedJobs(candidateId: string): Promise<{ data: string[]; source: "supabase" | "demo" }> {
  return queryOrFallback(
    (s) => s.from("saved_jobs").select("job_id").eq("candidate_id", candidateId),
    []
  ).then((r) => ({ data: r.data.map((x: any) => x.job_id), source: r.source }));
}

export async function saveJob(candidateId: string, jobId: string): Promise<boolean> {
  return mutateOrIgnore((s) =>
    s.from("saved_jobs").upsert(
      { candidate_id: candidateId, job_id: jobId },
      { onConflict: "candidate_id,job_id" }
    )
  );
}

export async function unsaveJob(candidateId: string, jobId: string): Promise<boolean> {
  return mutateOrIgnore((s) =>
    s.from("saved_jobs").delete().eq("candidate_id", candidateId).eq("job_id", jobId)
  );
}

// ---------------------------------------------------------------------------
// Activity log
// ---------------------------------------------------------------------------

export type ActivityEntry = {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export async function listActivity(userId: string, page = 1, limit = 20): Promise<ActivityEntry[]> {
  const offset = (page - 1) * limit;
  return getOrFallback(
    (s) => s.from("activity_log").select("*").eq("user_id", userId).order("created_at", { ascending: false }).range(offset, offset + limit - 1),
    [] as any[]
  ).then((data) => (data ?? []).map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    action: r.action,
    entityType: r.entity_type,
    entityId: r.entity_id,
    metadata: r.metadata ?? {},
    createdAt: r.created_at
  })));
}

export async function logActivity(input: {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await mutateOrIgnore((s) =>
    s.from("activity_log").insert({
      user_id: input.userId,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId,
      metadata: input.metadata ?? {}
    })
  );
}

// ---------------------------------------------------------------------------
// Parsed Resumes
// ---------------------------------------------------------------------------

export type ParsedResume = {
  id: string;
  candidateId: string;
  rawText: string;
  extractedSkills: string[];
  experience: string;
  education: string;
  parsedAt: string;
};

export async function getParsedResume(candidateId: string): Promise<ParsedResume | null> {
  return getOrFallback(
    (s) => s.from("parsed_resumes").select("*").eq("candidate_id", candidateId).order("parsed_at", { ascending: false }).limit(1).single(),
    null as any
  ).then((data) => data ? {
    id: data.id,
    candidateId: data.candidate_id,
    rawText: data.raw_text,
    extractedSkills: data.extracted_skills ?? [],
    experience: data.experience ?? "",
    education: data.education ?? "",
    parsedAt: data.parsed_at
  } : null);
}

export async function saveParsedResume(input: {
  candidateId: string;
  rawText: string;
  extractedSkills: string[];
  experience: string;
  education: string;
}): Promise<void> {
  await mutateOrIgnore((s) =>
    s.from("parsed_resumes").insert({
      candidate_id: input.candidateId,
      raw_text: input.rawText,
      extracted_skills: input.extractedSkills,
      experience: input.experience,
      education: input.education
    })
  );
}

// ---------------------------------------------------------------------------
// AI Scoring Cache
// ---------------------------------------------------------------------------

export type CachedScore = {
  candidateId: string;
  jobId: string;
  score: number;
  skillScore: number;
  experienceScore: number;
  signalScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  summary: string;
};

export async function getCachedScore(candidateId: string, jobId: string): Promise<CachedScore | null> {
  return getOrFallback(
    (s) => s.from("ai_scoring_cache").select("*").eq("candidate_id", candidateId).eq("job_id", jobId).single(),
    null as any
  ).then((data) => data ? {
    candidateId: data.candidate_id,
    jobId: data.job_id,
    score: data.score,
    skillScore: data.skill_score,
    experienceScore: data.experience_score,
    signalScore: data.signal_score,
    matchedSkills: data.matched_skills ?? [],
    missingSkills: data.missing_skills ?? [],
    summary: data.summary
  } : null);
}

export async function cacheScore(input: CachedScore): Promise<void> {
  await mutateOrIgnore((s) =>
    s.from("ai_scoring_cache").upsert({
      candidate_id: input.candidateId,
      job_id: input.jobId,
      score: input.score,
      skill_score: input.skillScore,
      experience_score: input.experienceScore,
      signal_score: input.signalScore,
      matched_skills: input.matchedSkills,
      missing_skills: input.missingSkills,
      summary: input.summary
    }, { onConflict: "candidate_id,job_id" })
  );
}

// ---------------------------------------------------------------------------
// Analytics – Recruiter dashboard
// ---------------------------------------------------------------------------

export type RecruiterAnalytics = {
  totalCandidates: number;
  applicationsByStage: Record<string, number>;
  averageMatchScore: number;
  topSkills: { skill: string; count: number }[];
  applicationsOverTime: { date: string; count: number }[];
  averageTimeInPipeline: number;
  pipelineConversion: { from: string; to: string; rate: number }[];
  recruiterActivity: { action: string; count: number }[];
};

const fallbackAnalytics: RecruiterAnalytics = {
  totalCandidates: 0,
  applicationsByStage: {},
  averageMatchScore: 0,
  topSkills: [],
  applicationsOverTime: [],
  averageTimeInPipeline: 0,
  pipelineConversion: [],
  recruiterActivity: []
};

export async function getRecruiterAnalytics(recruiterUserId?: string): Promise<RecruiterAnalytics> {
  const supabase = getClient();
  if (!supabase) return fallbackAnalytics;

  try {
    const [candidatesResult, appsResult, jobsResult] = await Promise.all([
      supabase.from("candidates").select("id", { count: "exact", head: true }),
      supabase.from("applications").select("*"),
      supabase.from("jobs").select("skills")
    ]);

    const totalCandidates = candidatesResult.count ?? 0;
    const applications = (appsResult.data ?? []).map(normalizeApplication);
    const stageCounts: Record<string, number> = {};
    let totalScore = 0;
    let totalTime = 0;
    let scoredCount = 0;
    for (const app of applications) {
      stageCounts[app.stage] = (stageCounts[app.stage] ?? 0) + 1;
      if (app.matchScore > 0) { totalScore += app.matchScore; scoredCount++; }
      if (app.createdAt) {
        totalTime += Date.now() - new Date(app.createdAt).getTime();
      }
    }

    const skillCounts: Record<string, number> = {};
    for (const job of (jobsResult.data ?? [])) {
      for (const skill of (job.skills ?? [])) {
        skillCounts[skill] = (skillCounts[skill] ?? 0) + 1;
      }
    }
    const topSkills = Object.entries(skillCounts)
      .map(([s, c]) => ({ skill: s, count: c }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const days: Record<string, number> = {};
    for (const app of applications) {
      if (app.createdAt) {
        const d = app.createdAt.slice(0, 10);
        days[d] = (days[d] ?? 0) + 1;
      }
    }
    const applicationsOverTime = Object.entries(days)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const stages = ["applied", "screening", "shortlisted", "interview", "offer"];
    const pipelineConversion = stages.slice(0, -1).map((from, i) => {
      const to = stages[i + 1];
      const fromCount = stageCounts[from] ?? 0;
      const toCount = stageCounts[to] ?? 0;
      return { from, to, rate: fromCount > 0 ? Math.round((toCount / fromCount) * 100) : 0 };
    });

    let recruiterActivity: { action: string; count: number }[] = [];
    if (recruiterUserId) {
      const { data: activityData } = await supabase
        .from("activity_log")
        .select("action")
        .eq("user_id", recruiterUserId)
        .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString());
      const actionCounts: Record<string, number> = {};
      for (const row of activityData ?? []) {
        actionCounts[row.action] = (actionCounts[row.action] ?? 0) + 1;
      }
      recruiterActivity = Object.entries(actionCounts)
        .map(([a, c]) => ({ action: a, count: c }))
        .sort((a, b) => b.count - a.count);
    }

    return {
      totalCandidates,
      applicationsByStage: stageCounts,
      averageMatchScore: scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0,
      topSkills,
      applicationsOverTime,
      averageTimeInPipeline: scoredCount > 0 ? Math.round(totalTime / scoredCount / 86400000) : 0,
      pipelineConversion,
      recruiterActivity
    };
  } catch {
    return fallbackAnalytics;
  }
}

// ---------------------------------------------------------------------------
// Analytics – Candidate dashboard
// ---------------------------------------------------------------------------

export type CandidateAnalytics = {
  totalApplications: number;
  applicationsByStage: Record<string, number>;
  profileCompleteness: number;
  recentActivity: ActivityEntry[];
};

const fallbackCandidateAnalytics: CandidateAnalytics = {
  totalApplications: 0, applicationsByStage: {}, profileCompleteness: 0, recentActivity: []
};

export async function getCandidateAnalytics(candidateId: string): Promise<CandidateAnalytics> {
  const supabase = getClient();
  if (!supabase) return fallbackCandidateAnalytics;

  try {
    const [appsResult, uploadsResult, activityResult] = await Promise.all([
      supabase.from("applications").select("*").eq("candidate_id", candidateId),
      supabase.from("uploads").select("kind").eq("owner_id", candidateId),
      supabase.from("activity_log").select("*").eq("user_id", candidateId).order("created_at", { ascending: false }).limit(10)
    ]);

    const applications = (appsResult.data ?? []).map(normalizeApplication);
    const stageCounts: Record<string, number> = {};
    for (const app of applications) {
      stageCounts[app.stage] = (stageCounts[app.stage] ?? 0) + 1;
    }

    const kinds = new Set((uploadsResult.data ?? []).map((u: any) => u.kind));
    const profileCompleteness = Math.round((kinds.size / 3) * 100);

    const recentActivity = (activityResult.data ?? []).map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      action: r.action,
      entityType: r.entity_type,
      entityId: r.entity_id,
      metadata: r.metadata ?? {},
      createdAt: r.created_at
    }));

    return { totalApplications: applications.length, applicationsByStage: stageCounts, profileCompleteness, recentActivity };
  } catch {
    return fallbackCandidateAnalytics;
  }
}
