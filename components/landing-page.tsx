"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  BriefcaseBusiness,
  Clapperboard,
  LockKeyhole,
  Play,
  ShieldCheck,
  Sparkles,
  UserRoundPlus,
  WandSparkles
} from "lucide-react";
import { AnimatedCounter } from "@/components/animated-counter";
import { PremiumTiltCard } from "@/components/premium-tilt-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const ImmersiveScene = dynamic(
  () => import("@/components/immersive-scene").then((mod) => mod.ImmersiveScene),
  { ssr: false }
);

const features = [
  {
    icon: Clapperboard,
    title: "Cinematic candidate profiles",
    copy: "Video resumes, interview clips, skills, and AI summaries in one elegant review surface — no stock filler imagery."
  },
  {
    icon: Brain,
    title: "Explainable AI ranking",
    copy: "Recruiters see why someone fits: skills, experience, communication signal, and role alignment."
  },
  {
    icon: ShieldCheck,
    title: "Role-aware workflows",
    copy: "Candidate and recruiter journeys stay separate with auth-ready routes and Supabase-ready policies."
  }
];

const activity = [
  ["Video resume parsed", "00:14", "complete"],
  ["Communication signal scored", "00:21", "live"],
  ["Recruiter shortlist updated", "00:27", "complete"]
];

const workflow = [
  {
    step: "01",
    title: "Candidate records cinematic intro",
    copy: "Video-first profile and resume data are merged into one signal stack.",
    metric: "46s avg"
  },
  {
    step: "02",
    title: "AI creates explainable score",
    copy: "Fit is broken down by communication, skill overlap, and role evidence.",
    metric: "94% peak"
  },
  {
    step: "03",
    title: "Recruiter takes guided decisions",
    copy: "Shortlist, interview notes, and panel recommendations flow in one room.",
    metric: "3.2x faster"
  }
];

export function LandingPage() {
  return (
    <main className="overflow-hidden">
      <section className="relative min-h-[calc(100vh-4.25rem)] overflow-hidden pb-16">
        <ImmersiveScene />
        <div className="pointer-events-none absolute inset-0 -z-10 cinematic-mesh opacity-90" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,transparent_0%,hsl(var(--background)/0.35)_55%,hsl(var(--background))_100%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.07)_1px,transparent_1px)] [background-size:56px_56px]" />

        <div className="container grid min-h-[calc(100vh-4.25rem)] items-center gap-12 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
            className="max-w-3xl"
          >
            <Badge className="mb-6 border-primary/25 bg-background/75 shadow-glow backdrop-blur-md">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
              AI video hiring command center
            </Badge>
            <h1 className="heading-display font-display text-balance text-5xl sm:text-6xl lg:text-7xl lg:leading-[1.02]">
              HireSight AI
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              A premium 3D hiring experience where candidates present their story on video and recruiters move through
              AI-ranked talent with clarity, speed, and confidence.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="glow" className="group h-12 px-6">
                <Link href="/auth?role=candidate&mode=signup">
                  <UserRoundPlus className="h-4 w-4" />
                  Candidate sign up
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 bg-background/70 backdrop-blur-md">
                <Link href="/auth?role=recruiter&mode=signin">
                  <BriefcaseBusiness className="h-4 w-4" />
                  Recruiter sign in
                </Link>
              </Button>
            </div>
            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                ["94%", "top match"],
                ["3.2x", "faster shortlist"],
                ["Live", "video insight"]
              ].map(([value, label]) => (
                <PremiumTiltCard
                  key={label}
                  className="glass rounded-xl p-4"
                  intensity={8}
                >
                  <p className="font-display text-2xl font-semibold">{value}</p>
                  <p className="section-kicker mt-1">{label}</p>
                </PremiumTiltCard>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 36 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12 }}
            className="relative"
          >
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-tr from-teal-400/25 via-transparent to-orange-400/20 blur-3xl" />
            <div className="glass rounded-2xl p-3 shadow-glow">
              <div className="rounded-xl border border-white/20 bg-background/80 p-5 shadow-panel backdrop-blur-2xl sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="h-2 w-2 animate-pulse-glow rounded-full bg-teal-400 shadow-[0_0_18px_rgba(45,212,191,0.9)]" />
                      Live candidate intelligence
                    </div>
                    <h2 className="font-display mt-2 text-3xl font-semibold">Marcus Lee</h2>
                    <p className="text-sm text-muted-foreground">Full-stack AI Engineer</p>
                  </div>
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    className="rounded-xl bg-foreground px-4 py-3 text-center text-background shadow-glow"
                  >
                    <div className="font-display text-3xl font-semibold">
                      <AnimatedCounter value={94} />
                    </div>
                    <p className="text-xs uppercase tracking-[0.2em] text-background/70">match</p>
                  </motion.div>
                </div>

                <div className="mt-6 grid gap-4">
                  {[
                    ["Skill overlap", 96],
                    ["Video communication", 88],
                    ["Experience relevance", 94]
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span>{label}</span>
                        <span className="font-medium">{value}%</span>
                      </div>
                      <Progress value={Number(value)} />
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-[0.9fr_1.1fr]">
                  <div className="relative min-h-52 overflow-hidden rounded-xl border border-border/60 bg-slate-950 text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(45,212,191,0.35),transparent_38%),linear-gradient(155deg,rgba(15,23,42,0.25),rgba(2,6,23,0.96))]" />
                    <div className="absolute inset-x-5 top-5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-white/65">
                      <span>Video resume</span>
                      <span>01:38</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.08 }}
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-950 shadow-glow"
                      >
                        <Play className="ml-1 h-6 w-6 fill-current" />
                      </motion.div>
                    </div>
                    <div className="absolute inset-x-5 bottom-5 space-y-2">
                      <div className="flex gap-1">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <span
                            key={i}
                            className="w-1 rounded-full bg-teal-300/80"
                            style={{ height: `${10 + ((i * 7) % 28)}px` }}
                          />
                        ))}
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-white/15">
                        <motion.div
                          animate={{ x: ["-20%", "125%"] }}
                          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                          className="h-full w-2/5 rounded-full bg-gradient-to-r from-teal-300 to-orange-300"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    {activity.map(([label, time, state], index) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + index * 0.12 }}
                        className="flex items-center justify-between rounded-xl border border-border/70 bg-background/75 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <BadgeCheck
                            className={state === "live" ? "h-5 w-5 text-orange-500" : "h-5 w-5 text-primary"}
                          />
                          <span className="text-sm">{label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{time}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="container -mt-2 lg:-mt-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            className="grid gap-4 md:grid-cols-3"
          >
            {workflow.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="glass relative overflow-hidden rounded-2xl p-5"
              >
                <div className="absolute right-4 top-4 text-4xl font-semibold text-foreground/10">{item.step}</div>
                <p className="section-kicker">{item.metric}</p>
                <h3 className="font-display mt-3 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="container py-20 lg:py-24">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge className="bg-background/70">
              <WandSparkles className="mr-1 h-3.5 w-3.5" />
              Jury-ready experience
            </Badge>
            <h2 className="heading-display font-display mt-4 max-w-2xl text-3xl sm:text-5xl">
              Built to feel like a product, not a prototype.
            </h2>
          </div>
          <Button asChild variant="outline" className="w-fit bg-background/70">
            <Link href="/auth?role=recruiter&mode=signup">
              Recruiter sign up
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature, index) => (
            <PremiumTiltCard
              key={feature.title}
              className="h-full"
              intensity={7}
            >
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -8 }}
              >
                <Card className="glass h-full overflow-hidden rounded-2xl p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-foreground text-background shadow-glow">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display mt-5 text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.copy}</p>
                </Card>
              </motion.div>
            </PremiumTiltCard>
          ))}
        </div>
      </section>

      <section className="container pb-20">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="glass relative overflow-hidden rounded-2xl p-6 sm:p-8">
            <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-teal-300/20 blur-2xl" />
            <div className="absolute -bottom-10 right-0 h-36 w-36 rounded-full bg-orange-300/20 blur-2xl" />
            <p className="section-kicker">Recruiter to candidate storytelling</p>
            <h2 className="font-display mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
              Every hiring decision carries the candidate context with it.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
              The platform keeps the narrative continuous: intro clip, experience proof, role fit, and recruiter notes
              are visible in one decision surface.
            </p>
            <div className="mt-8 space-y-4">
              {[
                ["Candidate story", 100],
                ["AI confidence", 94],
                ["Recruiter clarity", 91]
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{label}</span>
                    <span className="font-medium">{value}%</span>
                  </div>
                  <Progress value={Number(value)} />
                </div>
              ))}
            </div>
          </div>
          <div className="grid content-start gap-4">
            {[
              "Live interview playback with AI cues",
              "Deterministic score cards for hiring panels",
              "Motion-first recruiter workspace interactions"
            ].map((copy, index) => (
              <motion.div
                key={copy}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="glass rounded-2xl p-5"
              >
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-primary" />
                  <p className="text-sm leading-6">{copy}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container pb-20 lg:pb-24">
        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-foreground p-8 text-background shadow-glow sm:p-12">
          <div className="absolute inset-0 opacity-30 [background:linear-gradient(115deg,transparent_0%,rgba(45,212,191,0.65)_35%,transparent_70%)] animate-shimmer" />
          <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <LockKeyhole className="mb-5 h-7 w-7 text-teal-200" />
              <h2 className="heading-display font-display text-3xl sm:text-5xl">
                Separate doors for every hiring role.
              </h2>
              <p className="mt-4 max-w-2xl text-background/72">
                Candidates can create profiles and upload video resumes. Recruiters can sign in, post jobs, review AI
                scores, and manage shortlists.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
              <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
                <Link href="/auth?role=candidate&mode=signup">Candidate sign up</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-background/25 bg-transparent text-background hover:bg-background/10"
              >
                <Link href="/auth?role=recruiter&mode=signin">Recruiter sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
