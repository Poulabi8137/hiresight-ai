import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { listJobs } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function JobsPage() {
  const { data: jobs } = await listJobs(1, 100);

  return (
    <main className="container py-10">
      <div className="mb-8">
        <Badge>Job discovery</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">Open roles ranked by fit.</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Candidates see roles with transparent fit signals. Recruiters get applications enriched by video and AI summaries.
        </p>
      </div>
      {jobs.length === 0 ? (
        <Card className="glass flex min-h-[200px] items-center justify-center p-8 text-center">
          <p className="text-muted-foreground">No open roles at the moment. Check back later.</p>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {jobs.map((job) => (
            <Card key={job.id} className="glass p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                  <h2 className="mt-1 text-2xl font-semibold">{job.title}</h2>
                </div>
                <Badge>{job.status}</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{job.description}</p>
              <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {job.location} · {job.mode} · {job.salary}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {job.skills.map((skill) => <Badge key={skill}>{skill}</Badge>)}
              </div>
              <Button asChild className="mt-6">
                <Link href="/candidate">
                  Apply with video profile
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
