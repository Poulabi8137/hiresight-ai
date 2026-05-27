import { NextResponse } from "next/server";
import { candidates, jobs } from "@/lib/demo-data";
import { scoreCandidate } from "@/lib/ai/scoring";
import { getAuthState } from "@/lib/auth";

export async function POST(request: Request) {
  const auth = await getAuthState();
  if (!auth) {
    return NextResponse.json({ error: "Authentication is required for AI insights." }, { status: 401 });
  }

  const body = await request.json();
  const candidate = candidates.find((item) => item.id === body.candidateId) ?? candidates[0];
  const job = jobs.find((item) => item.id === body.jobId) ?? jobs[0];

  return NextResponse.json({
    candidateId: candidate.id,
    jobId: job.id,
    breakdown: scoreCandidate(candidate, job),
    deterministic: true
  });
}
