import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/api-client';
import { Star, Clock, ShieldCheck, ArrowRight, ArrowLeft, MapPin } from 'lucide-react';
import { AnimatedCounter } from '@/components/AnimatedCounter';

const CITY_DATA: Record<string, { name: string; state: string; desc: string; heroImage: string; experiences: any[] }> = {
  mumbai: {
    name: 'Mumbai',
    state: 'Maharashtra',
    desc: 'The vibrant coastal metropolis of historic docks, legendary Irani cafes, UNESCO Art Deco architecture, and Koli fishing lineages.',
    heroImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1600&q=80',
    experiences: [
      {
        id: 'exp-3',
        title: 'Colaba Art Deco & Coastal Fisherfolk Dawn Walk',
        category: 'Urban Culture',
        durationMinutes: 150,
        priceMin: 1500,
        priceMax: 2000,
        ratingAverage: 4.92,
        mediaUrls: ['https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1000&q=80'],
        description: 'Experience Sassoon Docks at sunrise, architectural secrets of the Oval Maidan, and heritage Parsi bakery breakfasts.',
        provider: { businessName: 'Bombay Heritage Trust' },
      },
    ],
  },
  thane: {
    name: 'Thane',
    state: 'Maharashtra',
    desc: 'The historic City of Lakes nestled in the foothills of the Sahyadris, renowned for tranquil Upvan promenades and centuries-old shrines.',
    heroImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    experiences: [],
  },
  'navi-mumbai': {
    name: 'Navi Mumbai',
    state: 'Maharashtra',
    desc: 'Vast creekfront biodiversity sanctuaries, pink flamingo dawn migrations, Belapur maritime fortresses, and garden promenades.',
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    experiences: [],
  },
  powai: {
    name: 'Powai',
    state: 'Maharashtra',
    desc: 'Serene lakeside promenades and European neoclassical architecture blending contemporary artisanal culture with tranquil water views.',
    heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=80',
    experiences: [],
  },
  'kanjur-marg': {
    name: 'Kanjur Marg',
    state: 'Maharashtra',
    desc: 'Traditional heritage enclaves, ancient sacred shrines, and authentic community food trails nestled along the central corridor.',
    heroImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=80',
    experiences: [],
  },
  panvel: {
    name: 'Panvel',
    state: 'Maharashtra',
    desc: 'Gateway to the Western Ghats with dramatic monsoon waterfalls, historic Maratha hill forts, and rustic Konkani culinary stops.',
    heroImage: 'https://images.unsplash.com/photo-1546271876-af6caec5961b?auto=format&fit=crop&w=1600&q=80',
    experiences: [],
  },
  'kalyan-dombivli': {
    name: 'Kalyan-Dombivli',
    state: 'Maharashtra',
    desc: 'Ancient Ulhas riverfront ghats, revered medieval shrines, and rich coastal culinary traditions.',
    heroImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80',
    experiences: [],
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const city = CITY_DATA[params.slug.toLowerCase()];
  if (!city) return { title: 'City Not Found' };
  return {
    title: `Authentic Experiences in ${city.name} — Experience Platform`,
    description: `Discover verified food walks, heritage tours, and artisan workshops in ${city.name}, ${city.state}.`,
  };
}

import { ALL_EXPERIENCES } from '@/lib/experiences-data';

async function getCityExperiences(cityName: string, fallbackList: any[]) {
  const localList = ALL_EXPERIENCES.filter((e) => e.city.toLowerCase() === cityName.toLowerCase());
  const fallback = localList.length > 0 ? localList : fallbackList;
  try {
    const res = await fetch(`${API_BASE}/experiences/search?city=${encodeURIComponent(cityName)}&limit=50`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        const remoteIds = new Set(data.data.map((e: any) => e.id));
        return [...data.data, ...fallback.filter((e) => !remoteIds.has(e.id))];
      }
    }
  } catch {
    // Fallback to complete catalog
  }
  return fallback;
}

export default async function CityDiscoveryPage({ params }: { params: { slug: string } }) {
  const city = CITY_DATA[params.slug.toLowerCase()];
  if (!city) notFound();

  const experiences = await getCityExperiences(city.name, city.experiences);

  return (
    <div className="bg-[#F5F1E6] text-[#2C2C2C] min-h-screen pt-28 pb-24 selection:bg-[#8B7355]/30 selection:text-[#2C2C2C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Go Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/#curated-experiences"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#2C2C2C] hover:text-[#347F8C] bg-white border border-[#D4CFC0] hover:border-[#347F8C]/60 px-4 py-2.5 rounded-xl transition-all duration-200 shadow-xs hover:shadow-sm font-bold active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-[#347F8C]" />
            <span>Go Back</span>
          </Link>
          <span className="text-xs font-mono text-[#5C6460]/80">
            {city.name} Regional Archive
          </span>
        </div>

        {/* City Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-[#D4CFC0] h-96 mb-16 flex items-end p-8 sm:p-12 shadow-sm">
          <Image
            src={city.heroImage}
            alt={city.name}
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent" />
          <div className="relative z-10 text-white max-w-3xl">
            <div className="inline-flex items-center gap-2 text-[#8B7355] font-mono text-xs uppercase tracking-[0.25em] mb-3 font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              Heritage Quarter &bull; {city.state}
            </div>
            <h1 className="font-edu-cursive font-normal text-5xl sm:text-6xl md:text-7xl tracking-wide leading-normal py-1 text-white">
              {city.name}
            </h1>
            <p className="text-[#F5F1E6]/90 text-sm sm:text-base mt-4 sm:mt-5 max-w-2xl font-light leading-relaxed">
              {city.desc}
            </p>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between border-b border-[#C4A265] pb-6 mb-10">
          <div>
            <span className="text-[#347F8C] font-mono text-xs uppercase tracking-[0.2em] block mb-1 font-semibold">
              Curated Enclave Archive
            </span>
            <h2 className="font-manifold text-2xl sm:text-3xl uppercase tracking-wider text-[#2C2C2C] font-bold">
              Experiences in <span className="font-edu-cursive font-normal normal-case text-3xl sm:text-4xl text-[#347F8C]">{city.name}</span>
            </h2>
          </div>
          <span className="text-sm font-cormorant font-semibold oldstyle-nums text-[#2C2C2C]/70 tracking-normal">
            (<AnimatedCounter target={experiences.length} /> Verified Listings)
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experiences.map((exp: any) => (
            <article
              key={exp.id}
              className="group relative bg-white border border-[#D4CFC0] hover:border-[#347F8C]/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md flex flex-col justify-between shadow-sm"
            >
              <div className="relative h-60 w-full overflow-hidden bg-[#EAE5D6]">
                <Image
                  src={exp.mediaUrls?.[0] || city.heroImage}
                  alt={exp.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                <div className="absolute top-3.5 left-3.5">
                  <span className="bg-[#2C2C2C]/85 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono tracking-wider text-[#F5F1E6] uppercase font-semibold">
                    {exp.category}
                  </span>
                </div>

                <div className="absolute top-3.5 right-3.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-medium text-[#2C2C2C] border border-[#D4CFC0] flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="font-semibold">{Number(exp.ratingAverage || 4.9).toFixed(2)}</span>
                </div>

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
                  <span className="text-[11px] font-mono text-white flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#A69B80]" />
                    {exp.provider?.businessName ? `Listed by ${exp.provider.businessName}` : 'Presented by a local connoisseur'}
                  </span>
                  <span className="text-[11px] font-mono text-white/90 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-white/80" />
                    {exp.durationMinutes || 120} min
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-cormorant text-xl sm:text-2xl tracking-normal text-[#2C2C2C] group-hover:text-[#347F8C] transition-colors line-clamp-2 leading-snug font-bold">
                    {exp.title}
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-[#2C2C2C]/80 line-clamp-2 font-light leading-relaxed">
                    {exp.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#D4CFC0] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#2C2C2C]/60 block">
                      Starting at
                    </span>
                    <p className="font-semibold font-cormorant oldstyle-nums text-[#2C2C2C] text-lg tracking-wide">
                      {(!exp.priceMin && !exp.priceMax) || (exp.priceMin === 0 && exp.priceMax === 0)
                        ? 'Free'
                        : exp.priceMin === 0
                        ? `Free – ₹${exp.priceMax?.toLocaleString()}`
                        : `₹${exp.priceMin?.toLocaleString()} – ₹${exp.priceMax?.toLocaleString()}`}
                    </p>
                  </div>
                  <Link
                    href={`/experiences/${exp.id}`}
                    aria-label={`Explore ${exp.title}`}
                    className="group/btn inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#F5F1E6] bg-[#347F8C] hover:bg-[#2A6772] font-bold px-4 py-2 rounded-xl transition-all duration-300 active:scale-95 shadow-sm"
                  >
                    <span>Explore</span>
                    <span className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-1">&rarr;</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Go Back Footer */}
        <div className="mt-14 pt-8 border-t border-[#D4CFC0] flex items-center justify-between">
          <Link
            href="/#curated-experiences"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#2C2C2C] hover:text-[#347F8C] bg-white border border-[#D4CFC0] hover:border-[#347F8C]/60 px-5 py-3 rounded-xl transition-all duration-200 shadow-xs hover:shadow-sm font-bold active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-[#347F8C]" />
            <span>Go Back to Curated Experiences</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
