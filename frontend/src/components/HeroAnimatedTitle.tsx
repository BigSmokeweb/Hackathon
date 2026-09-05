'use client';

import { useState } from 'react';

export function HeroAnimatedTitle() {
  const [key, setKey] = useState(0);

  return (
    <div
      className="w-full flex items-center justify-center px-4 sm:px-8 select-none"
      onClick={() => setKey((k) => k + 1)}
    >
      <svg
        key={key}
        viewBox="0 0 1750 240"
        className="w-full max-w-[95vw] lg:max-w-[92vw] xl:max-w-7xl h-auto overflow-visible"
      >
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className="corn-font animate-corn-revolution"
          style={{
            fontFamily: "'Manifold CF', sans-serif",
            fontSize: '94px',
            fontWeight: 800,
            letterSpacing: '0.12em',
          }}
        >
          EXPERIENCE. PLATFORM.
        </text>
      </svg>
    </div>
  );
}
