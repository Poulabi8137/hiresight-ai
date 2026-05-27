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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const ImmersiveScene = dynamic(
  () => import("@/components/immersive-scene").then((mod) => mod.ImmersiveScene),
  { ssr: false }
);

const features = [
  { icon: Clapperboard, title: "Cinematic candidate profiles", copy: "Video resumes, interview clips, resumes, skills, and AI summaries land in one elegant review surface." },
  { icon: Brain, title: "Explainable AI ranking", copy: "Recruiters see why someone fits: skills, experience, communication signal, and role alignment." },
  { icon: ShieldCheck, title: "Role-aware workflows", copy: "Candidate and recruiter journeys stay separate with auth-ready routes and Supabase-ready policies." }
];

const activity = [
  ["Video resume parsed", "00:14", "complete"],
  ["Communication signal scored", "00:21", "live"],
  ["Recruiter shortlist updated", "00:27", "complete"]
];

export function LandingPage() {
  return (
    <main>
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        <ImmersiveScene />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(248,250,252,0.9)_0%,rgba(240,253,250,0.62)_42%,rgba(255,247,237,0.74)_100%)] dark:bg-[linear-gradient(120deg,rgba(2,6,23,0.98)_0%,rgba(8,47,73,0.74)_48%,rgba(67,20,7,0.45)_100%)]" />
        <div className="container grid min-h-[calc(100vh-4rem)] items-center gap-10 py-10 lg:grid-cols-[0.98fr_1.02fr]">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
            className="max-w-3xl"
          >
            <Badge className="mb-5 border-white/40 bg-background/70 shadow-glow backdrop-blur">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              AI video hiring command center
            </Badge>
            <h1 className="text-balance text-5xl font-semibold tracking-normal text-foreground sm:text-6xl lg:text-7xl">
              HireSight AI
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              A premium 3D hiring experience where candidates present their story on video and recruiters move through AI-ranked talent with clarity, speed, and confidence.
            </p>
            <div className="mt-8 grid gap-3 sm:flex">
              <Button asChild size="lg" variant="glow" className="group">
                <Link href="/auth?role=candidate&mode=signup">
                  <UserRoundPlus className="h-4 w-4" />
                  Candidate sign up
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-background/65 backdrop-blur">
                <Link href="/auth?role=recruiter&mode=signin">
                  <BriefcaseBusiness className="h-4 w-4" />
                  Recruiter sign in
                </Link>
              </Button>
            </div>
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                ["94%", "top match"],
                ["3.2x", "faster shortlist"],
                ["Live", "video insight"]
              ].map(([value, label]) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="rounded-lg border border-white/30 bg-background/55 p-4 shadow-panel backdrop-blur-xl"
                >
                  <p className="text-2xl font-semibold">{value}</p>
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 36 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12 }}
            className="relative"
          >
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-tr from-teal-400/20 via-white/10 to-orange-400/20 blur-2xl" />
            <div className="glass rounded-lg p-3">
              <div className="rounded-lg border border-white/25 bg-background/78 p-5 shadow-panel backdrop-blur-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_18px_rgba(45,212,191,0.9)]" />
                      Live candidate intelligence
                    </div>
                    <h2 className="mt-2 text-3xl font-semibold">Marcus Lee</h2>
                    <p className="text-sm text-muted-foreground">Full-stack AI Engineer</p>
                  </div>
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    className="rounded-lg bg-foreground px-4 py-3 text-center text-background shadow-glow"
                  >
                    <div className="text-3xl font-semibold"><AnimatedCounter value={94} /></div>
                    <p className="text-xs">match</p>
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
                        <span>{value}%</span>
                      </div>
                      <Progress value={Number(value)} />
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-[0.88fr_1.12fr]">
                  <div className="relative min-h-48 overflow-hidden rounded-lg border bg-slate-950 text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(45,212,191,0.35),transparent_35%),linear-gradient(145deg,rgba(15,23,42,0.2),rgba(2,6,23,0.96))]" />
                    <div className="absolute inset-x-5 top-5 flex items-center justify-between text-xs text-white/70">
                      <span>VIDEO RESUME</span>
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
                    <div className="absolute inset-x-5 bottom-5 h-1 overflow-hidden rounded-full bg-white/15">
                      <motion.div
                        animate={{ x: ["-20%", "125%"] }}
                        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                        className="h-full w-2/5 rounded-full bg-teal-300"
                      />
                    </div>
                  </div>
                  <div className="grid gap-3">
                    {activity.map(([label, time, state], index) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + index * 0.12 }}
                        className="flex items-center justify-between rounded-lg border bg-background/70 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <BadgeCheck className={state === "live" ? "h-5 w-5 text-orange-500" : "h-5 w-5 text-teal-500"} />
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
      </section>

      <section className="container py-20">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge className="bg-background/70">
              <WandSparkles className="mr-1 h-3.5 w-3.5" />
              Jury-ready experience
            </Badge>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-normal sm:text-5xl">
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
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -8 }}
            >
              <Card className="glass h-full overflow-hidden p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-foreground text-background shadow-glow">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.copy}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container pb-20">
        <div className="relative overflow-hidden rounded-lg border border-white/20 bg-foreground p-8 text-background shadow-glow sm:p-12">
          <div className="absolute inset-0 opacity-30 [background:linear-gradient(115deg,transparent_0%,rgba(45,212,191,0.65)_35%,transparent_70%)] animate-shimmer" />
          <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <LockKeyhole className="mb-5 h-7 w-7 text-teal-200" />
              <h2 className="text-3xl font-semibold tracking-normal sm:text-5xl">Separate doors for every hiring role.</h2>
              <p className="mt-4 max-w-2xl text-background/72">
                Candidates can create profiles and upload video resumes. Recruiters can sign in, post jobs, review AI scores, and manage shortlists.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
              <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
                <Link href="/auth?role=candidate&mode=signup">Candidate sign up</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-background/25 bg-transparent text-background hover:bg-background/10">
                <Link href="/auth?role=recruiter&mode=signin">Recruiter sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
