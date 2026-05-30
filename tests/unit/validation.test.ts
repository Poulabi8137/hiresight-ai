import { describe, it, expect } from "vitest";
import { authSchema, jobSchema, applicationSchema, uploadRequestSchema } from "@/lib/validation";

describe("authSchema", () => {
  it("accepts valid auth payload", () => {
    const result = authSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      role: "candidate"
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = authSchema.safeParse({
      email: "not-an-email",
      password: "password123",
      role: "candidate"
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = authSchema.safeParse({
      email: "test@example.com",
      password: "short",
      role: "candidate"
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid role", () => {
    const result = authSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      role: "admin"
    });
    expect(result.success).toBe(false);
  });
});

describe("jobSchema", () => {
  const validJob = {
    title: "Senior Engineer",
    company: "Acme Corp",
    location: "San Francisco, CA",
    mode: "Hybrid" as const,
    salary: "$150k - $200k",
    description: "We are looking for a senior engineer to join our team and build great products.",
    skills: ["React", "TypeScript", "Node.js"],
    seniority: "Senior"
  };

  it("accepts valid job payload", () => {
    const result = jobSchema.safeParse(validJob);
    expect(result.success).toBe(true);
  });

  it("rejects short title", () => {
    const result = jobSchema.safeParse({ ...validJob, title: "AB" });
    expect(result.success).toBe(false);
  });

  it("rejects short company name", () => {
    const result = jobSchema.safeParse({ ...validJob, company: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid mode", () => {
    const result = jobSchema.safeParse({ ...validJob, mode: "Invalid" });
    expect(result.success).toBe(false);
  });

  it("rejects description under 20 chars", () => {
    const result = jobSchema.safeParse({ ...validJob, description: "Too short" });
    expect(result.success).toBe(false);
  });

  it("rejects empty skills array", () => {
    const result = jobSchema.safeParse({ ...validJob, skills: [] });
    expect(result.success).toBe(false);
  });
});

describe("applicationSchema", () => {
  it("accepts valid application", () => {
    const result = applicationSchema.safeParse({
      candidateId: "cand-123",
      jobId: "job-456"
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing candidateId", () => {
    const result = applicationSchema.safeParse({ jobId: "job-456" });
    expect(result.success).toBe(false);
  });

  it("rejects missing jobId", () => {
    const result = applicationSchema.safeParse({ candidateId: "cand-123" });
    expect(result.success).toBe(false);
  });

  it("rejects empty strings", () => {
    const result = applicationSchema.safeParse({ candidateId: "", jobId: "" });
    expect(result.success).toBe(false);
  });
});

describe("uploadRequestSchema", () => {
  it("accepts valid upload metadata", () => {
    const result = uploadRequestSchema.safeParse({
      fileName: "resume.pdf",
      contentType: "application/pdf",
      size: 1024,
      kind: "resume"
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid kind", () => {
    const result = uploadRequestSchema.safeParse({
      fileName: "test.mp4",
      contentType: "video/mp4",
      size: 1024,
      kind: "document"
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative size", () => {
    const result = uploadRequestSchema.safeParse({
      fileName: "test.pdf",
      contentType: "application/pdf",
      size: -1,
      kind: "resume"
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional signed URL", () => {
    const result = uploadRequestSchema.safeParse({
      fileName: "test.pdf",
      contentType: "application/pdf",
      size: 1024,
      kind: "resume",
      signedUrl: "https://example.com/file.pdf"
    });
    expect(result.success).toBe(true);
  });
});
