'use client';

import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useCollection } from '@/lib/collection-store';

interface BookmarkButtonProps {
  experience: {
    id: string;
    title: string;
    city?: string;
    category?: string;
    mediaUrls?: string[];
    priceMin?: number;
    priceMax?: number;
    ratingAverage?: number;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function BookmarkButton({
  experience,
  className = '',
  size = 'md',
  showLabel = false,
}: BookmarkButtonProps) {
  const { hasItem, toggle } = useCollection();
  const isSaved = hasItem(experience.id);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAnimating(true);
    toggle(experience);

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isSaved ? 'Remove from Journal' : 'Save to Travel Journal'}
      title={isSaved ? 'Pinned to Travel Journal' : 'Pin page in Travel Journal'}
      className={`relative group inline-flex items-center justify-center cursor-pointer transition-all duration-300 rounded-full select-none ${
        isAnimating ? 'animate-page-fold scale-110' : 'active:scale-95'
      } ${
        isSaved
          ? 'bg-[#C4A265] text-[#2C2C2C] shadow-md shadow-[#C4A265]/25 border border-[#B38F4D]'
          : 'bg-white/90 backdrop-blur-md text-[#2C2C2C] hover:text-[#C4A265] hover:bg-white border border-[#D4CFC0] shadow-xs'
      } ${
        size === 'sm' ? 'p-1.5 text-xs' : size === 'lg' ? 'p-2.5 text-sm' : 'p-2 text-xs'
      } ${className}`}
    >
      {/* Visual dog-ear corner fold hint */}
      <span
        className={`absolute -top-0.5 -right-0.5 w-2 h-2 pointer-events-none transition-all duration-300 ${
          isSaved
            ? 'border-t-2 border-r-2 border-amber-200 rotate-45 opacity-100'
            : 'opacity-0 group-hover:opacity-60 border-t border-r border-[#C4A265]'
        }`}
      />

      <Bookmark
        className={`${iconSizes[size]} transition-all duration-300 ${
          isSaved ? 'fill-[#2C2C2C] text-[#2C2C2C]' : 'fill-transparent text-[#2C2C2C]'
        }`}
      />

      {showLabel && (
        <span className="ml-1.5 font-mono text-[11px] font-bold tracking-wider uppercase">
          {isSaved ? 'Pinned in Journal' : 'Pin to Journal'}
        </span>
      )}
    </button>
  );
}
