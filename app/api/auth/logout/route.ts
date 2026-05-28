import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const demoCookie = "hiresight_demo_role";

export async function POST() {
  const supabase = createServerSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  // Clear demo cookie as well (if demo auth is enabled).
  cookies().set(demoCookie, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });

  return NextResponse.json({ ok: true });
}

