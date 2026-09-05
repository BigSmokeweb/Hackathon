'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Navigation, 
  ChevronDown, 
  Sparkles, 
  ArrowRight, 
  Compass, 
  X, 
  LocateFixed, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export interface CityData {
  slug: string;
  name: string;
  state: string;
  tagline: string;
  lat: number;
  lng: number;
  image: string;
  experienceCount: number;
  vibe: string;
}

export const CITIES_REGISTRY: CityData[] = [
  {
    slug: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    tagline: 'UNESCO Pols, Midnight Spice Bazaars & Stepwells',
    lat: 23.0225,
    lng: 72.5714,
    image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=600&q=80',
    experienceCount: 142,
    vibe: 'Heritage & Culinary',
  },
  {
    slug: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    tagline: 'Art Deco Coastal Enclaves, Sassoon Docks & Irani Cafes',
    lat: 18.9445,
    lng: 72.8210,
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80',
    experienceCount: 215,
    vibe: 'Coastal & Urban Culture',
  },
  {
    slug: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    tagline: '5th Gen Block Printing Guilds, Indigo Vats & Stepwells',
    lat: 26.9124,
    lng: 75.7873,
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    experienceCount: 98,
    vibe: 'Royal Crafts & Artisan',
  },
];

// Haversine formula to compute great-circle distance in kilometers
function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

interface NearbyCitiesDropdownProps {
  isHome: boolean;
  scrolled: boolean;
}

export function NearbyCitiesDropdown({ isHome, scrolled }: NearbyCitiesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Request browser geolocation
  const detectLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationStatus('Geolocation not supported by your browser');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Pinpointing your coordinates...');
    setLocationDenied(false);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLocating(false);
        setLocationStatus('Location locked & distances calibrated');
      },
      (err) => {
        setIsLocating(false);
        setLocationDenied(true);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus('Location access was denied. Showing all regional hubs.');
        } else {
          setLocationStatus('Could not determine exact location. Showing regional hubs.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  };

  // When opening dropdown for the first time, auto-detect location if not already detected
  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && !userCoords && !isLocating && !locationDenied) {
      detectLocation();
    }
  };

  // Close on escape key and outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Compute distances & sort cities by proximity
  const sortedCities = [...CITIES_REGISTRY].map((city) => {
    const distanceKm = userCoords
      ? calculateHaversineDistanceKm(userCoords.lat, userCoords.lng, city.lat, city.lng)
      : null;
    return {
      ...city,
      distanceKm,
    };
  }).sort((a, b) => {
    if (a.distanceKm !== null && b.distanceKm !== null) {
      return a.distanceKm - b.distanceKm;
    }
    return 0;
  });

  const nearestCity = sortedCities.length > 0 && sortedCities[0].distanceKm !== null ? sortedCities[0] : null;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Navbar Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`flex items-center gap-1.5 transition-all duration-200 py-1 px-2 rounded-lg ${
          isOpen
            ? isHome && !scrolled
              ? 'bg-white/20 text-white shadow-sm'
              : 'bg-[#D8D4C8]/40 text-[#3E4541]'
            : isHome && !scrolled
            ? 'text-zinc-200 hover:text-white hover:bg-white/10'
            : 'text-[#5C6460] hover:text-[#3E4541] hover:bg-[#D8D4C8]/25'
        }`}
      >
        <MapPin className={`w-3.5 h-3.5 ${userCoords ? 'text-[#8FAF82]' : isHome && !scrolled ? 'text-sky-300' : 'text-[#347F8C]'}`} />
        <span>Cities</span>
        {userCoords && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#8FAF82] animate-pulse" />
        )}
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[360px] sm:w-[420px] bg-[#F7F4EA] border border-[#D8D4C8] rounded-2xl shadow-2xl shadow-[#3E4541]/15 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 text-[#3E4541]">
          {/* Header */}
          <div className="p-4 bg-white/70 border-b border-[#D8D4C8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#347F8C]/10 flex items-center justify-center text-[#347F8C]">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-manifold text-xs uppercase tracking-wider font-bold text-[#3E4541]">
                  Regional Hubs Near You
                </h3>
                <p className="text-[11px] font-mono text-[#5C6460]">
                  {isLocating
                    ? 'Determining your coordinates...'
                    : userCoords
                    ? `Calibrated from your device location`
                    : 'Sorted by heritage circuits'}
                </p>
              </div>
            </div>

            {/* Refresh / Re-locate Button */}
            <button
              type="button"
              onClick={detectLocation}
              disabled={isLocating}
              title="Recalculate location"
              className="p-1.5 rounded-lg border border-[#D8D4C8] hover:border-[#347F8C] hover:bg-white transition-all text-[#347F8C] active:scale-95 disabled:opacity-50"
            >
              <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Location Status Notice */}
          {locationStatus && (
            <div className={`px-4 py-2 text-[11px] font-mono flex items-center gap-1.5 border-b border-[#D8D4C8] ${
              locationDenied 
                ? 'bg-amber-50/80 text-amber-800' 
                : userCoords 
                ? 'bg-emerald-50/80 text-emerald-800' 
                : 'bg-sky-50/80 text-sky-800'
            }`}>
              {locationDenied ? (
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              ) : userCoords ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              ) : (
                <Navigation className="w-3.5 h-3.5 shrink-0 animate-pulse text-sky-600" />
              )}
              <span className="truncate">{locationStatus}</span>
            </div>
          )}

          {/* Nearest Highlight Banner */}
          {nearestCity && nearestCity.distanceKm !== null && (
            <div className="mx-3 mt-3 p-3 rounded-xl bg-gradient-to-r from-[#347F8C]/15 to-[#8FAF82]/15 border border-[#347F8C]/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-bold text-[#347F8C] bg-white px-2 py-0.5 rounded-full shadow-2xs">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Closest to you
                </span>
                <span className="font-semibold text-xs text-[#3E4541]">
                  {nearestCity.name}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#347F8C] bg-white/80 px-2 py-0.5 rounded-md border border-[#347F8C]/20">
                {nearestCity.distanceKm < 25 ? 'In your area' : `~${nearestCity.distanceKm} km`}
              </span>
            </div>
          )}

          {/* Cities List */}
          <div className="p-3 space-y-2.5 max-h-[380px] overflow-y-auto">
            {sortedCities.map((city, idx) => {
              const isClosest = idx === 0 && city.distanceKm !== null;
              return (
                <Link
                  key={city.slug}
                  href={`/cities/${city.slug}`}
                  onClick={() => setIsOpen(false)}
                  className={`group relative flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 bg-white hover:shadow-md ${
                    isClosest
                      ? 'border-[#347F8C]/40 hover:border-[#347F8C]'
                      : 'border-[#D8D4C8] hover:border-[#3E4541]/30'
                  }`}
                >
                  {/* City Thumbnail */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-stone-200">
                    <img
                      src={city.image}
                      alt={city.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                  </div>

                  {/* City Details */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-manifold text-sm font-bold uppercase tracking-wide text-[#3E4541] group-hover:text-[#347F8C] transition-colors">
                          {city.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#5C6460]/80">
                          {city.state}
                        </span>
                      </div>

                      {/* Distance Pill */}
                      {city.distanceKm !== null ? (
                        <span
                          className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                            isClosest
                              ? 'bg-[#8FAF82]/20 text-[#2D5A27]'
                              : 'bg-[#D8D4C8]/40 text-[#5C6460]'
                          }`}
                        >
                          {city.distanceKm < 25 ? '📍 In City' : `~${city.distanceKm} km`}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-[#5C6460]/70">
                          Regional Hub
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-[#5C6460] line-clamp-1 font-light leading-snug">
                      {city.tagline}
                    </p>

                    <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-[#3E4541]/70">
                      <span className="text-[#347F8C] font-semibold">
                        {city.experienceCount}+ experiences
                      </span>
                      <span>&bull;</span>
                      <span>{city.vibe}</span>
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <ArrowRight className="w-4 h-4 text-[#5C6460]/40 group-hover:text-[#347F8C] group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              );
            })}
          </div>

          {/* Footer Note & Quick Action */}
          <div className="p-3 bg-white/60 border-t border-[#D8D4C8] flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#5C6460]">
              {userCoords ? 'Distances calculated via GPS' : 'Click locate to calculate GPS distances'}
            </span>
            <Link
              href="/explore"
              onClick={() => setIsOpen(false)}
              className="font-bold text-[#347F8C] hover:text-[#2A6772] hover:underline"
            >
              Browse All India &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
