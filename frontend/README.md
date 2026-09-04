# Frontend Application — Local Experience Intelligence Platform

Production-ready Next.js 14 App Router client with SSR/ISR, dynamic SEO, and strict security isolation.

## Architecture Highlights
- **Strict Separation**: Connects strictly to `/backend` via REST (`/api/v1/*`). Never talks to database, never holds private secrets or AI keys.
- **SEO & Structured Data**: Dynamic OpenGraph tags, JSON-LD Schema (`TouristAttraction`, `ItemList`, `LocalBusiness`), automatic `sitemap.ts` and `robots.ts`.
- **Security & CSP**: Hardened Content Security Policy (`default-src 'self' ...`), DOMPurify output-encoding on all user-generated reviews and listings.
- **Aesthetics & Performance**: Tailwind CSS with rich modern color palette, responsive hero discovery bar, and explainable AI recommendation cards.

## Setup & Local Development
1. `npm install`
2. Start development server: `npm run dev` (Runs at http://localhost:3000)
3. Build for production: `npm run build`
