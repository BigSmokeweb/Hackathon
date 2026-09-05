import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FloatingChatSupport } from '@/components/FloatingChatSupport';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://experienceplatform.in'),
  title: {
    default: 'Experience Platform — Discover Authentic India',
    template: '%s | Experience Platform',
  },
  description: 'Deterministic discovery platform for authentic culinary, cultural, artisan, and adventure experiences across India.',
  keywords: ['India Travel', 'Local Experiences', 'Authentic Food Tours', 'Artisan Workshops', 'Culture Walk', 'Ahmedabad', 'Mumbai', 'Jaipur'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self' blob:; media-src 'self' data: blob:; img-src 'self' data: blob: https: https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://images.unsplash.com https://unpkg.com; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' blob: data: http://localhost:4000 https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://nominatim.openstreetmap.org;"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if ('scrollRestoration' in history) {
                  history.scrollRestoration = 'manual';
                }
                window.scrollTo(0, 0);
              } catch (e) {}
            `,
          }}
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className={`${inter.className} bg-[#F7F4EA] text-[#3E4541] antialiased selection:bg-[#4FA3D1]/30 selection:text-[#3E4541] overflow-x-hidden`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <FloatingChatSupport />
      </body>
    </html>
  );
}
