import { RecruiterWorkspace } from "@/components/recruiter-workspace";
import { requireRole } from "@/lib/auth";

export default async function RecruiterPage() {
  await requireRole("recruiter");
  return <RecruiterWorkspace />;
}
