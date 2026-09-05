import type { Metadata } from 'next';
import Link from 'next/link';
import { CuratedDirectory } from '@/components/CuratedDirectory';
import { API_BASE } from '@/lib/api-client';

export const metadata: Metadata = {
  title: 'Curated Directory — Experience Platform',
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

export default async function ExplorePage() {
  const experiences = await getAllExperiences();

  return (
    <div className="bg-[#F7F4EA] text-[#3E4541] min-h-screen pt-28 pb-24 selection:bg-[#4FA3D1]/30 selection:text-[#3E4541]">
      {/* ─── Editorial Header ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="border-b border-[#D8D4C8] pb-10">
          <div className="inline-flex items-center gap-2 text-[#347F8C] font-mono text-xs tracking-[0.28em] uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-[#8FAF82]" />
            Verified Guild Directory
          </div>
          <h1 className="font-manifold text-3xl sm:text-5xl lg:text-6xl tracking-[0.06em] text-[#3E4541] uppercase leading-none">
            Curated Experiences
          </h1>
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
        targetId="explore-directory"
      />
    </div>
  );
}
