import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { HeroAnimatedTitle } from '@/components/HeroAnimatedTitle';
import { ItineraryBuilder } from '@/components/ItineraryBuilder';
import { API_BASE } from '@/lib/api-client';
import { Search, MapPin, Clock, Star, ShieldCheck, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Experience Platform — Discover Authentic India',
  description: 'Verified culinary walks, master artisan workshops, and historic trails across India.',
};

const CATEGORIES = [
  { label: 'All Expeditions', value: '' },
  { label: 'Culinary & Food', value: 'FOOD' },
  { label: 'Heritage & Culture', value: 'CULTURE' },
  { label: 'Artisan Workshops', value: 'WORKSHOPS' },
  { label: 'Outdoor & Adventure', value: 'ADVENTURE' },
  { label: 'Hidden Enclaves', value: 'HIDDEN_GEMS' },
  { label: 'Nightlife & Music', value: 'NIGHTLIFE' },
];

const CITIES = [
  { label: 'All Cities', value: '' },
  { label: 'Ahmedabad', value: 'Ahmedabad' },
  { label: 'Mumbai', value: 'Mumbai' },
  { label: 'Jaipur', value: 'Jaipur' },
  { label: 'Varanasi', value: 'Varanasi' },
  { label: 'Kochi', value: 'Kochi' },
  { label: 'Kolkata', value: 'Kolkata' },
];

const CURATED_DIRECTORY_FALLBACK = [
  {
    id: 'exp-1',
    title: 'Old Ahmedabad Pols & Midnight Spice Trail',
    category: 'FOOD',
    categoryLabel: 'Culinary & Food',
    city: 'Ahmedabad',
    durationMinutes: 180,
    priceMin: 1800,
    priceMax: 2400,
    ratingAverage: 4.96,
    authenticityRating: 0.98,
    mediaUrls: ['https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1000&q=80'],
    description: 'Walk through 600-year-old wooden carved Pol houses, private haveli courtyards, and secret midnight street delicacies.',
    provider: { businessName: 'Manek Chowk Guild', verificationStatus: 'VERIFIED' },
  },
  {
    id: 'exp-2',
    title: 'Bagru Hand-Block Printing with 5th Gen Masters',
    category: 'WORKSHOPS',
    categoryLabel: 'Artisan Workshops',
    city: 'Jaipur',
    durationMinutes: 240,
    priceMin: 3200,
    priceMax: 4500,
    ratingAverage: 4.98,
    authenticityRating: 0.99,
    mediaUrls: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80'],
    description: 'Learn natural mud-resist Dabu printing, botanical indigo vats, and carve your own personalized wooden blocks.',
    provider: { businessName: 'Chhipa Artisan Collective', verificationStatus: 'VERIFIED' },
  },
  {
    id: 'exp-3',
    title: 'Colaba Art Deco & Coastal Fisherfolk Dawn Walk',
    category: 'CULTURE',
    categoryLabel: 'Heritage & Culture',
    city: 'Mumbai',
    durationMinutes: 150,
    priceMin: 1500,
    priceMax: 2000,
    ratingAverage: 4.92,
    authenticityRating: 0.95,
    mediaUrls: ['https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1000&q=80'],
    description: 'Experience Sassoon Docks at sunrise, architectural secrets of the Oval Maidan, and heritage Parsi bakery breakfasts.',
    provider: { businessName: 'Bombay Heritage Trust', verificationStatus: 'VERIFIED' },
  },
  {
    id: 'exp-4',
    title: 'Varanasi Dawn Boat & Classical Dhrupad Ragas',
    category: 'CULTURE',
    categoryLabel: 'Heritage & Culture',
    city: 'Varanasi',
    durationMinutes: 210,
    priceMin: 2800,
    priceMax: 3600,
    ratingAverage: 4.99,
    authenticityRating: 0.99,
    mediaUrls: ['https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1000&q=80'],
    description: 'Private wooden boat journey along ancient ghats accompanied by live morning tanpura and Dhrupad vocalists.',
    provider: { businessName: 'Kashi Heritage Society', verificationStatus: 'VERIFIED' },
  },
  {
    id: 'exp-5',
    title: 'Fort Kochi Spice Vaults & Kathakali Workshop',
    category: 'WORKSHOPS',
    categoryLabel: 'Artisan Workshops',
    city: 'Kochi',
    durationMinutes: 180,
    priceMin: 2200,
    priceMax: 3000,
    ratingAverage: 4.94,
    authenticityRating: 0.96,
    mediaUrls: ['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=80'],
    description: 'Step into colonial Dutch spice warehouses, watch ritual green-room makeup, and learn facial mudras from masters.',
    provider: { businessName: 'Malabar Cultural Guild', verificationStatus: 'VERIFIED' },
  },
  {
    id: 'exp-6',
    title: 'Kumartuli Clay Idol Sculpture & Alley Tales',
    category: 'WORKSHOPS',
    categoryLabel: 'Artisan Workshops',
    city: 'Kolkata',
    durationMinutes: 150,
    priceMin: 1600,
    priceMax: 2200,
    ratingAverage: 4.95,
    authenticityRating: 0.97,
    mediaUrls: ['https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1000&q=80'],
    description: 'Inside the studios of Bengal idol sculptors shaping sacred forms using straw, bamboo, and Hooghly river clay.',
    provider: { businessName: 'Bengal Crafts Council', verificationStatus: 'VERIFIED' },
  },
];

async function getExperiences(searchParams: { city?: string; cat?: string; budget?: string; q?: string }) {
  try {
    const params = new URLSearchParams();
    if (searchParams.city) params.set('city', searchParams.city);
    if (searchParams.cat) params.set('category', searchParams.cat);
    if (searchParams.budget) params.set('budgetBand', searchParams.budget);
    if (searchParams.q) params.set('q', searchParams.q);
    params.set('limit', '24');

    const res = await fetch(`${API_BASE}/experiences/search?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return filterFallbacks(searchParams);
    const data = await res.json();
    if (!data?.data || data.data.length === 0) return filterFallbacks(searchParams);
    return data.data;
  } catch {
    return filterFallbacks(searchParams);
  }
}

function filterFallbacks(searchParams: { city?: string; cat?: string; budget?: string; q?: string }) {
  let list = [...CURATED_DIRECTORY_FALLBACK];
  if (searchParams.city) {
    list = list.filter((e) => e.city.toLowerCase() === searchParams.city?.toLowerCase());
  }
  if (searchParams.cat) {
    list = list.filter((e) => e.category.toLowerCase() === searchParams.cat?.toLowerCase());
  }
  if (searchParams.q) {
    const q = searchParams.q.toLowerCase();
    list = list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q),
    );
  }
  return list;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { city?: string; cat?: string; budget?: string; q?: string };
}) {
  const experiences = await getExperiences(searchParams || {});

  return (
    <div className="bg-[#F7F4EA] text-[#3E4541] min-h-screen selection:bg-[#4FA3D1]/30 selection:text-[#3E4541]">
      {/* ─── SECTION 1: FULLSCREEN CINEMATIC HERO ─── */}
      <section className="relative w-screen h-screen min-h-[680px] overflow-hidden flex flex-col items-center justify-center select-none">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.png"
            alt="Experience Platform Hero Background"
            fill
            priority
            quality={100}
            className="object-cover object-center scale-[1.02] transform"
          />
          {/* Subtle cinematic gradient overlays that fade into Warm Ivory #F7F4EA */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#F7F4EA] pointer-events-none" />
        </div>

        {/* Animated Title in "Corn Font" Style */}
        <div className="relative z-10 w-full flex items-center justify-center">
          <HeroAnimatedTitle />
        </div>

        {/* Subtitle statement */}
        <div className="relative z-10 mt-4 text-center px-4">
          <p className="text-white/80 text-xs sm:text-sm tracking-[0.22em] uppercase font-mono max-w-xl mx-auto drop-shadow-md">
            Curated Culinary Trails &bull; Master Artisan Guilds &bull; Living Heritage
          </p>
        </div>

        {/* ─── Minimalist Scroll Indicator ─── */}
        <div className="absolute bottom-8 sm:bottom-10 z-20 flex flex-col items-center">
          <a
            href="#curated-experiences"
            className="group flex flex-col items-center gap-3 text-white/70 hover:text-white transition-all duration-300"
            aria-label="Scroll to discover experiences"
          >
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/70 group-hover:text-sky-300 transition-colors">
              Scroll to Discover
            </span>
            <div className="w-5 h-8 rounded-full border border-white/30 group-hover:border-white flex justify-center pt-1.5 transition-colors shadow-lg backdrop-blur-md">
              <span className="w-1 h-2 rounded-full bg-white animate-bounce" />
            </div>
          </a>
        </div>
      </section>

      {/* ─── SECTION 2: EXACT CURATED EXPERIENCES DIRECTORY FROM SCREENSHOT ─── */}
      <div id="curated-experiences" className="relative scroll-mt-16 pt-16 pb-28 bg-[#F7F4EA]">
        {/* Subtle Ambient Sage/Teal Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-[#8FAF82]/10 blur-[120px] rounded-full pointer-events-none" />

        {/* ─── Editorial Header (Exact SS Format) ─── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="border-b border-[#D8D4C8] pb-10">
            <div className="inline-flex items-center gap-2 text-[#347F8C] font-mono text-xs tracking-[0.28em] uppercase mb-3">
              <span className="w-2 h-2 rounded-full bg-[#8FAF82]" />
              Verified Guild Directory
            </div>
            <h2 className="font-manifold text-3xl sm:text-5xl lg:text-6xl tracking-[0.06em] text-[#3E4541] uppercase leading-none">
              Curated Experiences
            </h2>
            <p className="text-[#5C6460] text-sm sm:text-base mt-4 max-w-2xl font-light leading-relaxed">
              Living artisan workshops, dawn cultural walks, and culinary lineages across India. Verified on-site for depth and historical rigor.
            </p>
          </div>

          {/* ─── Filter Bar ─── */}
          <div className="mt-8 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Typographic Category Chips */}
              <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar flex-1 min-w-0">
                {CATEGORIES.map((cat) => {
                  const isActive = (searchParams?.cat || '') === cat.value;
                  const params = new URLSearchParams();
                  if (searchParams?.city) params.set('city', searchParams.city);
                  if (cat.value) params.set('cat', cat.value);
                  if (searchParams?.q) params.set('q', searchParams.q);

                  return (
                    <Link
                      key={cat.value}
                      href={`/#curated-experiences?${params.toString()}`}
                      className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all duration-300 border shrink-0 ${
                        isActive
                          ? 'bg-[#347F8C] text-[#F7F4EA] border-[#347F8C] font-bold shadow-md shadow-[#347F8C]/20'
                          : 'bg-white/90 text-[#3E4541] border-[#D8D4C8] hover:border-[#347F8C]/40 hover:bg-white shadow-sm'
                      }`}
                    >
                      {cat.label}
                    </Link>
                  );
                })}
              </div>

              {/* Search & City Filter Controls */}
              <form
                action="/#curated-experiences"
                method="GET"
                className="flex items-center gap-2 bg-white/95 border border-[#D8D4C8] p-1.5 rounded-2xl focus-within:border-[#347F8C] transition-colors shadow-sm shrink-0"
              >
                <div className="flex items-center gap-2 px-3 text-[#5C6460]">
                  <Search className="w-3.5 h-3.5 text-[#5C6460]" />
                  <input
                    type="text"
                    name="q"
                    defaultValue={searchParams?.q || ''}
                    placeholder="Search master or craft..."
                    className="bg-transparent text-xs text-[#3E4541] placeholder-[#7C8581] focus:outline-none w-36 sm:w-44 font-light"
                  />
                </div>

              <div className="h-5 w-px bg-[#D8D4C8]" />

              <div className="flex items-center gap-1 px-2 text-xs text-[#3E4541]">
                <MapPin className="w-3 h-3 text-[#347F8C]" />
                <select
                  name="city"
                  defaultValue={searchParams?.city || ''}
                  className="bg-transparent text-xs text-[#3E4541] focus:outline-none cursor-pointer [&>option]:bg-white [&>option]:text-[#3E4541]"
                >
                  {CITIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {searchParams?.cat && <input type="hidden" name="cat" value={searchParams.cat} />}

              <button
                type="submit"
                className="bg-[#347F8C] hover:bg-[#2A6772] text-[#F7F4EA] text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition-all active:scale-95 shadow-md shadow-[#347F8C]/20"
              >
                Filter
              </button>
            </form>
          </div>
        </div>
      </section>

        {/* ─── Experiences Grid ─── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {experiences.length === 0 ? (
            <div className="text-center py-28 bg-white border border-[#D8D4C8] rounded-3xl shadow-sm">
              <h3 className="font-manifold text-xl tracking-wider text-[#3E4541] uppercase">
                No matching expeditions
              </h3>
              <p className="text-[#5C6460] text-xs sm:text-sm max-w-sm mx-auto mt-2 font-light">
                We couldn't find any journeys matching your criteria. Try adjusting your city or keyword.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#347F8C] border border-[#347F8C]/40 hover:bg-[#347F8C] hover:text-[#F7F4EA] px-5 py-2.5 rounded-xl transition-all"
              >
                Reset Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {experiences.map((exp: any) => (
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
                        {exp.provider?.businessName || 'Verified Guild'}
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
                          ₹{exp.priceMin?.toLocaleString()} – ₹{exp.priceMax?.toLocaleString()}
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

      {/* ─── SECTION 3: ITINERARY BUILDER ATELIER ─── */}
      <ItineraryBuilder />
    </div>
  );
}
