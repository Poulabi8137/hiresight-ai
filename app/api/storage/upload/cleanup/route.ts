import { z } from "zod";
import { getAuthState } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { apiError, handleError, validate } from "@/lib/api-error";
import { logger } from "@/lib/logger";
import { assertCSRF } from "@/lib/csrf";

const cleanupSchema = z.object({
  bucket: z.string().min(1),
  path: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const csrf = assertCSRF(request); if (csrf) return csrf;
    const auth = await getAuthState();
    if (!auth) return apiError("Authentication is required.", 401);

    const body = await request.json();
    const parsed = validate(cleanupSchema, body);

    const supabase = createServerSupabaseClient();
    if (!supabase) return apiError("Supabase not configured.", 500);

    // Ownership check: only the file owner may delete
    const { data: uploadRecord } = await supabase
      .from("uploads")
      .select("owner_id")
      .eq("bucket", parsed.bucket)
      .eq("storage_path", parsed.path)
      .maybeSingle();

    if (!uploadRecord) {
      logger.warn("cleanup: file not found in metadata", {
        metadata: { bucket: parsed.bucket, path: parsed.path, userId: auth.userId }
      });
      return apiError("File not found or already removed.", 404);
    }

    if (uploadRecord.owner_id !== auth.userId) {
      logger.warn("cleanup: ownership mismatch", {
        metadata: { bucket: parsed.bucket, path: parsed.path, owner: uploadRecord.owner_id, requester: auth.userId }
      });
      return apiError("You do not own this file.", 403);
    }

    const { error } = await supabase.storage.from(parsed.bucket).remove([parsed.path]);
    if (error) return apiError("Storage service error.", 500);

    return Response.json({ cleaned: true });
  } catch (e) {
    return handleError(e);
  }
}
