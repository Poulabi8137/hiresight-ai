import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthState } from "@/lib/auth";
import { listNotes, createNote } from "@/lib/db";
import { handleError, apiError, validate } from "@/lib/api-error";
import { assertCSRF } from "@/lib/csrf";

const noteSchema = z.object({
  candidateId: z.string().min(1),
  note: z.string().min(1).max(4000)
});

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthState();
    if (!auth || auth.role !== "recruiter") {
      return apiError("Recruiter authentication is required.", 401);
    }

    const candidateId = request.nextUrl.searchParams.get("candidateId");
    if (!candidateId) return apiError("candidateId query parameter is required.", 400);

    const notes = await listNotes(candidateId);
    return NextResponse.json({ notes, source: "supabase" });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(request: Request) {
  try {
    const csrf = assertCSRF(request); if (csrf) return csrf;
    const auth = await getAuthState();
    if (!auth || auth.role !== "recruiter") {
      return apiError("Recruiter authentication is required.", 401);
    }

    const body = await request.json();
    const parsed = validate(noteSchema, body);

    const { source } = await createNote({
      candidateId: parsed.candidateId,
      recruiterId: auth.userId,
      note: parsed.note
    });

    return NextResponse.json({ note: { candidateId: parsed.candidateId, note: parsed.note }, source }, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
