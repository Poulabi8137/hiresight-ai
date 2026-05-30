"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from "recharts";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";

type Analytics = {
  totalCandidates: number;
  applicationsByStage: Record<string, number>;
  averageMatchScore: number;
  topSkills: { skill: string; count: number }[];
  applicationsOverTime: { date: string; count: number }[];
  averageTimeInPipeline: number;
  pipelineConversion: { from: string; to: string; rate: number }[];
};

const COLORS = ["hsl(173,80%,34%)", "hsl(15,94%,61%)", "hsl(142,76%,36%)", "hsl(260,80%,60%)", "hsl(38,92%,50%)"];
const STAGE_LABELS: Record<string, string> = { applied: "Applied", screening: "Screening", shortlisted: "Shortlisted", interview: "Interview", offer: "Offer" };

export function RecruiterAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/analytics/recruiter")
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setAnalytics(data.analytics); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <LoadingState text="Loading analytics..." />;
  if (error) return <ErrorState title="Failed to load analytics" message={error} onRetry={() => window.location.reload()} />;
  if (!analytics) return null;

  const stageData = Object.entries(analytics.applicationsByStage).map(([name, value]) => ({
    name: STAGE_LABELS[name] ?? name,
    value
  }));

  const pipelineData = analytics.pipelineConversion.map((p) => ({
    name: `${STAGE_LABELS[p.from] ?? p.from} \u2192 ${STAGE_LABELS[p.to] ?? p.to}`,
    rate: Math.round(p.rate * 100)
  }));

  const skillsData = analytics.topSkills.slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="primary"><BarChart3 className="mr-1 h-3.5 w-3.5" />Analytics</Badge>
          <h2 className="text-xl font-semibold mt-2">Recruiter dashboard</h2>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Users, label: "Total candidates", value: analytics.totalCandidates },
          { icon: TrendingUp, label: "Avg match score", value: `${analytics.averageMatchScore}%` },
          { icon: Clock, label: "Avg pipeline time", value: `${Math.round(analytics.averageTimeInPipeline / 86400)}d` },
          { icon: Sparkles, label: "Stages active", value: stageData.filter((s) => s.value > 0).length }
        ].map((stat) => (
          <Card key={stat.label} className="glass">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-semibold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader><CardTitle>Applications by Stage</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stageData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={(entry: unknown) => { const d = entry as { name?: string; percent?: number }; return `${d.name ?? ""} ${((d.percent ?? 0) * 100).toFixed(0)}%`; }}>
                    {stageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader><CardTitle>Applications Over Time</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.applicationsOverTime}>
                  <defs>
                    <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(173,80%,34%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(173,80%,34%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="count" stroke="hsl(173,80%,34%)" fill="url(#appGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader><CardTitle>Top Skills</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="skill" type="category" tick={{ fontSize: 11 }} width={100} stroke="hsl(var(--muted-foreground))" />
                  <RechartsTooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {skillsData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader><CardTitle>Pipeline Conversion</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" unit="%" />
                  <RechartsTooltip formatter={(v: unknown) => `${v as number}%`} />
                  <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                    {pipelineData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
