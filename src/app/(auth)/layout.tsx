import React from 'react';
import { BrandLogo } from '@/components/layout/BrandLogo';
import BrandShowcase from '@/components/auth/BrandShowcase';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen w-full bg-zinc-950 flex flex-col lg:flex-row overflow-x-hidden cyber-grid relative selection:bg-red-600 selection:text-white'>
      <div className='pointer-events-none fixed inset-0 cyber-ambient-glow z-0' />

      <div className='relative hidden lg:flex lg:w-1/2 xl:w-7/12 flex-col justify-between p-10 xl:p-14 border-r border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl z-10'>
        <div className='absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none' />

        <div className='relative z-10 -mt-1 -ml-1'>
          <BrandLogo className='h-24 w-auto object-contain' />
        </div>

        <div className='relative z-10 my-auto py-12'>
          <BrandShowcase />
        </div>

        <div className='relative z-10'>
          <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-zinc-900/90 text-zinc-300 border border-zinc-800'>
            ✓ Govt. of Sindh Weights &amp; Measures Authorized
          </span>
        </div>
      </div>

      <div className='relative flex-1 flex flex-col justify-center items-center p-6 sm:p-10 z-10 min-h-screen'>
        <div className='lg:hidden mb-6 w-full max-w-md'>
          <BrandLogo className='h-20 w-auto object-contain' />
        </div>
        <div className='w-full max-w-md'>{children}</div>
      </div>
    </div>
  );
}
