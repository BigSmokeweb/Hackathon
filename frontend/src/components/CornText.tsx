'use client';

import { useState, useRef, useCallback } from 'react';

interface CornTextProps {
  text?: string;
  className?: string;
  forceFieldRadius?: number;
  maxLetters?: number;
  fontSize?: string;
  viewBoxWidth?: number;
  viewBoxHeight?: number;
  fontFamily?: string;
  letterSpacing?: string;
  fontWeight?: number | string;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
}

export function CornText({
  text = 'Explore Platform',
  className = '',
  forceFieldRadius = 78,
  maxLetters = 4,
  fontSize = '150px',
  viewBoxWidth = 1600,
  viewBoxHeight = 280,
  fontFamily = "'Luxurious Script', var(--font-luxurious-script), cursive",
  letterSpacing = '0.02em',
  fontWeight = 400,
  textTransform = 'none',
}: CornTextProps) {
  const chars = text.split('');
  const [charKeys, setCharKeys] = useState<number[]>(() => new Array(chars.length).fill(1));
  const svgRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const lastTriggerRef = useRef<number[]>(new Array(chars.length).fill(0));

  // Trigger full text animation on click
  const handleTitleClick = useCallback(() => {
    const now = performance.now();
    lastTriggerRef.current = new Array(chars.length).fill(now);
    setCharKeys((prev) => prev.map((k) => k + 1));
  }, [chars.length]);

  // Invisible circular cursor force field (calibrated to exactly 4 letters max)
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!svgRef.current) return;
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const now = performance.now();

      const tspans = svgRef.current.querySelectorAll('tspan');
      if (!tspans || tspans.length === 0) return;

      // Find all characters within the force field radius and take at most 4 nearest
      const candidateIndices: { index: number; dist: number }[] = [];

      tspans.forEach((tspan, i) => {
        if (chars[i] === ' ') return;
        const rect = tspan.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const distance = Math.hypot(mouseX - cx, mouseY - cy);

        if (distance <= forceFieldRadius) {
          candidateIndices.push({ index: i, dist: distance });
        }
      });

      // Sort by distance to cursor center and cap to exactly 4 letters
      const targetChars = candidateIndices
        .sort((a, b) => a.dist - b.dist)
        .slice(0, maxLetters);

      let changed = false;
      const nextKeys = [...charKeys];

      targetChars.forEach(({ index }) => {
        // Cooldown prevents flickering while mouse hovers
        if (now - lastTriggerRef.current[index] > 1100) {
          lastTriggerRef.current[index] = now;
          nextKeys[index] = nextKeys[index] + 1;
          changed = true;
        }
      });

      if (changed) {
        setCharKeys(nextKeys);
      }
    },
    [chars, charKeys, forceFieldRadius, maxLetters]
  );

  return (
    <h1 className="contents">
      <span className="sr-only">{text}</span>
      <div
        className={`w-full flex items-center justify-center px-4 sm:px-8 select-none ${className}`}
        onMouseMove={handleMouseMove}
        aria-hidden="true"
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full max-w-[95vw] lg:max-w-[92vw] xl:max-w-7xl h-auto overflow-visible cursor-pointer select-none"
          onClick={handleTitleClick}
          onMouseMove={handleMouseMove}
        >
          <text
            ref={textRef}
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            className="select-none font-luxurious-script"
            style={{
              fontFamily,
              fontSize,
              fontWeight,
              letterSpacing,
              textTransform,
            }}
          >
            {chars.map((char, index) => (
              <tspan
                key={`${index}-${charKeys[index]}`}
                data-char={char}
                className={charKeys[index] > 0 ? 'animate-corn-revolution' : ''}
                style={{
                  fill: '#ffffff',
                }}
              >
                {char}
              </tspan>
            ))}
          </text>
        </svg>
      </div>
    </h1>
  );
}
export default CornText;
