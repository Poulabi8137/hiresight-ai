import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const demoCookie = "hiresight_demo_role";

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  const url = new URL("/", request.url);
  const response = NextResponse.redirect(url);

  response.cookies.set(demoCookie, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });

  return response;
}
