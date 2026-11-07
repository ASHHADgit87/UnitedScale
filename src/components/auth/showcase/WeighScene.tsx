"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import GlassCard from "./GlassCard";

const TARGET_KG = 248.65;
const CAPACITY_KG = 300;
const TICK_MS = 120;
const RAMP_TICKS = 28;
const HISTORY_SIZE = 28;
const RING_RADIUS = 48;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
const TICKS = Array.from({ length: 60 }, (_, i) => i);

export default function WeighScene() {
  const reduceMotion = useReducedMotion();
  const [weight, setWeight] = useState(0);
  const [stable, setStable] = useState(false);
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    if (reduceMotion) {
      setWeight(TARGET_KG);
      setStable(true);
      setHistory(Array.from({ length: HISTORY_SIZE }, () => TARGET_KG));
      return;
    }

    let tick = 0;
    const id = setInterval(() => {
      tick += 1;
      const progress = Math.min(tick / RAMP_TICKS, 1);
      const isStable = progress >= 1;
      const jitter = isStable ? 0 : (Math.random() - 0.5) * 6 * (1 - progress);
      const next = Math.max(0, TARGET_KG * progress + jitter);

      setWeight(next);
      setStable(isStable);
      setHistory((prev) => [...prev.slice(-(HISTORY_SIZE - 1)), next]);

      if (isStable) clearInterval(id);
    }, TICK_MS);

    return () => clearInterval(id);
  }, [reduceMotion]);

  const fraction = Math.min(weight / CAPACITY_KG, 1);
  const loadPct = (fraction * 100).toFixed(1);
  const padded = [
    ...Array.from({ length: HISTORY_SIZE - history.length }, () => 0),
    ...history,
  ];

  const rows = [
    { label: "Capacity", value: `${CAPACITY_KG} kg` },
    { label: "Current load", value: `${loadPct}%` },
    { label: "Resolution", value: "0.01 kg" },
    { label: "Signal", value: stable ? "Locked" : "Settling" },
  ];

  return (
    <GlassCard
      eyebrow="Weighing"
      title="Platform scale · 300 kg"
      badge={stable ? "Stable" : "Settling"}
      badgeActive={stable}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-center gap-6">
          <div className="relative h-36 w-36 flex-none">
            <svg viewBox="0 0 120 120" className="h-full w-full text-white">
              <defs>
                <linearGradient id="weighRing" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#b91c1c" />
                  <stop offset="100%" stopColor="#fca5a5" />
                </linearGradient>
              </defs>
              {TICKS.map((i) => (
                <line
                  key={i}
                  x1="60"
                  y1="2"
                  x2="60"
                  y2={i % 5 === 0 ? 8 : 5}
                  transform={`rotate(${i * 6} 60 60)`}
                  stroke="currentColor"
                  strokeOpacity={0.28}
                  strokeWidth={i % 5 === 0 ? 1 : 0.6}
                />
              ))}
              <circle
                cx="60"
                cy="60"
                r={RING_RADIUS}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.1}
                strokeWidth="6"
              />
              <circle
                cx="60"
                cy="60"
                r={RING_RADIUS}
                fill="none"
                stroke="url(#weighRing)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={RING_LENGTH}
                strokeDashoffset={RING_LENGTH * (1 - fraction)}
                transform="rotate(-90 60 60)"
                className="drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold tabular-nums text-white">
                {weight.toFixed(2)}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-red-400">
                kg
              </span>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between border-b border-white/10 py-1.5 text-xs last:border-b-0"
              >
                <span className="text-zinc-500">{row.label}</span>
                <span className="font-medium tabular-nums text-zinc-100">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">
            Signal history
          </span>
          <div className="flex h-12 items-end gap-1">
            {padded.map((value, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-gradient-to-t from-red-800 to-red-400"
                style={{
                  height: `${Math.max((value / CAPACITY_KG) * 100, 3)}%`,
                  opacity: 0.35 + (i / HISTORY_SIZE) * 0.65,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
