"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  Gauge,
  MessageSquareText,
  Radar,
  ScanFace,
  Sparkles,
  X,
  Zap,
  BarChart3,
  Clock,
  Target,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Application, Candidate, Job } from "@/lib/types";
import { scoreCandidate } from "@/lib/ai/scoring";
import { useHireSightStore, useSelectedCandidateId } from "@/lib/store";
import { fetchWithTimeout, initials } from "@/lib/utils";
import { AnimatedCounter } from "@/components/animated-counter";
import { PremiumTiltCard } from "@/components/premium-tilt-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { OnboardingWalkthrough } from "@/components/onboarding-walkthrough";
import { toast } from "sonner";

const PipelineBoard = dynamic(
  () => import("@/components/pipeline-board").then((m) => m.PipelineBoard),
  { ssr: false }
);

const VideoInterviewPlayer = dynamic(
  () => import("@/components/video-interview-player").then((m) => m.VideoInterviewPlayer),
  { ssr: false }
);

const AiMatchVisualization = dynamic(
  () => import("@/components/ai-match-visualization").then((m) => m.AiMatchVisualization),
  { ssr: false }
);

const stages = ["applied", "screening", "shortlisted", "interview", "offer"] as const;

type FetchState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
};

export function RecruiterWorkspace() {
  const selectedCandidateId = useSelectedCandidateId();
  const setSelectedCandidateId = useHireSightStore((s) => s.setSelectedCandidateId);
  const [fullscreen, setFullscreen] = useState(false);
  const [decisionState, setDecisionState] = useState<"idle" | "shortlisting" | "shortlisted" | "noting" | "noted">("idle");
  const [noteInput, setNoteInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [notes, setNotes] = useState<{ id: string; note: string; createdAt: string }[]>([]);
  const shouldReduceMotion = useReducedMotion();

  const [candidates, setCandidates] = useState<FetchState<Candidate[]>>({ data: [], loading: true, error: null });
  const [jobs, setJobs] = useState<FetchState<Job[]>>({ data: [], loading: true, error: null });
  const [applications, setApplications] = useState<FetchState<Application[]>>({ data: [], loading: true, error: null });

  const fetchAll = useCallback(async () => {
    const results = await Promise.allSettled([
      fetchWithTimeout("/api/candidates").then((r) => r.json()),
      fetchWithTimeout("/api/jobs").then((r) => r.json()),
      fetchWithTimeout("/api/applications").then((r) => r.json())
    ]);

    const [candResult, jobsResult, appsResult] = results;

    if (candResult.status === "fulfilled" && candResult.value.candidates) {
      setCandidates({ data: candResult.value.candidates, loading: false, error: null });
    } else {
      setCandidates({ data: [], loading: false, error: "Failed to load candidates." });
    }

    if (jobsResult.status === "fulfilled" && jobsResult.value.jobs) {
      setJobs({ data: jobsResult.value.jobs, loading: false, error: null });
    } else {
      setJobs({ data: [], loading: false, error: "Failed to load jobs." });
    }

    if (appsResult.status === "fulfilled" && appsResult.value.applications) {
      setApplications({ data: appsResult.value.applications, loading: false, error: null });
    } else {
      setApplications({ data: [], loading: false, error: "Failed to load applications." });
    }
  }, []);

  useEffect(() => { void fetchAll();   }, [fetchAll]);

  const loading = candidates.loading || jobs.loading || applications.loading;
  const hasError = candidates.error || jobs.error || applications.error;
  const primaryJob = jobs.data[0] ?? null;

  const selected = useMemo(
    () => candidates.data.find((c) => c.id === selectedCandidateId) ?? candidates.data[0] ?? null,
    [candidates.data, selectedCandidateId]
  );

  useEffect(() => {
    if (!selected?.id) return;
    fetchWithTimeout(`/api/recruiter/notes?candidateId=${selected.id}`)
      .then((r) => r.json())
      .then((data) => { if (data.notes) setNotes(data.notes); })
      .catch(() => {});
  }, [selected?.id]);

  const breakdown = useMemo(
    () => (selected && primaryJob ? scoreCandidate(selected, primaryJob) : null),
    [selected, primaryJob]
  );

  const rankedCandidates = useMemo(
    () =>
      candidates.data
        .map((c) => ({ candidate: c, match: primaryJob ? scoreCandidate(c, primaryJob).score : 0 }))
        .sort((a, b) => b.match - a.match),
    [candidates.data, primaryJob]
  );

  const stageCounts = useMemo(
    () =>
      stages.reduce(
        (acc, stage) => {
          acc[stage] = applications.data.filter((app) => app.stage === stage).length;
          return acc;
        },
        {} as Record<(typeof stages)[number], number>
      ),
    [applications.data]
  );

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 2200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (loading) {
    return (
      <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center cinematic-mesh">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading talent pipeline…</p>
        </div>
      </main>
    );
  }

  if (hasError) {
    return (
      <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center cinematic-mesh">
        <div className="max-w-md text-center">
          <p className="text-lg font-semibold text-destructive">Failed to load data</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {candidates.error ?? jobs.error ?? applications.error}
          </p>
          <Button className="mt-6" onClick={() => void fetchAll()}>
            Retry
          </Button>
        </div>
      </main>
    );
  }

  if (candidates.data.length === 0) {
    return (
      <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center cinematic-mesh">
        <div className="max-w-md text-center">
          <Radar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-2xl font-semibold">No candidates yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Candidates who complete their video profile and upload a resume will appear here.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <OnboardingWalkthrough role="recruiter" />
      <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden cinematic-mesh">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:48px_48px] dark:opacity-25" />
      <div aria-hidden className="pointer-events-none absolute -left-32 top-16 -z-10 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-40 top-40 -z-10 h-80 w-80 rounded-full bg-orange-400/12 blur-3xl" />

      <div className="container space-y-8 py-8 lg:py-10">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl">
            <Badge className="border-primary/25 bg-primary/10 text-primary">
              <Radar className="mr-1.5 h-3.5 w-3.5" />
              Recruiter command theater
            </Badge>
            <h1 className="heading-display font-display mt-4 text-4xl sm:text-5xl lg:text-[3.25rem] lg:leading-[1.05]">
              Review talent like a premiere, not a spreadsheet.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Immersive video evidence, explainable AI scoring, and pipeline motion — built for high-signal hiring decisions.
            </p>
          </div>

          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-4 gap-3 sm:gap-4"
          >
            {([
              ["Candidates", rankedCandidates.length, "total", Users],
              ["Top match", breakdown?.score ?? 0, "% match", Target],
              ["Pipeline", applications.data.filter((a) => a.stage !== "offer").length, "active", BarChart3],
              ["Avg score", Math.round(rankedCandidates.reduce((s, c) => s + c.match, 0) / Math.max(rankedCandidates.length, 1)), "%", Gauge]
            ] as const).map(([label, value, suffix, Icon]) => (
              <motion.div
                key={label}
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                whileHover={shouldReduceMotion ? undefined : { y: -3, transition: { duration: 0.2 } }}
                className="glass rounded-xl px-3 py-3 text-center sm:px-4 sm:py-4 cursor-default"
              >
                <Icon className="mx-auto h-4 w-4 text-primary mb-1" />
                <p className="section-kicker">{label}</p>
                <p className="mt-0.5 font-display text-xl font-semibold sm:text-2xl">
                  {typeof value === "number" ? <AnimatedCounter value={value} /> : value}
                  {typeof value === "number" && suffix === "%" ? "%" : ""}
                </p>
                {suffix && suffix !== "%" ? (
                  <p className="mt-0.5 text-2xs text-muted-foreground">{suffix}</p>
                ) : null}
              </motion.div>
            ))}
          </motion.div>
        </motion.header>

        <div className="grid gap-6 xl:grid-cols-[minmax(280px,340px)_1fr]">
          <aside className="space-y-4 xl:sticky xl:top-[5.5rem] xl:self-start">
          <div className="flex items-center gap-3 mb-3">
            <ScanFace className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Talent radar</p>
              <p className="text-xs text-muted-foreground">Ranked by role fit, communication, and experience.</p>
            </div>
          </div>

            <div className="space-y-3">
              {rankedCandidates.map(({ candidate, match }, index) => {
                const active = candidate.id === selected?.id;
                return (
                  <motion.button
                    key={candidate.id}
                    type="button"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 6 }}
                    onClick={() => setSelectedCandidateId(candidate.id)}
                    className={`group relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 ${
                      active
                        ? "border-primary/60 bg-primary/[0.12] shadow-glow"
                        : "border-border/80 bg-card/60 hover:border-primary/40 hover:bg-card/90"
                    }`}
                  >
                    {active ? (
                      <span className="absolute inset-y-3 left-0 w-1 rounded-full bg-gradient-to-b from-teal-400 to-orange-400" />
                    ) : null}
                    <div className="flex items-center gap-3 pl-2">
                      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-foreground font-display text-sm font-semibold text-background">
                        {initials(candidate.name)}
                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-teal-400 shadow-[0_0_14px_rgba(45,212,191,0.9)]" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate font-semibold">{candidate.name}</h2>
                        <p className="truncate text-sm text-muted-foreground">{candidate.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-2xl font-semibold leading-none">{match}%</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">fit</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 pl-2 text-xs text-muted-foreground">
                      <Zap className="h-3.5 w-3.5 text-primary" />
                      Video + AI brief ready
                      <ChevronRight className="ml-auto h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </aside>

          {selected && breakdown ? (
            <section className="space-y-5">
              <motion.div layout className="glass-dark overflow-hidden rounded-2xl ring-glow">
                <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`spotlight-video-${selected.id}`}
                      initial={{ opacity: 0, filter: "blur(8px)", scale: 0.985 }}
                      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                      exit={{ opacity: 0, filter: "blur(8px)", scale: 0.99 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="relative"
                    >
                      <VideoInterviewPlayer
                        src={selected.videoUrl ?? "/demo-videos/strong-ai-interview.mp4"}
                        candidateName={selected.name}
                        candidateInitials={initials(selected.name)}
                        className="min-h-[320px] lg:min-h-[520px]"
                        onCinemaMode={() => setFullscreen(true)}
                      />
                    </motion.div>
                  </AnimatePresence>

                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={selected.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.35 }}
                      className="flex flex-col justify-between border-t border-white/10 p-6 sm:p-8 lg:border-l lg:border-t-0"
                    >
                      <div>
                        <p className="text-sm text-white/50">{selected.location}</p>
                        <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{selected.name}</h2>
                        <p className="mt-1 text-white/65">{selected.title}</p>

                        <div className="mt-6 flex items-center gap-5">
                          <MatchRing score={breakdown.score} />
                          <p className="text-sm leading-7 text-white/72">{breakdown.summary}</p>
                        </div>

                        <div className="mt-8 space-y-4">
                          {[
                            ["Skill overlap", breakdown.skillScore, Gauge],
                            ["Experience relevance", breakdown.experienceScore, FileText],
                            ["Video signal strength", breakdown.signalScore, ScanFace]
                          ].map(([label, value, Icon], index) => (
                            <motion.div
                              key={String(label)}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.06 + index * 0.08 }}
                            >
                              <Signal label={String(label)} value={Number(value)} icon={Icon as LucideIcon} inverted />
                            </motion.div>
                          ))}
                        </div>
                        </div>

                      {notes.length > 0 && (
                        <div className="mt-6 space-y-2">
                          <p className="text-xs font-medium text-white/50">Notes</p>
                          {notes.map((n) => (
                            <div key={n.id} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                              <p className="text-xs text-white/80">{n.note}</p>
                              <p className="mt-1 text-2xs text-white/40">{new Date(n.createdAt).toLocaleDateString()}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-8">
                        <div className="flex flex-wrap gap-2">
                          {selected.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1 text-xs text-white/78"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                          <Button
                            disabled={decisionState === "shortlisting"}
                            className={`bg-teal-400 text-slate-950 hover:bg-teal-300 ${decisionState === "shortlisted" ? "animate-pulse-glow" : ""}`}
                            onClick={async () => {
                              const app = applications.data.find((a) => a.candidateId === selected.id);
                              if (!app) return;
                              setDecisionState("shortlisting");
                              try {
                                const res = await fetchWithTimeout("/api/applications", {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ applicationId: app.id, stage: "shortlisted" })
                                });
                                if (res.ok) {
                                  setDecisionState("shortlisted");
                                  setFeedback("Candidate shortlisted.");
                                  toast.success("Candidate shortlisted successfully");
                                  void fetchAll();
                                } else {
                                  setDecisionState("idle");
                                  setFeedback("Failed to update stage.");
                                  toast.error("Failed to shortlist candidate");
                                }
                              } catch {
                                setDecisionState("idle");
                                setFeedback("Network error.");
                                toast.error("Network error while shortlisting");
                              }
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {decisionState === "shortlisting" ? "Updating…" : decisionState === "shortlisted" ? "Shortlisted" : "Shortlist"}
                          </Button>
                          {decisionState !== "noting" && decisionState !== "noted" ? (
                            <Button
                              variant="outline"
                              className="border-white/15 bg-white/[0.06] text-white hover:bg-white/10"
                              onClick={() => setDecisionState("noting")}
                            >
                              <MessageSquareText className="h-4 w-4" />
                              Add note
                            </Button>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <textarea
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                                placeholder="Type a note…"
                                rows={2}
                                className="w-full rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-xs text-white placeholder-white/40 backdrop-blur focus:outline-none focus:ring-1 focus:ring-teal-400"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-teal-400 text-xs text-slate-950 hover:bg-teal-300"
                                  disabled={!noteInput.trim()}
                                  onClick={async () => {
                                    if (!noteInput.trim()) return;
                                    try {
                                      const res = await fetchWithTimeout("/api/recruiter/notes", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ candidateId: selected.id, note: noteInput.trim() })
                                      });
                                      if (res.ok) {
                                        setDecisionState("noted");
                                        setFeedback("Note saved.");
                                        toast.success("Note saved");
                                        setNoteInput("");
                                      } else {
                                        setFeedback("Failed to save note.");
                                        toast.error("Failed to save note");
                                      }
                                    } catch {
                                      setFeedback("Network error.");
                                      toast.error("Network error while saving note");
                                    }
                                  }}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-white/15 text-xs text-white hover:bg-white/10"
                                  onClick={() => {
                                    setDecisionState("idle");
                                    setNoteInput("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>

              <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                <PipelineBoard
                  candidates={candidates.data}
                  applications={applications.data}
                  stageCounts={stageCounts}
                  onRefresh={fetchAll}
                />

                {selected && breakdown ? (
                  <AiMatchVisualization breakdown={breakdown} />
                ) : (
                  <PremiumTiltCard className="h-full">
                    <div className="glass relative overflow-hidden rounded-2xl p-6">
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-400 via-white to-orange-400" />
                      <MessageSquareText className="h-6 w-6 text-primary" />
                      <h2 className="heading-display mt-4 text-2xl">AI recruiter brief</h2>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        Select a candidate to see their AI match analysis.
                      </p>
                    </div>
                  </PremiumTiltCard>
                )}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {fullscreen && selected ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-slate-950/96 p-4 text-white backdrop-blur-xl"
          >
            <div className="mx-auto flex h-full max-w-7xl flex-col">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="section-kicker text-white/45">Cinema review</p>
                  <h2 className="font-display text-2xl font-semibold">{selected.name}</h2>
                </div>
                <Button
                  variant="outline"
                  className="border-white/15 bg-white/[0.06] text-white hover:bg-white/10"
                  onClick={() => setFullscreen(false)}
                >
                  <X className="h-4 w-4" />
                  Close
                </Button>
              </div>
              <div className="grid flex-1 overflow-hidden rounded-2xl border border-white/10 lg:grid-cols-[1fr_22rem]">
                <div className="relative bg-black">
                  <VideoInterviewPlayer
                    src={selected.videoUrl ?? "/demo-videos/strong-ai-interview.mp4"}
                    candidateName={selected.name}
                    candidateInitials={initials(selected.name)}
                    title="Cinema review"
                    className="h-full w-full"
                    showCinemaButton={false}
                    autoPlay
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(45,212,191,0.12),transparent_34%),radial-gradient(circle_at_80%_88%,rgba(251,146,60,0.12),transparent_32%)]" />
                </div>
                <div className="border-t border-white/10 bg-white/[0.04] p-5 lg:border-l lg:border-t-0">
                  <h3 className="font-semibold">AI observation stream</h3>
                  <div className="mt-4 space-y-3 text-sm text-white/72">
                    <p>Clear introduction with role context in the first 12 seconds.</p>
                    <p>Strong evidence density when discussing shipped product outcomes.</p>
                    <p>Recommended next step: structured technical panel.</p>
                  </div>
                  <div className="mt-6 space-y-3">
                    <Signal label="Panel readiness" value={breakdown?.score ?? 0} icon={Sparkles} inverted />
                    <Signal label="Communication" value={selected.communication} icon={ScanFace} inverted />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {feedback ? (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-5 left-1/2 z-[90] w-[min(34rem,92vw)] -translate-x-1/2"
          >
            <div className="glass rounded-2xl px-4 py-3 shadow-glow">
              <div className="flex items-center gap-3 text-sm">
                <span className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_18px_rgba(45,212,191,0.9)]" />
                <span className="text-foreground">{feedback}</span>
                <span className="ml-auto text-xs text-muted-foreground">Esc closes cinema</span>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
    </>
  );
}

function MatchRing({ score }: { score: number }) {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
      style={{ background: `conic-gradient(#2dd4bf ${score * 3.6}deg, rgba(255,255,255,0.12) 0deg)` }}
    >
      <div className="flex h-[4.5rem] w-[4.5rem] flex-col items-center justify-center rounded-full bg-slate-950">
        <span className="font-display text-2xl font-semibold">
          <AnimatedCounter value={score} />
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-white/50">match</span>
      </div>
    </motion.div>
  );
}

function Signal({
  label,
  value,
  icon: Icon,
  inverted = false
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  inverted?: boolean;
}) {
  return (
    <div className={inverted ? "text-white" : ""}>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          {label}
        </span>
        <span>{Math.round(value)}%</span>
      </div>
      <Progress value={value} className={inverted ? "bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-teal-400 [&>div]:to-orange-400" : ""} />
    </div>
  );
}
