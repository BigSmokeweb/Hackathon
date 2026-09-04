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

function getTimeColor(remaining: number): string {
  if (remaining < 30) return 'text-red-600';
  if (remaining < 45) return 'text-amber-600';
  return 'text-emerald-600';
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
  const budgetColor = budgetPct < 15 ? 'bg-red-500' : budgetPct < 30 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div
      id="trip-state-bar"
      className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm"
    >
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">

          {/* Stops count */}
          <div className="flex items-center gap-1.5">
            <span className="text-xl">📍</span>
            <div>
              <p className="text-xs text-slate-500 leading-none">Stops</p>
              <p className="font-bold text-slate-900 text-sm">{selectedCount}</p>
            </div>
          </div>

          {/* Current city */}
          {currentCity && (
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-xl">🗺️</span>
              <div>
                <p className="text-xs text-slate-500 leading-none">Area</p>
                <p className="font-bold text-slate-900 text-sm">{currentCity}</p>
              </div>
            </div>
          )}

          {/* Time remaining */}
          <div className="flex items-center gap-1.5">
            <span className="text-xl">⏱️</span>
            <div>
              <p className="text-xs text-slate-500 leading-none">Time left</p>
              <p className={`font-bold text-sm ${getTimeColor(remainingTimeMinutes)}`}>
                {formatTime(remainingTimeMinutes)}
              </p>
            </div>
          </div>

          {/* Budget remaining */}
          <div className="flex items-center gap-2">
            <span className="text-xl">💰</span>
            <div className="min-w-[80px]">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 leading-none">Budget left</p>
                <p className="font-bold text-slate-900 text-sm">₹{Math.round(remainingBudget)}</p>
              </div>
              <div className="mt-1 h-1.5 w-24 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${budgetColor}`}
                  style={{ width: `${budgetPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Weather badge */}
          {isAdverseWeather && (
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
              <span className="text-sm">🌧️</span>
              <span className="text-xs font-medium text-blue-700">
                {weatherDescription ?? 'Adverse weather'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
