"use client";

import { type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

type PremiumTiltCardProps = {
  children: ReactNode;
  className?: string;
  glareClassName?: string;
  intensity?: number;
};

export function PremiumTiltCard({
  children,
  className,
  glareClassName,
  intensity = 10
}: PremiumTiltCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(y, { stiffness: 160, damping: 22, mass: 0.35 });
  const rotateY = useSpring(x, { stiffness: 160, damping: 22, mass: 0.35 });

  const transform = useMotionTemplate`perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  const onMove: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    x.set((px - 0.5) * intensity);
    y.set((0.5 - py) * intensity);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transformStyle: "preserve-3d", transform }}
      className={cn("group relative", className)}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          "bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.28),transparent_45%)]",
          glareClassName
        )}
      />
      <div style={{ transform: "translateZ(30px)" }} className="relative">
        {children}
      </div>
    </motion.div>
  );
}
