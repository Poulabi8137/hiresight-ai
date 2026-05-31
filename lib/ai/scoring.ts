import type { Candidate, Job, MatchBreakdown } from "@/lib/types";

const normalize = (value: string) => value.trim().toLowerCase();

const SKILL_WEIGHTS: Record<string, number> = {
  "react": 1.2, "typescript": 1.1, "python": 1.0, "sql": 0.9, "aws": 1.0,
  "docker": 0.8, "kubernetes": 0.8, "node.js": 1.1, "next.js": 1.2,
  "postgresql": 0.9, "graphql": 1.0, "machine learning": 1.0, "api": 0.8,
  "leadership": 1.0, "communication": 0.7, "agile": 0.6, "git": 0.5
};

// Semantic aliases for skill matching
const SKILL_ALIASES: Record<string, string[]> = {
  "react": ["react.js", "reactjs", "react native"],
  "typescript": ["ts", "type script"],
  "node.js": ["node", "nodejs", "node js", "express"],
  "next.js": ["next", "nextjs", "next js"],
  "python": ["python3"],
  "aws": ["amazon web services", "ec2", "s3", "lambda"],
  "docker": ["container", "containers"],
  "kubernetes": ["k8s", "kube"],
  "postgresql": ["postgres", "psql"],
  "machine learning": ["ml", "ai", "deep learning"],
  "sql": ["mysql", "postgresql", "database"],
  "leadership": ["lead", "managing", "management"],
  "communication": ["comm", "presentation"],
};

function normalizeSkill(skill: string): string {
  const n = normalize(skill);
  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    if (aliases.includes(n)) return canonical;
  }
  return n;
}

function isCriticalSkill(skill: string): boolean {
  const critical = ["react", "typescript", "python", "aws", "docker", "kubernetes",
    "node.js", "next.js", "postgresql", "sql", "machine learning", "leadership",
    "api", "graphql", "agile", "git"];
  const n = normalizeSkill(skill);
  return critical.includes(n);
}

type MatchDetail = {
  skill: string;
  matched: string | null;
  weight: number;
  critical: boolean;
};

export function matchSkills(candidateSkills: string[], requiredSkills: string[]): {
  matched: string[];
  missing: string[];
  details: MatchDetail[];
  weightedScore: number;
} {
  const candNormalized = new Set(candidateSkills.map(normalizeSkill));
  const details: MatchDetail[] = [];

  for (const skill of requiredSkills) {
    const n = normalizeSkill(skill);
    const weight = SKILL_WEIGHTS[n] ?? 0.7;
    const critical = isCriticalSkill(skill);
    const matched = candNormalized.has(n) ? skill : null;
    details.push({ skill, matched, weight, critical });
  }

  const matched = details.filter((d) => d.matched).map((d) => d.matched!);
  const missing = details.filter((d) => !d.matched).map((d) => d.skill);

  const totalWeight = details.reduce((s, d) => s + d.weight, 0);
  const earnedWeight = details.filter((d) => d.matched).reduce((s, d) => s + d.weight, 0);
  const weightedScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 80;

  return { matched, missing, details, weightedScore };
}

export function scoreCandidate(candidate: Candidate, job: Job): MatchBreakdown {
  const { matched, missing, weightedScore } = matchSkills(candidate.skills, job.skills);
  const hasAllCritical = !missing.some((s) => isCriticalSkill(s));

  const skillScore = weightedScore;
  const experienceScore = Math.min(100, 55 + candidate.experienceYears * 8);
  const signalScore = candidate.confidence * 0.35 + candidate.communication * 0.35 + candidate.relevance * 0.3;

  // Penalize if critical skills are missing
  const criticalPenalty = hasAllCritical ? 0 : 10;
  const score = Math.round(Math.max(0, Math.min(100,
    skillScore * 0.48 + experienceScore * 0.2 + signalScore * 0.32 - criticalPenalty
  )));

  const missingCritical = missing.filter((s) => isCriticalSkill(s));
  const explanation = missingCritical.length > 0
    ? `Missing critical skills: ${missingCritical.join(", ")}`
    : "All critical skills covered";

  const strengths = matched.length > 0
    ? [`Strong match in ${matched.slice(0, 3).join(", ")}`, `${candidate.experienceYears}+ years of relevant experience`, "Communication clarity aligns with role requirements"]
    : ["Communication clarity aligns with role requirements"];

  const weaknesses = missingCritical.length > 0
    ? [`Missing critical: ${missingCritical.join(", ")}`]
    : missing.length > 0
    ? [`Could improve: ${missing.join(", ")}`]
    : [];

  const confidence = Math.round(
    70 +
    (matched.length / Math.max(job.skills.length, 1)) * 15 +
    (candidate.experienceYears >= 3 ? 10 : candidate.experienceYears >= 1 ? 5 : 0) +
    (candidate.communication > 70 ? 5 : 0)
  );

  return {
    score,
    skillScore: Math.round(skillScore),
    experienceScore: Math.round(experienceScore),
    signalScore: Math.round(signalScore),
    missingSkills: missing,
    matchedSkills: matched,
    strengths,
    weaknesses,
    confidence: Math.min(99, confidence),
    summary: `${candidate.name} matches ${matched.length}/${job.skills.length} priority skills. ${explanation}.`
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
