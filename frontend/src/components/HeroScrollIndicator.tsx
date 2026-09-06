'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function HeroScrollIndicator() {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Fully visible at 0, smoothly fades out by 75px scroll
      const newOpacity = Math.max(0, 1 - scrollY / 75);
      setOpacity(newOpacity);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    document.getElementById('curated-experiences')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        opacity,
        pointerEvents: opacity <= 0.05 ? 'none' : 'auto',
      }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 cursor-pointer transition-[opacity,transform] duration-200 group select-none outline-none active:scale-95"
      aria-label="Scroll to curated collection"
    >
      <span className="text-[9px] font-mono tracking-[0.32em] uppercase text-white/75 group-hover:text-[#C4A265] transition-colors drop-shadow-sm">
        Explore
      </span>
      <div className="flex flex-col items-center animate-hero-breathe">
        {/* Delicate thin 1px gold gradient line */}
        <div className="w-[1px] h-7 bg-gradient-to-b from-white/20 via-[#C4A265]/80 to-[#C4A265]" />
        {/* Subtle breathing chevron */}
        <ChevronDown className="w-3.5 h-3.5 text-[#C4A265] -mt-0.5 drop-shadow" strokeWidth={1.75} />
      </div>
    </button>
  );
}

export default HeroScrollIndicator;
