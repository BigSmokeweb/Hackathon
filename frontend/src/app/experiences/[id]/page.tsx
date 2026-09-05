import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { API_BASE } from '@/lib/api-client';
import { Star, Clock, ShieldCheck, MapPin, ArrowLeft, ArrowRight, Compass, CheckCircle2 } from 'lucide-react';

const FALLBACK_DIRECTORY: Record<string, any> = {
  'exp-1': {
    id: 'exp-1',
    title: 'Old Ahmedabad Pols & Midnight Spice Trail',
    category: 'Culinary & Heritage',
    city: 'Ahmedabad',
    state: 'Gujarat',
    durationMinutes: 180,
    priceMin: 1800,
    priceMax: 2400,
    ratingAverage: 4.96,
    reviewCount: 142,
    authenticityRating: 0.98,
    mediaUrls: ['https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80'],
    description: `Walk through 600-year-old wooden carved Pol houses, private haveli courtyards, and secret midnight street delicacies.

This nocturnal expedition explores the historic living quarters of Ahmedabad's walled city. We visit hidden courtyards preserved through communal otlas, stepwells, bird feeders (chabutros), and taste heirloom family recipes perfected across generations.`,
    accessibilityTags: ['Walking_Intensive', 'Vegetarian_Only', 'Night_Tour'],
    provider: {
      businessName: 'Manek Chowk Guild',
      city: 'Ahmedabad',
      verificationStatus: 'VERIFIED',
    },
    reviews: [
      { id: 'r1', user: { name: 'Aarav Mehta' }, ratingOverall: 5, text: 'Unbelievable haveli access that tourists never see. The midnight maska bun and masala chai in the inner court was unforgettable.' },
      { id: 'r2', user: { name: 'Elena Rostova' }, ratingOverall: 5, text: 'A masterclass in vernacular wooden architecture and culinary heritage.' },
    ],
  },
  'exp-2': {
    id: 'exp-2',
    title: 'Bagru Hand-Block Printing with 5th Gen Masters',
    category: 'Artisan Workshop',
    city: 'Jaipur',
    state: 'Rajasthan',
    durationMinutes: 240,
    priceMin: 3200,
    priceMax: 4500,
    ratingAverage: 4.98,
    reviewCount: 98,
    authenticityRating: 0.99,
    mediaUrls: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80'],
    description: `Learn natural mud-resist Dabu printing, botanical indigo vats, and carve your own personalized wooden blocks.

Guided by master craftsmen from the Chhipa community whose ancestors printed textiles for Rajasthani courts. You will work directly with fermented indigo vats, limestone resist pastes, and keep your hand-printed silk scarf.`,
    accessibilityTags: ['Hands_On_Craft', 'Botanical_Dyes', 'Take_Home_Artifact'],
    provider: {
      businessName: 'Chhipa Artisan Collective',
      city: 'Jaipur',
      verificationStatus: 'VERIFIED',
    },
    reviews: [
      { id: 'r3', user: { name: 'Priya Sengupta' }, ratingOverall: 5, text: 'The depth of knowledge regarding natural minerals and indigo chemistry was mesmerizing.' },
    ],
  },
  'exp-3': {
    id: 'exp-3',
    title: 'Colaba Art Deco & Coastal Fisherfolk Dawn Walk',
    category: 'Urban Culture',
    city: 'Mumbai',
    state: 'Maharashtra',
    durationMinutes: 150,
    priceMin: 1500,
    priceMax: 2000,
    ratingAverage: 4.92,
    reviewCount: 215,
    authenticityRating: 0.95,
    mediaUrls: ['https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80'],
    description: `Experience Sassoon Docks at sunrise, architectural secrets of the Oval Maidan, and heritage Parsi bakery breakfasts.

At 5:30 AM, witness the vibrant arrival of Bombay's indigenous Koli fishing trawlers. Then transition into the UNESCO-recognized Art Deco quarter of Marine Drive and Oval Maidan with an architectural historian.`,
    accessibilityTags: ['Early_Dawn_Start', 'Architectural_Walk', 'Breakfast_Included'],
    provider: {
      businessName: 'Bombay Heritage Trust',
      city: 'Mumbai',
      verificationStatus: 'VERIFIED',
    },
    reviews: [
      { id: 'r4', user: { name: 'Kabir Varma' }, ratingOverall: 5, text: 'Seeing Sassoon Docks wake up is Mumbai at its rawest and most poetic.' },
    ],
  },
};

import { ALL_EXPERIENCES } from '@/lib/experiences-data';

async function getExperience(id: string) {
  const localMatch = ALL_EXPERIENCES.find((e) => e.id === id);
  try {
    const res = await fetch(`${API_BASE}/experiences/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return localMatch || FALLBACK_DIRECTORY[id] || FALLBACK_DIRECTORY['exp-1'];
    const data = await res.json();
    return data || localMatch || FALLBACK_DIRECTORY[id] || FALLBACK_DIRECTORY['exp-1'];
  } catch {
    return localMatch || FALLBACK_DIRECTORY[id] || FALLBACK_DIRECTORY['exp-1'];
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const experience = await getExperience(params.id);
  if (!experience) {
    return { title: 'Experience Not Found' };
  }
  return {
    title: `${experience.title} — ${experience.city} | Experience Platform`,
    description: experience.description?.substring(0, 160),
  };
}

export default async function ExperienceDetailPage({ params }: { params: { id: string } }) {
  const exp = await getExperience(params.id);
  if (!exp) notFound();

  return (
    <div className="bg-[#F7F4EA] text-[#3E4541] min-h-screen pt-28 pb-24 selection:bg-[#4FA3D1]/30 selection:text-[#3E4541]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/#curated-experiences"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#3E4541]/70 hover:text-[#347F8C] transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Curated Experiences</span>
        </Link>

        {/* Main Experience Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-14">
          <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-[#D8D4C8] h-80 sm:h-96 lg:h-[460px] bg-[#EFEBE0] relative shadow-sm">
            <img
              src={exp.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80'}
              alt={exp.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-[#F7F4EA]">
              <span className="bg-[#3E4541]/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 uppercase tracking-wider text-[#F7F4EA] font-semibold">
                {exp.city}
              </span>
              <span className="bg-[#3E4541]/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
                {exp.durationMinutes || 120} Minutes
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-[#4FA3D1]/15 text-[#347F8C] border border-[#4FA3D1]/30 text-[11px] font-mono tracking-wider px-3 py-1 rounded-full uppercase font-semibold">
                  {exp.category}
                </span>
                {exp.provider?.verificationStatus === 'VERIFIED' && (
                  <span className="bg-white text-[#3E4541]/80 border border-[#D8D4C8] text-[11px] font-mono px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#8FAF82]" /> Verified Host
                  </span>
                )}
              </div>

              <h1 className="font-manifold text-2xl sm:text-3xl lg:text-4xl uppercase tracking-wide text-[#3E4541] font-bold leading-snug">
                {exp.title}
              </h1>

              <div className="flex items-center gap-4 mt-4 text-xs font-mono text-[#3E4541]/75">
                <span className="flex items-center gap-1 text-[#3E4541] font-semibold">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {Number(exp.ratingAverage || 4.9).toFixed(2)}
                </span>
                <span className="text-[#D8D4C8]">&bull;</span>
                <span>{exp.reviewCount || 48} verified reviews</span>
                <span className="text-[#D8D4C8]">&bull;</span>
                <span className="text-[#8FAF82] font-semibold">
                  {Math.round((exp.authenticityRating || 0.95) * 100)}% Authenticity
                </span>
              </div>
            </div>

            {/* Tariff & Reservation Box */}
            <div className="bg-white p-6 rounded-2xl border border-[#D8D4C8] mt-8 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#3E4541]/60 block">
                    Tariff per guest
                  </span>
                  <p className="font-manifold text-2xl text-[#3E4541] font-bold tracking-wide mt-0.5">
                    {(!exp.priceMin && !exp.priceMax) || (exp.priceMin === 0 && exp.priceMax === 0)
                      ? 'Free'
                      : exp.priceMin === 0
                      ? `Free – ₹${exp.priceMax?.toLocaleString()}`
                      : `₹${exp.priceMin?.toLocaleString()} – ₹${exp.priceMax?.toLocaleString()}`}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#3E4541]/60 block">
                    Duration
                  </span>
                  <p className="text-sm font-mono text-[#3E4541]/80 mt-0.5 font-semibold">
                    {exp.durationMinutes || 120} mins
                  </p>
                </div>
              </div>

              <Link
                href="/#itinerary"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#347F8C] hover:bg-[#2A6772] text-[#F7F4EA] font-mono text-xs uppercase tracking-wider font-bold py-3.5 rounded-xl transition-all duration-300 shadow-md shadow-[#347F8C]/20"
              >
                <span>Add to Day Plan</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Practical Notes */}
            <div className="mt-6 p-4 rounded-xl bg-[#F0EDE1] border border-[#D8D4C8] text-xs font-mono text-[#3E4541]/80 flex items-start gap-3">
              <Compass className="w-4 h-4 text-[#347F8C] shrink-0 mt-0.5" />
              <span>
                Coordinates validated. Meeting points sent directly upon itinerary generation. Respect spatial norms and local heritage rules.
              </span>
            </div>
          </div>
        </div>

        {/* Details & Reviews Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-16 pt-12 border-t border-[#D8D4C8]">
          <div className="lg:col-span-8">
            <section className="mb-12">
              <h2 className="font-manifold text-xl text-[#3E4541] uppercase tracking-wide font-bold mb-4">
                Field Briefing
              </h2>
              <p className="text-sm sm:text-base text-[#3E4541]/85 leading-relaxed font-light">
                {exp.description}
              </p>
            </section>

            {/* Host Guild Notes */}
            <section className="mb-12 bg-white p-6 rounded-2xl border border-[#D8D4C8] shadow-sm">
              <div className="flex items-center gap-2 text-[#347F8C] font-mono text-xs tracking-wider uppercase font-semibold mb-2">
                <ShieldCheck className="w-4 h-4 text-[#8FAF82]" />
                Host Certification
              </div>
              <p className="text-xs sm:text-sm text-[#3E4541]/80 leading-relaxed font-light">
                Every session is overseen by certified regional custodians, ensuring ethical compensation to artisans, zero commercial kickbacks, and pristine cultural transmission.
              </p>
            </section>

            {/* Reviews */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-manifold text-xl text-[#3E4541] uppercase tracking-wide font-bold">
                  Field Dispatches & Reviews
                </h2>
                <span className="text-xs font-mono text-[#3E4541]/60">
                  {exp.reviewCount || 48} entries
                </span>
              </div>

              {exp.reviews && exp.reviews.length > 0 ? (
                <div className="space-y-4">
                  {exp.reviews.map((rev: any) => (
                    <div
                      key={rev.id}
                      className="bg-white p-5 rounded-xl border border-[#D8D4C8] shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-xs sm:text-sm text-[#3E4541]">
                          {rev.userName}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-[#3E4541]/80 font-light leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-mono text-[#3E4541]/50">
                  Newly curated expedition. First cohort chronicles opening soon.
                </p>
              )}
            </section>
          </div>

          {/* Provider Card */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl border border-[#D8D4C8] shadow-sm">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#347F8C] font-semibold block mb-2">
                Listed By
              </span>
              <h3 className="font-manifold text-xl text-[#3E4541] font-bold tracking-wide uppercase">
                {exp.provider?.businessName ? `Listed by ${exp.provider.businessName}` : 'Listed by local traveller'}
              </h3>
              <p className="text-xs font-mono text-[#3E4541]/60 mt-1">Based in {exp.provider?.city || exp.city}</p>
              <div className="mt-4 pt-4 border-t border-[#D8D4C8] text-xs text-[#3E4541]/75 leading-relaxed font-light">
                Verified through the Experience Platform spatial integrity network. On-site audits conducted for authentic historical and craft preservation.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
