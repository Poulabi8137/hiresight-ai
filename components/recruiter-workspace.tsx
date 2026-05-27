"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  Gauge,
  MessageSquareText,
  Radar,
  ScanFace,
  Sparkles,
  UserCheck,
  X,
  Zap
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { applications, candidates, jobs } from "@/lib/demo-data";
import { scoreCandidate } from "@/lib/ai/scoring";
import { useHireSightStore } from "@/lib/store";
import { initials } from "@/lib/utils";
import { AnimatedCounter } from "@/components/animated-counter";
import { VideoInterviewPlayer } from "@/components/video-interview-player";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const stages = ["applied", "screening", "shortlisted", "interview", "offer"] as const;

export function RecruiterWorkspace() {
  const { selectedCandidateId, setSelectedCandidateId } = useHireSightStore();
  const [fullscreen, setFullscreen] = useState(false);
  const selected = candidates.find((candidate) => candidate.id === selectedCandidateId) ?? candidates[0];
  const job = jobs[0];
  const breakdown = scoreCandidate(selected, job);

  const rankedCandidates = useMemo(
    () =>
      candidates
        .map((candidate) => ({ candidate, match: scoreCandidate(candidate, job).score }))
        .sort((a, b) => b.match - a.match),
    [job]
  );

  const stageCounts = useMemo(
    () =>
      stages.reduce(
        (acc, stage) => {
          acc[stage] = applications.filter((app) => app.stage === stage).length;
          return acc;
        },
        {} as Record<(typeof stages)[number], number>
      ),
    []
  );

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden cinematic-mesh">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:48px_48px] dark:opacity-25" />

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

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              ["Live queue", rankedCandidates.length, "candidates"],
              ["Top match", breakdown.score, "%"],
              ["Open role", job.title.split(" ")[0], job.company]
            ].map(([label, value, suffix]) => (
              <div key={label} className="glass rounded-xl px-4 py-3 text-center sm:px-5 sm:py-4">
                <p className="section-kicker">{label}</p>
                <p className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
                  {typeof value === "number" ? <AnimatedCounter value={value} /> : value}
                  {typeof value === "number" && suffix === "%" ? "%" : null}
                </p>
                {suffix && suffix !== "%" ? (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{suffix}</p>
                ) : null}
              </div>
            ))}
          </div>
        </motion.header>

        <div className="grid gap-6 xl:grid-cols-[minmax(280px,340px)_1fr]">
          <aside className="space-y-4">
            <div className="glass rounded-xl p-5">
              <p className="section-kicker">Talent radar</p>
              <p className="mt-2 text-sm text-muted-foreground">Ranked by role fit, communication, and experience depth.</p>
            </div>

            <div className="space-y-3">
              {rankedCandidates.map(({ candidate, match }, index) => {
                const active = candidate.id === selected.id;
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
                        {candidate.avatar}
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

          <section className="space-y-5">
            <motion.div
              layout
              className="glass-dark overflow-hidden rounded-2xl ring-glow"
            >
              <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
                <VideoInterviewPlayer
                  src={selected.videoUrl}
                  candidateName={selected.name}
                  candidateInitials={initials(selected.name)}
                  className="min-h-[320px] lg:min-h-[520px]"
                  onCinemaMode={() => setFullscreen(true)}
                />

                <div className="flex flex-col justify-between border-t border-white/10 p-6 sm:p-8 lg:border-l lg:border-t-0">
                  <div>
                    <p className="text-sm text-white/50">{selected.location}</p>
                    <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{selected.name}</h2>
                    <p className="mt-1 text-white/65">{selected.title}</p>

                    <div className="mt-6 flex items-center gap-5">
                      <MatchRing score={breakdown.score} />
                      <p className="text-sm leading-7 text-white/72">{breakdown.summary}</p>
                    </div>

                    <div className="mt-8 space-y-4">
                      <Signal label="Skill overlap" value={breakdown.skillScore} icon={Gauge} inverted />
                      <Signal label="Experience relevance" value={breakdown.experienceScore} icon={FileText} inverted />
                      <Signal label="Video signal strength" value={breakdown.signalScore} icon={ScanFace} inverted />
                    </div>
                  </div>

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
                      <Button className="bg-teal-400 text-slate-950 hover:bg-teal-300">
                        <CheckCircle2 className="h-4 w-4" />
                        Shortlist
                      </Button>
                      <Button variant="outline" className="border-white/15 bg-white/[0.06] text-white hover:bg-white/10">
                        <MessageSquareText className="h-4 w-4" />
                        Add note
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="glass rounded-2xl p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Badge className="bg-background/70">
                      <UserCheck className="mr-1 h-3.5 w-3.5" />
                      Hiring pipeline
                    </Badge>
                    <h2 className="heading-display mt-3 text-2xl">Stage-aware motion board</h2>
                  </div>
                  <Button>
                    <Sparkles className="h-4 w-4" />
                    Generate shortlist
                  </Button>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {stages.map((stage, index) => (
                    <motion.div
                      key={stage}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.04 }}
                      className="flex min-h-40 flex-col rounded-xl border border-border/70 bg-background/55 p-3 backdrop-blur"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium capitalize">{stage}</p>
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                          {stageCounts[stage]}
                        </span>
                      </div>
                      <div className="mt-3 flex-1 space-y-2">
                        {applications
                          .filter((application) => application.stage === stage)
                          .map((application) => {
                            const candidate = candidates.find((item) => item.id === application.candidateId);
                            return (
                              <div
                                key={application.id}
                                className="rounded-lg bg-foreground px-3 py-2 text-xs text-background shadow-glow"
                              >
                                {candidate?.name}
                                <span className="block text-background/65">{application.matchScore}% match</span>
                              </div>
                            );
                          })}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="glass relative overflow-hidden rounded-2xl p-6">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-400 via-white to-orange-400" />
                <MessageSquareText className="h-6 w-6 text-primary" />
                <h2 className="heading-display mt-4 text-2xl">AI recruiter brief</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Prioritize Marcus for systems depth, Ava for product motion polish, and Zoya for customer-facing storytelling.
                  Review communication cadence before panel scheduling.
                </p>
                <div className="mt-5 space-y-2">
                  {["Ask about production ownership", "Compare async communication", "Review stakeholder examples"].map(
                    (item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/60 px-3 py-2.5 text-sm"
                      >
                        <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                        {item}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {fullscreen ? (
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
                <video
                  src={selected.videoUrl}
                  controls
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full bg-black object-contain"
                />
                <div className="border-t border-white/10 bg-white/[0.04] p-5 lg:border-l lg:border-t-0">
                  <h3 className="font-semibold">AI observation stream</h3>
                  <div className="mt-4 space-y-3 text-sm text-white/72">
                    <p>Clear introduction with role context in the first 12 seconds.</p>
                    <p>Strong evidence density when discussing shipped product outcomes.</p>
                    <p>Recommended next step: structured technical panel.</p>
                  </div>
                  <div className="mt-6 space-y-3">
                    <Signal label="Panel readiness" value={breakdown.score} icon={Sparkles} inverted />
                    <Signal label="Communication" value={selected.communication} icon={ScanFace} inverted />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
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
