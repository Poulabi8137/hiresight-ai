import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthState } from "@/lib/auth";
import { listSavedJobs, saveJob, unsaveJob } from "@/lib/db";
import { handleError, apiError, validate } from "@/lib/api-error";
import { assertCSRF } from "@/lib/csrf";

const jobIdSchema = z.object({ jobId: z.string().min(1) });

export async function GET() {
  try {
    const auth = await getAuthState();
    if (!auth || auth.role !== "candidate") {
      return apiError("Candidate authentication is required.", 401);
    }
    const { data, source } = await listSavedJobs(auth.userId);
    return NextResponse.json({ savedJobIds: data, source });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(request: Request) {
  try {
    const csrf = assertCSRF(request); if (csrf) return csrf;
    const auth = await getAuthState();
    if (!auth || auth.role !== "candidate") {
      return apiError("Candidate authentication is required.", 401);
    }
    const body = await request.json();
    const parsed = validate(jobIdSchema, body);
    await saveJob(auth.userId, parsed.jobId);
    return NextResponse.json({ saved: true }, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(request: Request) {
  try {
    const csrf = assertCSRF(request); if (csrf) return csrf;
    const auth = await getAuthState();
    if (!auth || auth.role !== "candidate") {
      return apiError("Candidate authentication is required.", 401);
    }
    const body = await request.json();
    const parsed = validate(jobIdSchema, body);
    await unsaveJob(auth.userId, parsed.jobId);
    return NextResponse.json({ saved: false });
  } catch (e) {
    return handleError(e);
  }
}
