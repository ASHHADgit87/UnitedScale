"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import GlassCard from "./GlassCard";

const STEPS = [
  "Readings recorded",
  "Tolerance verified",
  "Certificate issued",
] as const;
const STEP_MS = 800;

const FIELDS = [
  { label: "Certificate no.", value: "US-CAL-DEMO-0001" },
  { label: "Instrument", value: "Platform Scale 500 × 600" },
  { label: "Capacity", value: "300 kg" },
  { label: "Result", value: "Within tolerance" },
] as const;

export default function CertScene() {
  const [stage, setStage] = useState(0);
  const issued = stage >= STEPS.length;

  useEffect(() => {
    if (stage >= STEPS.length) return;
    const id = setTimeout(() => setStage((current) => current + 1), STEP_MS);
    return () => clearTimeout(id);
  }, [stage]);

  return (
    <GlassCard
      eyebrow="Calibration"
      title="Certificate generation"
      badge={issued ? "Issued" : "Preparing"}
      badgeActive={issued}
    >
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center">
          {STEPS.map((label, i) => {
            const done = stage > i;
            return (
              <div
                key={label}
                className="flex flex-1 items-center last:flex-none"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border transition-colors duration-300 ${
                      done
                        ? "border-red-500 bg-red-500 text-snow"
                        : "border-white/15 text-transparent"
                    }`}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                  <span
                    className={`whitespace-nowrap text-[11px] font-medium transition-colors duration-300 ${
                      done ? "text-white" : "text-zinc-500"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="mx-3 h-px flex-1 bg-white/10">
                    <motion.div
                      className="h-full bg-red-500"
                      initial={{ width: "0%" }}
                      animate={{ width: stage > i ? "100%" : "0%" }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <motion.div
          className="flex flex-1 flex-col justify-between rounded-xl border border-white/15 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-3.5"
          animate={{ opacity: issued ? 1 : 0.4, y: issued ? 0 : 6 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-200">
              Calibration certificate
            </span>
            <span className="rounded border border-red-500/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-red-400">
              Sample
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {FIELDS.map((field) => (
              <div
                key={field.label}
                className="flex items-center justify-between text-[11px]"
              >
                <span className="text-zinc-500">{field.label}</span>
                <span className="font-medium tabular-nums text-zinc-100">
                  {field.value}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-500">
              Issued to Sample Industries
            </span>
            <motion.div
              className="text-white"
              animate={{ scale: issued ? 1 : 0.6, opacity: issued ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 14 }}
            >
              <svg viewBox="0 0 48 48" className="h-9 w-9">
                <circle
                  cx="24"
                  cy="24"
                  r="21"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="16"
                  fill="rgba(239,68,68,0.12)"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />
                <motion.path
                  d="M16 24.5 L22 30 L32 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: issued ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </GlassCard>
  );
}
