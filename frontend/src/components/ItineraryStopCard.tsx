'use client';

import { Star, ShieldCheck, Clock } from 'lucide-react';

interface ItineraryStopCardProps {
  stopNumber: number;
  title: string;
  category: string;
  city: string;
  distanceKm: number;
  priceMin: number;
  priceMax: number;
  ratingAverage: number;
  authenticityRating: number;
  mediaUrl?: string;
  aiExplanation?: string;
  onRemove?: () => void;
}

export function ItineraryStopCard({
  stopNumber,
  title,
  category,
  city,
  distanceKm,
  priceMin,
  priceMax,
  ratingAverage,
  authenticityRating,
  mediaUrl,
  aiExplanation,
  onRemove,
}: ItineraryStopCardProps) {
  return (
    <div
      id={`itinerary-stop-${stopNumber}`}
      className="flex gap-4 bg-white border border-[#D4CFC0] hover:border-[#347F8C]/50 rounded-2xl p-4 shadow-sm transition-all duration-300 items-start text-[#2C2C2C]"
    >
      {/* Stop number badge */}
      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#347F8C] text-white flex items-center justify-center text-xs font-mono font-bold shadow-sm">
        {stopNumber}
      </div>

      {/* Thumbnail */}
      {mediaUrl && (
        <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-[#F5F1E6] border border-[#D4CFC0] hidden sm:block">
          <img src={mediaUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#347F8C] font-semibold">
            {category}
          </span>
          <span className="text-[#D4CFC0] text-xs">&bull;</span>
          <span className="text-[10px] font-mono text-[#2C2C2C]/70 uppercase">{city}</span>
          {distanceKm > 0 && (
            <>
              <span className="text-[#D4CFC0] text-xs">&bull;</span>
              <span className="text-[10px] font-mono text-[#2C2C2C]/70">{distanceKm.toFixed(1)} km</span>
            </>
          )}
        </div>

        <h3 className="font-cormorant font-bold text-[#2C2C2C] text-base sm:text-lg leading-snug line-clamp-2">
          {title}
        </h3>

        {/* Pricing & Rating */}
        <div className="flex items-center gap-3 mt-2 text-xs font-mono text-[#2C2C2C]/75">
          <span className="text-[#2C2C2C] font-semibold">
            {!priceMin || priceMin === 0 ? 'Free' : `₹${priceMin.toLocaleString()}`}
          </span>
          <span className="text-[#D4CFC0]">&bull;</span>
          <span className="flex items-center gap-1 text-amber-600 font-semibold">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            {Number(ratingAverage || 4.9).toFixed(1)}
          </span>
          <span className="text-[#D4CFC0]">&bull;</span>
          <span className="text-[#A69B80] font-semibold">{Math.round((authenticityRating || 0.95) * 100)}% Authenticity</span>
        </div>
      </div>

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-[#2C2C2C]/40 hover:text-red-500 transition-colors text-xs font-mono p-1"
          title="Remove Stop"
        >
          ✕
        </button>
      )}
    </div>
  );
}
