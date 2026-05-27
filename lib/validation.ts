import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["candidate", "recruiter"])
});

export const jobSchema = z.object({
  title: z.string().min(3),
  company: z.string().min(2),
  location: z.string().min(2),
  mode: z.enum(["Remote", "Hybrid", "Onsite"]),
  salary: z.string().min(2),
  description: z.string().min(20),
  skills: z.array(z.string().min(1)).min(1),
  seniority: z.string().min(2)
});

export const applicationSchema = z.object({
  candidateId: z.string().min(1),
  jobId: z.string().min(1)
});

export const uploadRequestSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().positive(),
  kind: z.enum(["resume", "video_resume", "interview"]),
  bucket: z.enum(["resumes", "videos", "avatars"]).optional(),
  storagePath: z.string().min(1).optional(),
  signedUrl: z.string().url().optional()
});
