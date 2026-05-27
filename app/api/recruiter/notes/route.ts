import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { getAuthState } from "@/lib/auth";

export async function POST(request: Request) {
  const auth = await getAuthState();
  if (!auth || auth.role !== "recruiter") {
    return NextResponse.json({ error: "Recruiter authentication is required." }, { status: 401 });
  }

  const body = await request.json();
  if (!body.candidateId || !body.note) {
    return NextResponse.json({ error: "candidateId and note are required" }, { status: 400 });
  }

  const record = {
    candidate_id: body.candidateId,
    recruiter_id: auth.userId,
    note: String(body.note).slice(0, 4000)
  };

  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ note: { id: `demo-${Date.now()}`, ...record }, source: "demo" }, { status: 201 });
  }

  const { data, error } = await supabase.from("recruiter_notes").insert(record).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ note: data, source: "supabase" }, { status: 201 });
}
