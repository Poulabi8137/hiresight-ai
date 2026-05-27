"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  const cycleTheme = () => {
    setTheme(theme === "dark" ? "light" : theme === "light" ? "system" : "dark");
  };

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Laptop;

  return (
    <Button aria-label="Toggle theme" variant="ghost" size="icon" onClick={cycleTheme}>
      <Icon className="h-4 w-4" />
    </Button>
  );
}
