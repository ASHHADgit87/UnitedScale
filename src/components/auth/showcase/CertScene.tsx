'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTypewriter } from '@/hooks/useTypewriter';
import TerminalFrame from './TerminalFrame';
import Cursor from './Cursor';

const COMMAND = 'generate-certificate --device PS-500x600 --client "Sample Industries"';

const FIELDS = [
  { label: 'Certificate No.', value: 'US-CAL-DEMO-0001' },
  { label: 'Device', value: 'Platform Scale 500x600' },
  { label: 'Capacity', value: '300 kg' },
  { label: 'Result', value: 'PASS · within tolerance' },
] as const;

export default function CertScene() {
  const { typed, done } = useTypewriter(COMMAND, { speedMs: 35 });
  const [issued, setIssued] = useState(false);

  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setIssued(true), 500);
    return () => clearTimeout(id);
  }, [done]);

  return (
    <TerminalFrame title='Calibration · Certificate'>
      <div className='flex flex-col gap-4'>
        <div className='font-mono text-xs leading-relaxed text-zinc-200'>
          <span className='mr-2 text-red-500'>$</span>
          {typed}
          {!issued && <Cursor />}
        </div>

        <motion.div
          className='relative flex flex-col gap-2 rounded-md border border-zinc-700 bg-zinc-900/80 p-4'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: issued ? 1 : 0, y: issued ? 0 : 10 }}
          transition={{ duration: 0.5 }}
        >
          <span className='text-[10px] font-semibold uppercase tracking-widest text-zinc-500'>
            Calibration Certificate · Sample
          </span>

          {FIELDS.map((field) => (
            <div key={field.label} className='flex items-center justify-between text-[11px]'>
              <span className='text-zinc-500'>{field.label}</span>
              <span className='font-mono text-zinc-200'>{field.value}</span>
            </div>
          ))}

          <motion.div
            className='absolute bottom-3 right-4 -rotate-12 rounded border-2 border-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-red-500'
            initial={{ scale: 1.8, opacity: 0 }}
            animate={{ scale: issued ? 1 : 1.8, opacity: issued ? 0.9 : 0 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 16 }}
          >
            Sample
          </motion.div>
        </motion.div>
      </div>
    </TerminalFrame>
  );
}

