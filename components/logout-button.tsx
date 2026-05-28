"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="bg-background/70 backdrop-blur-md"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.refresh();
        router.push("/");
      }}
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
}

