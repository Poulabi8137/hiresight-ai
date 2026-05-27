import { CandidateWorkspace } from "@/components/candidate-workspace";
import { requireRole } from "@/lib/auth";

export default async function CandidatePage() {
  await requireRole("candidate");
  return <CandidateWorkspace />;
}
