import type { Metadata } from 'next';
import Link from 'next/link';
import { HeroAnimatedTitle } from '@/components/HeroAnimatedTitle';
import { ItineraryBuilder } from '@/components/ItineraryBuilder';
import { CuratedDirectory } from '@/components/CuratedDirectory';
import { ScrollToHeroOnRefresh } from '@/components/ScrollToHeroOnRefresh';
import { API_BASE } from '@/lib/api-client';

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

import { ALL_EXPERIENCES } from '@/lib/experiences-data';

async function getAllExperiences() {
  try {
    const res = await fetch(`${API_BASE}/experiences/search?limit=200`, {
      cache: 'no-store',
    });
    if (!res.ok) return ALL_EXPERIENCES;
    const data = await res.json();
    if (!data?.data || data.data.length === 0) return ALL_EXPERIENCES;
    return data.data;
  } catch {
    return ALL_EXPERIENCES;
  }
}

export default async function HomePage() {
  const experiences = await getAllExperiences();

  return (
    <div className="bg-[#F7F4EA] text-[#3E4541] min-h-screen selection:bg-[#4FA3D1]/30 selection:text-[#3E4541]">
      <ScrollToHeroOnRefresh />
      {/* ─── SECTION 1: FULLSCREEN CINEMATIC HERO ─── */}
      <section id="hero" className="relative w-screen h-screen min-h-[680px] overflow-hidden flex flex-col items-center justify-center select-none">
        {/* Background Video (Looping, Muted, Autoplay, PlaysInline) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center scale-[1.02] transform"
          >
            <source src="/hero-bg-2.mp4" type="video/mp4" />
          </video>
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

        </section>

        {/* ─── Curated Directory with Instant Client-Side Category Buttons ─── */}
        <CuratedDirectory
          initialExperiences={experiences}
          categories={CATEGORIES}
          cities={CITIES}
        />
      </div>

      {/* ─── SECTION 3: ITINERARY BUILDER ATELIER ─── */}
      <ItineraryBuilder />
    </div>
  );
}
