'use client';

import { motion } from 'framer-motion';

export default function Cursor() {
  return (
    <motion.span
      aria-hidden
      className='ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-red-500'
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
}

