"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, CheckCircle2, Sparkles } from "lucide-react";
import { useReducedMotion } from "framer-motion";

type OnboardingStep = {
  title: string;
  description: string;
  illustration?: React.ReactNode;
  highlightSelector?: string;
};

export function OnboardingWalkthrough({
  role,
  forceOpen,
  onComplete,
  onDismiss,
}: {
  role: "candidate" | "recruiter";
  forceOpen?: boolean;
  onComplete?: () => void;
  onDismiss?: () => void;
}) {
  const steps = role === "candidate" ? candidateSteps : recruiterSteps;
  const storageKey = `hiresight-onboarding-${role}`;

  // Check localStorage synchronously — skip mount if already completed
  const [isOpen, setIsOpen] = useState(() => {
    if (forceOpen) return true;
    if (typeof window === "undefined") return false;
    return localStorage.getItem(storageKey) !== "true";
  });

  const [completed, setCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const handleComplete = useCallback(() => {
    localStorage.setItem(storageKey, "true");
    setCompleted(true);
    setIsOpen(false);
    onComplete?.();
  }, [storageKey, onComplete]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(storageKey, "true");
    setCompleted(false);
    setIsOpen(false);
    onDismiss?.();
  }, [storageKey, onDismiss]);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Onboarding tour">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 24, scale: 0.97 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
          exit={shouldReduceMotion ? {} : { opacity: 0, y: -12, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-lg rounded-2xl border border-border/60 bg-background p-6 shadow-2xl mx-4 mb-0 sm:mb-0"
        >
          <button type="button" onClick={handleDismiss} className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" aria-label="Dismiss onboarding">
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium capitalize">{role} onboarding</span>
            <span className="ml-auto text-2xs text-muted-foreground">{currentStep + 1} / {steps.length}</span>
          </div>

          <div className="mb-6">
            {step.illustration && (
              <div className="mb-4 flex items-center justify-center">{step.illustration}</div>
            )}
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
          </div>

          <div className="flex items-center justify-between gap-3" role="group" aria-label="Onboarding navigation">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s - 1)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div key={i} className={`h-1.5 w-1.5 rounded-full transition-colors ${i === currentStep ? "bg-primary" : i < currentStep ? "bg-primary/40" : "bg-muted-foreground/20"}`} />
              ))}
            </div>

            {isLast ? (
              <button
                type="button"
                onClick={handleComplete}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" /> Done
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s + 1)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function resetOnboarding(role: "candidate" | "recruiter") {
  localStorage.removeItem(`hiresight-onboarding-${role}`);
}

export function isOnboardingComplete(role: "candidate" | "recruiter"): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(`hiresight-onboarding-${role}`) === "true";
}

function IllustrationCircle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
      {children}
    </div>
  );
}

const candidateSteps: OnboardingStep[] = [
  {
    title: "Welcome to HireSight AI",
    description: "Your AI-powered job search companion. We help you find the perfect role by matching your skills, experience, and communication style with top opportunities.",
    illustration: <IllustrationCircle><Sparkles className="h-8 w-8" /></IllustrationCircle>,
  },
  {
    title: "Complete Your Profile",
    description: "Start by filling in your professional details - your skills, experience, and career goals. A complete profile helps our AI find better matches for you.",
    illustration: <IllustrationCircle><svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 117.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg></IllustrationCircle>,
  },
  {
    title: "Upload Your Resume",
    description: "Upload your resume or record a video introduction. Our AI analyzes both to extract your skills, experience, and communication strengths.",
    illustration: <IllustrationCircle><svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg></IllustrationCircle>,
  },
  {
    title: "Apply to Jobs",
    description: "Browse recommended positions and apply with one click. Your AI profile is attached automatically - no more repetitive applications.",
    illustration: <IllustrationCircle><svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" /></svg></IllustrationCircle>,
  },
  {
    title: "AI Recommendations",
    description: "Our AI continuously scores your fit against each role based on skill overlap, experience relevance, and video signal strength. Check your dashboard daily for new matches.",
    illustration: <IllustrationCircle><svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg></IllustrationCircle>,
  },
];

const recruiterSteps: OnboardingStep[] = [
  {
    title: "Welcome to HireSight AI",
    description: "Your AI-powered recruiting command center. Find the best candidates faster with intelligent matching, video analysis, and pipeline automation.",
    illustration: <IllustrationCircle><Sparkles className="h-8 w-8" /></IllustrationCircle>,
  },
  {
    title: "Create Your First Job",
    description: "Post a role by describing the position, required skills, and seniority level. Our AI will automatically score incoming candidates against your requirements.",
    illustration: <IllustrationCircle><svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg></IllustrationCircle>,
  },
  {
    title: "Review Applicants",
    description: "Each candidate comes with an AI match score, skill breakdown, and video analysis. Focus on the best fits first with our ranked candidate list.",
    illustration: <IllustrationCircle><svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg></IllustrationCircle>,
  },
  {
    title: "Move Candidates Through Pipeline",
    description: "Drag candidates between stages - from Applied to Screening, Shortlisted, Interview, and Offer. Track progress at a glance.",
    illustration: <IllustrationCircle><svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg></IllustrationCircle>,
  },
  {
    title: "AI Scoring Explained",
    description: "Each candidate gets scored on three axes: Skill overlap (technical fit), Experience relevance (seniority match), and Video signal strength (communication clarity).",
    illustration: <IllustrationCircle><svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg></IllustrationCircle>,
  },
  {
    title: "Analytics Overview",
    description: "Monitor your pipeline with key metrics: total candidates, average match scores, stage distribution, and pipeline conversion rates. Make data-driven hiring decisions.",
    illustration: <IllustrationCircle><svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg></IllustrationCircle>,
  },
];
