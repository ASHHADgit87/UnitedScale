import type { ReactNode } from 'react';

interface TerminalFrameProps {
  title: string;
  children: ReactNode;
}

export default function TerminalFrame({ title, children }: TerminalFrameProps) {
  return (
    <div className='relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/80 shadow-[0_0_40px_rgba(220,38,38,0.15)]'>
      <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-600 to-transparent' />

      <div className='flex items-center gap-2 border-b border-zinc-800 px-4 py-2.5'>
        <span className='h-2.5 w-2.5 rounded-full bg-red-600' />
        <span className='h-2.5 w-2.5 rounded-full bg-zinc-700' />
        <span className='h-2.5 w-2.5 rounded-full bg-zinc-700' />
        <span className='ml-2 text-[10px] font-medium uppercase tracking-widest text-zinc-500'>
          {title}
        </span>
      </div>

      <div className='min-h-[280px] p-5'>{children}</div>
    </div>
  );
}

