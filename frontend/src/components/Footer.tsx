'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#EFEBE0] text-[#5C6460] py-16 border-t border-[#D8D4C8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#3E4541] text-[#F7F4EA] flex items-center justify-center font-extrabold text-xs shadow-md shadow-[#3E4541]/15">
              LX
            </div>
            <span className="font-manifold text-sm tracking-[0.14em] text-[#3E4541] uppercase">
              Experience<span className="text-[#347F8C]">Platform</span>
            </span>
          </div>
          <p className="text-[#5C6460] text-xs leading-relaxed max-w-xs font-light">
            A curated spatial directory and dynamic route engine for authentic culinary, artisan, and heritage experiences across India.
          </p>
        </div>
        <div>
          <h4 className="text-[#347F8C] font-semibold mb-3 text-xs uppercase tracking-[0.18em]">
            Signature Cities
          </h4>
          <ul className="space-y-2.5 text-xs text-[#5C6460]">
            <li><Link href="/cities/ahmedabad" className="hover:text-[#3E4541] transition-colors">Ahmedabad Heritage</Link></li>
            <li><Link href="/cities/mumbai" className="hover:text-[#3E4541] transition-colors">Mumbai Coastal & Food</Link></li>
            <li><Link href="/cities/jaipur" className="hover:text-[#3E4541] transition-colors">Jaipur Artisan Guilds</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[#347F8C] font-semibold mb-3 text-xs uppercase tracking-[0.18em]">
            Curated Guilds
          </h4>
          <ul className="space-y-2.5 text-xs text-[#5C6460]">
            <li><Link href="/explore?cat=FOOD" className="hover:text-[#3E4541] transition-colors">Culinary & Food Trails</Link></li>
            <li><Link href="/explore?cat=WORKSHOPS" className="hover:text-[#3E4541] transition-colors">Master Artisan Workshops</Link></li>
            <li><Link href="/explore?cat=CULTURE" className="hover:text-[#3E4541] transition-colors">Heritage & Architecture</Link></li>
            <li><Link href="/explore?cat=ADVENTURE" className="hover:text-[#3E4541] transition-colors">Highland & Coastal Trails</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[#347F8C] font-semibold mb-3 text-xs uppercase tracking-[0.18em]">
            Trust & Security
          </h4>
          <p className="text-xs text-[#5C6460] leading-relaxed mb-3 font-light">
            DPDP Act Compliant. 100% Verified Local Guides & Master Guilds. High-precision spatial integrity.
          </p>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono text-[#347F8C] bg-white border border-[#D8D4C8] px-3 py-1 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#8FAF82]" />
            Verified Guild Network
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-[#D8D4C8] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#7C8581] gap-4">
        <span>© {new Date().getFullYear()} Experience Platform. All rights reserved.</span>
        <div className="flex items-center space-x-6">
          <Link href="/explore" className="hover:text-[#3E4541] transition-colors">Explore</Link>
          <Link href="/#itinerary" className="hover:text-[#3E4541] transition-colors">Itinerary Builder</Link>
          <Link href="/auth/login" className="hover:text-[#3E4541] transition-colors">Provider Portal</Link>
        </div>
      </div>
    </footer>
  );
}
