# System Design Addendum — Conversational Adaptive Itinerary Builder
## Extends `system-design.md`. Read that document first; this file only adds to it.

---

## 1. What this adds

A new interaction mode on top of the existing recommendation engine: instead of a single one-shot query returning top-5 results, the traveler builds an itinerary **one stop at a time**, in a loop, with the system carrying state between each step.

```
Location → Context → Recommend → User Selects → New Location → Updated Context → Recommend → ... → Finish
```

This does **not** replace the existing deterministic engine. It wraps it in a stateful session and adds two new scoring factors (route continuity, diversity) plus a rejection-learning mechanism. The AI Reasoning Service's role is unchanged: it still only explains/phrases, never ranks.

---

## 2. New entity: `TripSession`

```
TripSession
 ├── id (UUID)
 ├── user_id (FK)
 ├── status (enum: active, completed, abandoned)
 ├── start_location (PostGIS point)
 ├── current_location (PostGIS point)     ← updates after each selection
 ├── start_time
 ├── remaining_time_minutes
 ├── total_budget
 ├── remaining_budget
 ├── group_size
 ├── accessibility_requirements[]
 ├── interests[]                           ← initial, can shift via rejection learning
 ├── selected_experiences[]  (ordered array, FK list)
 ├── selected_categories[]                 ← for diversity scoring
 ├── rejected_experiences[]  (FK list)
 ├── rejected_categories[]                 ← for negative preference weighting
 ├── created_at / updated_at
```

`TripSession` is **ephemeral by design intent** but persisted (not just in-memory) so a user can resume a session, and so completed sessions become training/analytics signal later. Apply the same data-retention discipline as `Interaction` — anonymize/purge old abandoned sessions per the DPDP retention policy already defined in `system-design.md` Section 6.

---

## 3. Updated recommendation engine flow (session-aware variant)

The existing Layer 1–4 pipeline (`system-design.md` Section 7) is unchanged for the single-shot case. For session-based recommendations, insert two additional signals into Layer 2 scoring:

```
Layer 1 — Hard filters (unchanged: radius from current_location, open/closed,
           budget ceiling using remaining_budget, accessibility, time fit using
           remaining_time_minutes)

Layer 2 — Weighted scoring, extended:
   score = w1*location_match + w2*intent_match + w3*budget_fit
         + w4*time_availability + w5*rating + w6*authenticity
         - w7*distance_penalty
         + w8*route_continuity_score      ← NEW
         + w9*diversity_score             ← NEW
         - w10*rejection_penalty          ← NEW

Layer 3 — AI reasoning (unchanged: explains top-N only)

Layer 4 — Response assembly + TripSession update on selection
```

### 3.1 Route continuity score
Penalizes candidates that would cause geographic backtracking or zig-zagging relative to the session's path so far, not just the single previous stop. A simple, defensible V1 implementation:
```
route_continuity_score = f(distance_from_current_location, bearing_consistency)
```
where `bearing_consistency` mildly rewards candidates that continue in a similar general direction to the last 1–2 moves, rather than doubling back. Don't over-engineer this into a full TSP solver for the hackathon — a directional heuristic is enough to avoid the "Gateway → Kala Ghoda → Bandra → Colaba → Powai" failure case, and it's explainable to judges.

### 3.2 Diversity score
Soft penalty (not a hard block) on repeating a category already present 2+ times in `selected_categories`. This keeps recommendations from collapsing into "food, food, food, food" while still allowing a genuinely food-focused trip if the user keeps choosing food.

### 3.3 Rejection penalty
When a user explicitly rejects a candidate ("No", "not interested", or a reject action), record it to `rejected_experiences` and `rejected_categories` on the session. Future scoring in that session applies a negative weight to that category. This is **session-scoped only** — do not persist rejection learning to the user's permanent profile without separate explicit consent, since that's a preference-inference privacy concern under DPDP.

---

## 4. Stopping conditions

Do not design this as "keep going until the user has their favorite itinerary" — that's unmeasurable. Use explicit, checkable conditions:

```
STOP the loop when any of:
  - user explicitly says done / taps "Finish itinerary"
  - remaining_time_minutes < minimum viable stop duration (e.g., 30 min)
  - remaining_budget < cheapest available candidate in range
  - no candidate passes Layer 1 hard filters (nothing left that fits)
```

When time/budget is nearly exhausted but not zero, the AI Reasoning Service should phrase this explicitly rather than silently stopping — e.g. surface "You have 45 minutes left — want one final nearby stop, or shall we wrap up?" as a generated prompt, driven by a flag the backend sets, not a decision the LLM makes on its own.

---

## 5. Adapt flow (mid-itinerary changes)

Two triggers, both already anticipated by the PS text:

**A. User-initiated change** ("I don't want to go to Marine Drive anymore")
```
User removes a planned stop
   ↓
TripSession.selected_experiences updated (remove/replace)
   ↓
current_location recalculated from new last-confirmed stop
   ↓
Re-run Layer 1–4 with updated context
   ↓
Return alternatives that preserve remaining itinerary feasibility
```

**B. External condition change** (weather-adapt — see Section 6)

Both paths reuse the exact same re-scoring pipeline. Don't build a separate "replanning engine" — it's the same engine invoked again with fresh context. This keeps the system auditable and avoids two parallel decision paths that could disagree.

---

## 6. Weather-adapt (specific implementation notes)

Add a lightweight external weather signal (e.g., a free-tier weather API keyed on the session's `current_location`), checked at two points:
- When a new recommendation is requested (not continuously polled — avoid unnecessary external calls/cost)
- Optionally on a coarse interval (e.g., every 30 min) for an active session, if time permits

Weather becomes an **additional hard/soft filter tag** on experiences (`indoor` / `outdoor` / `weather_dependent`), not a new scoring dimension bolted on ad hoc. When rain/extreme weather is detected:
```
IF current weather == adverse AND next candidate is tagged outdoor/weather_dependent:
   deprioritize or hard-filter those candidates
   AI Reasoning Service generates: "Rain detected near [location]. Want me to adjust your plan?"
```
This is a good, cheap, high-impact demo moment and directly satisfies the PS line about adapting to "weather conditions change."

---

## 7. Security/privacy notes specific to this feature

- `TripSession.current_location` is precise GPS during an active session (needed for functionality) — apply the same rule as elsewhere: never log raw coordinates outside the session record itself, and coarse-anonymize before writing anything to `Recommendation_Log`.
- Abandoned/inactive sessions (no activity for N hours) should auto-expire and their precise location data purged, retaining only anonymized category/pattern data if used for future analytics — configurable via the same retention policy referenced in `system-design.md`.
- Rejection data is session-scoped by default (Section 3.3) — do not silently promote it to permanent profile data.

---

## 8. Feature prioritization note (carried from design discussion)

For the Ideathon/finale build, treat scope as tiered:
- **Build fully:** Conversational Adaptive Itinerary Builder (Sections 2–5) + Weather-Adapt (Section 6) — these directly demonstrate the PS's "Adapt" requirement and are the strongest differentiator.
- **Design + partial stub, present as roadmap:** Group Travel Planning, Local Expert/Authenticity Score, full Route Efficiency Score UI, gamification (Hidden Gems Challenge). These are good pitch material but should not consume build time that the core loop needs.
