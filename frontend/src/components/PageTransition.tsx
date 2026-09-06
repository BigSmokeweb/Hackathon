'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

const INDIA_QUOTES = [
  '“India will teach you not to judge, to be patient, and to cherish every fleeting encounter.”',
  '“In India, the past is never past; it breathes in every stone, spice, and conversation.”',
  '“The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.”',
  '“Mumbai is not a city, it is an ocean of stories that sweeps you along.”',
  '“To wander here is to witness centuries existing side by side in living harmony.”',
  '“Let the aroma of roasted spices and the toll of temple bells guide your compass.”',
];

export function PageTransition() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const [isWashing, setIsWashing] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(INDIA_QUOTES[0]);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      // Pick a fresh quote on navigation
      const randomQuote = INDIA_QUOTES[Math.floor(Math.random() * INDIA_QUOTES.length)];
      setCurrentQuote(randomQuote);
      setIsWashing(true);

      const timer = setTimeout(() => {
        setIsWashing(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      style={{
        opacity: isWashing ? 1 : 0,
        pointerEvents: isWashing ? 'auto' : 'none',
      }}
      className="fixed inset-0 z-[99999] bg-[#F5F1E6] flex flex-col items-center justify-center transition-opacity duration-300 ease-out select-none px-6"
    >
      {/* Ambient center radiance */}
      <div className="absolute w-72 h-72 bg-[#C4A265]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Monogram Seal */}
      <div className="relative flex flex-col items-center">
        <div className="relative w-14 h-14 rounded-2xl bg-[#2C2C2C] text-[#F5F1E6] flex items-center justify-center font-serif text-xl font-bold border-2 border-[#C4A265] shadow-xl shadow-[#C4A265]/20">
          <span>C</span>
          {/* Subtle spinning ring accent */}
          <div className="absolute -inset-1.5 rounded-2xl border border-[#C4A265]/40 animate-pulse pointer-events-none" />
        </div>

        <span className="font-manifold uppercase tracking-[0.28em] text-xs text-[#2C2C2C] font-bold mt-3">
          Celeste
        </span>
      </div>

      {/* Single-Line Serif Quote about India */}
      <div className="mt-6 max-w-lg text-center">
        <p className="font-cormorant italic text-sm sm:text-base text-[#2C2C2C]/85 tracking-wide leading-relaxed font-normal">
          {currentQuote}
        </p>
        <div className="w-8 h-[1px] bg-[#C4A265] mx-auto mt-3 opacity-70" />
      </div>
    </div>
  );
}

export default PageTransition;
