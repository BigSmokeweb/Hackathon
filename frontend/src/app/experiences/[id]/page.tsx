import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

async function getExperience(id: string) {
  try {
    const res = await fetch(`http://localhost:4000/api/v1/experiences/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const experience = await getExperience(params.id);
  if (!experience) {
    return { title: 'Experience Not Found' };
  }
  return {
    title: `${experience.title} — ${experience.city}`,
    description: experience.description?.substring(0, 160),
    openGraph: {
      title: experience.title,
      description: experience.description?.substring(0, 160),
      images: experience.mediaUrls?.[0] ? [{ url: experience.mediaUrls[0] }] : [],
    },
  };
}

export default async function ExperienceDetailPage({ params }: { params: { id: string } }) {
  const exp = await getExperience(params.id);
  if (!exp) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/explore" className="text-xs text-orange-600 font-semibold hover:underline mb-6 inline-block">
        ← Back to all experiences
      </Link>

      {/* Main Experience Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 h-80 bg-slate-100">
          <img
            src={exp.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b'}
            alt={exp.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {exp.category}
              </span>
              <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                📍 {exp.city}, {exp.state}
              </span>
              {exp.provider?.verificationStatus === 'VERIFIED' && (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  ✓ Verified Provider
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              {exp.title}
            </h1>

            <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
              <span className="font-semibold text-amber-600">★ {Number(exp.ratingAverage || 0).toFixed(1)}</span>
              <span>•</span>
              <span>{exp.reviewCount || 0} reviews</span>
              <span>•</span>
              <span>{Math.round((exp.authenticityRating || 0.9) * 100)}% Authenticity</span>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs text-slate-500">Price per person</span>
                <p className="text-2xl font-black text-slate-900">₹{exp.priceMin} - ₹{exp.priceMax}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Duration</span>
                <p className="font-semibold text-slate-800">{exp.durationMinutes || 120} mins</p>
              </div>
            </div>
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg shadow-sm transition">
              Book Interaction
            </button>
          </div>
        </div>
      </div>

      {/* Description & Host Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-200 pt-8">
        <div className="md:col-span-2 space-y-6">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">About this experience</h2>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {exp.description}
            </p>
          </section>

          {exp.accessibilityTags && exp.accessibilityTags.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Accessibility & Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {exp.accessibilityTags.map((tag: string) => (
                  <span key={tag} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md">
                    {tag.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Structured Reviews */}
          <section className="pt-6 border-t border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Verified Traveler Reviews</h2>
            {exp.reviews && exp.reviews.length > 0 ? (
              <div className="space-y-4">
                {exp.reviews.map((rev: any) => (
                  <div key={rev.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-bold text-slate-900">{rev.user?.name || 'Traveler'}</span>
                      <span className="text-amber-600 font-semibold">★ {rev.ratingOverall}/5</span>
                    </div>
                    <p className="text-sm text-slate-700">{rev.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No reviews yet for this newly listed experience.</p>
            )}
          </section>
        </div>

        {/* Provider Details Card */}
        <div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Hosted by</h3>
            <p className="font-bold text-slate-800 text-base">{exp.provider?.businessName}</p>
            <p className="text-xs text-slate-500 mt-1">Based in {exp.provider?.city}</p>
            {exp.provider?.verificationStatus === 'VERIFIED' && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                ✓ Government/GST Verified
              </div>
            )}
          </div>
        </div>
      </div>

      {/* JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'TouristAttraction',
            name: exp.title,
            description: exp.description,
            image: exp.mediaUrls?.[0],
            address: {
              '@type': 'PostalAddress',
              streetAddress: exp.address,
              addressLocality: exp.city,
              addressRegion: exp.state,
              addressCountry: 'IN',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: exp.ratingAverage || 5,
              reviewCount: exp.reviewCount || 1,
            },
          }),
        }}
      />
    </div>
  );
}
