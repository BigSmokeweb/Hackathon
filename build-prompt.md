# Build Prompt — Local Experience Intelligence Platform

Paste this as your instruction, with `system-design.md` uploaded alongside it.

---

You are acting as a senior full-stack engineering team building a **production-grade, company-ready** two-sided marketplace platform. I've attached `system-design.md` — a full architecture/security spec. Treat it as the source of truth for data model, security controls, and feature scope. Do not skip or simplify anything in it without telling me first and explaining the tradeoff.

## Project structure

Set up the repo as a monorepo with **fully separated frontend and backend**, not a single Next.js app mixing both:

```
/frontend        → Next.js (App Router) + TypeScript, Tailwind, calls backend only via REST/HTTPS
/backend         → Node.js (NestJS) API, all business logic, DB access, auth, AI proxy
/backend/src
   /modules/auth
   /modules/users
   /modules/providers
   /modules/experiences
   /modules/recommendation-engine   ← pure, deterministic, unit-tested, no AI dependency
   /modules/ai-reasoning            ← isolated service, stateless, receives pre-filtered data only
   /modules/reviews
   /modules/admin
/shared           → shared TypeScript types/DTOs used by both frontend and backend (single source of truth for API contracts)
/infra            → docker-compose for local dev, migration scripts, seed data scripts
```

The frontend must never talk to the database, never hold API keys (Gemini, DB credentials, etc.), and never contain business logic that decides rankings — it only renders what the backend returns.

## Non-negotiable engineering requirements

**Security (build this in from the first commit, not bolted on later):**
- All API keys and secrets server-side only, loaded from environment variables, never committed, never in frontend bundles
- Every DB query parameterized via ORM (Prisma or TypeORM) — no raw string-concatenated SQL anywhere
- Every API endpoint validates input with a schema library (Zod or class-validator) before touching business logic
- All resource fetches check `resource.owner_id === session.user_id` at the service layer — no IDOR
- UUIDs for all externally-exposed IDs, never sequential integers
- JWT access tokens short-lived (15 min) with refresh token rotation; provider accounts require MFA
- Rate limiting (Redis token bucket) on every public endpoint, stricter on auth and search endpoints
- Output-encode/sanitize all user-generated content (reviews, provider descriptions) before render; strict CSP headers
- The AI reasoning module must never receive raw, unsanitized user text concatenated directly into a system prompt with tool/DB access — treat all user input as untrusted, pass only structured, pre-filtered JSON into LLM calls
- Passwords (if any local auth exists) hashed with argon2/bcrypt; prefer delegating to Supabase Auth/Clerk/Auth0 instead of hand-rolling
- Add basic automated security checks to CI: dependency vulnerability scanning (`npm audit` / Snyk), and a linter rule set that flags raw SQL and `dangerouslySetInnerHTML`-style patterns

**Architecture:**
- Recommendation engine (`/modules/recommendation-engine`) must be pure functions: hard filters → weighted scoring → ranking, fully unit-testable, with weights in config, not hardcoded. Write tests for it.
- AI reasoning service only explains/phrases already-ranked results — it never decides the ranking itself. Confirm this separation explicitly in your implementation before writing the AI module.
- Use PostGIS for all location data (`geography(Point,4326)` type), not plain float lat/lng columns, so radius search and distance sorting are correct and indexed.

**SEO (frontend):**
- Use Next.js SSR/ISR for all public discovery/experience pages (not client-side-only rendering) so content is crawlable
- Proper `<title>`, meta description, Open Graph tags per page, generated dynamically per city/category/experience
- Semantic HTML structure (proper heading hierarchy, alt text on all images)
- `sitemap.xml` and `robots.txt` generated automatically from the experiences database
- Structured data (JSON-LD, `LocalBusiness`/`Event` schema) on provider and experience pages
- Core Web Vitals discipline: image optimization via `next/image`, lazy-load below-the-fold content, minimize client JS on public pages

**Code quality / optimization:**
- TypeScript strict mode across both frontend and backend, no `any` without justification
- ESLint + Prettier enforced in CI, consistent formatting
- Database queries must avoid N+1 patterns — use proper joins/includes
- API responses paginated by default, never unbounded result sets
- Environment-specific config (dev/staging/prod) cleanly separated, no hardcoded environment values in code
- Meaningful commit history and a README per folder (`/frontend/README.md`, `/backend/README.md`) explaining setup and structure

## What to do first

1. Scaffold the monorepo structure above with working local dev setup (`docker-compose up` should bring up Postgres+PostGIS, Redis, backend, frontend).
2. Implement the database schema from `system-design.md` Section 4 as migrations.
3. Build auth (traveler + provider roles) end-to-end first, since everything else depends on it.
4. Build the recommendation engine as a standalone, tested module before wiring up the AI layer.
5. Only after 1–4 are working, integrate the AI reasoning service for explanations.

Before writing code, summarize back to me your understanding of the module boundaries and the security controls list above, so I can confirm before you proceed.
