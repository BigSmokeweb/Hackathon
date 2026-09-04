import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const CITY_DATA: Record<string, { name: string; state: string; desc: string; heroImage: string }> = {
  ahmedabad: {
    name: 'Ahmedabad',
    state: 'Gujarat',
    desc: 'India’s first UNESCO World Heritage City, celebrated for its historic pols, traditional street delicacies, and textile mastery.',
    heroImage: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80',
  },
  mumbai: {
    name: 'Mumbai',
    state: 'Maharashtra',
    desc: 'The vibrant coastal metropolis of historic docks, legendary Irani cafes, UNESCO Art Deco architecture, and Koli culture.',
    heroImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
  },
  jaipur: {
    name: 'Jaipur',
    state: 'Rajasthan',
    desc: 'The regal Pink City of royal artisans, 350-year-old block printing villages, and hilltop astronomy lore.',
    heroImage: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80',
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const city = CITY_DATA[params.slug.toLowerCase()];
  if (!city) return { title: 'City Not Found' };
  return {
    title: `Authentic Experiences in ${city.name} — Local Experience Platform`,
    description: `Discover verified food walks, heritage tours, and artisan workshops in ${city.name}, ${city.state}.`,
  };
}

async function getCityExperiences(cityName: string) {
  try {
    const res = await fetch(`http://localhost:4000/api/v1/experiences/search?city=${cityName}&limit=20`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function CityDiscoveryPage({ params }: { params: { slug: string } }) {
  const city = CITY_DATA[params.slug.toLowerCase()];
  if (!city) notFound();

  const experiences = await getCityExperiences(city.name);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* City Hero */}
      <div className="relative rounded-3xl overflow-hidden shadow-md border border-slate-200 h-72 mb-10 flex items-end p-8">
        <img src={city.heroImage} alt={city.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        <div className="relative z-10 text-white max-w-2xl">
          <span className="text-orange-400 font-semibold text-xs uppercase tracking-wider">Destinations</span>
          <h1 className="text-3xl sm:text-4xl font-black mt-1">{city.name}, {city.state}</h1>
          <p className="text-slate-200 text-sm mt-2">{city.desc}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Experiences in {city.name}</h2>
        <span className="text-xs text-slate-500">{experiences.length} verified experiences</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {experiences.map((exp: any) => (
          <article key={exp.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg transition flex flex-col">
            <div className="relative h-48 w-full bg-slate-100">
              <img src={exp.mediaUrls?.[0]} alt={exp.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 bg-white/90 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-800 shadow-sm">
                {exp.category}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">{exp.title}</h3>
                <p className="mt-2 text-xs text-slate-500 line-clamp-2">{exp.description}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Price</span>
                  <p className="font-bold text-slate-900 text-sm">₹{exp.priceMin} - ₹{exp.priceMax}</p>
                </div>
                <Link href={`/experiences/${exp.id}`} className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition">
                  View Details
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
