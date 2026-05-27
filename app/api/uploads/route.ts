import { NextResponse } from "next/server";
import { uploadRequestSchema } from "@/lib/validation";
import { getAuthState } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const maxBytes = 250 * 1024 * 1024;

function bucketForKind(kind: "resume" | "video_resume" | "interview") {
  return kind === "resume" ? "resumes" : "videos";
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = uploadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid upload payload", issues: parsed.error.flatten() }, { status: 400 });
  }
  if (parsed.data.size > maxBytes) {
    return NextResponse.json({ error: "File exceeds 250MB limit" }, { status: 413 });
  }

  const auth = await getAuthState();
  if (!auth) {
    return NextResponse.json({ error: "Authentication is required before uploading media." }, { status: 401 });
  }

  const bucket = parsed.data.bucket ?? bucketForKind(parsed.data.kind);
  const storagePath =
    parsed.data.storagePath ??
    `${auth.userId}/${parsed.data.kind}/${Date.now()}-${parsed.data.fileName.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  const url = parsed.data.signedUrl ?? `supabase://${bucket}/${storagePath}`;

  const record = {
    owner_id: auth.userId,
    kind: parsed.data.kind,
    file_name: parsed.data.fileName,
    content_type: parsed.data.contentType,
    size: parsed.data.size,
    bucket,
    storage_path: storagePath,
    url
  };

  const supabase = createServerSupabaseClient();
  if (supabase && auth.source === "supabase") {
    const { data, error } = await supabase.from("uploads").insert(record).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ upload: data, source: "supabase" }, { status: 201 });
  }

  return NextResponse.json({ upload: { id: `demo-${Date.now()}`, ...record }, source: "demo" }, { status: 201 });
}
