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
