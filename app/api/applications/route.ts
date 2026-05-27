import { NextResponse } from "next/server";
import { applications, candidates, jobs } from "@/lib/demo-data";
import { scoreCandidate } from "@/lib/ai/scoring";
import { applicationSchema } from "@/lib/validation";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { getAuthState } from "@/lib/auth";

export async function GET() {
  const auth = await getAuthState();
  if (!auth) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }

  return NextResponse.json({ applications, source: "demo" });
}

export async function POST(request: Request) {
  const auth = await getAuthState();
  if (!auth || auth.role !== "candidate") {
    return NextResponse.json({ error: "Candidate authentication is required to apply." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid application payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const candidate = candidates.find((item) => item.id === parsed.data.candidateId);
  const job = jobs.find((item) => item.id === parsed.data.jobId);
  if (!candidate || !job) {
    return NextResponse.json({ error: "Candidate or job not found" }, { status: 404 });
  }

  const match = scoreCandidate(candidate, job);
  const record = {
    candidate_id: parsed.data.candidateId,
    job_id: parsed.data.jobId,
    stage: "applied",
    match_score: match.score
  };

  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ application: { id: `demo-${Date.now()}`, ...record }, match, source: "demo" }, { status: 201 });
  }

  const { data, error } = await supabase.from("applications").insert(record).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ application: data, match, source: "supabase" }, { status: 201 });
}
