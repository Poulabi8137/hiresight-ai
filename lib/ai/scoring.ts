import type { Candidate, Job, MatchBreakdown } from "@/lib/types";

const normalize = (value: string) => value.trim().toLowerCase();

export function scoreCandidate(candidate: Candidate, job: Job): MatchBreakdown {
  const candidateSkills = new Set(candidate.skills.map(normalize));
  const requiredSkills = job.skills.map(normalize);
  const matchedSkills = job.skills.filter((skill) => candidateSkills.has(normalize(skill)));
  const missingSkills = job.skills.filter((skill) => !candidateSkills.has(normalize(skill)));

  const skillScore = requiredSkills.length
    ? (matchedSkills.length / requiredSkills.length) * 100
    : 80;
  const experienceScore = Math.min(100, 55 + candidate.experienceYears * 8);
  const signalScore = candidate.confidence * 0.35 + candidate.communication * 0.35 + candidate.relevance * 0.3;
  const score = Math.round(skillScore * 0.48 + experienceScore * 0.2 + signalScore * 0.32);

  return {
    score,
    skillScore: Math.round(skillScore),
    experienceScore: Math.round(experienceScore),
    signalScore: Math.round(signalScore),
    missingSkills,
    matchedSkills,
    summary: `${candidate.name} matches ${matchedSkills.length}/${job.skills.length} priority skills with strong video communication signals and ${candidate.experienceYears} years of relevant experience.`
  };
}

export function extractKeywords(text: string) {
  const common = new Set(["and", "the", "with", "for", "from", "that", "this", "into", "have", "will"]);
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s.+#-]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 3 && !common.has(word))
    )
  ).slice(0, 12);
}

export function summarizeCandidate(candidate: Candidate) {
  const topSkills = candidate.skills.slice(0, 3).join(", ");
  return `${candidate.name} is a ${candidate.title} with standout signals in ${topSkills}. Video review suggests ${candidate.communication}% communication strength and ${candidate.confidence}% confidence.`;
}
