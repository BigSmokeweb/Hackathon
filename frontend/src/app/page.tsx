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

import { ALL_EXPERIENCES } from '@/lib/experiences-data';

async function getAllExperiences() {
  try {
    const res = await fetch(`${API_BASE}/experiences/search?limit=50`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        const remoteIds = new Set(data.data.map((e: any) => e.id));
        return [...data.data, ...ALL_EXPERIENCES.filter((e) => !remoteIds.has(e.id))];
      }
    }
  } catch {
    // Fallback to complete catalog
  }
  return ALL_EXPERIENCES;
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
