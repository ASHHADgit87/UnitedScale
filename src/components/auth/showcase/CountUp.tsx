"use client";

import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";

interface CountUpProps {
  value: number;
  active?: boolean;
  durationSec?: number;
  delaySec?: number;
  decimals?: number;
  className?: string;
}

export default function CountUp({
  value,
  active = true,
  durationSec = 1.2,
  delaySec = 0,
  decimals = 0,
  className,
}: CountUpProps) {
  const reduceMotion = useReducedMotion();
  const progress = useMotionValue(0);
  const text = useTransform(progress, (current) =>
    current.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
  );

  useEffect(() => {
    if (!active) {
      progress.set(0);
      return;
    }
    if (reduceMotion) {
      progress.set(value);
      return;
    }
    const controls = animate(progress, value, {
      duration: durationSec,
      delay: delaySec,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [active, value, reduceMotion, durationSec, delaySec, progress]);

  return <motion.span className={className}>{text}</motion.span>;
}
