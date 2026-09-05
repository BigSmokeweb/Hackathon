'use client';

import Link from 'next/link';
import { ItineraryBuilder } from '@/components/ItineraryBuilder';
import { ArrowLeft } from 'lucide-react';

export default function TripPage() {
  return (
    <div className="min-h-screen bg-[#F7F4EA] text-[#3E4541] selection:bg-[#4FA3D1]/30 selection:text-[#3E4541]">
      {/* Top Return to Hero Banner */}
      <div className="pt-24 pb-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#3E4541]/70 hover:text-[#347F8C] border border-[#D8D4C8] hover:border-[#347F8C] px-4 py-2 rounded-xl transition backdrop-blur-md bg-white shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Hero</span>
        </Link>
      </div>

      {/* Redesigned Atelier Itinerary Builder */}
      <ItineraryBuilder />
    </div>
  );
}
