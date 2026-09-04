'use client';

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

const CATEGORY_EMOJI: Record<string, string> = {
  FOOD: '🍛',
  CULTURE: '🏛️',
  ADVENTURE: '🧗',
  HIDDEN_GEMS: '💎',
  NIGHTLIFE: '🌙',
  EVENTS: '🎭',
  WORKSHOPS: '🎨',
  SHOPPING: '🛍️',
};

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
  const emoji = CATEGORY_EMOJI[category] ?? '📍';

  return (
    <div
      id={`itinerary-stop-${stopNumber}`}
      className="flex gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Stop number badge */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm font-bold shadow">
        {stopNumber}
      </div>

      {/* Thumbnail */}
      {mediaUrl && (
        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-slate-100 hidden sm:block">
          <img src={mediaUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full mb-1">
              {emoji} {category.replace('_', ' ')}
            </span>
            <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">{title}</h3>
          </div>
          {onRemove && (
            <button
              id={`remove-stop-${stopNumber}`}
              onClick={onRemove}
              className="flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors text-lg leading-none mt-0.5"
              aria-label={`Remove stop ${stopNumber}`}
            >
              ×
            </button>
          )}
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>📍 {city}</span>
          <span>🚶 {distanceKm.toFixed(1)} km</span>
          <span className="font-medium text-amber-600">★ {ratingAverage.toFixed(1)}</span>
          <span>₹{priceMin}–{priceMax}</span>
          <span className="text-emerald-700 font-medium">{Math.round(authenticityRating * 100)}% authentic</span>
        </div>

        {aiExplanation && (
          <div className="mt-2 bg-orange-50 border border-orange-100 rounded-lg px-2.5 py-1.5 text-xs text-orange-950">
            <span className="font-semibold text-orange-800">Why this stop: </span>
            {aiExplanation}
          </div>
        )}
      </div>
    </div>
  );
}
