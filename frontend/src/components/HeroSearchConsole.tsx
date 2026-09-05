'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Compass, ArrowRight, Sparkles } from 'lucide-react';

const CITIES = [
  { name: 'All India', value: '' },
  { name: 'Ahmedabad', value: 'Ahmedabad' },
  { name: 'Mumbai', value: 'Mumbai' },
  { name: 'Jaipur', value: 'Jaipur' },
];

const CATEGORIES = [
  { label: 'All Experiences', value: '' },
  { label: '🍛 Culinary Trails', value: 'FOOD' },
  { label: '🏛️ Heritage & Culture', value: 'CULTURE' },
  { label: '🎨 Artisan Workshops', value: 'WORKSHOPS' },
  { label: '🧗 Outdoor Adventures', value: 'ADVENTURE' },
];

export function HeroSearchConsole() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (category) params.set('cat', category);
    if (searchQuery) params.set('q', searchQuery);
    router.push(`/explore?${params.toString()}`);
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Quick City Pills */}
      <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300/80 mr-1 hidden sm:inline-flex items-center gap-1">
          <MapPin className="w-3 h-3 text-amber-400" /> Popular:
        </span>
        {CITIES.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => setCity(c.value)}
            className={`text-xs px-3.5 py-1 rounded-full font-medium transition-all duration-200 backdrop-blur-md ${
              city === c.value
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/15'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Main Frosted Glass Search Console */}
      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-2xl bg-slate-950/55 border border-white/20 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 shadow-2xl shadow-black/50 transition-all duration-300 hover:border-white/30"
      >
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          {/* Destination / City Input */}
          <div className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 focus-within:border-amber-400/80 transition-all text-left">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-300/90 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400" /> Location
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Any City (e.g. Mumbai, Jaipur)"
              className="w-full bg-transparent text-sm font-semibold text-white placeholder:text-slate-400 focus:outline-none mt-0.5"
            />
          </div>

          <div className="hidden md:block w-px h-10 bg-white/15"></div>

          {/* Category Dropdown */}
          <div className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 focus-within:border-amber-400/80 transition-all text-left">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-300/90 flex items-center gap-1">
              <Compass className="w-3 h-3 text-amber-400" /> Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none mt-0.5 cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden md:block w-px h-10 bg-white/15"></div>

          {/* Keyword Search */}
          <div className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 focus-within:border-amber-400/80 transition-all text-left">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-300/90 flex items-center gap-1">
              <Search className="w-3 h-3 text-amber-400" /> Keyword
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Pottery, Street Food, Fort"
              className="w-full bg-transparent text-sm font-semibold text-white placeholder:text-slate-400 focus:outline-none mt-0.5"
            />
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            className="flex-shrink-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold px-7 py-3.5 rounded-xl sm:rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 group"
          >
            <span>Explore</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
}
