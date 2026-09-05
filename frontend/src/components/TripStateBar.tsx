'use client';

interface TripStateBarProps {
  remainingTimeMinutes: number;
  remainingBudget: number;
  totalBudget: number;
  selectedCount: number;
  currentCity?: string;
  isAdverseWeather?: boolean;
  weatherDescription?: string;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function TripStateBar({
  remainingTimeMinutes,
  remainingBudget,
  totalBudget,
  selectedCount,
  currentCity,
  isAdverseWeather,
  weatherDescription,
}: TripStateBarProps) {
  const budgetPct = totalBudget > 0 ? Math.max(0, (remainingBudget / totalBudget) * 100) : 0;
  const budgetColor = budgetPct < 15 ? 'bg-red-500' : budgetPct < 30 ? 'bg-amber-500' : 'bg-[#347F8C]';

  return (
    <div
      id="trip-state-bar"
      className="sticky top-16 z-30 bg-[#F7F4EA]/95 backdrop-blur-2xl border-b border-[#D8D4C8] shadow-sm text-[#3E4541]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Stops count */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#347F8C] animate-pulse" />
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#7C8581] leading-none">
                Stops
              </p>
              <p className="font-manifold font-bold text-[#3E4541] text-sm mt-0.5">{selectedCount}</p>
            </div>
          </div>

          {/* Current city */}
          {currentCity && (
            <div className="hidden sm:flex items-center gap-2">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#7C8581] leading-none">
                  Locale
                </p>
                <p className="font-mono text-[#5C6460] text-xs mt-0.5">{currentCity}</p>
              </div>
            </div>
          )}

          {/* Time remaining */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#7C8581] leading-none">
              Window Left
            </p>
            <p className="font-mono font-bold text-xs mt-0.5 text-[#347F8C]">
              {formatTime(remainingTimeMinutes)}
            </p>
          </div>

          {/* Budget progress */}
          <div className="flex-1 min-w-[140px] max-w-[200px]">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#5C6460] mb-1">
              <span>Budget</span>
              <span className="font-bold text-[#3E4541]">₹{Math.round(remainingBudget)}</span>
            </div>
            <div className="w-full bg-[#D8D4C8] rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${budgetColor}`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
          </div>

          {/* Weather status */}
          {isAdverseWeather && (
            <div className="flex items-center gap-1.5 bg-[#4FA3D1]/15 border border-[#4FA3D1]/30 text-[#347F8C] text-[11px] font-mono px-3 py-1 rounded-full">
              <span>Forecast:</span>
              <span>{weatherDescription || 'Adverse weather detected'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
