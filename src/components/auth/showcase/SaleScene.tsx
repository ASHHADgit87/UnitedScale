"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "./GlassCard";
import CountUp from "./CountUp";

interface Batch {
  id: string;
  name: string;
  received: string;
  qty: number;
  unitCost: number;
}

const PRODUCT = "S-Type Load Cell 500 kg";
const SALE_QTY = 14;
const UNIT_PRICE = 24000;

const BATCHES: Batch[] = [
  {
    id: "a",
    name: "Batch A",
    received: "Received 12 Mar",
    qty: 10,
    unitCost: 18500,
  },
  {
    id: "b",
    name: "Batch B",
    received: "Received 04 Jun",
    qty: 40,
    unitCost: 19200,
  },
  {
    id: "c",
    name: "Batch C",
    received: "Received 19 Sep",
    qty: 25,
    unitCost: 20100,
  },
];

const deductOldestFirst = (batches: Batch[], qtyNeeded: number) => {
  let remaining = qtyNeeded;
  let cost = 0;

  const result = batches.map((batch) => {
    const taken = Math.min(batch.qty, remaining);
    remaining -= taken;
    cost += taken * batch.unitCost;
    return { ...batch, left: batch.qty - taken };
  });

  return { result, cost };
};

const { result: AFTER, cost: COST } = deductOldestFirst(BATCHES, SALE_QTY);
const REVENUE = SALE_QTY * UNIT_PRICE;
const PROFIT = REVENUE - COST;
const MARGIN = ((PROFIT / REVENUE) * 100).toFixed(1);

const STATS = [
  {
    label: "Cost of goods",
    value: COST,
    note: `${SALE_QTY} units`,
    highlight: false,
  },
  {
    label: "Revenue",
    value: REVENUE,
    note: `PKR ${UNIT_PRICE.toLocaleString("en-US")} each`,
    highlight: false,
  },
  {
    label: "Gross profit",
    value: PROFIT,
    note: `${MARGIN}% margin`,
    highlight: true,
  },
] as const;

const getStatus = (left: number, qty: number) => {
  if (left === 0) return { label: "Used up", className: "text-red-400" };
  if (left < qty) return { label: "Partly used", className: "text-white" };
  return { label: "In stock", className: "text-zinc-500" };
};

export default function SaleScene() {
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setApplied(true), 900);
    return () => clearTimeout(id);
  }, []);

  return (
    <GlassCard
      eyebrow="Stock"
      title="Oldest stock sells first"
      badge="Auto-costed"
      badgeActive={applied}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">
              Sale order
            </span>
            <span className="text-sm font-medium text-white">{PRODUCT}</span>
          </div>
          <span className="text-sm font-semibold text-red-400">
            {SALE_QTY} units
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {AFTER.map((batch, index) => {
            const shown = applied ? batch.left : batch.qty;
            const pct = (shown / batch.qty) * 100;
            const status = getStatus(shown, batch.qty);

            return (
              <div key={batch.id} className="flex items-center gap-3">
                <div className="flex w-36 flex-col">
                  <span className="text-xs font-medium text-zinc-200">
                    {batch.name}
                  </span>
                  <span className="truncate text-[10px] text-zinc-500">
                    {batch.received} · PKR{" "}
                    {batch.unitCost.toLocaleString("en-US")}
                  </span>
                </div>
                <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-red-700 via-red-500 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.7)]"
                    initial={{ width: "100%" }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      duration: 1,
                      ease: "easeOut",
                      delay: index * 0.15,
                    }}
                  />
                </div>
                <span className="w-14 text-right text-xs tabular-nums text-zinc-300">
                  {shown} units
                </span>
                <span
                  className={`w-16 text-right text-[10px] font-semibold uppercase tracking-wider ${status.className}`}
                >
                  {status.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className={`flex flex-1 flex-col gap-0.5 rounded-lg border px-3 py-2 ${
                stat.highlight
                  ? "border-red-500/40 bg-red-500/10"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <span className="text-[10px] uppercase tracking-widest text-zinc-500">
                {stat.label}
              </span>
              <span
                className={`text-sm font-semibold tabular-nums ${
                  stat.highlight ? "text-white" : "text-zinc-200"
                }`}
              >
                PKR{" "}
                <CountUp value={stat.value} active={applied} delaySec={0.4} />
              </span>
              <span
                className={`text-[10px] ${stat.highlight ? "text-red-300" : "text-zinc-500"}`}
              >
                {stat.note}
              </span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
