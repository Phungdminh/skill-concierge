'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export function AnimatedBackground() {
  const reduced = useReducedMotion();
  const [themeChanging, setThemeChanging] = useState(false);
  const paused = reduced || themeChanging;

  useEffect(() => {
    function pause() {
      setThemeChanging(true);
    }

    function resume() {
      setThemeChanging(false);
    }

    window.addEventListener('themechange:start', pause);
    window.addEventListener('themechange:end', resume);
    return () => {
      window.removeEventListener('themechange:start', pause);
      window.removeEventListener('themechange:end', resume);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="bg-grid absolute inset-0" />

      <motion.div
        aria-hidden
        className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, #ea384c 0%, #f97316 40%, transparent 80%)',
        }}
        animate={paused ? undefined : { scale: [1, 1.15, 1], opacity: [0.35, 0.5, 0.35] }}
        transition={paused ? undefined : { duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        aria-hidden
        className="absolute right-[-10%] top-[30%] h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, #fbbf24, transparent 70%)' }}
        animate={paused ? undefined : { x: [0, -30, 0], y: [0, 20, 0] }}
        transition={paused ? undefined : { duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        aria-hidden
        className="absolute left-[-10%] top-[40%] h-[380px] w-[380px] rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, #ea384c, transparent 70%)' }}
        animate={paused ? undefined : { x: [0, 30, 0], y: [0, -20, 0] }}
        transition={paused ? undefined : { duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div
        className="absolute inset-x-0 bottom-0 h-48"
        style={{ background: 'linear-gradient(to top, var(--background), transparent)' }}
      />
    </div>
  );
}
