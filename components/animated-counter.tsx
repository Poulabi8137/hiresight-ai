"use client";

import { motion, useMotionValue, useReducedMotion, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

export function AnimatedCounter({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => `${Math.round(latest)}${suffix}`);

  useEffect(() => {
    if (shouldReduceMotion) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, { duration: 1.2, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [count, shouldReduceMotion, value]);

  return <motion.span>{rounded}</motion.span>;
}
