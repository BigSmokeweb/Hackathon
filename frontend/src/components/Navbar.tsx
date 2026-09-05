'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = pathname === '/';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isHome && !scrolled
          ? 'bg-transparent border-b border-transparent py-4 text-white'
          : 'bg-[#F7F4EA]/92 backdrop-blur-2xl border-b border-[#D8D4C8] py-3 shadow-md shadow-[#3E4541]/5 text-[#3E4541]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link
          href="/"
          onClick={(e) => {
            if (isHome) {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex items-center space-x-3 group"
        >
          <div
            className={`w-8 h-8 rounded-lg font-extrabold text-xs flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${
              isHome && !scrolled
                ? 'bg-white text-black shadow-lg shadow-black/20'
                : 'bg-[#3E4541] text-[#F7F4EA] shadow-md shadow-[#3E4541]/15'
            }`}
          >
            LX
          </div>
          <span
            className={`font-manifold text-base tracking-[0.14em] uppercase ${
              isHome && !scrolled ? 'text-white' : 'text-[#3E4541]'
            }`}
          >
            Experience<span className={isHome && !scrolled ? 'text-sky-300' : 'text-[#347F8C]'}>Platform</span>
          </span>
        </Link>

        <nav className="flex items-center space-x-7 text-xs font-semibold tracking-wider uppercase">
          <Link
            href="/#curated-experiences"
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                document.getElementById('curated-experiences')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className={`transition-colors duration-200 ${
              isHome && !scrolled ? 'text-zinc-200 hover:text-white' : 'text-[#5C6460] hover:text-[#3E4541]'
            }`}
          >
            Explore
          </Link>
          <Link
            href="/#itinerary"
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                document.getElementById('itinerary')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className={`flex items-center gap-1.5 transition-colors duration-200 ${
              isHome && !scrolled ? 'text-sky-300 hover:text-white' : 'text-[#347F8C] hover:text-[#2A6772]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                isHome && !scrolled ? 'bg-sky-300' : 'bg-[#347F8C]'
              }`}
            />
            Itinerary
          </Link>
          <Link
            href="/cities/ahmedabad"
            className={`transition-colors duration-200 hidden sm:inline-block ${
              isHome && !scrolled ? 'text-zinc-200 hover:text-white' : 'text-[#5C6460] hover:text-[#3E4541]'
            }`}
          >
            Cities
          </Link>
          <Link
            href="/provider/portal"
            className={`transition-colors duration-200 hidden md:inline-block ${
              isHome && !scrolled ? 'text-zinc-200 hover:text-white' : 'text-[#5C6460] hover:text-[#3E4541]'
            }`}
          >
            For Hosts
          </Link>
          <Link
            href="/auth/login"
            className={`px-4 py-1.5 rounded-full font-bold transition-all duration-300 active:scale-95 text-xs ${
              isHome && !scrolled
                ? 'border border-white/30 bg-white/10 hover:bg-white hover:text-black text-white'
                : 'bg-[#347F8C] hover:bg-[#2A6772] text-[#F7F4EA] shadow-sm shadow-[#347F8C]/25'
            }`}
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
}
