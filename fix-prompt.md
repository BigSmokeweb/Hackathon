# Fix Prompt — Performance, URL Structure, Security & Accessibility

Give this to your coding agent as a standalone task. I'm attaching the Lighthouse audit report for `https://experience-platform-sigma.vercel.app/` (scores: Performance 91, Accessibility 90, Best Practices 77, SEO 100). Read the full report before starting — the specific numbers below are pulled directly from it, don't guess at different ones.

Even though Performance scored 91, the site *feels* slow in practice and the report shows real, fixable problems. Do not treat 91 as "good enough" — fix the underlying issues listed below.

---

## 1. Performance (currently 91, but with real waste)

The report shows:
- **Total network payload: 8,938 KiB** — this is a lot for a single page load. Find what's actually being shipped (check the Network tab / bundle analyzer) and cut it.
- **Improve image delivery — est. savings of 1,480 KiB.** Convert all images to WebP/AVIF, use `next/image` with proper `sizes`/`width`/`height` so the browser doesn't download oversized images, and lazy-load anything below the fold.
- **Use efficient cache lifetimes — est. savings of 1,543 KiB.** Set proper `Cache-Control` headers on static assets (images, JS, CSS) so repeat visits don't re-download unchanged files. On Vercel this usually means checking `next.config.js` headers config and ensuring static assets aren't being served with short/no-cache headers.
- **Render-blocking requests — est. savings of 180ms.** Identify any CSS/JS loaded synchronously in `<head>` that blocks first paint; defer or inline-critical-CSS where appropriate.
- **Reduce unused JavaScript — est. savings of 101 KiB** and **Legacy JavaScript — est. savings of 11 KiB.** Check for unused imports, dead code, and unnecessary polyfills being shipped to modern browsers. Run a bundle analyzer (`@next/bundle-analyzer`) and identify what's bloating the JS bundle.
- **Minimize main-thread work — 2.8s total, with 4 long tasks found.** Identify what's running on the main thread for that long (heavy client-side rendering, unoptimized re-renders, large synchronous computations) and either move it off the main thread, memoize it, or defer it until after first paint.
- **16 non-composited animations found.** Check any CSS animations/transitions and make sure they animate `transform`/`opacity` (GPU-composited) rather than properties like `width`/`top`/`left` that force layout recalculation.
- **Speed Index is 2.4s (flagged red)** despite fast FCP (0.8s) and LCP (1.0s) — this usually means content appears but takes time to become visually complete/stable. Investigate what's rendering progressively/late after the initial paint.

## 2. Clean up URLs ("dirty" URLs)

- Audit every route and remove unnecessary query parameters from URLs that should be path-based instead — e.g., `/experience?id=abc123&city=mumbai` should become `/experience/abc123` or `/mumbai/experience/abc123` using Next.js dynamic routes.
- Any internal tracking/session parameters must not leak into the visible/shareable URL — move them to headers, cookies, or server-side session state instead of the query string.
- Ensure URLs are lowercase, hyphenated, human-readable slugs (e.g., `/experiences/mumbai/kala-ghoda-art-walk`, not `/experiences/exp_9f8a7b2c1d`) both for UX and SEO.

## 3. Shorten shareable links

- If "share" functionality currently copies a long URL (full path + multiple query params), implement either:
  - Clean slug-based URLs (see above) so the natural URL is already short, or
  - A dedicated short-link/redirect system (e.g., `/s/:shortCode` that redirects server-side to the full experience page) if the underlying route genuinely needs to carry more state than a slug allows.
- Do not put any sensitive data (user IDs, session tokens, internal DB IDs) in a shareable link — a shared link may be seen by people other than the original user.

## 4. Security ("vulnerability identify" — from Best Practices score of 77)

Directly from the report:
- **Uses third-party cookies — 3 found.** Identify which third-party scripts are setting these and either remove them, replace with first-party alternatives, or ensure they're not tracking-related without disclosure (this also matters for DPDP compliance per our system design).
- **Ensure CSP is effective against XSS attacks** — currently not passing. Add a real `Content-Security-Policy` header (via `next.config.js` headers or middleware) that restricts `script-src`, `style-src`, etc. to known origins — not just a placeholder policy.
- **Ensure proper origin isolation with COOP** — add a `Cross-Origin-Opener-Policy` header.
- **Mitigate clickjacking with XFO or CSP** — add `X-Frame-Options: DENY` (or `frame-ancestors 'none'` in CSP) so the site can't be embedded in a malicious iframe.
- **Mitigate DOM-based XSS with Trusted Types** — enable the Trusted Types API via CSP (`require-trusted-types-for 'script'`) and fix any code path using `innerHTML`/`dangerouslySetInnerHTML` with unsanitized input to use a Trusted Types policy or safe alternative.
- **Issues logged in the Chrome DevTools Issues panel** — open DevTools → Issues tab yourself on the live site and fix whatever's flagged there; the PDF report doesn't show the specific issues, only that they exist.

This overlaps directly with the security controls already specified in `system-design.md` and `build-prompt.md` — treat these as the same requirement, not a separate ad hoc fix.

## 5. Accessibility (currently 90 — small, concrete fixes)

- **Select elements do not have associated label elements** — add `<label htmlFor>` or `aria-label` to every `<select>`.
- **Background/foreground contrast ratio insufficient** — find the flagged elements (Lighthouse lists them in the full report) and adjust colors to meet WCAG AA contrast (4.5:1 for normal text).
- **Heading elements not in sequentially-descending order** — audit heading hierarchy (`h1`→`h2`→`h3`, no skipping levels) across all pages.
- **`<video>` elements missing `<track kind="captions">`** — add caption tracks to any video content, or a text transcript if captions aren't available yet.
- **Identical links have the same purpose** — check for multiple links with the same visible text pointing to different destinations, or vice versa; make link text unique/descriptive per destination.

## 6. SEO — already 100, just don't regress it

No action needed here, but when making the above changes (especially URL restructuring), make sure to:
- Update `sitemap.ts`/`sitemap.xml` to reflect new clean URLs
- Add proper 301 redirects from any old URLs (if this site has existing indexed pages) to the new clean ones, so you don't lose any existing search ranking
- Re-run Lighthouse after changes to confirm SEO stays at 100

---

## How to work

1. Fix performance first (Section 1) — it has the most measurable, verifiable impact and the report gives you exact savings estimates to confirm against after the fix.
2. Then URL cleanup + shareable links (Sections 2–3) together, since they're related.
3. Then security headers (Section 4) — these are usually a single `next.config.js` or middleware change with big payoff.
4. Then accessibility (Section 5) — smallest, most mechanical fixes.
5. Re-run Lighthouse (or ask me to) after each section and report the new scores before moving to the next section, so we can confirm each fix actually worked rather than assuming it did.

Do not weaken any existing security control from `system-design.md`/`build-prompt.md` while doing this (e.g., don't loosen CSP to "fix" a rendering issue — fix the actual code causing the CSP conflict instead). If a fix requires a real tradeoff, stop and ask me.
