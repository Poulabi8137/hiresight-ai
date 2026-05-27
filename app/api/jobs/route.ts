import { NextResponse } from "next/server";
import { jobs } from "@/lib/demo-data";
import { jobSchema } from "@/lib/validation";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { getAuthState } from "@/lib/auth";

export async function GET() {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ jobs, source: "demo" });
  }

  const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ jobs: data, source: "supabase" });
}

export async function POST(request: Request) {
  const auth = await getAuthState();
  if (!auth || auth.role !== "recruiter") {
    return NextResponse.json({ error: "Recruiter authentication is required to post jobs." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = jobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid job payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  const record = {
    ...parsed.data,
    employer_id: body.employerId ?? "00000000-0000-0000-0000-000000000001",
    status: "open"
  };

  if (!supabase) {
    return NextResponse.json({ job: { id: `demo-${Date.now()}`, ...record }, source: "demo" }, { status: 201 });
  }

  const { data, error } = await supabase.from("jobs").insert(record).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ job: data, source: "supabase" }, { status: 201 });
}
