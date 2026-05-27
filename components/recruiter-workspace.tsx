"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  Expand,
  FileText,
  Gauge,
  MessageSquareText,
  Play,
  Radar,
  ScanFace,
  Sparkles,
  UserCheck,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { applications, candidates, jobs } from "@/lib/demo-data";
import { scoreCandidate } from "@/lib/ai/scoring";
import { useHireSightStore } from "@/lib/store";
import { AnimatedCounter } from "@/components/animated-counter";
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

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_18%,rgba(20,184,166,0.22),transparent_28%),radial-gradient(circle_at_18%_72%,rgba(249,115,22,0.2),transparent_30%),linear-gradient(135deg,rgba(248,250,252,0.96),rgba(226,232,240,0.72))] dark:bg-[radial-gradient(circle_at_78%_18%,rgba(20,184,166,0.18),transparent_30%),radial-gradient(circle_at_18%_72%,rgba(249,115,22,0.16),transparent_30%),linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.94))]" />
      <div className="container py-8">
        <motion.section
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]"
        >
          <aside className="order-2 space-y-4 lg:order-1">
            <div className="glass rounded-lg p-5">
              <Badge className="bg-background/70">
                <Radar className="mr-1 h-3.5 w-3.5" />
                Live talent radar
              </Badge>
              <h1 className="mt-4 text-3xl font-semibold tracking-normal sm:text-4xl">
                Recruiter command room
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Review candidate presence, AI fit, interview evidence, and pipeline movement from one cinematic workspace.
              </p>
            </div>

            <div className="space-y-3">
              {rankedCandidates.map(({ candidate, match }, index) => (
                <motion.button
                  key={candidate.id}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  whileHover={{ x: 8, rotateY: -3 }}
                  onClick={() => setSelectedCandidateId(candidate.id)}
                  className={`group w-full rounded-lg border p-4 text-left shadow-panel backdrop-blur-xl transition ${
                    candidate.id === selected.id
                      ? "border-primary bg-primary/12"
                      : "border-white/20 bg-background/58 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-sm font-semibold text-background">
                        {candidate.avatar}
                        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-teal-400 shadow-[0_0_18px_rgba(45,212,191,0.9)]" />
                      </span>
                      <div>
                        <h2 className="font-semibold">{candidate.name}</h2>
                        <p className="truncate text-sm text-muted-foreground">{candidate.title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold">{match}%</p>
                      <p className="text-xs text-muted-foreground">fit</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Play className="h-3.5 w-3.5 text-primary" />
                    Interview preview ready
                    <ChevronRight className="ml-auto h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </motion.button>
              ))}
            </div>
          </aside>

          <section className="order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-lg border border-white/20 bg-slate-950 text-white shadow-glow">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(45,212,191,0.25),transparent_28%),radial-gradient(circle_at_80%_88%,rgba(251,146,60,0.22),transparent_28%)]" />
              <div className="relative grid min-h-[680px] lg:grid-cols-[1.05fr_0.95fr]">
                <div className="relative min-h-[420px] overflow-hidden">
                  <video
                    key={selected.videoUrl}
                    src={selected.videoUrl}
                    className="h-full min-h-[420px] w-full object-cover opacity-[0.88]"
                    controls
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(90deg,rgba(2,6,23,0.15),transparent_38%,rgba(2,6,23,0.78))]" />
                  <div className="absolute left-5 top-5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow-[0_0_20px_rgba(239,68,68,0.65)]">
                      INTERVIEW REVIEW
                    </span>
                    <span className="rounded-full bg-black/55 px-3 py-1 text-xs text-white/80 backdrop-blur">AI transcript active</span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setFullscreen(true)}
                    className="absolute bottom-5 right-5 border-white/20 bg-black/45 text-white hover:bg-white/10"
                  >
                    <Expand className="h-4 w-4" />
                    Cinema mode
                  </Button>
                </div>

                <div className="relative flex flex-col justify-between p-6 sm:p-8">
                  <div>
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <p className="text-sm text-white/58">{selected.location}</p>
                        <h2 className="mt-2 text-4xl font-semibold tracking-normal">{selected.name}</h2>
                        <p className="mt-1 text-white/64">{selected.title}</p>
                      </div>
                      <motion.div
                        animate={{ y: [0, -7, 0] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                        className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
                        style={{ background: `conic-gradient(#2dd4bf ${breakdown.score * 3.6}deg, rgba(255,255,255,0.12) 0deg)` }}
                      >
                        <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-slate-950">
                          <span className="text-3xl font-semibold"><AnimatedCounter value={breakdown.score} /></span>
                          <span className="text-[10px] uppercase tracking-[0.18em] text-white/50">match</span>
                        </div>
                      </motion.div>
                    </div>

                    <p className="mt-6 max-w-xl text-sm leading-7 text-white/72">{breakdown.summary}</p>

                    <div className="mt-6 grid gap-3">
                      <Signal label="Skill overlap" value={breakdown.skillScore} icon={Gauge} />
                      <Signal label="Experience relevance" value={breakdown.experienceScore} icon={FileText} />
                      <Signal label="Video signal strength" value={breakdown.signalScore} icon={ScanFace} />
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="flex flex-wrap gap-2">
                      {selected.skills.map((skill) => (
                        <span key={skill} className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs text-white/78">
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
            </div>
          </section>
        </motion.section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="glass rounded-lg p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Badge className="bg-background/70">
                  <UserCheck className="mr-1 h-3.5 w-3.5" />
                  Hiring pipeline
                </Badge>
                <h2 className="mt-3 text-2xl font-semibold">Motion-aware pipeline states</h2>
              </div>
              <Button>
                <Sparkles className="h-4 w-4" />
                Generate shortlist
              </Button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-5">
              {stages.map((stage, index) => (
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="min-h-36 rounded-lg border bg-background/58 p-3 backdrop-blur"
                >
                  <p className="text-sm font-medium capitalize">{stage}</p>
                  <div className="mt-3 space-y-2">
                    {applications
                      .filter((application) => application.stage === stage)
                      .map((application) => {
                        const candidate = candidates.find((item) => item.id === application.candidateId);
                        return (
                          <div key={application.id} className="rounded-md bg-foreground px-3 py-2 text-xs text-background shadow-glow">
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

          <div className="glass relative overflow-hidden rounded-lg p-6">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-400 via-white to-orange-400" />
            <MessageSquareText className="h-6 w-6 text-primary" />
            <h2 className="mt-4 text-2xl font-semibold">AI recruiter brief</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Prioritize Marcus for systems depth, Ava for product motion polish, and Zoya for customer-facing storytelling. The interview layer highlights communication style before the live panel stage.
            </p>
            <div className="mt-5 grid gap-2">
              {["Ask about production ownership", "Compare async communication", "Review stakeholder examples"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border bg-background/60 px-3 py-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {fullscreen ? (
        <div className="fixed inset-0 z-[80] bg-slate-950/96 p-4 text-white backdrop-blur">
          <div className="mx-auto flex h-full max-w-7xl flex-col">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-white/50">Fullscreen interview review</p>
                <h2 className="text-2xl font-semibold">{selected.name}</h2>
              </div>
              <Button variant="outline" className="border-white/15 bg-white/[0.06] text-white hover:bg-white/10" onClick={() => setFullscreen(false)}>
                <X className="h-4 w-4" />
                Close
              </Button>
            </div>
            <div className="grid flex-1 overflow-hidden rounded-lg border border-white/10 lg:grid-cols-[1fr_22rem]">
              <video src={selected.videoUrl} controls autoPlay muted playsInline className="h-full w-full bg-black object-contain" />
              <div className="border-l border-white/10 bg-white/[0.04] p-5">
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
        </div>
      ) : null}
    </main>
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
      <Progress value={value} className={inverted ? "bg-white/10" : ""} />
    </div>
  );
}
