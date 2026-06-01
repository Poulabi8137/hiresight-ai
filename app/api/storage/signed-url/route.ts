import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthState } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { assertCSRF } from "@/lib/csrf";

export const runtime = "nodejs";

const schema = z.object({
  bucket: z.enum(["resumes", "videos", "avatars"]),
  path: z.string().min(1),
  expiresIn: z.number().int().min(10).max(60 * 60).optional()
});

/** Extract the owner userId from a storage path (format: {userId}/{kind}/...). */
function extractOwnerFromPath(path: string): string | null {
  const firstSlash = path.indexOf("/");
  return firstSlash > 0 ? path.slice(0, firstSlash) : null;
}

/** Verify that a recruiter has a business relationship with a given user. */
async function recruiterCanAccessUser(
  supabase: NonNullable<ReturnType<typeof createServerSupabaseClient>>,
  recruiterUserId: string,
  targetUserId: string
): Promise<boolean> {
  // The recruiter must own a job that has an application from this candidate.
  const { count } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .in(
      "job_id",
      supabase
        .from("jobs")
        .select("id")
        .in(
          "employer_id",
          supabase.from("employers").select("id").eq("owner_id", recruiterUserId)
        )
    )
    .in(
      "candidate_id",
      supabase.from("candidates").select("id").eq("user_id", targetUserId)
    );

  return (count ?? 0) > 0;
}

export async function POST(request: Request) {
  const csrf = assertCSRF(request); if (csrf) return csrf;
  const auth = await getAuthState();
  if (!auth) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Ownership rule: by default users can only mint signed URLs for their own folder.
  const isOwnerPath = parsed.data.path.startsWith(`${auth.userId}/`);

  if (!isOwnerPath) {
    // Recruiters may access candidate videos, but only if they have a work relationship.
    if (auth.role === "recruiter" && parsed.data.bucket === "videos") {
      const ownerId = extractOwnerFromPath(parsed.data.path);
      if (!ownerId || !(await recruiterCanAccessUser(supabase, auth.userId, ownerId))) {
        logger.warn("signed-url: recruiter not authorized for path", {
          metadata: { recruiterId: auth.userId, path: parsed.data.path }
        });
        return NextResponse.json({ error: "Not allowed." }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "Not allowed." }, { status: 403 });
    }
  }

  const expiresIn = parsed.data.expiresIn ?? 60 * 30;
  const { data, error } = await supabase.storage.from(parsed.data.bucket).createSignedUrl(parsed.data.path, expiresIn);
  if (error) return NextResponse.json({ error: "Could not generate signed URL." }, { status: 500 });
  if (!data?.signedUrl) return NextResponse.json({ error: "Could not generate signed URL." }, { status: 500 });

  return NextResponse.json({ signedUrl: data.signedUrl, expiresIn });
}

