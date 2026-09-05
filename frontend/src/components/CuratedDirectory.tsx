'use client';

import { Suspense, useState, useEffect, useMemo, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, MapPin, Clock, Star, ShieldCheck, ArrowRight } from 'lucide-react';

export interface CategoryOption {
  label: string;
  value: string;
}

export interface CityOption {
  label: string;
  value: string;
}

export interface CuratedExperience {
  id: string;
  title: string;
  category: string;
  categoryLabel?: string;
  city: string;
  durationMinutes?: number;
  priceMin?: number;
  priceMax?: number;
  ratingAverage?: number;
  authenticityRating?: number;
  mediaUrls?: string[];
  description?: string;
  provider?: {
    businessName?: string;
    verificationStatus?: string;
  };
}

interface CuratedDirectoryProps {
  initialExperiences: CuratedExperience[];
  categories: CategoryOption[];
  cities: CityOption[];
  targetId?: string;
}

function CuratedDirectoryContent({
  initialExperiences,
  categories,
  cities,
  targetId = 'curated-experiences',
}: CuratedDirectoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCat = searchParams?.get('cat') || '';
  const currentCity = searchParams?.get('city') || '';
  const currentQ = searchParams?.get('q') || '';

  const [activeCategory, setActiveCategory] = useState(currentCat);
  const [selectedCity, setSelectedCity] = useState(currentCity);
  const [searchQuery, setSearchQuery] = useState(currentQ);

  useEffect(() => {
    setActiveCategory(currentCat);
  }, [currentCat]);

  useEffect(() => {
    setSelectedCity(currentCity);
  }, [currentCity]);

  useEffect(() => {
    setSearchQuery(currentQ);
  }, [currentQ]);

  const updateUrl = (cat: string, city: string, q: string) => {
    const params = new URLSearchParams();
    if (cat) params.set('cat', cat);
    if (city) params.set('city', city);
    if (q.trim()) params.set('q', q.trim());

    const qs = params.toString();
    const newUrl = `${pathname || '/'}${qs ? `?${qs}` : ''}`;

    startTransition(() => {
      router.replace(newUrl, { scroll: false });
    });
  };

  const handleCategoryClick = (catVal: string) => {
    setActiveCategory(catVal);
    updateUrl(catVal, selectedCity, searchQuery);
  };

  const handleCityChange = (cityVal: string) => {
    setSelectedCity(cityVal);
    updateUrl(activeCategory, cityVal, searchQuery);
  };

  const handleSearchChange = (qVal: string) => {
    setSearchQuery(qVal);
    updateUrl(activeCategory, selectedCity, qVal);
  };

  const handleReset = () => {
    setActiveCategory('');
    setSelectedCity('');
    setSearchQuery('');
    updateUrl('', '', '');
  };

  const filteredExperiences = useMemo(() => {
    return initialExperiences.filter((exp) => {
      if (activeCategory && exp.category?.toLowerCase() !== activeCategory.toLowerCase()) {
        return false;
      }
      if (selectedCity && exp.city?.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = exp.title?.toLowerCase().includes(q);
        const matchesDesc = exp.description?.toLowerCase().includes(q);
        const matchesCity = exp.city?.toLowerCase().includes(q);
        const matchesCat = exp.category?.toLowerCase().includes(q);
        const matchesProvider = exp.provider?.businessName?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCity && !matchesCat && !matchesProvider) {
          return false;
        }
      }
      return true;
    });
  }, [initialExperiences, activeCategory, selectedCity, searchQuery]);

  return (
    <div id={targetId}>
      {/* ─── Filter Controls Bar ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="mt-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Typographic Category Chips */}
            <div className="flex items-center gap-2 flex-wrap py-1 flex-1 min-w-0">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleCategoryClick(cat.value)}
                    className={`cursor-pointer px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all duration-200 border shrink-0 active:scale-95 ${
                      isActive
                        ? 'bg-[#347F8C] text-[#F7F4EA] border-[#347F8C] font-bold shadow-md shadow-[#347F8C]/20'
                        : 'bg-white/90 text-[#3E4541] border-[#D8D4C8] hover:border-[#347F8C]/50 hover:bg-white shadow-sm'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Search & City Filter Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateUrl(activeCategory, selectedCity, searchQuery);
              }}
              className="flex items-center gap-2 bg-white/95 border border-[#D8D4C8] p-1.5 rounded-2xl focus-within:border-[#347F8C] transition-colors shadow-sm shrink-0"
            >
              <div className="flex items-center gap-2 px-3 text-[#5C6460]">
                <Search className={`w-3.5 h-3.5 text-[#5C6460] ${isPending ? 'animate-spin' : ''}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search master or craft..."
                  className="bg-transparent text-xs text-[#3E4541] placeholder-[#7C8581] focus:outline-none w-36 sm:w-44 font-light"
                />
              </div>

              <div className="h-5 w-px bg-[#D8D4C8]" />

              <div className="flex items-center gap-1 px-2 text-xs text-[#3E4541]">
                <MapPin className="w-3 h-3 text-[#347F8C]" />
                <select
                  value={selectedCity}
                  onChange={(e) => handleCityChange(e.target.value)}
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
          </div>
        </div>
      </div>

      {/* ─── Experiences Grid ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredExperiences.length === 0 ? (
          <div className="text-center py-28 bg-white border border-[#D8D4C8] rounded-3xl shadow-sm">
            <h3 className="font-manifold text-xl tracking-wider text-[#3E4541] uppercase">
              No matching expeditions
            </h3>
            <p className="text-[#5C6460] text-xs sm:text-sm max-w-sm mx-auto mt-2 font-light">
              We couldn't find any journeys matching your criteria. Try adjusting your city or keyword.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-6 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#347F8C] border border-[#347F8C]/40 hover:bg-[#347F8C] hover:text-[#F7F4EA] px-5 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExperiences.map((exp) => (
              <article
                key={exp.id}
                className="group relative bg-white border border-[#D8D4C8] hover:border-[#347F8C]/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col justify-between"
              >
                {/* Image Cover */}
                <div className="relative h-60 w-full overflow-hidden bg-zinc-100">
                  <img
                    src={exp.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1000&q=80'}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-80" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                    <span className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono tracking-wider text-[#3E4541] font-bold border border-[#D8D4C8] uppercase shadow-sm">
                      {exp.city}
                    </span>
                  </div>

                  <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-medium text-[#3E4541] border border-[#D8D4C8] flex items-center gap-1 shadow-sm font-bold">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{Number(exp.ratingAverage || 4.9).toFixed(2)}</span>
                  </div>

                  {/* Host Guild Base Meta */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
                    <span className="text-[11px] font-mono text-zinc-200 flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#4FA3D1]" />
                      {exp.provider?.businessName ? `Listed by ${exp.provider.businessName}` : 'Listed by local traveller'}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-300" />
                      {exp.durationMinutes || 120} min
                    </span>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#347F8C] mb-1.5 block font-bold">
                      {exp.category}
                    </span>
                    <h3 className="font-manifold font-extrabold uppercase text-lg sm:text-xl tracking-wide text-[#3E4541] group-hover:text-[#347F8C] transition-colors line-clamp-2 leading-snug">
                      {exp.title}
                    </h3>
                    <p className="text-[#5C6460] text-xs sm:text-sm mt-3 leading-relaxed line-clamp-3 font-light">
                      {exp.description || 'Authentic regional immersion hosted by generational craft and heritage lineage keepers.'}
                    </p>
                  </div>

                  <div className="mt-8 pt-5 border-t border-[#D8D4C8] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#7C8581] block">
                        Tariff
                      </span>
                      <p className="font-bold text-[#3E4541] text-base">
                        {(!exp.priceMin && !exp.priceMax) || (exp.priceMin === 0 && exp.priceMax === 0)
                          ? 'Free'
                          : exp.priceMin === 0
                          ? `Free – ₹${exp.priceMax?.toLocaleString()}`
                          : `₹${exp.priceMin?.toLocaleString()} – ₹${exp.priceMax?.toLocaleString()}`}
                      </p>
                    </div>
                    <Link
                      href={`/experiences/${exp.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#F7F4EA] bg-[#347F8C] hover:bg-[#2A6772] font-bold px-4 py-2 rounded-lg transition-all duration-300 active:scale-95 shadow-md shadow-[#347F8C]/20"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function CuratedDirectory(props: CuratedDirectoryProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-[#5C6460] font-mono text-xs uppercase tracking-wider">
          Loading curated expeditions...
        </div>
      }
    >
      <CuratedDirectoryContent {...props} />
    </Suspense>
  );
}
