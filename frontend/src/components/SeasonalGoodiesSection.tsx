'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  Utensils, 
  Palette, 
  Music, 
  Heart, 
  Flame, 
  ChevronRight,
  Bookmark
} from 'lucide-react';
import { SEASONAL_FESTIVALS, SeasonalFestival, SeasonalGoodie } from '@/lib/seasonal-data';
import { useCollection } from '@/lib/collection-store';

export function SeasonalGoodiesSection() {
  const [activeFestivalId, setActiveFestivalId] = useState<string>(SEASONAL_FESTIVALS[0].id);
  const activeFestival = SEASONAL_FESTIVALS.find((f) => f.id === activeFestivalId) || SEASONAL_FESTIVALS[0];
  const { toggle, hasItem } = useCollection();

  const getCategoryIcon = (category: SeasonalGoodie['category']) => {
    switch (category) {
      case 'Cuisine':
        return <Utensils className="w-3.5 h-3.5 text-amber-700" />;
      case 'Artisan':
        return <Palette className="w-3.5 h-3.5 text-[#347F8C]" />;
      case 'Music':
        return <Music className="w-3.5 h-3.5 text-[#C4A265]" />;
      case 'Tradition':
      default:
        return <Sparkles className="w-3.5 h-3.5 text-emerald-700" />;
    }
  };

  return (
    <section
      id="seasonal-goodies"
      className="scroll-mt-16 py-20 bg-[#F4EFE6] border-y border-[#D4CFC0] relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#C4A265]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#347F8C]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ─── Section Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#C4A265] pb-8 mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-[#347F8C] font-mono text-xs tracking-[0.28em] uppercase mb-3">
              <span className="w-2 h-2 rounded-full bg-[#C4A265] animate-pulse" />
              Living Festive Calendar
            </div>
            <h2 className="font-edu-cursive font-normal text-4xl sm:text-5xl lg:text-6xl text-[#2C2C2C] leading-tight">
              Seasonal Goodies & Celebrations
            </h2>
            <p className="text-[#5C6460] text-sm sm:text-base mt-3 max-w-2xl font-light leading-relaxed">
              Heirloom culinary delicacies, midnight pandal trails, sacred dhol rhythms, and handcrafted festive artistry that make each season in Maharashtra unforgettable.
            </p>
          </div>

          {/* Festive Switcher Chips (Exact format from user screenshot) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {SEASONAL_FESTIVALS.map((fest) => {
              const isActive = fest.id === activeFestival.id;
              return (
                <button
                  key={fest.id}
                  type="button"
                  onClick={() => setActiveFestivalId(fest.id)}
                  className={`px-4 py-2 rounded-full text-xs font-mono font-semibold transition-all duration-200 shrink-0 cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                    isActive
                      ? 'bg-[#2C2C2C] text-[#F5F1E6] border border-[#C4A265] scale-105 shadow-sm'
                      : 'bg-white/90 text-[#2C2C2C] border border-[#D4CFC0] hover:border-[#C4A265] hover:bg-white'
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isActive ? 'text-[#C4A265]' : 'text-[#8C827A]'}`} />
                  <span>{fest.seasonLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Active Festival Showcase ─── */}
        <div className="space-y-12 animate-in fade-in duration-300">
          {/* Hero Festive Banner Card */}
          <div className="relative rounded-3xl overflow-hidden border border-[#D4CFC0] shadow-md bg-[#2C2C2C] text-white min-h-[300px] flex flex-col justify-end">
            <Image
              src={activeFestival.bannerImage}
              alt={activeFestival.name}
              fill
              sizes="(max-width: 1024px) 100vw, 1200px"
              className="object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

            <div className="relative z-10 p-6 sm:p-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-[#C4A265] text-[#2C2C2C] text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-md mb-3">
                <span>{activeFestival.badge}</span>
              </div>
              <h3 className="font-edu-cursive text-3xl sm:text-4xl lg:text-5xl text-white font-normal leading-tight">
                {activeFestival.name}
              </h3>
              <p className="text-white/85 text-xs sm:text-sm font-mono mt-2 tracking-wide">
                {activeFestival.tagline}
              </p>
              <p className="text-zinc-300 text-sm mt-3 font-light leading-relaxed max-w-2xl">
                {activeFestival.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-5 text-[11px] font-mono text-zinc-300">
                <span className="font-bold uppercase tracking-wider text-amber-300">Celebrated across:</span>
                {activeFestival.highlightedCities.map((city, idx) => (
                  <span
                    key={idx}
                    className="bg-white/15 backdrop-blur-xs border border-white/20 px-2.5 py-0.5 rounded-full text-white"
                  >
                    📍 {city}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Seasonal Goodies Grid ─── */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C4A265]" />
              <h4 className="font-mono text-xs uppercase tracking-[0.24em] font-bold text-[#347F8C]">
                Signature Festive Goodies & Artisanal Lineages
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {activeFestival.goodies.map((goodie, idx) => (
                <div
                  key={idx}
                  className="bg-white/95 rounded-2xl border border-[#D4CFC0] p-5 shadow-xs hover:shadow-md hover:border-[#C4A265] transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#2C2C2C] bg-[#F5F1E6] px-2.5 py-1 rounded-full border border-[#D4CFC0]">
                        {getCategoryIcon(goodie.category)}
                        <span>{goodie.category}</span>
                      </span>
                      <span className="text-[10px] font-mono text-[#C4A265] font-semibold italic">
                        {goodie.tag}
                      </span>
                    </div>

                    <h5 className="font-bold text-base text-[#2C2C2C] group-hover:text-[#347F8C] transition-colors leading-snug">
                      {goodie.name}
                    </h5>

                    <p className="text-xs text-[#5C6460] mt-2 leading-relaxed font-light">
                      {goodie.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] font-mono text-[#347F8C]">
                    <span className="font-semibold">Authentic Regional Fare</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#C4A265]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Iconic Festive Spots & Mandals ─── */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#347F8C]" />
              <h4 className="font-mono text-xs uppercase tracking-[0.24em] font-bold text-[#347F8C]">
                Iconic Mandals, Arenas & Gathering Trails
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeFestival.highlights.map((spot, idx) => {
                const isSaved = hasItem(`fest-${activeFestival.id}-${idx}`);
                return (
                  <div
                    key={idx}
                    className="bg-white/95 rounded-2xl border border-[#D4CFC0] hover:border-[#C4A265] p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-bold text-sm text-[#2C2C2C] leading-snug">
                          {spot.title}
                        </h5>
                        <button
                          type="button"
                          onClick={() =>
                            toggle({
                              id: `fest-${activeFestival.id}-${idx}`,
                              title: `${spot.title} (${activeFestival.seasonLabel})`,
                              city: spot.location.split(',')[0],
                              category: 'FESTIVAL',
                            })
                          }
                          aria-label="Pin to journal"
                          className={`p-1.5 rounded-full transition-colors cursor-pointer shrink-0 ${
                            isSaved ? 'text-[#C4A265]' : 'text-zinc-300 hover:text-[#C4A265]'
                          }`}
                          title={isSaved ? 'Pinned to Journal' : 'Pin to Journal'}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#C4A265]' : ''}`} />
                        </button>
                      </div>

                      <div className="mt-2.5 space-y-1 text-xs font-mono text-[#5C6460]">
                        <div className="flex items-center gap-1.5 text-[#347F8C] font-semibold">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{spot.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                          <span>{spot.timing}</span>
                        </div>
                      </div>

                      <div className="mt-3.5 p-3 rounded-xl bg-[#F8F6F0] border border-[#EAE5D8] text-xs text-[#5C6460] italic leading-relaxed">
                        &ldquo;{spot.vibe}&rdquo;
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                      <a
                        href="#itinerary"
                        className="text-[11px] font-mono font-bold text-[#347F8C] hover:text-[#2A6772] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Add to Journey Plan</span>
                        <ChevronRight className="w-3 h-3 text-[#C4A265]" />
                      </a>
                      <span className="text-[10px] font-mono text-zinc-400">
                        Seasonal Highlight
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
