import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { scoreCandidate } from "@/lib/ai/scoring";
import { applicationSchema } from "@/lib/validation";
import { getAuthState } from "@/lib/auth";
import { listApplications, createApplication, updateApplicationStage, getCandidate, getJob } from "@/lib/db";
import { parsePagination } from "@/lib/pagination";
import { logger } from "@/lib/logger";
import { assertCSRF } from "@/lib/csrf";

export async function GET(request: NextRequest) {
  const start = performance.now();
  const auth = await getAuthState();
  if (!auth) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const { page, limit } = parsePagination({
    page: Number(searchParams.get("page")) || undefined,
    limit: Number(searchParams.get("limit")) || undefined
  });

  const { data, total, source } = await listApplications(page, limit, auth.userId, auth.role);
  const elapsed = performance.now() - start;
  if (elapsed > 200) {
    logger.warn("Slow applications endpoint", { metadata: { elapsed: `${Math.round(elapsed)}ms` } });
  }
  return NextResponse.json({
    applications: data, data,
    pagination: { page, limit, total, hasMore: page * limit < total },
    source,
    timing: { elapsed: `${Math.round(elapsed)}ms` }
  });
}

export async function POST(request: Request) {
  const csrf = assertCSRF(request); if (csrf) return csrf;
  const start = performance.now();
  const auth = await getAuthState();
  if (!auth || auth.role !== "candidate") {
    return NextResponse.json({ error: "Candidate authentication is required to apply." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid application payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const [candidate, job] = await Promise.all([
    getCandidate(parsed.data.candidateId),
    getJob(parsed.data.jobId)
  ]);

  const match = scoreCandidate(candidate, job);
  const { application, source } = await createApplication({
    candidateId: parsed.data.candidateId,
    jobId: parsed.data.jobId,
    matchScore: match.score
  });

  const elapsed = performance.now() - start;
  if (elapsed > 200) {
    logger.warn("Slow applications POST endpoint", { metadata: { elapsed: `${Math.round(elapsed)}ms` } });
  }
  return NextResponse.json({ application, match, source, timing: { elapsed: `${Math.round(elapsed)}ms` } }, { status: 201 });
}

const stageSchema = z.object({
  applicationId: z.string().min(1),
  stage: z.enum(["applied", "screening", "shortlisted", "interview", "offer", "rejected"])
});

export async function PATCH(request: Request) {
  const csrf = assertCSRF(request); if (csrf) return csrf;
  const start = performance.now();
  const auth = await getAuthState();
  if (!auth || auth.role !== "recruiter") {
    return NextResponse.json({ error: "Recruiter authentication is required." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = stageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid stage update payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { application, source } = await updateApplicationStage(parsed.data.applicationId, parsed.data.stage);
  const elapsed = performance.now() - start;
  if (elapsed > 200) {
    logger.warn("Slow applications PATCH endpoint", { metadata: { elapsed: `${Math.round(elapsed)}ms` } });
  }
  return NextResponse.json({ application, source, timing: { elapsed: `${Math.round(elapsed)}ms` } });
}
