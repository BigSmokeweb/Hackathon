'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Search, MapPin } from 'lucide-react';

interface CityOption {
  label: string;
  value: string;
}

interface CuratedFilterBarProps {
  cities: CityOption[];
  targetId?: string;
  basePath?: string;
}

export function CuratedFilterBar({
  cities,
  targetId = 'curated-experiences',
  basePath,
}: CuratedFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get('q') || '';
  const currentCity = searchParams.get('city') || '';
  const currentCat = searchParams.get('cat') || '';

  const [query, setQuery] = useState(currentQ);
  const [selectedCity, setSelectedCity] = useState(currentCity);

  const applyFilters = (newQ: string, newCity: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newQ.trim()) params.set('q', newQ.trim());
    else params.delete('q');

    if (newCity) params.set('city', newCity);
    else params.delete('city');

    if (currentCat) params.set('cat', currentCat);

    const path = basePath || pathname || '/';
    const qs = params.toString();
    const targetUrl = `${path}${qs ? `?${qs}` : ''}${targetId ? `#${targetId}` : ''}`;

    startTransition(() => {
      router.push(targetUrl, { scroll: false });
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(query, selectedCity);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCity(val);
    applyFilters(query, val);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 bg-white/95 border border-[#D8D4C8] p-1.5 rounded-2xl focus-within:border-[#347F8C] transition-colors shadow-sm shrink-0"
    >
      <div className="flex items-center gap-2 px-3 text-[#5C6460]">
        <Search className={`w-3.5 h-3.5 text-[#5C6460] ${isPending ? 'animate-spin' : ''}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search master or craft..."
          className="bg-transparent text-xs text-[#3E4541] placeholder-[#7C8581] focus:outline-none w-36 sm:w-44 font-light"
        />
      </div>

      <div className="h-5 w-px bg-[#D8D4C8]" />

      <div className="flex items-center gap-1 px-2 text-xs text-[#3E4541]">
        <MapPin className="w-3 h-3 text-[#347F8C]" />
        <select
          value={selectedCity}
          onChange={handleCityChange}
          className="bg-transparent text-xs text-[#3E4541] focus:outline-none cursor-pointer [&>option]:bg-white [&>option]:text-[#3E4541]"
        >
          {cities.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="cursor-pointer bg-[#347F8C] hover:bg-[#2A6772] text-[#F7F4EA] text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition-all active:scale-95 shadow-md shadow-[#347F8C]/20"
      >
        Filter
      </button>
    </form>
  );
}
