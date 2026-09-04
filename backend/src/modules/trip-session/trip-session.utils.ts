import { StopConditionResult } from '@experience-platform/shared';

// Thresholds for "nearly exhausted" warnings (wrap-up prompts).
// These intentionally do not live in the HTTP layer so this function
// is independently unit-testable without spinning up a NestJS context.
const WRAP_UP_TIME_THRESHOLD_MINUTES = 45;
const WRAP_UP_BUDGET_THRESHOLD_RATIO = 0.15; // < 15% of total budget remaining

/**
 * Determines whether the itinerary loop should stop or warn the user.
 *
 * Pure function — no side effects, no NestJS dependencies, no DB access.
 * Called by TripSessionService; never called directly from the controller.
 *
 * Stop conditions (addendum Section 4):
 *  1. USER_DONE — explicit user action (call the mark-complete endpoint instead)
 *  2. TIME_EXHAUSTED — remainingTimeMinutes < MIN_VIABLE_STOP_DURATION
 *  3. BUDGET_EXHAUSTED — remainingBudget < cheapestCandidatePrice
 *  4. NO_CANDIDATES — no candidate passed Layer 1 hard filters
 *
 * @param session           Active session snapshot (time/budget/status)
 * @param cheapestPrice     Lowest priceMin among surviving Layer 1 candidates
 * @param candidateCount    Number of candidates that survived Layer 1
 * @param totalBudget       Original session totalBudget (for ratio calculation)
 */
export function evaluateStopConditions(
  session: {
    remainingTimeMinutes: number;
    remainingBudget: number;
    status: string;
  },
  cheapestPrice: number,
  candidateCount: number,
  totalBudget: number,
): StopConditionResult {
  const MIN_VIABLE_STOP_MINUTES = 30;

  if (session.remainingTimeMinutes < MIN_VIABLE_STOP_MINUTES) {
    return {
      shouldStop: true,
      reason: 'TIME_EXHAUSTED',
      isNearlyExhausted: true,
      wrapUpFlag: true,
      wrapUpTriggerReason: 'LOW_TIME',
    };
  }

  if (session.remainingBudget < cheapestPrice) {
    return {
      shouldStop: true,
      reason: 'BUDGET_EXHAUSTED',
      isNearlyExhausted: true,
      wrapUpFlag: true,
      wrapUpTriggerReason: 'LOW_BUDGET',
    };
  }

  if (candidateCount === 0) {
    return {
      shouldStop: true,
      reason: 'NO_CANDIDATES',
      isNearlyExhausted: true,
      wrapUpFlag: true,
      wrapUpTriggerReason: 'NO_CANDIDATES',
    };
  }

  // Not stopping yet, but check if we're nearing exhaustion
  const isLowTime = session.remainingTimeMinutes < WRAP_UP_TIME_THRESHOLD_MINUTES;
  const isLowBudget = totalBudget > 0 &&
    session.remainingBudget / totalBudget < WRAP_UP_BUDGET_THRESHOLD_RATIO;
  const isNearlyExhausted = isLowTime || isLowBudget;

  if (isNearlyExhausted) {
    return {
      shouldStop: false,
      isNearlyExhausted: true,
      wrapUpFlag: true,
      wrapUpTriggerReason: isLowTime ? 'LOW_TIME' : 'LOW_BUDGET',
    };
  }

  return {
    shouldStop: false,
    isNearlyExhausted: false,
    wrapUpFlag: false,
  };
}

/**
 * Estimates travel time between two GPS points assuming average city speed.
 * Used to deduct travel time (in addition to experience duration) when a
 * user selects a stop.
 *
 * @param distanceKm  Distance between current location and selected experience
 * @returns           Estimated travel time in whole minutes
 */
export function estimateTravelTimeMinutes(distanceKm: number): number {
  const AVERAGE_CITY_SPEED_KMH = 20; // conservative urban speed (traffic, walking, auto)
  return Math.ceil((distanceKm / AVERAGE_CITY_SPEED_KMH) * 60);
}
