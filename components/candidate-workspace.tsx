"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Clock3, FileText, Video, Sparkles, Briefcase, Bookmark, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Job } from "@/lib/types";
import { useUploadsByKind, useSelectedCandidateId } from "@/lib/store";
import { fetchWithTimeout } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LoadingState, LoadingSkeleton } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { OnboardingWalkthrough } from "@/components/onboarding-walkthrough";
import { toast } from "sonner";

export function CandidateWorkspace() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const uploadsByKind = useUploadsByKind();
  const selectedCandidateId = useSelectedCandidateId();

  const hasResume = (uploadsByKind.resume?.length ?? 0) > 0;
  const hasVideoResume = (uploadsByKind.video_resume?.length ?? 0) > 0;
  const hasInterview = (uploadsByKind.interview?.length ?? 0) > 0;
  const completed = [hasResume, hasVideoResume, hasInterview].filter(Boolean).length;
  const profileStrength = Math.round((completed / 3) * 100);

  const profileSteps: Array<[string, string, LucideIcon, number]> = [
    ["Resume PDF", hasResume ? "Uploaded and parsed successfully" : "Upload your resume to get started", FileText, hasResume ? 100 : 0],
    ["Video resume", hasVideoResume ? "Communication signal ready for recruiters" : "Record a video introduction", Video, hasVideoResume ? 100 : 0],
    ["Interview sample", hasInterview ? "Interview sample uploaded" : "Optional — recommended for better matching", Clock3, hasInterview ? 100 : 42]
  ];

  useEffect(() => {
    let cancelled = false;
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Failed to load jobs.");
          return;
        }
        setJobs(data.jobs ?? []);
      } catch {
        if (!cancelled) setError("Could not connect to job service.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchJobs();
    return () => { cancelled = true; };
  }, []);

  const profileLabel = useMemo(() => {
    if (!hasResume) return "Start by uploading your resume";
    if (!hasVideoResume) return "Add a video resume to improve visibility";
    if (!hasInterview) return "Add an interview sample for higher match confidence";
    return "Complete profile — you're ready for recruiters.";
  }, [hasResume, hasVideoResume, hasInterview]);

  return (
    <>
      <OnboardingWalkthrough role="candidate" />
      <main className="container py-8 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <Badge variant="primary">
          <Sparkles className="mr-1 h-3.5 w-3.5" />
          Candidate studio
        </Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Build your profile</h1>
        <p className="mt-2 text-muted-foreground">
          Upload your resume, record a video pitch, and get AI-matched jobs.
        </p>
      </div>

      {/* Profile Strength + Steps grid */}
      <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_0.45fr]">
        <div className="space-y-4">
          {profileSteps.map(([title, copy, Icon, value]) => (
            <div
              key={String(title)}
              className="glass rounded-xl p-5 card-hover"
            >
              <div className="flex items-start gap-4">
                <span className={`rounded-xl p-3 ${value === 100 ? "bg-green-500/15 text-green-600 dark:text-green-400" : "bg-primary/15 text-primary"}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-semibold">{title}</h2>
                    {value === 100 && <Badge variant="success" size="sm">Complete</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
                  <Progress value={value} className="mt-3" aria-label={`${title} ${value}% complete`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Card className="glass h-fit">
          <CardHeader>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              Profile strength
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="font-display text-5xl font-bold" role="meter" aria-valuenow={profileStrength} aria-valuemin={0} aria-valuemax={100} aria-label={`Profile ${profileStrength}% complete`}>
                {profileStrength}%
              </div>
              <Progress value={profileStrength} className="mt-4" aria-label={`Profile strength ${profileStrength}%`} />
              <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">{profileLabel}</p>
              <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                <a href="/upload">Complete profile</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs section */}
      <section>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Recommended jobs</h2>
            <p className="text-sm text-muted-foreground">Matched to your profile and skills.</p>
          </div>
          <Badge variant="primary" className="hidden sm:inline-flex">{jobs.length} open roles</Badge>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass">
                <CardContent className="p-5">
                  <LoadingSkeleton lines={3} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <ErrorState title="Failed to load jobs" message={error} onRetry={() => window.location.reload()} />
        ) : jobs.length === 0 ? (
          <EmptyState icon={Briefcase} title="No open roles at the moment" description="Check back later for new opportunities." />
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                applyingJobId={applyingJobId}
                selectedCandidateId={selectedCandidateId}
                onApply={setApplyingJobId}
              />
            ))}
          </div>
        )}
      </section>
    </main>
    </>
  );
}

const JobCard = memo(function JobCard({
  job,
  applyingJobId,
  selectedCandidateId,
  onApply
}: {
  job: Job;
  applyingJobId: string | null;
  selectedCandidateId: string;
  onApply: (id: string | null) => void;
}) {
  return (
    <Card className="glass card-hover">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{job.company}</span>
              <span aria-hidden="true">·</span>
              <span>{job.mode}</span>
              {job.salary && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{job.salary}</span>
                </>
              )}
            </div>
            <h3 className="mt-1 text-lg font-semibold">{job.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-2">{job.description}</p>
          </div>
          <Badge variant="primary" className="shrink-0 self-start">89% fit</Badge>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {job.skills.map((skill) => <Badge key={skill} variant="outline" size="sm">{skill}</Badge>)}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            size="sm"
            disabled={applyingJobId === job.id}
            aria-label={applyingJobId === job.id ? `Applying to ${job.title}` : `Apply to ${job.title}`}
            onClick={async () => {
              onApply(job.id);
              try {
                const res = await fetchWithTimeout("/api/applications", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ candidateId: selectedCandidateId, jobId: job.id })
                });
                if (res.ok) {
                  toast.success("Application submitted successfully");
                } else {
                  toast.error("Failed to submit application");
                }
              } catch {
                toast.error("Network error while applying");
              } finally {
                onApply(null);
              }
            }}
          >
            <ArrowRight className="h-4 w-4" />
            {applyingJobId === job.id ? "Applying\u2026" : "Apply"}
          </Button>
          <Button size="sm" variant="outline" aria-label={`Save ${job.title}`}>
            <Bookmark className="h-4 w-4" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
