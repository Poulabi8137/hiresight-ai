import { NextResponse } from "next/server";
import { candidates } from "@/lib/demo-data";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { getAuthState } from "@/lib/auth";

export async function GET() {
  const auth = await getAuthState();
  if (!auth || auth.role !== "recruiter") {
    return NextResponse.json({ error: "Recruiter authentication is required." }, { status: 401 });
  }

  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ candidates, source: "demo" });
  }

  const { data, error } = await supabase
    .from("candidates")
    .select("*, users(full_name, avatar_url)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ candidates: data, source: "supabase" });
}
