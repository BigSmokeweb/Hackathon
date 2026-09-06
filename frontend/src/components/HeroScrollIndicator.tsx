'use client';

import { useEffect, useState } from 'react';

export function HeroScrollIndicator() {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Fully visible at 0, smoothly fades out by 80px scroll
      const newOpacity = Math.max(0, 1 - scrollY / 80);
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
      className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2.5 cursor-pointer transition-[opacity,transform] duration-200 group select-none outline-none active:scale-95"
      aria-label="Scroll to discover collection"
    >
      <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.34em] uppercase text-white/80 group-hover:text-[#2C2C2C] transition-colors drop-shadow-md font-medium">
        Scroll to discover
      </span>

      {/* Sleek rounded mouse pill indicator matching screenshot */}
      <div className="w-5 h-8 rounded-full border-[1.5px] border-white/70 group-hover:border-[#2C2C2C] flex items-start justify-center p-1 backdrop-blur-2xs shadow-xs transition-colors">
        <span className="w-1 h-2 rounded-full bg-white/90 group-hover:bg-[#2C2C2C] animate-bounce transition-colors" />
      </div>
    </button>
  );
}

export default HeroScrollIndicator;
