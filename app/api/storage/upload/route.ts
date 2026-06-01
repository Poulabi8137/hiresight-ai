import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthState } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { enqueueResumeParse } from "@/lib/jobs";
import { assertCSRF } from "@/lib/csrf";

export const runtime = "nodejs";

const kindSchema = z.enum(["resume", "video_resume", "interview", "avatar"]);

const uploadSchema = z.object({
  kind: kindSchema,
  contentHash: z.string().optional()
});

const limits = {
  resume: {
    bucket: "resumes",
    maxBytes: 25 * 1024 * 1024,
    allowed: ["application/pdf"]
  },
  video_resume: {
    bucket: "videos",
    maxBytes: 250 * 1024 * 1024,
    allowed: ["video/mp4", "video/webm", "video/quicktime"]
  },
  interview: {
    bucket: "videos",
    maxBytes: 250 * 1024 * 1024,
    allowed: ["video/mp4", "video/webm", "video/quicktime"]
  },
  avatar: {
    bucket: "avatars",
    maxBytes: 5 * 1024 * 1024,
    allowed: ["image/png", "image/jpeg", "image/webp"]
  }
} as const;

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 160);
}

export async function POST(request: Request) {
  const csrf = assertCSRF(request); if (csrf) return csrf;
  const auth = await getAuthState();
  if (!auth) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY." },
      { status: 500 }
    );
  }

  const form = await request.formData();
  const kind = String(form.get("kind") ?? "");
  const parsed = uploadSchema.safeParse({ kind });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid upload payload.", issues: parsed.error.flatten() }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file." }, { status: 400 });
  }

  const lane = limits[parsed.data.kind];

  // Role gating: only candidates upload resume/video/interview. Avatars allowed for both roles.
  if (parsed.data.kind !== "avatar" && auth.role !== "candidate") {
    return NextResponse.json({ error: "Only candidates can upload resumes and videos." }, { status: 403 });
  }

  if (!lane.allowed.includes(file.type as never)) {
    return NextResponse.json(
      { error: "Unsupported MIME type.", allowed: lane.allowed, received: file.type },
      { status: 415 }
    );
  }

  if (file.size <= 0 || file.size > lane.maxBytes) {
    return NextResponse.json(
      { error: "File exceeds size limit.", maxBytes: lane.maxBytes, received: file.size },
      { status: 413 }
    );
  }

  // Dedup: check for existing upload with same owner + kind + file name + size
  const safeName = sanitizeFileName(file.name || "upload");
  const { data: existing } = await supabase
    .from("uploads")
    .select("*")
    .eq("owner_id", auth.userId)
    .eq("kind", parsed.data.kind)
    .eq("file_name", safeName)
    .eq("size", file.size)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { upload: existing, durable: { bucket: existing.bucket, path: existing.storage_path, url: existing.url }, dedup: true },
      { status: 200 }
    );
  }

  const storagePath = `${auth.userId}/${parsed.data.kind}/${Date.now()}-${safeName}`;
  const bucket = lane.bucket;

  let uploadError: { message: string } | null = null;
  try {
    const { error } = await supabase.storage.from(bucket).upload(storagePath, file, {
      upsert: false,
      contentType: file.type,
      cacheControl: "3600"
    });
    uploadError = error;
  } catch (e) {
    uploadError = { message: e instanceof Error ? e.message : "Storage service unreachable." };
  }

  if (uploadError) {
    return NextResponse.json({ error: "File upload to storage failed." }, { status: 500 });
  }

  const durableUrl = `supabase://${bucket}/${storagePath}`;
  const record = {
    owner_id: auth.userId,
    kind: parsed.data.kind,
    file_name: safeName,
    content_type: file.type,
    size: file.size,
    bucket,
    storage_path: storagePath,
    url: durableUrl
  };

  let uploadRow: any = null;
  try {
    const { data, error: insertError } = await supabase.from("uploads").insert(record).select("*").single();
    if (insertError) return NextResponse.json({ error: "Failed to record upload metadata." }, { status: 500 });
    uploadRow = data;
  } catch {
    return NextResponse.json({ error: "Failed to record upload metadata." }, { status: 500 });
  }

  // Best-effort persistence onto profile tables (when present). We never store signed URLs here.
  try {
    if (parsed.data.kind === "avatar") {
      await supabase.from("users").update({ avatar_url: durableUrl }).eq("id", auth.userId);
    } else {
      const updates =
        parsed.data.kind === "resume"
          ? { resume_url: durableUrl }
          : parsed.data.kind === "video_resume"
            ? { video_url: durableUrl }
            : null;

      if (updates) {
        await supabase.from("candidates").update(updates).eq("user_id", auth.userId);
      }
    }
  } catch {
    // Profile update is best-effort; upload already succeeded
  }

  // Enqueue resume parsing for resume uploads
  if (parsed.data.kind === "resume") {
    enqueueResumeParse(auth.userId, bucket, storagePath);
  }

  return NextResponse.json(
    {
      upload: uploadRow,
      durable: { bucket, path: storagePath, url: durableUrl }
    },
    { status: 201 }
  );
}

