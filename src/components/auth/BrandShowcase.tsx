'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SaleScene from './showcase/SaleScene';
import WeighScene from './showcase/WeighScene';
import CertScene from './showcase/CertScene';

const BRANDS = ['AND', 'Omega', 'Yaohua', 'Avery', 'Mettler'] as const;

const SCENES = [
  { id: 'fifo', label: 'FIFO stock', durationMs: 9000, Component: SaleScene },
  { id: 'weigh', label: 'Live weighing', durationMs: 8000, Component: WeighScene },
  { id: 'cert', label: 'Certification', durationMs: 8500, Component: CertScene },
] as const;

export default function BrandShowcase() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setTimeout(
      () => setIndex((i) => (i + 1) % SCENES.length),
      SCENES[index].durationMs,
    );
    return () => clearTimeout(id);
  }, [index]);

  const ActiveScene = SCENES[index].Component;

  return (
    <div className='flex w-full max-w-xl flex-col gap-6'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-semibold tracking-tight text-white xl:text-4xl'>
          Precision you can <span className='text-red-500'>certify.</span>
        </h1>
        <p className='text-sm text-zinc-400'>
          Weighing, counting and calibration, tracked from the first gram to the
          signed certificate.
        </p>
      </div>

      <AnimatePresence mode='wait'>
        <motion.div
          key={SCENES[index].id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
        >
          <ActiveScene />
        </motion.div>
      </AnimatePresence>

      <div className='flex gap-3'>
        {SCENES.map((scene, i) => (
          <button
            key={scene.id}
            type='button'
            onClick={() => setIndex(i)}
            className='flex flex-1 flex-col gap-2 text-left'
          >
            <div className='h-0.5 w-full overflow-hidden rounded-full bg-zinc-800'>
              {i === index && (
                <motion.div
                  className='h-full bg-red-500'
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: scene.durationMs / 1000, ease: 'linear' }}
                />
              )}
            </div>
            <span
              className={`text-[10px] font-medium uppercase tracking-widest transition-colors ${
                i === index ? 'text-zinc-200' : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {scene.label}
            </span>
          </button>
        ))}
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        <span className='mr-1 text-[10px] font-medium uppercase tracking-widest text-zinc-500'>
          Integrated with
        </span>
        {BRANDS.map((brand) => (
          <span
            key={brand}
            className='rounded-md border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-xs font-medium text-zinc-300'
          >
            {brand}
          </span>
        ))}
      </div>
    </div>
  );
}

