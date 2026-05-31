"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedCounter({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0);
  const startRef = useRef(0);

  useEffect(() => {
    const diff = value - startRef.current;
    if (diff === 0) return;
    const duration = 200;
    const step = Math.max(1, Math.ceil(Math.abs(diff) / (duration / 16)));
    let current = startRef.current;

    const timer = setInterval(() => {
      current += Math.sign(diff) * step;
      if (Math.abs(current - value) <= step) {
        setDisplayed(value);
        startRef.current = value;
        clearInterval(timer);
      } else {
        setDisplayed(current);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayed}{suffix}</span>;
}
