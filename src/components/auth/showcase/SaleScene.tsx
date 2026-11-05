'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTypewriter } from '@/hooks/useTypewriter';
import TerminalFrame from './TerminalFrame';
import Cursor from './Cursor';

interface Layer {
  id: string;
  qty: number;
  unitCost: number;
}

const COMMAND = 'sell --sku "S-Type Load Cell 500kg" --qty 14';
const SALE_QTY = 14;

const LAYERS: Layer[] = [
  { id: 'L-001', qty: 10, unitCost: 18500 },
  { id: 'L-002', qty: 40, unitCost: 19200 },
  { id: 'L-003', qty: 25, unitCost: 20100 },
];

function deductFifo(layers: Layer[], qtyNeeded: number) {
  let remaining = qtyNeeded;
  let cogs = 0;

  const result = layers.map((layer) => {
    const taken = Math.min(layer.qty, Math.max(remaining, 0));
    remaining -= taken;
    cogs += taken * layer.unitCost;
    return { ...layer, left: layer.qty - taken };
  });

  return { result, cogs };
}

const { result: AFTER, cogs: COGS } = deductFifo(LAYERS, SALE_QTY);

const formatPkr = (n: number) => `PKR ${n.toLocaleString('en-US')}`;

export default function SaleScene() {
  const { typed, done } = useTypewriter(COMMAND);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setApplied(true), 600);
    return () => clearTimeout(id);
  }, [done]);

  return (
    <TerminalFrame title='Inventory · FIFO deduction'>
      <div className='flex flex-col gap-5'>
        <div className='font-mono text-sm text-zinc-200'>
          <span className='mr-2 text-red-500'>$</span>
          {typed}
          {!applied && <Cursor />}
        </div>

        <div className='flex flex-col gap-3'>
          {AFTER.map((layer) => {
            const pct = applied ? (layer.left / layer.qty) * 100 : 100;
            const status = !applied
              ? 'ACTIVE'
              : layer.left === 0
                ? 'DEPLETED'
                : layer.left < layer.qty
                  ? 'PARTIAL'
                  : 'ACTIVE';

            return (
              <div key={layer.id} className='flex items-center gap-3'>
                <span className='w-12 font-mono text-[11px] text-zinc-500'>
                  {layer.id}
                </span>

                <div className='h-2 flex-1 overflow-hidden rounded-full bg-zinc-900'>
                  <motion.div
                    className='h-full rounded-full bg-gradient-to-r from-red-700 to-red-500 shadow-[0_0_8px_rgba(220,38,38,0.6)]'
                    initial={{ width: '100%' }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                  />
                </div>

                <span className='w-16 text-right font-mono text-[11px] text-zinc-400'>
                  {applied ? layer.left : layer.qty} units
                </span>
                <span className='w-14 text-right font-mono text-[11px] text-zinc-600'>
                  @{layer.unitCost.toLocaleString('en-US')}
                </span>
                <span
                  className={`w-16 text-right text-[10px] font-semibold tracking-wider ${
                    status === 'DEPLETED'
                      ? 'text-red-400'
                      : status === 'PARTIAL'
                        ? 'text-amber-400'
                        : 'text-zinc-500'
                  }`}
                >
                  {status}
                </span>
              </div>
            );
          })}
        </div>

        <motion.div
          className='flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-[11px]'
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: applied ? 1 : 0, y: applied ? 0 : 6 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <span className='text-zinc-400'>
            StockMovement logged · {SALE_QTY} units out
          </span>
          <span className='font-mono font-semibold text-red-400'>
            COGS {formatPkr(COGS)}
          </span>
        </motion.div>
      </div>
    </TerminalFrame>
  );
}

