'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import TerminalFrame from './TerminalFrame';

const TARGET_KG = 248.65;
const TICK_MS = 120;
const RAMP_TICKS = 28;

const serialLine = (flag: 'ST' | 'US', kg: number) =>
  `${flag},GS,+${kg.toFixed(2).padStart(7, '0')}kg`;

export default function WeighScene() {
  const reduceMotion = useReducedMotion();
  const [weight, setWeight] = useState(0);
  const [stable, setStable] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    if (reduceMotion) {
      setWeight(TARGET_KG);
      setStable(true);
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

      if (tick % 6 === 0) {
        setLog((prev) => [
          ...prev.slice(-2),
          serialLine(isStable ? 'ST' : 'US', next),
        ]);
      }
    }, TICK_MS);

    return () => clearInterval(id);
  }, [reduceMotion]);

  return (
    <TerminalFrame title='Indicator · D-900s'>
      <div className='flex flex-col gap-5'>
        <div className='flex items-center justify-between text-[10px] font-medium uppercase tracking-widest text-zinc-500'>
          <span>Platform scale · 300 kg</span>
          <span>RS-232 · 9600 baud</span>
        </div>

        <div className='flex items-end justify-between'>
          <div className='font-mono text-5xl font-bold tabular-nums text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)] xl:text-6xl'>
            {weight.toFixed(2).padStart(7, '0')}
            <span className='ml-2 text-xl text-red-400/80'>kg</span>
          </div>

          <div
            className={`flex items-center gap-2 rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
              stable
                ? 'border-emerald-700 bg-emerald-950/60 text-emerald-300'
                : 'border-zinc-700 bg-zinc-900 text-zinc-500'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                stable ? 'animate-pulse bg-emerald-400' : 'bg-zinc-600'
              }`}
            />
            {stable ? 'Stable' : 'Settling'}
          </div>
        </div>

        <div className='flex min-h-[64px] flex-col gap-1 rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 font-mono text-[11px] text-zinc-400'>
          {log.map((line, i) => (
            <span key={`${i}-${line}`}>
              <span className='mr-2 text-red-500'>&gt;</span>
              {line}
            </span>
          ))}
        </div>
      </div>
    </TerminalFrame>
  );
}

