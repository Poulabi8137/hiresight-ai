import { z } from "zod";
import { getAuthState } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { apiError, handleError, validate } from "@/lib/api-error";

const cleanupSchema = z.object({
  bucket: z.string().min(1),
  path: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const auth = await getAuthState();
    if (!auth) return apiError("Authentication is required.", 401);

    const body = await request.json();
    const parsed = validate(cleanupSchema, body);

    const supabase = createServerSupabaseClient();
    if (!supabase) return apiError("Supabase not configured.", 500);

    const { error } = await supabase.storage.from(parsed.bucket).remove([parsed.path]);
    if (error) return apiError(error.message, 500);

    return Response.json({ cleaned: true });
  } catch (e) {
    return handleError(e);
  }
}
