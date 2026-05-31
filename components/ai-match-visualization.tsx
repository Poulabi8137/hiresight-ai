"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, TrendingUpDown, Target, AlertTriangle, Star, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatScore, cn } from "@/lib/utils";
import type { MatchBreakdown } from "@/lib/types";

type AiMatchVisualizationProps = {
  breakdown: MatchBreakdown & {
    confidence: number;
    strengths: string[];
    weaknesses: string[];
  };
};

export function AiMatchVisualization({ breakdown }: AiMatchVisualizationProps) {
  const shouldReduceMotion = useReducedMotion();
  const score = breakdown.score;

  return (
    <div className="space-y-4" role="region" aria-label="AI Match Analysis">
      <div className="flex items-center gap-2">
        <Badge variant="primary">
          <Brain className="mr-1 h-3.5 w-3.5" />AI Match Analysis
        </Badge>
        <Badge variant="outline" className="ml-auto">
          <Sparkles className="mr-1 h-3 w-3" />
          {Math.round(breakdown.confidence)}% confident
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="relative">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120" role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label={`Overall match score: ${Math.round(score)}%`}>
                <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <motion.circle
                  cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 326.73} 326.73`}
                  initial={shouldReduceMotion ? undefined : { strokeDasharray: "0 326.73" }}
                  animate={shouldReduceMotion ? undefined : { strokeDasharray: `${(score / 100) * 326.73} 326.73` }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="text-3xl font-bold"
                  initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.5 }}
                  animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  {Math.round(score)}%
                </motion.span>
                <span className="text-2xs text-muted-foreground">Overall match</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <SignalBar label="Skill overlap" value={breakdown.skillScore} icon={Target} />
          <SignalBar label="Experience relevance" value={breakdown.experienceScore} icon={TrendingUpDown} />
          <SignalBar label="Video signal strength" value={breakdown.signalScore} icon={Brain} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {breakdown.matchedSkills.length > 0 && (
          <Card className="glass">
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Star className="h-4 w-4 text-emerald-400" /> Matched Skills</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {breakdown.matchedSkills.map((skill) => (
                  <span key={skill} className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">{skill}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {breakdown.missingSkills.length > 0 && (
          <Card className="glass">
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-orange-400" /> Missing Skills</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {breakdown.missingSkills.map((skill) => (
                  <span key={skill} className="rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-medium text-orange-400">{skill}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {breakdown.strengths.length > 0 && (
          <Card className="glass">
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Star className="h-4 w-4 text-emerald-400" /> Strengths</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {breakdown.strengths.map((s, i) => (
                  <motion.li
                    key={i}
                    initial={shouldReduceMotion ? undefined : { opacity: 0, x: -8 }}
                    animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                    {s}
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {breakdown.weaknesses.length > 0 && (
          <Card className="glass">
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-orange-400" /> Areas to Improve</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {breakdown.weaknesses.map((w, i) => (
                  <motion.li
                    key={i}
                    initial={shouldReduceMotion ? undefined : { opacity: 0, x: -8 }}
                    animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-400" aria-hidden="true" />
                    {w}
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {breakdown.summary && (
        <Card className="glass">
          <CardContent className="p-4">
            <p className="text-sm leading-6 text-muted-foreground">{breakdown.summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SignalBar({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="h-3.5 w-3.5 text-primary" />
          {label}
        </span>
        <span className="font-medium">{Math.round(value)}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}
