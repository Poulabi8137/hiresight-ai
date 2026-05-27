import type { Application, Candidate, Job } from "@/lib/types";

export const candidates: Candidate[] = [
  {
    id: "cand-ava",
    name: "Ava Raman",
    title: "Product Designer turned Frontend Engineer",
    location: "Bengaluru, IN",
    avatar: "AR",
    skills: ["React", "Design Systems", "TypeScript", "Motion", "User Research"],
    experienceYears: 4,
    videoUrl: "/demo-videos/strong-ai-interview.mp4",
    resumeUrl: "/demo/ava-resume.pdf",
    summary:
      "Ava communicates design intent with unusual clarity and translates product ambiguity into polished React experiences.",
    confidence: 92,
    communication: 95,
    relevance: 91
  },
  {
    id: "cand-marcus",
    name: "Marcus Lee",
    title: "Full-stack AI Engineer",
    location: "Austin, TX",
    avatar: "ML",
    skills: ["Next.js", "PostgreSQL", "Supabase", "LLM Apps", "Node.js"],
    experienceYears: 6,
    videoUrl: "/demo-videos/strong-ai-interview.mp4",
    resumeUrl: "/demo/marcus-resume.pdf",
    summary:
      "Marcus balances systems thinking with customer empathy and has shipped AI workflow tools from zero to revenue.",
    confidence: 88,
    communication: 86,
    relevance: 94
  },
  {
    id: "cand-zoya",
    name: "Zoya Fernandes",
    title: "Customer Success Strategist",
    location: "Toronto, CA",
    avatar: "ZF",
    skills: ["Enterprise SaaS", "Onboarding", "Analytics", "Storytelling", "CRM"],
    experienceYears: 5,
    videoUrl: "/demo-videos/average-ai-interview.mp4",
    resumeUrl: "/demo/zoya-resume.pdf",
    summary:
      "Zoya presents with strong executive presence and turns customer narratives into measurable expansion plans.",
    confidence: 96,
    communication: 97,
    relevance: 82
  }
];

export const jobs: Job[] = [
  {
    id: "job-ai-product-engineer",
    employerId: "emp-nova",
    title: "AI Product Engineer",
    company: "NovaWorks",
    location: "San Francisco, CA",
    mode: "Hybrid",
    salary: "$145k - $185k",
    description:
      "Build human-centered AI workflows for operations teams, from prototype through production.",
    skills: ["Next.js", "React", "PostgreSQL", "LLM Apps", "TypeScript"],
    seniority: "Senior",
    status: "open"
  },
  {
    id: "job-growth-designer",
    employerId: "emp-nova",
    title: "Growth Product Designer",
    company: "NovaWorks",
    location: "Remote",
    mode: "Remote",
    salary: "$120k - $155k",
    description:
      "Design cinematic onboarding and conversion surfaces for a premium B2B platform.",
    skills: ["Design Systems", "Motion", "User Research", "Figma", "React"],
    seniority: "Mid-Senior",
    status: "open"
  }
];

export const applications: Application[] = [
  {
    id: "app-1",
    candidateId: "cand-marcus",
    jobId: "job-ai-product-engineer",
    stage: "shortlisted",
    matchScore: 94,
    createdAt: "2026-05-20T10:00:00.000Z"
  },
  {
    id: "app-2",
    candidateId: "cand-ava",
    jobId: "job-growth-designer",
    stage: "interview",
    matchScore: 92,
    createdAt: "2026-05-21T12:30:00.000Z"
  },
  {
    id: "app-3",
    candidateId: "cand-zoya",
    jobId: "job-growth-designer",
    stage: "screening",
    matchScore: 81,
    createdAt: "2026-05-22T08:15:00.000Z"
  }
];
