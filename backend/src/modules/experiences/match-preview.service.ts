import { Injectable } from '@nestjs/common';
import {
  MatchPreviewRequestDto,
  MatchPreviewResponseDto,
  MatchPreviewDimension,
  BudgetBand,
  Category,
} from '@experience-platform/shared';
import {
  DeterministicScoringEngine,
  RawCandidateInput,
} from '../recommendation-engine/deterministic-scoring.engine';
import {
  DEFAULT_RECOMMENDATION_WEIGHTS,
} from '../recommendation-engine/recommendation.config';
import { computeListingNudges } from './listing-nudges.util';

/**
 * MatchPreviewService — read-only, zero writes.
 *
 * Reuses DeterministicScoringEngine.calculateScore() with the same weights
 * as the live recommendation engine, so the preview is truthful.
 * No LLM call. No RecommendationLog write. No traveler PII involved.
 *
 * Called: POST /experiences/match-preview (PROVIDER auth required).
 */
@Injectable()
export class MatchPreviewService {
  /**
   * Compute a deterministic match-preview for a draft listing payload.
   * Pure: no side effects, no DB writes.
   */
  buildPreview(dto: MatchPreviewRequestDto): MatchPreviewResponseDto {
    const weights = DEFAULT_RECOMMENDATION_WEIGHTS;

    // Build a synthetic candidate from the draft fields.
    // Neutral defaults for unprovided fields so scoring works at any form step.
    const syntheticCandidate: RawCandidateInput = {
      id: '__preview__',
      title: 'Preview',
      category: dto.category ?? Category.CULTURE,
      city: 'Preview',
      distanceKm: 0,                           // perfect proximity — host is listing in their own area
      priceMin: dto.priceMin ?? 0,
      priceMax: dto.priceMax ?? 0,
      budgetBand: dto.budgetBand ?? BudgetBand.MODERATE,
      ratingAverage: 4.0,                      // neutral baseline — new listing has no reviews yet
      reviewCount: 0,
      authenticityRating: dto.description && dto.description.trim().length >= 20 ? 0.85 : 0.5,
      accessibilityTags: dto.accessibilityTags ?? [],
      mediaUrls: dto.mediaUrls ?? [],
      availabilityRules: (dto.availabilityRules ?? []).map((r) => ({
        daysOfWeek: r.daysOfWeek,
        openTime: r.openTime,
        closeTime: r.closeTime,
      })),
    };

    // Score in neutral context — no user categories/budget specified so each
    // dimension reflects the listing's own completeness, not traveler preference.
    const breakdown = DeterministicScoringEngine.calculateScore(
      syntheticCandidate,
      {
        maxSearchRadiusKm: 25,
        // Deliberately no userCategories / userBudgetBand — this is a
        // listing-quality preview, not a traveler-match simulation.
      },
      weights,
    );

    // ── Map breakdown to labelled dimension objects ────────────────────────
    const dimensions: MatchPreviewDimension[] = [
      {
        key: 'locationMatch',
        label: 'Location completeness',
        score: breakdown.locationMatch,
        weight: weights.w1_locationMatch,
        contribution: Math.round(breakdown.locationMatch * weights.w1_locationMatch * 100) / 100,
        tip: dto.latitude === undefined ? 'Pin your location on the map to maximise proximity matching.' : undefined,
      },
      {
        key: 'intentMatch',
        label: 'Category relevance',
        score: breakdown.intentMatch,
        weight: weights.w2_intentMatch,
        contribution: Math.round(breakdown.intentMatch * weights.w2_intentMatch * 100) / 100,
        tip: dto.category === undefined ? 'Select a category to unlock intent-match scoring.' : undefined,
      },
      {
        key: 'budgetFit',
        label: 'Budget fit',
        score: breakdown.budgetFit,
        weight: weights.w3_budgetFit,
        contribution: Math.round(breakdown.budgetFit * weights.w3_budgetFit * 100) / 100,
        tip: dto.budgetBand === undefined ? 'Set a price range so budget-filtering travelers can find you.' : undefined,
      },
      {
        key: 'timeAvailability',
        label: 'Time availability',
        score: breakdown.timeAvailability,
        weight: weights.w4_timeAvailability,
        contribution: Math.round(breakdown.timeAvailability * weights.w4_timeAvailability * 100) / 100,
        tip: (dto.availabilityRules ?? []).length === 0 ? 'Add opening hours to score on time-fit matching.' : undefined,
      },
      {
        key: 'ratingScore',
        label: 'Rating signal',
        score: breakdown.ratingScore,
        weight: weights.w5_rating,
        contribution: Math.round(breakdown.ratingScore * weights.w5_rating * 100) / 100,
        tip: 'Rating improves as guests leave verified reviews.',
      },
      {
        key: 'authenticityScore',
        label: 'Authenticity',
        score: breakdown.authenticityScore,
        weight: weights.w6_authenticity,
        contribution: Math.round(breakdown.authenticityScore * weights.w6_authenticity * 100) / 100,
        tip: (dto.description ?? '').trim().length < 20 ? 'Add a description to boost your authenticity score.' : undefined,
      },
    ];

    const estimatedScore = breakdown.finalScore;

    // ── Segment summary (deterministic template, no LLM) ──────────────────
    const segmentSummary = this.buildSegmentSummary(dto, estimatedScore);

    // ── Publish eligibility ────────────────────────────────────────────────
    const publishEligible = this.isPublishEligible(dto);

    // ── Nudges via shared pure function ────────────────────────────────────
    const nudges = computeListingNudges({
      accessibilityTags: dto.accessibilityTags ?? [],
      availabilityRules: dto.availabilityRules ?? [],
      priceMin: dto.priceMin,
      priceMax: dto.priceMax,
      mediaUrls: dto.mediaUrls ?? [],
      description: dto.description,
    });

    return { segmentSummary, dimensions, estimatedScore, nudges, publishEligible };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private isPublishEligible(dto: MatchPreviewRequestDto): boolean {
    return (
      dto.category !== undefined &&
      dto.budgetBand !== undefined &&
      dto.priceMin !== undefined &&
      dto.priceMax !== undefined &&
      dto.latitude !== undefined &&
      dto.longitude !== undefined &&
      (dto.mediaUrls ?? []).length >= 1
    );
  }

  /**
   * Builds a short human-readable summary from the draft's own data.
   * Template-driven — zero LLM dependency.
   */
  private buildSegmentSummary(dto: MatchPreviewRequestDto, score: number): string {
    const parts: string[] = [];

    if (dto.category) {
      const categoryLabel: Record<string, string> = {
        FOOD: 'food & culinary',
        CULTURE: 'culture & heritage',
        ADVENTURE: 'adventure',
        HIDDEN_GEMS: 'hidden gems',
        NIGHTLIFE: 'nightlife',
        EVENTS: 'local events',
        WORKSHOPS: 'workshops & crafts',
        SHOPPING: 'shopping & markets',
      };
      parts.push(categoryLabel[dto.category] ?? dto.category.toLowerCase());
    }

    const budgetLabel: Record<string, string> = {
      BUDGET: 'budget (₹0–500)',
      MODERATE: 'moderate (₹500–1,500)',
      PREMIUM: 'premium (₹1,500–4,000)',
      LUXURY: 'luxury (₹4,000+)',
    };

    const hasAccessibility = (dto.accessibilityTags ?? []).length > 0;

    let summary = 'Your listing';

    if (parts.length > 0) {
      summary += ` in the ${parts.join(', ')} category`;
    }

    if (dto.budgetBand) {
      summary += ` (${budgetLabel[dto.budgetBand] ?? dto.budgetBand})`;
    }

    if (hasAccessibility) {
      summary += ', with accessibility features,';
    }

    if (score >= 0.7) {
      summary += ' is well-positioned to reach travelers interested in authentic local experiences.';
    } else if (score >= 0.45) {
      summary += ' has good potential — completing the missing details below will significantly improve your reach.';
    } else {
      summary += ' needs a few more details before it can be effectively matched to travelers.';
    }

    return summary;
  }
}
