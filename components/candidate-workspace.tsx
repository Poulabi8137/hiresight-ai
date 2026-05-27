"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock3, FileText, Video } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { jobs } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function CandidateWorkspace() {
  const profileSteps: Array<[string, string, LucideIcon, number]> = [
    ["Resume PDF", "Parsed 18 skills and 4 project outcomes", FileText, 100],
    ["Video resume", "Communication signal ready for recruiters", Video, 100],
    ["Interview sample", "Optional upload recommended", Clock3, 42]
  ];

  return (
    <main className="container py-10">
      <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_0.45fr]">
        <div>
          <Badge>Candidate studio</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">Build a profile recruiters can feel.</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Upload your resume, record a video pitch, track applications, and get AI feedback before recruiters review you.
          </p>
        </div>
        <Card className="glass p-5">
          <p className="text-sm text-muted-foreground">Profile strength</p>
          <div className="mt-2 text-4xl font-semibold">86%</div>
          <Progress value={86} className="mt-4" />
          <p className="mt-3 text-sm text-muted-foreground">Add an interview sample to improve matching confidence.</p>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="space-y-4">
          {profileSteps.map(([title, copy, Icon, value], index) => (
            <motion.div
              key={String(title)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="glass rounded-lg p-5"
            >
              <div className="flex items-start gap-4">
                <span className="rounded-md bg-primary/15 p-3 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <h2 className="font-semibold">{title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
                  <Progress value={value} className="mt-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        <section className="glass rounded-lg p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Recommended jobs</h2>
              <p className="text-sm text-muted-foreground">Ranked by your resume, skills, and video signals.</p>
            </div>
            <Button variant="outline" size="sm">Refresh AI</Button>
          </div>
          <div className="mt-5 space-y-4">
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-lg border bg-background/65 p-5"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">{job.company} · {job.mode}</p>
                    <h3 className="mt-1 text-xl font-semibold">{job.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{job.description}</p>
                  </div>
                  <Badge>{index === 0 ? "94% fit" : "89% fit"}</Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.skills.map((skill) => <Badge key={skill}>{skill}</Badge>)}
                </div>
                <div className="mt-5 flex gap-3">
                  <Button size="sm">
                    Apply
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <CheckCircle2 className="h-4 w-4" />
                    Save
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
