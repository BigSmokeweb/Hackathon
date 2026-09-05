import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/api-client';
import { Star, Clock, ShieldCheck, ArrowRight, ArrowLeft, MapPin } from 'lucide-react';

const CITY_DATA: Record<string, { name: string; state: string; desc: string; heroImage: string; experiences: any[] }> = {
  ahmedabad: {
    name: 'Ahmedabad',
    state: 'Gujarat',
    desc: 'India’s first UNESCO World Heritage City, celebrated for its 600-year-old carved wooden Pols, midnight spice bazaars, and generational textile lineages.',
    heroImage: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1600&q=80',
    experiences: [
      {
        id: 'exp-1',
        title: 'Old Ahmedabad Pols & Midnight Spice Trail',
        category: 'Culinary & Heritage',
        durationMinutes: 180,
        priceMin: 1800,
        priceMax: 2400,
        ratingAverage: 4.96,
        mediaUrls: ['https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1000&q=80'],
        description: 'Walk through 600-year-old wooden carved Pol houses, private haveli courtyards, and secret midnight street delicacies.',
        provider: { businessName: 'Manek Chowk Guild' },
      },
    ],
  },
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
  jaipur: {
    name: 'Jaipur',
    state: 'Rajasthan',
    desc: 'The regal Pink City of royal guild masters, 350-year-old botanical block printing hamlets, and hilltop stone stepwells.',
    heroImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80',
    experiences: [
      {
        id: 'exp-2',
        title: 'Bagru Hand-Block Printing with 5th Gen Masters',
        category: 'Artisan Workshop',
        durationMinutes: 240,
        priceMin: 3200,
        priceMax: 4500,
        ratingAverage: 4.98,
        mediaUrls: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80'],
        description: 'Learn natural mud-resist Dabu printing, botanical indigo vats, and carve your own personalized wooden blocks.',
        provider: { businessName: 'Chhipa Artisan Collective' },
      },
    ],
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
    <div className="bg-[#F7F4EA] text-[#3E4541] min-h-screen pt-28 pb-24 selection:bg-[#4FA3D1]/30 selection:text-[#3E4541]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Go Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/#curated-experiences"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#3E4541] hover:text-[#347F8C] bg-white border border-[#D8D4C8] hover:border-[#347F8C]/60 px-4 py-2.5 rounded-xl transition-all duration-200 shadow-xs hover:shadow-sm font-bold active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-[#347F8C]" />
            <span>Go Back</span>
          </Link>
          <span className="text-xs font-mono text-[#5C6460]/80">
            {city.name} Regional Archive
          </span>
        </div>

        {/* City Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-[#D8D4C8] h-96 mb-16 flex items-end p-8 sm:p-12 shadow-sm">
          <img
            src={city.heroImage}
            alt={city.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent" />
          <div className="relative z-10 text-white max-w-3xl">
            <div className="inline-flex items-center gap-2 text-[#4FA3D1] font-mono text-xs uppercase tracking-[0.25em] mb-2 font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              Signature Enclave &bull; {city.state}
            </div>
            <h1 className="font-manifold text-4xl sm:text-6xl tracking-wide uppercase leading-tight font-bold">
              {city.name}
            </h1>
            <p className="text-[#F7F4EA]/90 text-sm sm:text-base mt-3 max-w-2xl font-light leading-relaxed">
              {city.desc}
            </p>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between border-b border-[#D8D4C8] pb-6 mb-10">
          <div>
            <span className="text-[#347F8C] font-mono text-xs uppercase tracking-[0.2em] block mb-1 font-semibold">
              Curated Enclave Archive
            </span>
            <h2 className="font-manifold text-2xl sm:text-3xl uppercase tracking-wider text-[#3E4541] font-bold">
              Expeditions in {city.name}
            </h2>
          </div>
          <span className="text-xs font-mono text-[#3E4541]/60 uppercase tracking-wider">
            {experiences.length} Verified Listings
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experiences.map((exp: any) => (
            <article
              key={exp.id}
              className="group relative bg-white border border-[#D8D4C8] hover:border-[#347F8C]/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md flex flex-col justify-between shadow-sm"
            >
              <div className="relative h-60 w-full overflow-hidden bg-[#EFEBE0]">
                <img
                  src={exp.mediaUrls?.[0] || city.heroImage}
                  alt={exp.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                <div className="absolute top-3.5 left-3.5">
                  <span className="bg-[#3E4541]/85 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono tracking-wider text-[#F7F4EA] uppercase font-semibold">
                    {exp.category}
                  </span>
                </div>

                <div className="absolute top-3.5 right-3.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-medium text-[#3E4541] border border-[#D8D4C8] flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="font-semibold">{Number(exp.ratingAverage || 4.9).toFixed(2)}</span>
                </div>

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
                  <span className="text-[11px] font-mono text-white flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#8FAF82]" />
                    {exp.provider?.businessName ? `Listed by ${exp.provider.businessName}` : 'Listed by local traveller'}
                  </span>
                  <span className="text-[11px] font-mono text-white/90 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-white/80" />
                    {exp.durationMinutes || 120} min
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-manifold text-lg tracking-wide text-[#3E4541] group-hover:text-[#347F8C] transition-colors line-clamp-2 leading-snug font-bold">
                    {exp.title}
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-[#3E4541]/80 line-clamp-2 font-light leading-relaxed">
                    {exp.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#D8D4C8] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#3E4541]/60 block">
                      Tariff
                    </span>
                    <p className="font-semibold text-[#3E4541] text-base">
                      {(!exp.priceMin && !exp.priceMax) || (exp.priceMin === 0 && exp.priceMax === 0)
                        ? 'Free'
                        : exp.priceMin === 0
                        ? `Free – ₹${exp.priceMax?.toLocaleString()}`
                        : `₹${exp.priceMin?.toLocaleString()} – ₹${exp.priceMax?.toLocaleString()}`}
                    </p>
                  </div>
                  <Link
                    href={`/experiences/${exp.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#F7F4EA] bg-[#347F8C] hover:bg-[#2A6772] font-bold px-4 py-2 rounded-xl transition-all duration-300 active:scale-95 shadow-sm"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Go Back Footer */}
        <div className="mt-14 pt-8 border-t border-[#D8D4C8] flex items-center justify-between">
          <Link
            href="/#curated-experiences"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#3E4541] hover:text-[#347F8C] bg-white border border-[#D8D4C8] hover:border-[#347F8C]/60 px-5 py-3 rounded-xl transition-all duration-200 shadow-xs hover:shadow-sm font-bold active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-[#347F8C]" />
            <span>Go Back to Curated Experiences</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
