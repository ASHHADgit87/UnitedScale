'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import SaleScene from './showcase/SaleScene';
import WeighScene from './showcase/WeighScene';
import CertScene from './showcase/CertScene';

const BRANDS = ['AND', 'Omega', 'Yaohua', 'Avery', 'Mettler'] as const;

const SCENES = [
  {
    id: 'stock',
    label: 'Stock',
    caption: 'Every sale is costed against your oldest stock first, so margins stay exact.',
    durationMs: 9000,
    Component: SaleScene,
  },
  {
    id: 'weigh',
    label: 'Weighing',
    caption: 'Readings from your platform scales are captured the moment they settle.',
    durationMs: 8000,
    Component: WeighScene,
  },
  {
    id: 'cert',
    label: 'Certificates',
    caption: 'Calibration records become ready-to-issue certificates in one step.',
    durationMs: 8500,
    Component: CertScene,
  },
] as const;

export default function BrandShowcase() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setTimeout(
      () => setIndex((current) => (current + 1) % SCENES.length),
      SCENES[index].durationMs,
    );
    return () => clearTimeout(id);
  }, [index]);

  const active = SCENES[index];
  const ActiveScene = active.Component;

  return (
    <div className='relative flex w-full max-w-2xl flex-col gap-7'>
      <div className='pointer-events-none absolute -left-10 top-10 -z-10 h-72 w-72 rounded-full bg-red-600/10 blur-3xl' />

      <div className='flex flex-col gap-4'>
        <div className='flex items-center gap-3'>
          <span className='h-px w-10 bg-gradient-to-r from-red-500 to-transparent' />
          <span className='text-[11px] font-medium uppercase tracking-[0.35em] text-red-400'>
            United Scale Portal
          </span>
        </div>
        <h1 className='text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl'>
          Precision you can{' '}
          <span className='bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent'>
            certify.
          </span>
        </h1>
        <p className='max-w-md text-sm leading-relaxed text-zinc-400'>
          Weighing, counting and calibration, tracked from the first gram to the signed
          certificate.
        </p>
      </div>

      <AnimatePresence mode='wait'>
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.35 }}
        >
          <ActiveScene />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode='wait'>
        <motion.p
          key={`${active.id}-caption`}
          className='min-h-[2.5rem] max-w-lg text-sm leading-relaxed text-zinc-300'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {active.caption}
        </motion.p>
      </AnimatePresence>

      <div className='flex gap-4'>
        {SCENES.map((scene, i) => (
          <button
            key={scene.id}
            type='button'
            onClick={() => setIndex(i)}
            className='group flex flex-1 flex-col gap-2 rounded-sm text-left outline-none focus-visible:ring-1 focus-visible:ring-red-500/70'
          >
            <div className='h-0.5 w-full overflow-hidden bg-white/15'>
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
              className={`flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.25em] transition-colors ${i === index ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-300'
                }`}
            >
              <span className='text-red-500'>{`0${i + 1}`}</span>
              {scene.label}
            </span>
          </button>
        ))}
      </div>

      <div className='flex flex-col gap-3'>
        <span className='text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-500'>
          Instrument brands we service
        </span>
        <div className='overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]'>
          <motion.div
            className='flex w-max items-center'
            animate={reduceMotion ? undefined : { x: ['0%', '-50%'] }}
            transition={{ duration: 26, ease: 'linear', repeat: Infinity }}
          >
            {[...BRANDS, ...BRANDS].map((brand, i) => (
              <div key={`${brand}-${i}`} className='flex items-center gap-10 pr-10'>
                <span className='text-sm font-semibold uppercase tracking-[0.25em] text-zinc-400'>
                  {brand}
                </span>
                <span className='h-3 w-px bg-white/15' />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}