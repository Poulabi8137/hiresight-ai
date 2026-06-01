import { NextRequest, NextResponse } from "next/server";
import { jobSchema } from "@/lib/validation";
import { getAuthState } from "@/lib/auth";
import { listJobs, createJob } from "@/lib/db";
import { parsePagination } from "@/lib/pagination";
import { logger } from "@/lib/logger";
import { assertCSRF } from "@/lib/csrf";

export async function GET(request: NextRequest) {
  const start = performance.now();
  const searchParams = request.nextUrl.searchParams;
  const { page, limit } = parsePagination({
    page: Number(searchParams.get("page")) || undefined,
    limit: Number(searchParams.get("limit")) || undefined
  });
  const search = searchParams.get("search") || undefined;
  const skill = searchParams.get("skill") || undefined;
  const mode = searchParams.get("mode") || undefined;

  const { data, total, source } = await listJobs(page, limit, search, skill, mode);
  const elapsed = performance.now() - start;
  if (elapsed > 200) {
    logger.warn("Slow jobs endpoint", { metadata: { elapsed: `${Math.round(elapsed)}ms`, source } });
  }
  return NextResponse.json({
    jobs: data, data,
    pagination: { page, limit, total, hasMore: page * limit < total },
    source,
    timing: { elapsed: `${Math.round(elapsed)}ms` }
  });
}

export async function POST(request: Request) {
  const csrf = assertCSRF(request); if (csrf) return csrf;
  const auth = await getAuthState();
  if (!auth || auth.role !== "recruiter") {
    return NextResponse.json({ error: "Recruiter authentication is required to post jobs." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = jobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid job payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { job, source } = await createJob({ ...parsed.data, employerId: body.employerId });
  return NextResponse.json({ job, source }, { status: 201 });
}
