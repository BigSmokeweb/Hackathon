# Build Prompt Addendum — Conversational Adaptive Itinerary Builder

Give this to your coding agent **after** it has already scaffolded the base project from `build-prompt.md` and `system-design.md`. Upload `feature-addendum-system-design.md` alongside this file.

---

I'm attaching `feature-addendum-system-design.md`, which extends the existing `system-design.md` with a new feature: a conversational, stateful itinerary builder. Read it fully. This is an **addition** to the existing architecture, not a replacement — the existing `recommendation-engine` module, the `experiences` service, and the AI reasoning isolation rules from the original docs all still apply and must not be weakened.

## What to build

**1. New backend module: `/backend/src/modules/trip-session`**
- `TripSession` entity/table per the schema in the addendum (Section 2), with a migration.
- CRUD + state-transition endpoints: create session, get active session, add selection, reject candidate, remove/replace a stop, mark complete/abandoned.
- All the same security rules apply here as everywhere else: ownership checks (`session.user_id === request.user.id`), input validation via Zod/class-validator, UUIDs only.

**2. Extend `/backend/src/modules/recommendation-engine`**
- Do not fork or duplicate it. Add the three new scoring factors (route continuity, diversity, rejection penalty) as additional, independently unit-testable functions inside the existing scoring module, gated behind a `sessionContext` parameter that's optional — the engine must still work exactly as before for non-session (single-shot) requests.
- Route continuity: implement the directional/bearing heuristic described in addendum Section 3.1. Keep it simple — do not implement a full TSP solver.
- Diversity and rejection penalty: implement as described in Section 3.3, session-scoped only, never persisted to the permanent user profile without a separate explicit opt-in flow (flag this as a TODO/future flow if not building consent UI now — do not silently persist it).
- Write unit tests for each new scoring factor independently, same rigor as the existing `deterministic-scoring.engine.spec.ts`.

**3. Stopping conditions**
- Implement the explicit stop conditions from addendum Section 4 as a pure function the backend calls, not something inferred by the LLM. The AI Reasoning Service only phrases the message when a stop condition is close/hit — it does not decide when to stop.

**4. Weather-adapt**
- Integrate a weather API call (use a free-tier provider; check for one already configured in `.env.example`, otherwise add a placeholder env var `WEATHER_API_KEY`), triggered per addendum Section 6 — on new recommendation requests and optionally a coarse polling interval for active sessions. Do not poll continuously/per-second; this is a cost and rate-limit concern.
- Add `weather_tag` (`indoor` / `outdoor` / `weather_dependent`) to the `Experience` model as a migration, defaulting existing seed data sensibly (e.g., market/street food = outdoor, museum/workshop = indoor).
- Wire adverse weather into Layer 1/2 filtering exactly as described — do not implement this as a separate ad hoc rule bypassing the normal scoring pipeline.

**5. AI Reasoning Service changes**
- Extend it to accept `sessionContext` (remaining time/budget, last stop, stop-condition-near flag, weather-adverse flag) alongside the existing top-N candidate payload, still as structured JSON only — no raw user free text gets concatenated into the prompt.
- New response types needed: itinerary-step explanation, "wrap up soon?" prompt, weather-adapt prompt. Keep these as distinct, schema-validated response shapes, not a single freeform chat response.

**6. Frontend**
- New conversational/step-by-step UI flow (can be a guided card-based interface, doesn't need to be literal chat-bubble UI) implementing the loop in addendum Section 1.
- Reuse existing components (experience cards, "why this" explanation panel) — don't rebuild them for this flow.
- Show trip state clearly at each step: remaining time, remaining budget, current location, itinerary so far.

**7. Privacy**
- Implement the retention/expiry rule from addendum Section 7: abandoned sessions with no activity for a configurable window (default 6 hours) should be flagged for purge of precise location data, keeping only anonymized category data if retained at all.
- Confirm `current_location` on `TripSession` is never written to `Recommendation_Log` in raw form — same anonymization util (`location-privacy.util.ts`) used elsewhere must be reused here, not reimplemented.

## Before writing code

Confirm back to me:
1. How you're gating the three new scoring factors so the existing single-shot recommendation path is provably unaffected (e.g., existing tests still pass unchanged).
2. Your plan for the stopping-condition function's location in the codebase (should be callable independently of the HTTP layer, for testing).
3. Confirmation that rejection/diversity data will not touch the permanent user profile without a separate consent mechanism.

## Scope reminder

Per addendum Section 8: build this feature and weather-adapt fully. Group travel, authenticity scoring, gamification, and full route-efficiency UI are **not** part of this build pass — do not start on them unless I explicitly ask.
