import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Explore All Experiences — Local Experience Platform',
  description: 'Search and filter authentic food trails, artisan workshops, and cultural tours across India.',
};

async function getExperiences(searchParams: { city?: string; cat?: string; budget?: string }) {
  try {
    const params = new URLSearchParams();
    if (searchParams.city) params.set('city', searchParams.city);
    if (searchParams.cat) params.set('category', searchParams.cat);
    if (searchParams.budget) params.set('budgetBand', searchParams.budget);
    params.set('limit', '20');

    const res = await fetch(`http://localhost:4000/api/v1/experiences/search?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { city?: string; cat?: string; budget?: string };
}) {
  const experiences = await getExperiences(searchParams);

  const categories = [
    { label: 'All Categories', value: '' },
    { label: 'Food & Culinary', value: 'FOOD' },
    { label: 'Culture & Heritage', value: 'CULTURE' },
    { label: 'Workshops & Crafts', value: 'WORKSHOPS' },
    { label: 'Adventure', value: 'ADVENTURE' },
    { label: 'Hidden Gems', value: 'HIDDEN_GEMS' },
    { label: 'Nightlife', value: 'NIGHTLIFE' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore Experiences
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Discover verified local guides, artisans, and culinary walks across India.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 pb-4">
        {categories.map((cat) => (
          <Link
            key={cat.value}
            href={`/explore${cat.value ? `?cat=${cat.value}` : ''}`}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              (searchParams.cat || '') === cat.value
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Grid of Results */}
      {experiences.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500 font-medium">No experiences found for this filter.</p>
          <Link href="/explore" className="mt-3 inline-block text-orange-600 font-semibold text-sm hover:underline">
            Clear all filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {experiences.map((exp: any) => (
            <article key={exp.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg transition flex flex-col">
              <div className="relative h-48 w-full bg-slate-100">
                <img
                  src={exp.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b'}
                  alt={exp.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-semibold text-slate-800 shadow-sm">
                  {exp.category}
                </div>
                {exp.provider?.verificationStatus === 'VERIFIED' && (
                  <div className="absolute top-3 right-3 bg-emerald-600 text-white px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm">
                    ✓ Verified
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span>📍 {exp.city}</span>
                    <span className="font-semibold text-amber-600">★ {Number(exp.ratingAverage || 0).toFixed(1)}</span>
                  </div>
                  <h2 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
                    {exp.title}
                  </h2>
                  <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {exp.description}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Price</span>
                    <p className="font-bold text-slate-900 text-sm">₹{exp.priceMin} - ₹{exp.priceMax}</p>
                  </div>
                  <Link
                    href={`/experiences/${exp.id}`}
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
