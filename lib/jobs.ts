import { registerJobHandler, enqueueJob } from "@/lib/job-queue";
import { scoreCandidate, matchSkills } from "@/lib/ai/scoring";
import { getCandidate, getJob, cacheScore, saveParsedResume } from "@/lib/db";
import { logger } from "@/lib/logger";
import { track } from "@/lib/monitoring";

// ---------------------------------------------------------------------------
// AI Scoring Job
// ---------------------------------------------------------------------------

registerJobHandler("ai-score", async (job) => {
  const { candidateId, jobId } = job.payload as { candidateId: string; jobId: string };

  const [candidate, jobData] = await Promise.all([
    getCandidate(candidateId),
    getJob(jobId)
  ]);

  const breakdown = scoreCandidate(candidate, jobData);

  await cacheScore({
    candidateId, jobId,
    score: breakdown.score,
    skillScore: breakdown.skillScore,
    experienceScore: breakdown.experienceScore,
    signalScore: breakdown.signalScore,
    matchedSkills: breakdown.matchedSkills,
    missingSkills: breakdown.missingSkills,
    summary: breakdown.summary
  });

  logger.info("AI score cached via job queue", {
    metadata: { candidateId, jobId, score: breakdown.score }
  });
});

export function enqueueScore(candidateId: string, jobId: string): void {
  enqueueJob("ai-score", { candidateId, jobId });
}

// ---------------------------------------------------------------------------
// Resume Parsing Job
// ---------------------------------------------------------------------------

registerJobHandler("parse-resume", async (job) => {
  const { candidateId, bucket, path } = job.payload as {
    candidateId: string;
    bucket: string;
    path: string;
  };

  // Resume parsing is handled by the API route synchronously for now.
  // This job placeholder allows future async processing.
  logger.info("Resume parse job triggered", {
    metadata: { candidateId, bucket, path }
  });
});

export function enqueueResumeParse(candidateId: string, bucket: string, path: string): void {
  enqueueJob("parse-resume", { candidateId, bucket, path });
}
