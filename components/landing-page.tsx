"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  ArrowRight, BadgeCheck, Brain, BriefcaseBusiness, ChevronDown,
  Clapperboard, Eye, Fingerprint, Gauge, LockKeyhole, MessageSquareText,
  Play, ShieldCheck, Sparkles, Star, UserRoundPlus, WandSparkles,
  BarChart3, Zap, Layers, Clock, CheckCircle2, Target, Users, TrendingUp
} from "lucide-react";
import { AnimatedCounter } from "@/components/animated-counter";
import { PremiumTiltCard } from "@/components/premium-tilt-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";

const ImmersiveScene = dynamic(
  () => import("@/components/immersive-scene").then((mod) => mod.ImmersiveScene),
  { ssr: false }
);

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] }
};

const stagger = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true }
};

const features = [
  {
    icon: Clapperboard,
    title: "Cinematic candidate profiles",
    copy: "Video resumes, interview clips, skills, and AI summaries in one elegant review surface — no stock filler imagery.",
    gradient: "from-teal-500/20 to-teal-500/5"
  },
  {
    icon: Brain,
    title: "Explainable AI ranking",
    copy: "Recruiters see exactly why someone fits: skills, experience, communication signal, and role alignment — no black boxes.",
    gradient: "from-primary/20 to-primary/5"
  },
  {
    icon: ShieldCheck,
    title: "Role-aware workflows",
    copy: "Candidate and recruiter journeys stay separate with auth-ready routes, RLS policies, and dedicated dashboards.",
    gradient: "from-accent/20 to-accent/5"
  },
  {
    icon: Gauge,
    title: "Real-time analytics",
    copy: "Track pipeline conversion, candidate engagement, and hiring velocity with live dashboards and exportable reports.",
    gradient: "from-emerald-500/20 to-emerald-500/5"
  }
];

const workflowSteps = [
  {
    step: "01",
    title: "Candidate records cinematic intro",
    copy: "Video-first profile and resume data are merged into one signal stack. AI extracts skills, experience, and communication patterns.",
    metric: "46s avg",
    metricLabel: "recording time"
  },
  {
    step: "02",
    title: "AI creates explainable score",
    copy: "Fit is broken down by communication quality, skill overlap, experience relevance, and role-specific evidence.",
    metric: "94%",
    metricLabel: "peak accuracy"
  },
  {
    step: "03",
    title: "Recruiter takes guided decisions",
    copy: "Shortlist candidates, add interview notes, and get panel recommendations — all in one unified workspace.",
    metric: "3.2x",
    metricLabel: "faster shortlist"
  }
];

const testimonials = [
  { quote: "HireSight cut our screening time by 60% while improving match quality. The video-first approach is a game-changer.", name: "Sarah Chen", role: "VP of Talent, TechCorp" },
  { quote: "As a candidate, I love that I can tell my story through video instead of just a resume. The AI feedback is incredibly useful.", name: "Marcus Johnson", role: "Senior Engineer" },
  { quote: "The explainable scoring gives our hiring panel confidence in every decision. No more guesswork.", name: "David Park", role: "Engineering Director, ScaleUp" },
];

const faqs = [
  { q: "How does AI scoring work?", a: "Our AI analyzes video resumes, technical skills, experience, and communication patterns to generate an explainable match score. Every score comes with a detailed breakdown." },
  { q: "Is my data secure?", a: "Yes. We use Supabase Row Level Security to ensure candidates and recruiters only see what they should. All uploads are encrypted at rest." },
  { q: "Can I try it without setting up a database?", a: "Absolutely. The demo mode works entirely in your browser with sample data. You can explore all features without connecting to Supabase." },
  { q: "What file formats are supported?", a: "We support PDF resumes, MP4/WebM video resumes, and common interview recording formats. Files up to 20MB are accepted." },
];

export function LandingPage() {
  return (
    <main className="overflow-hidden">
      {/* ── Hero Section ── */}
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
            <Badge variant="primary" className="mb-6 shadow-glow-sm backdrop-blur-md">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              AI-powered video hiring
            </Badge>
            <h1 className="heading-display font-display text-balance text-5xl sm:text-6xl lg:text-7xl lg:leading-[1.02]">
              Hire with clarity, not guesswork.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              A premium hiring experience where candidates tell their story on video and recruiters move through
              AI-ranked talent with speed and confidence.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="xl" variant="glow" className="group h-12 px-6">
                <Link href="/auth?role=candidate&mode=signup">
                  <UserRoundPlus className="h-5 w-5" />
                  Get started
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="glow" className="group h-12 px-6 border-primary/30 bg-primary/10 hover:bg-primary/20">
                <Link href="/auth?mode=signup">
                  <Play className="h-5 w-5" />
                  Try demo
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 bg-background/70 backdrop-blur-md">
                <Link href="/auth?role=recruiter&mode=signin">
                  <BriefcaseBusiness className="h-4 w-4" />
                  Recruiter login
                </Link>
              </Button>
            </div>
            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                ["94%", "avg. match accuracy"],
                ["3.2x", "faster shortlists"],
                ["60%", "faster screening"]
              ].map(([value, label]) => (
                <PremiumTiltCard key={label} className="glass rounded-xl p-4" intensity={8}>
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
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-950 shadow-glow cursor-pointer"
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
                    {[
                      ["Video resume parsed", "00:14", "complete"],
                      ["Communication signal scored", "00:21", "live"],
                      ["Recruiter shortlist updated", "00:27", "complete"]
                    ].map(([label, time, state], index) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + index * 0.12 }}
                        className="flex items-center justify-between rounded-xl border border-border/70 bg-background/75 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <BadgeCheck className={state === "live" ? "h-5 w-5 text-orange-500" : "h-5 w-5 text-primary"} />
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

      {/* ── Stats Bar ── */}
      <section className="container -mt-6 pb-16">
        <motion.div {...fadeInUp} className="glass rounded-2xl p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Users, value: "10K+", label: "Candidates" },
              { icon: Target, value: "94%", label: "Match accuracy" },
              { icon: Clock, value: "3.2x", label: "Faster screening" },
              { icon: BarChart3, value: "60%", label: "Cost reduction" }
            ].map((stat, i) => (
              <motion.div key={stat.label} {...stagger} transition={{ delay: i * 0.08 }}
                className="flex items-center gap-4 p-3"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── How It Works ── */}
      <section className="container py-16 lg:py-20">
        <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto">
          <Badge variant="primary">
            <Zap className="mr-1 h-3.5 w-3.5" />
            Three-step workflow
          </Badge>
          <h2 className="heading-display font-display mt-4 text-3xl sm:text-5xl">
            From application to decision in minutes, not weeks.
          </h2>
          <p className="mt-4 text-muted-foreground">
            A streamlined process that respects everyone&apos;s time.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {workflowSteps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass relative overflow-hidden rounded-2xl p-6 card-hover"
            >
              <div className="absolute right-4 top-4 text-5xl font-bold text-foreground/5 font-display">{item.step}</div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary text-sm font-bold">
                {item.step}
              </div>
              <p className="mt-6 text-sm text-muted-foreground">{item.metricLabel}</p>
              <p className="font-display text-2xl font-bold">{item.metric}</p>
              <h3 className="font-display mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="container py-16 lg:py-20">
        <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto">
          <Badge variant="accent">
            <WandSparkles className="mr-1 h-3.5 w-3.5" />
            Built for scale
          </Badge>
          <h2 className="heading-display font-display mt-4 text-3xl sm:text-5xl">
            Everything you need to hire better.
          </h2>
          <p className="mt-4 text-muted-foreground">
            AI-powered tools that augment your team, not replace it.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.08 }}
              className="h-full"
            >
              <Card className="glass h-full overflow-hidden rounded-2xl card-hover">
                <CardContent className="p-6">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} border border-primary/10`}>
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display mt-5 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.copy}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── AI Matching in Action ── */}
      <section className="container py-16 lg:py-20">
        <motion.div {...fadeInUp} className="mx-auto max-w-2xl text-center">
          <Badge variant="primary">
            <Brain className="mr-1 h-3.5 w-3.5" />
            AI matching in action
          </Badge>
          <h2 className="heading-display font-display mt-4 text-3xl sm:text-5xl">
            See how AI scores candidates in real time.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every candidate is scored across three dimensions — skill overlap, experience relevance, and video communication signal.
          </p>
        </motion.div>

        <motion.div {...fadeInUp} transition={{ delay: 0.15, ...fadeInUp.transition }} className="mt-12 mx-auto max-w-3xl">
          <div className="glass rounded-2xl p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">MS</div>
                <div>
                  <p className="text-sm font-medium">Marcus Johnson</p>
                  <p className="text-2xs text-muted-foreground">Senior Full-Stack Engineer</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-lg font-semibold">92%</span>
                <span className="text-2xs text-muted-foreground">match</span>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Skill overlap", value: 95, icon: Target },
                { label: "Experience relevance", value: 88, icon: TrendingUp },
                { label: "Video signal strength", value: 91, icon: Zap },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                      {label}
                    </span>
                    <span className="font-medium">{value}%</span>
                  </div>
                  <Progress value={value} />
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-border/50 pt-4">
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">React</span>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">TypeScript</span>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">Node.js</span>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">AWS</span>
              <span className="rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-medium text-orange-400">Docker</span>
              <span className="rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-medium text-orange-400">Kubernetes</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Recruiter + Candidate Split ── */}
      <section className="container py-16 lg:py-20">
        <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto">
          <Badge variant="primary">
            <Users className="mr-1 h-3.5 w-3.5" />
            Two experiences, one platform
          </Badge>
          <h2 className="heading-display font-display mt-4 text-3xl sm:text-5xl">
            Separate doors for every role.
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <motion.div {...fadeInUp} transition={{ delay: 0.1, ...fadeInUp.transition }}>
            <Card className="glass overflow-hidden card-hover">
              <div className="h-1 bg-gradient-to-r from-teal-400 to-emerald-400" />
              <CardContent className="p-6 sm:p-8">
                <BriefcaseBusiness className="h-8 w-8 text-primary" />
                <h3 className="font-display mt-4 text-2xl font-semibold">For Recruiters</h3>
                <ul className="mt-5 space-y-3">
                  {["AI-ranked candidate pipeline", "Video resume review with scoring", "Stage-based hiring workflow", "Collaborative notes and feedback", "Real-time analytics dashboard"].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild size="lg" className="mt-6 w-full">
                  <Link href="/auth?role=recruiter&mode=signup">Try recruiter workspace</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...fadeInUp} transition={{ delay: 0.2, ...fadeInUp.transition }}>
            <Card className="glass overflow-hidden card-hover">
              <div className="h-1 bg-gradient-to-r from-accent to-orange-400" />
              <CardContent className="p-6 sm:p-8">
                <UserRoundPlus className="h-8 w-8 text-accent" />
                <h3 className="font-display mt-4 text-2xl font-semibold">For Candidates</h3>
                <ul className="mt-5 space-y-3">
                  {["Video-first profile creation", "AI-powered skill highlighting", "Real-time match scores on jobs", "Track applications and saved jobs", "Profile strength dashboard"].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild size="lg" variant="outline" className="mt-6 w-full">
                  <Link href="/auth?role=candidate&mode=signup">Try candidate workspace</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="container py-16 lg:py-20">
        <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto">
          <Badge variant="primary">
            <MessageSquareText className="mr-1 h-3.5 w-3.5" />
            Trusted by hiring teams
          </Badge>
          <h2 className="heading-display font-display mt-4 text-3xl sm:text-5xl">
            What users are saying.
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} {...stagger} transition={{ delay: i * 0.1 }}>
              <Card className="glass h-full card-hover">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-5 border-t border-border/50 pt-4">
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="container py-16 lg:py-20">
        <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto">
          <Badge variant="accent">
            <Layers className="mr-1 h-3.5 w-3.5" />
            FAQ
          </Badge>
          <h2 className="heading-display font-display mt-4 text-3xl sm:text-5xl">
            Frequently asked questions.
          </h2>
        </motion.div>

        <div className="mt-12 mx-auto max-w-3xl space-y-3">
          {faqs.map((faq, i) => (
            <motion.details
              key={faq.q}
              {...stagger}
              transition={{ delay: i * 0.06 }}
              className="group glass rounded-xl overflow-hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium list-none hover:bg-secondary/30 transition-colors">
                {faq.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-border/50 px-5 py-4 text-sm leading-6 text-muted-foreground">
                {faq.a}
              </div>
            </motion.details>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="container pb-20 lg:pb-24">
        <motion.div {...fadeInUp}>
          <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-foreground p-8 text-background shadow-glow sm:p-12">
            <div className="absolute inset-0 opacity-30 [background:linear-gradient(115deg,transparent_0%,rgba(45,212,191,0.65)_35%,transparent_70%)] animate-shimmer" />
            <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <LockKeyhole className="mb-5 h-7 w-7 text-teal-200" />
                <h2 className="heading-display font-display text-3xl sm:text-5xl">
                  Ready to transform your hiring?
                </h2>
                <p className="mt-4 max-w-2xl text-background/72">
                  Join thousands of teams using HireSight to find better talent faster. No credit card required.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90 h-12">
                  <Link href="/auth?role=candidate&mode=signup">Get started free</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-background/25 bg-transparent text-background hover:bg-background/10 h-12"
                >
                  <Link href="/auth?role=recruiter&mode=signin">Recruiter sign in</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
