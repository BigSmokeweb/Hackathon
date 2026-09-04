import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://experienceplatform.in'),
  title: {
    default: 'Local Experience Intelligence Platform — Discover Authentic India',
    template: '%s | Local Experience Platform',
  },
  description: 'AI-assisted, deterministic discovery platform for authentic culinary, cultural, artisan, and adventure experiences across India.',
  keywords: ['India Travel', 'Local Experiences', 'Authentic Food Tours', 'Artisan Workshops', 'Culture Walk', 'Ahmedabad', 'Mumbai', 'Jaipur'],
  authors: [{ name: 'Experience Intelligence Team' }],
  openGraph: {
    title: 'Local Experience Intelligence Platform',
    description: 'Discover authentic local experiences across India backed by verified local providers.',
    url: 'https://experienceplatform.in',
    siteName: 'Local Experience Intelligence',
    locale: 'en_IN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Strict Content Security Policy */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; img-src 'self' data: https: https://images.unsplash.com; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:4000;"
        />
      </head>
      <body className={inter.className}>
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold shadow-md shadow-orange-500/30">
                LX
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                Experience<span className="text-orange-600">Platform</span>
              </span>
            </div>
            <nav className="flex items-center space-x-6 text-sm font-medium text-slate-600">
              <a href="/explore" className="hover:text-orange-600 transition">Explore</a>
              <a href="/cities/ahmedabad" className="hover:text-orange-600 transition">Cities</a>
              <a href="/provider/portal" className="text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-lg transition">For Providers</a>
              <a href="/auth/login" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-1.5 rounded-lg shadow-sm transition">Sign In</a>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="bg-slate-900 text-slate-400 py-12 mt-20 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
            <div>
              <h3 className="text-white font-semibold mb-3">Experience Platform</h3>
              <p className="text-slate-400 leading-relaxed">
                Empowering verified local guides, artisans, and culinary hosts across India with explainable AI discovery.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">Top Cities</h4>
              <ul className="space-y-2">
                <li><a href="/cities/ahmedabad" className="hover:text-white transition">Ahmedabad</a></li>
                <li><a href="/cities/mumbai" className="hover:text-white transition">Mumbai</a></li>
                <li><a href="/cities/jaipur" className="hover:text-white transition">Jaipur</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">Categories</h4>
              <ul className="space-y-2">
                <li><a href="/explore?cat=FOOD" className="hover:text-white transition">Culinary & Food Trails</a></li>
                <li><a href="/explore?cat=WORKSHOPS" className="hover:text-white transition">Artisan Workshops</a></li>
                <li><a href="/explore?cat=CULTURE" className="hover:text-white transition">Heritage & Culture</a></li>
                <li><a href="/explore?cat=ADVENTURE" className="hover:text-white transition">Local Adventures</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">Trust & Security</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                DPDP Act 2023 Compliant. Verified Provider KYC. Deterministic recommendation scoring with private on-demand geolocation.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
