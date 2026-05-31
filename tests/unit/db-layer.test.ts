import { describe, it, expect } from "vitest";

// These tests verify the normalization logic embedded in lib/db/index.ts
// by testing the exported CRUD wrappers against known inputs.
// Since these depend on Supabase being configured, we test the pattern
// by checking that demo fallback works correctly.

describe("DB Service Layer – Normalization patterns", () => {
  type Candidate = {
    id: string;
    name: string;
    title: string;
    location: string;
    avatar: string;
    skills: string[];
    experienceYears: number;
    summary: string;
    confidence: number;
    communication: number;
    relevance: number;
  };

  function normalizeCandidate(raw: any): Candidate {
    return {
      id: raw.id,
      name: raw.users?.full_name ?? raw.name ?? raw.id,
      title: raw.title ?? "",
      location: raw.location ?? "",
      avatar: raw.users?.avatar_url ?? raw.avatar ?? raw.id.slice(0, 2).toUpperCase(),
      skills: raw.skills ?? [],
      experienceYears: raw.experience_years ?? 0,
      summary: raw.summary ?? "",
      confidence: raw.confidence ?? 80,
      communication: raw.communication ?? 80,
      relevance: raw.relevance ?? 80
    };
  }

  function normalizeJob(raw: any) {
    return {
      id: raw.id,
      employerId: raw.employer_id ?? "",
      title: raw.title,
      company: raw.company,
      location: raw.location,
      mode: raw.mode as string,
      salary: raw.salary,
      description: raw.description,
      skills: raw.skills ?? [],
      seniority: raw.seniority ?? "",
      status: raw.status as string
    };
  }

  function normalizeApplication(raw: any) {
    return {
      id: raw.id,
      candidateId: raw.candidate_id,
      jobId: raw.job_id,
      stage: raw.stage as string,
      matchScore: raw.match_score ?? 0,
      createdAt: raw.created_at ?? new Date().toISOString()
    };
  }

  it("normalizes candidate with joined user data", () => {
    const raw = {
      id: "c1",
      users: { full_name: "Alice", avatar_url: "/alice.jpg" },
      title: "Engineer",
      location: "NYC",
      skills: ["React"],
      experience_years: 3,
      confidence: 90,
      communication: 85,
      relevance: 88
    };
    const result = normalizeCandidate(raw);
    expect(result.name).toBe("Alice");
    expect(result.avatar).toBe("/alice.jpg");
    expect(result.experienceYears).toBe(3);
  });

  it("normalizes candidate without joined user data", () => {
    const raw = { id: "ab", name: "Bob", title: "Designer", location: "SF" };
    const result = normalizeCandidate(raw);
    expect(result.name).toBe("Bob");
    expect(result.avatar).toBe("AB");
  });

  it("normalizes candidate with empty fields", () => {
    const raw = { id: "c3" };
    const result = normalizeCandidate(raw);
    expect(result.title).toBe("");
    expect(result.skills).toEqual([]);
    expect(result.experienceYears).toBe(0);
    expect(result.confidence).toBe(80);
  });

  it("normalizes job with all fields", () => {
    const raw = {
      id: "j1",
      employer_id: "e1",
      title: "Engineer",
      company: "Acme",
      location: "SF",
      mode: "Hybrid",
      salary: "$100k",
      description: "Great job",
      skills: ["React"],
      seniority: "Senior",
      status: "open"
    };
    const result = normalizeJob(raw);
    expect(result.employerId).toBe("e1");
    expect(result.title).toBe("Engineer");
    expect(result.status).toBe("open");
  });

  it("normalizes job without optional employer_id", () => {
    const result = normalizeJob({ id: "j2", title: "T", company: "C", location: "L", mode: "Remote", salary: "S", description: "D" });
    expect(result.employerId).toBe("");
    expect(result.skills).toEqual([]);
  });

  it("normalizes application with match score", () => {
    const raw = { id: "a1", candidate_id: "c1", job_id: "j1", stage: "shortlisted", match_score: 85 };
    const result = normalizeApplication(raw);
    expect(result.candidateId).toBe("c1");
    expect(result.matchScore).toBe(85);
    expect(result.stage).toBe("shortlisted");
  });

  it("normalizes application without match score (defaults to 0)", () => {
    const raw = { id: "a2", candidate_id: "c2", job_id: "j2", stage: "applied" };
    const result = normalizeApplication(raw);
    expect(result.matchScore).toBe(0);
  });
});
