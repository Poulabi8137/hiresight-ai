import { NextRequest, NextResponse } from "next/server";
import { getAuthState } from "@/lib/auth";
import { listCandidates } from "@/lib/db";
import { parsePagination } from "@/lib/pagination";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const start = performance.now();
  const auth = await getAuthState();
  if (!auth || auth.role !== "recruiter") {
    return NextResponse.json({ error: "Recruiter authentication is required." }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const { page, limit } = parsePagination({
    page: Number(searchParams.get("page")) || undefined,
    limit: Number(searchParams.get("limit")) || undefined
  });
  const search = searchParams.get("search") || undefined;
  const skill = searchParams.get("skill") || undefined;

  const { data, total, source } = await listCandidates(page, limit, search, skill);
  const elapsed = performance.now() - start;
  if (elapsed > 200) {
    logger.warn("Slow candidates endpoint", { metadata: { elapsed: `${Math.round(elapsed)}ms` } });
  }
  return NextResponse.json({
    candidates: data, data,
    pagination: { page, limit, total, hasMore: page * limit < total },
    source,
    timing: { elapsed: `${Math.round(elapsed)}ms` }
  });
}
