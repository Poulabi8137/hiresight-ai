import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthState } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const schema = z.object({
  bucket: z.enum(["resumes", "videos", "avatars"]),
  path: z.string().min(1),
  expiresIn: z.number().int().min(10).max(60 * 60).optional()
});

export async function POST(request: Request) {
  const auth = await getAuthState();
  if (!auth) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid signed-url payload.", issues: parsed.error.flatten() }, { status: 400 });
  }

  // Ownership rule: by default users can only mint signed URLs for their own folder.
  // Recruiters can request signed URLs for videos (RLS policies allow video reads).
  const isOwnerPath = parsed.data.path.startsWith(`${auth.userId}/`);
  if (!isOwnerPath) {
    if (!(auth.role === "recruiter" && parsed.data.bucket === "videos")) {
      return NextResponse.json({ error: "Not allowed." }, { status: 403 });
    }
  }

  const expiresIn = parsed.data.expiresIn ?? 60 * 30;
  const { data, error } = await supabase.storage.from(parsed.data.bucket).createSignedUrl(parsed.data.path, expiresIn);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data?.signedUrl) return NextResponse.json({ error: "Could not generate signed URL." }, { status: 500 });

  return NextResponse.json({ signedUrl: data.signedUrl, expiresIn });
}

