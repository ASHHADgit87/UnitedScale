"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

interface GlassCardProps {
  eyebrow: string;
  title: string;
  badge?: string;
  badgeActive?: boolean;
  children: ReactNode;
}

export default function GlassCard({
  eyebrow,
  title,
  badge,
  badgeActive = false,
  children,
}: GlassCardProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 120, damping: 18 });
  const smoothY = useSpring(pointerY, { stiffness: 120, damping: 18 });
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-9, 9]);
  const glowX = useTransform(smoothX, [-0.5, 0.5], ["15%", "85%"]);
  const glowY = useTransform(smoothY, [-0.5, 0.5], ["15%", "85%"]);
  const glow = useMotionTemplate`radial-gradient(360px circle at ${glowX} ${glowY}, rgba(239, 68, 68, 0.22), transparent 65%)`;

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <div style={{ perspective: 1200 }}>
      <motion.div
        ref={ref}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        style={reduceMotion ? undefined : { rotateX, rotateY }}
        className="relative flex h-[340px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.02] to-transparent p-5 shadow-[0_0_60px_rgba(220,38,38,0.18)] backdrop-blur-xl"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: glow }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />
        <div className="absolute left-3 top-3 h-3 w-3 border-l border-t border-red-500/60" />
        <div className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-red-500/60" />

        <div className="relative flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-red-400">
              {eyebrow}
            </span>
            <span className="text-base font-semibold text-white">{title}</span>
          </div>
          {badge && (
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest transition-colors duration-300 ${
                badgeActive
                  ? "border-white bg-white text-zinc-950"
                  : "border-red-500/40 bg-red-500/10 text-red-300"
              }`}
            >
              {badge}
            </span>
          )}
        </div>

        <div className="relative mt-4 min-h-0 flex-1">{children}</div>
      </motion.div>
    </div>
  );
}
