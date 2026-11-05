'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface TypewriterOptions {
  speedMs?: number;
  startDelayMs?: number;
}

export function useTypewriter(
  text: string,
  { speedMs = 45, startDelayMs = 500 }: TypewriterOptions = {},
) {
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setStarted(true), startDelayMs);
    return () => clearTimeout(id);
  }, [startDelayMs]);

  useEffect(() => {
    if (!started || count >= text.length) return;
    const jitter = Math.random() * 35;
    const id = setTimeout(() => setCount((c) => c + 1), speedMs + jitter);
    return () => clearTimeout(id);
  }, [started, count, text, speedMs]);

  if (reduceMotion) return { typed: text, done: true };

  return { typed: text.slice(0, count), done: count >= text.length };
}

