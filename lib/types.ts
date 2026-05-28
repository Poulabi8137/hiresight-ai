export type Role = "candidate" | "recruiter";

export type Candidate = {
  id: string;
  name: string;
  title: string;
  location: string;
  avatar: string;
  skills: string[];
  experienceYears: number;
  videoUrl?: string;
  resumeUrl?: string;
  summary: string;
  confidence: number;
  communication: number;
  relevance: number;
};

export type Job = {
  id: string;
  employerId: string;
  title: string;
  company: string;
  location: string;
  mode: "Remote" | "Hybrid" | "Onsite";
  salary: string;
  description: string;
  skills: string[];
  seniority: string;
  status: "open" | "paused" | "closed";
};

export type Application = {
  id: string;
  candidateId: string;
  jobId: string;
  stage: "applied" | "screening" | "shortlisted" | "interview" | "offer" | "rejected";
  matchScore: number;
  createdAt: string;
};

export type UploadRecord = {
  id: string;
  ownerId: string;
  kind: "resume" | "video_resume" | "interview" | "avatar";
  fileName: string;
  url: string;
  contentType: string;
  size: number;
};

export type MatchBreakdown = {
  score: number;
  skillScore: number;
  experienceScore: number;
  signalScore: number;
  missingSkills: string[];
  matchedSkills: string[];
  summary: string;
};
