import { UploadStudio } from "@/components/upload-studio";
import { requireAnyRole } from "@/lib/auth";

export default async function UploadPage() {
  await requireAnyRole();
  return <UploadStudio />;
}
