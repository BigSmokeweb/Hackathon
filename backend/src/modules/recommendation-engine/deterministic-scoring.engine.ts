import {
  RecommendationWeights,
  DEFAULT_RECOMMENDATION_WEIGHTS,
} from './recommendation.config';
import {
  Category,
  BudgetBand,
  CandidateScoreBreakdown,
  RecommendationCandidateDto,
} from '@experience-platform/shared';

export interface RawCandidateInput {
  id: string;
  title: string;
  category: Category;
  city: string;
  distanceKm: number;
  priceMin: number;
  priceMax: number;
  budgetBand: BudgetBand;
  ratingAverage: number;
  reviewCount: number;
  authenticityRating: number;
  accessibilityTags: string[];
  mediaUrls: string[];
  availabilityRules: Array<{
    daysOfWeek: number[];
    openTime: string;
    closeTime: string;
  }>;
}

export interface FilterCriteria {
  maxDistanceKm: number;
  categories?: Category[];
  budgetBand?: BudgetBand;
  requiredAccessibilityTags?: string[];
  targetDayOfWeek?: number; // 0-6
  targetTimeMinutes?: number; // minutes from midnight (e.g. 14:30 = 870)
}

export class DeterministicScoringEngine {
  /**
   * Layer 1: Pure Hard Filtering (deterministic, zero LLM)
   */
  static applyHardFilters(
    candidates: RawCandidateInput[],
    criteria: FilterCriteria,
  ): RawCandidateInput[] {
    return candidates.filter((candidate) => {
      // 1. Distance ceiling
      if (candidate.distanceKm > criteria.maxDistanceKm) {
        return false;
      }

      // 2. Category match (if categories specified)
      if (
        criteria.categories &&
        criteria.categories.length > 0 &&
        !criteria.categories.includes(candidate.category)
      ) {
        return false;
      }

      // 3. Accessibility tags match (if required)
      if (
        criteria.requiredAccessibilityTags &&
        criteria.requiredAccessibilityTags.length > 0
      ) {
        const hasAllTags = criteria.requiredAccessibilityTags.every((tag) =>
          candidate.accessibilityTags.includes(tag),
        );
        if (!hasAllTags) return false;
      }

      // 4. Availability check (if day/time specified)
      if (
        criteria.targetDayOfWeek !== undefined &&
        criteria.targetTimeMinutes !== undefined &&
        candidate.availabilityRules &&
        candidate.availabilityRules.length > 0
      ) {
        const isOpen = candidate.availabilityRules.some((rule) => {
          if (!rule.daysOfWeek.includes(criteria.targetDayOfWeek!)) return false;
          const [openH, openM] = rule.openTime.split(':').map(Number);
          const [closeH, closeM] = rule.closeTime.split(':').map(Number);
          const openMins = openH * 60 + openM;
          const closeMins = closeH * 60 + closeM;
          return criteria.targetTimeMinutes! >= openMins && criteria.targetTimeMinutes! <= closeMins;
        });
        if (!isOpen) return false;
      }

      return true;
    });
  }

  /**
   * Layer 2: Pure Weighted Scoring (deterministic, configurable weights)
   */
  static calculateScore(
    candidate: RawCandidateInput,
    context: {
      userCategories?: Category[];
      userBudgetBand?: BudgetBand;
      maxSearchRadiusKm: number;
    },
    weights: RecommendationWeights = DEFAULT_RECOMMENDATION_WEIGHTS,
  ): CandidateScoreBreakdown {
    // Proximity score (1.0 = right here, 0.0 = edge of radius)
    const normalizedDistance = Math.min(candidate.distanceKm / (context.maxSearchRadiusKm || 20), 1.0);
    const locationMatch = Math.max(0, 1.0 - normalizedDistance);

    // Intent match (Category match & intent alignment)
    let intentMatch = 0.5; // baseline
    if (context.userCategories && context.userCategories.length > 0) {
      intentMatch = context.userCategories.includes(candidate.category) ? 1.0 : 0.2;
    }

    // Budget fit (exact match = 1.0, 1 step off = 0.6, 2 steps = 0.3)
    let budgetFit = 0.7;
    if (context.userBudgetBand) {
      const bands = [BudgetBand.BUDGET, BudgetBand.MODERATE, BudgetBand.PREMIUM, BudgetBand.LUXURY];
      const targetIdx = bands.indexOf(context.userBudgetBand);
      const candIdx = bands.indexOf(candidate.budgetBand);
      const diff = Math.abs(targetIdx - candIdx);
      budgetFit = diff === 0 ? 1.0 : diff === 1 ? 0.6 : 0.2;
    }

    // Time availability
    const timeAvailability = 1.0;

    // Rating score (normalized to 0-1)
    const ratingScore = Math.min(Math.max((candidate.ratingAverage || 3.5) / 5.0, 0), 1.0);

    // Authenticity score (0-1)
    const authenticityScore = Math.min(Math.max(candidate.authenticityRating || 0.8, 0), 1.0);

    // Distance penalty
    const distancePenalty = normalizedDistance * 0.5;

    // Final weighted score calculation
    const rawScore =
      weights.w1_locationMatch * locationMatch +
      weights.w2_intentMatch * intentMatch +
      weights.w3_budgetFit * budgetFit +
      weights.w4_timeAvailability * timeAvailability +
      weights.w5_rating * ratingScore +
      weights.w6_authenticity * authenticityScore -
      weights.w7_distancePenalty * distancePenalty;

    const finalScore = Math.round(Math.max(0, Math.min(1.0, rawScore)) * 1000) / 1000;

    return {
      locationMatch: Math.round(locationMatch * 100) / 100,
      intentMatch: Math.round(intentMatch * 100) / 100,
      budgetFit: Math.round(budgetFit * 100) / 100,
      timeAvailability,
      ratingScore: Math.round(ratingScore * 100) / 100,
      authenticityScore: Math.round(authenticityScore * 100) / 100,
      distancePenalty: Math.round(distancePenalty * 100) / 100,
      finalScore,
    };
  }

  /**
   * Complete Layer 1 & 2 Execution: Filter, Score, and Sort Top-N Candidates
   */
  static rankCandidates(
    candidates: RawCandidateInput[],
    criteria: FilterCriteria & {
      userCategories?: Category[];
      userBudgetBand?: BudgetBand;
      limit?: number;
    },
    weights: RecommendationWeights = DEFAULT_RECOMMENDATION_WEIGHTS,
  ): RecommendationCandidateDto[] {
    const filtered = this.applyHardFilters(candidates, criteria);

    const scored = filtered.map((candidate) => {
      const scoreBreakdown = this.calculateScore(
        candidate,
        {
          userCategories: criteria.userCategories,
          userBudgetBand: criteria.userBudgetBand,
          maxSearchRadiusKm: criteria.maxDistanceKm,
        },
        weights,
      );

      return {
        id: candidate.id,
        title: candidate.title,
        category: candidate.category,
        city: candidate.city,
        distanceKm: candidate.distanceKm,
        priceMin: candidate.priceMin,
        priceMax: candidate.priceMax,
        budgetBand: candidate.budgetBand,
        ratingAverage: candidate.ratingAverage,
        reviewCount: candidate.reviewCount,
        authenticityRating: candidate.authenticityRating,
        accessibilityTags: candidate.accessibilityTags,
        mediaUrls: candidate.mediaUrls,
        scoreBreakdown,
      };
    });

    // Pure deterministic descending sort by finalScore
    scored.sort((a, b) => b.scoreBreakdown.finalScore - a.scoreBreakdown.finalScore);

    const limit = criteria.limit || 10;
    return scored.slice(0, limit);
  }
}
