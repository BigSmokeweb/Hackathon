'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Clock, 
  ChevronRight, 
  Sun, 
  Moon, 
  Sunset
} from 'lucide-react';
import { 
  getCurrentTimeSlot, 
  TimeSlotRecommendation 
} from '@/lib/seasonal-data';

export function SeasonalTimeBanner() {
  const [timeSlot, setTimeSlot] = useState<TimeSlotRecommendation | null>(null);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  useEffect(() => {
    setTimeSlot(getCurrentTimeSlot());

    const updateClock = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST'
      );
    };

    updateClock();
    const interval = setInterval(() => {
      setTimeSlot(getCurrentTimeSlot());
      updateClock();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!timeSlot) return null;

  const TimeIcon =
    timeSlot.id === 'dawn'
      ? Sun
      : timeSlot.id === 'golden_hour'
      ? Sunset
      : timeSlot.id === 'night'
      ? Moon
      : Sparkles;

  return (
    <div className="w-full mb-10">
      {/* ─── Living Atmosphere & Time-Based Recommendation Strip ─── */}
      <div className={`relative rounded-2xl border ${timeSlot.borderColor} ${timeSlot.bgTint} p-4 sm:p-5 shadow-xs transition-all duration-300 overflow-hidden`}>
        {/* Subtle warm radiance */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C4A265]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Time of Day Real-time Atmosphere */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/95 border border-[#D4CFC0] flex items-center justify-center text-[#C4A265] shrink-0 shadow-xs">
              <TimeIcon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#C4A265] bg-white/85 border border-[#D4CFC0] px-2 py-0.5 rounded-md">
                  {timeSlot.statusBadge}
                </span>
                <span className="text-[10px] font-mono text-[#5C6460]">
                  {timeSlot.timeWindow} • {currentTimeStr}
                </span>
              </div>
              <h3 className="font-edu-cursive text-xl sm:text-2xl text-[#2C2C2C] mt-0.5 font-normal">
                {timeSlot.title}
              </h3>
              <p className="text-xs text-[#5C6460] max-w-xl mt-0.5 leading-relaxed">
                {timeSlot.recommendation}
              </p>
            </div>
          </div>

          {/* Right: Quick Anchor to Seasonal Goodies Section */}
          <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#D4CFC0]/60">
            <a
              href="#seasonal-goodies"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/95 hover:bg-white text-[#2C2C2C] border border-[#D4CFC0] hover:border-[#C4A265] text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C4A265] group-hover:scale-110 transition-transform" />
              <span>Seasonal Goodies</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#347F8C] group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Recommended Atmospheric Spots for Right Now */}
        <div className="mt-3.5 pt-3 border-t border-[#D4CFC0]/50 flex items-center gap-2 overflow-x-auto no-scrollbar text-[11px] font-mono text-[#5C6460]">
          <span className="font-bold text-[#2C2C2C] shrink-0 uppercase tracking-wider text-[10px]">
            Atmospheric Spots Now:
          </span>
          {timeSlot.idealFor.map((spot, i) => (
            <span
              key={i}
              className="bg-white/90 border border-[#D4CFC0] px-2.5 py-0.5 rounded-full text-[10px] shrink-0 font-medium text-[#2C2C2C]"
            >
              {spot}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
