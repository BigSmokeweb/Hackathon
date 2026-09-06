'use client';

import { useEffect, useRef, useState } from 'react';

export function AnimatedCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current) return;

    let rafId: number | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!hasAnimated.current) {
            hasAnimated.current = true;
            const start = performance.now();
            const step = (now: number) => {
              const progress = Math.min(1, (now - start) / duration);
              const ease = 1 - Math.pow(1 - progress, 3);
              setCount(Math.round(ease * target));
              if (progress < 1) {
                rafId = requestAnimationFrame(step);
              }
            };
            rafId = requestAnimationFrame(step);
          }
        } else {
          hasAnimated.current = false;
          if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
          setCount(0);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [target, duration]);

  return <span ref={ref}>{count}</span>;
}

export default AnimatedCounter;
