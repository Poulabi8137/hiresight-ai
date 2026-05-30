import { describe, it, expect } from "vitest";
import { scoreCandidate, matchSkills, extractKeywords, summarizeCandidate } from "@/lib/ai/scoring";
import type { Candidate, Job } from "@/lib/types";

const makeCandidate = (overrides: Partial<Candidate> = {}): Candidate => ({
  id: "cand-1",
  name: "Test Candidate",
  title: "Engineer",
  location: "SF",
  avatar: "TC",
  skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
  experienceYears: 5,
  summary: "",
  confidence: 85,
  communication: 90,
  relevance: 88,
  ...overrides
});

const makeJob = (overrides: Partial<Job> = {}): Job => ({
  id: "job-1",
  employerId: "emp-1",
  title: "Senior Engineer",
  company: "Acme",
  location: "SF",
  mode: "Hybrid",
  salary: "$150k",
  description: "Build great things",
  skills: ["React", "TypeScript", "AWS", "Docker"],
  seniority: "Senior",
  status: "open",
  ...overrides
});

describe("matchSkills", () => {
  it("matches overlapping skills exactly", () => {
    const result = matchSkills(
      ["React", "TypeScript", "Node.js"],
      ["React", "TypeScript", "AWS"]
    );
    expect(result.matched).toEqual(["React", "TypeScript"]);
    expect(result.missing).toEqual(["AWS"]);
    expect(result.weightedScore).toBeGreaterThan(0);
    expect(result.weightedScore).toBeLessThan(100);
  });

  it("handles semantic aliases (React.js → React)", () => {
    const result = matchSkills(
      ["React.js", "TS"],
      ["React", "Typescript"]
    );
    expect(result.matched).toContain("React");
  });

  it("returns 100% when all skills match", () => {
    const result = matchSkills(
      ["React", "TypeScript", "AWS"],
      ["React", "TypeScript", "AWS"]
    );
    expect(result.missing).toEqual([]);
    expect(result.weightedScore).toBe(100);
  });

  it("handles empty skill lists", () => {
    const result = matchSkills([], []);
    expect(result.matched).toEqual([]);
    expect(result.missing).toEqual([]);
    expect(result.weightedScore).toBe(80);
  });

  it("flags critical missing skills", () => {
    const result = matchSkills(
      ["CSS"],
      ["React", "TypeScript", "AWS"]
    );
    expect(result.missing.length).toBe(3);
    const critical = result.details.filter((d) => d.critical && !d.matched);
    expect(critical.length).toBeGreaterThan(0);
  });
});

describe("scoreCandidate", () => {
  it("computes a match breakdown with all fields", () => {
    const breakdown = scoreCandidate(makeCandidate(), makeJob());
    expect(breakdown.score).toBeGreaterThanOrEqual(0);
    expect(breakdown.score).toBeLessThanOrEqual(100);
    expect(breakdown.skillScore).toBeGreaterThan(0);
    expect(breakdown.experienceScore).toBeGreaterThan(0);
    expect(breakdown.signalScore).toBeGreaterThan(0);
    expect(breakdown.matchedSkills.length).toBeGreaterThan(0);
    expect(breakdown.summary).toContain("Test Candidate");
  });

  it("penalizes missing critical skills", () => {
    const candidate = makeCandidate({ skills: ["CSS", "HTML"] });
    const job = makeJob({ skills: ["React", "TypeScript", "AWS", "Docker"] });
    const breakdown = scoreCandidate(candidate, job);
    expect(breakdown.matchedSkills).toEqual([]);
    expect(breakdown.missingSkills.length).toBe(4);
    // Should have a penalty reflected in the score
    expect(breakdown.summary).toContain("Missing critical");
  });

  it("rewards full skill coverage", () => {
    const candidate = makeCandidate({ skills: ["React", "TypeScript", "AWS", "Docker"] });
    const job = makeJob({ skills: ["React", "TypeScript", "AWS", "Docker"] });
    const breakdown = scoreCandidate(candidate, job);
    expect(breakdown.matchedSkills.length).toBe(4);
    expect(breakdown.missingSkills).toEqual([]);
    expect(breakdown.score).toBeGreaterThanOrEqual(80);
  });

  it("handles zero experience edge case", () => {
    const candidate = makeCandidate({ experienceYears: 0 });
    const breakdown = scoreCandidate(candidate, makeJob());
    expect(breakdown.experienceScore).toBe(55);
    expect(breakdown.score).toBeGreaterThanOrEqual(0);
  });

  it("caps experience score at 100", () => {
    const candidate = makeCandidate({ experienceYears: 20 });
    const breakdown = scoreCandidate(candidate, makeJob());
    expect(breakdown.experienceScore).toBe(100);
  });
});

describe("extractKeywords", () => {
  it("extracts meaningful keywords from text", () => {
    const keywords = extractKeywords("React development with TypeScript and Node.js backend");
    expect(keywords.length).toBeGreaterThan(0);
    expect(keywords).toContain("react");
    expect(keywords).toContain("typescript");
  });

  it("filters common stop words", () => {
    const keywords = extractKeywords("the and with for from that this into have will");
    expect(keywords.length).toBe(0);
  });

  it("handles empty text", () => {
    expect(extractKeywords("")).toEqual([]);
  });

  it("limits to 12 keywords", () => {
    const text = Array.from({ length: 20 }, (_, i) => `keyword${i}`).join(" ");
    expect(extractKeywords(text).length).toBeLessThanOrEqual(12);
  });
});

describe("summarizeCandidate", () => {
  it("generates a summary with candidate name and skills", () => {
    const cand = makeCandidate();
    const summary = summarizeCandidate(cand);
    expect(summary).toContain("Test Candidate");
    expect(summary).toContain("Engineer");
    expect(summary).toContain("90%");
  });
});
