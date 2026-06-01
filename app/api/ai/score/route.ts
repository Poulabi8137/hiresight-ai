import { NextResponse } from "next/server";
import { scoreCandidate } from "@/lib/ai/scoring";
import { getCandidate, getJob, getCachedScore, cacheScore } from "@/lib/db";
import { getAuthState } from "@/lib/auth";
import { logger, generateRequestId } from "@/lib/logger";
import { assertCSRF } from "@/lib/csrf";

export async function POST(request: Request) {
  const csrf = assertCSRF(request); if (csrf) return csrf;
  const requestId = generateRequestId();
  const auth = await getAuthState();
  if (!auth) {
    return NextResponse.json({ error: "Authentication is required for AI insights." }, { status: 401 });
  }

  const body = await request.json();
  const { candidateId, jobId } = body;
  if (!candidateId || !jobId) {
    return NextResponse.json({ error: "candidateId and jobId are required." }, { status: 400 });
  }

  // Check cache
  const cached = await getCachedScore(candidateId, jobId);
  if (cached) {
    return NextResponse.json({
      candidateId,
      jobId,
      breakdown: cached,
      deterministic: true,
      cached: true
    });
  }

  const [candidate, job] = await Promise.all([
    getCandidate(candidateId),
    getJob(jobId)
  ]);

  const breakdown = scoreCandidate(candidate, job);

  // Cache asynchronously (don't block response)
  cacheScore({
    candidateId, jobId,
    score: breakdown.score,
    skillScore: breakdown.skillScore,
    experienceScore: breakdown.experienceScore,
    signalScore: breakdown.signalScore,
    matchedSkills: breakdown.matchedSkills,
    missingSkills: breakdown.missingSkills,
    summary: breakdown.summary
  }).then(() => {
    logger.debug("Score cached", { requestId, metadata: { candidateId, jobId } });
  });

  return NextResponse.json({
    candidateId: candidate.id,
    jobId: job.id,
    breakdown,
    deterministic: true,
    cached: false
  });
}
