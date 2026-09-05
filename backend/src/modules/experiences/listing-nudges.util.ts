import { NudgeItem } from '@experience-platform/shared';

/**
 * computeListingNudges — pure function.
 *
 * Takes a snapshot of listing fields and returns a list of nudges
 * corresponding to real scoring dimensions in recommendation.config.ts.
 * Each nudge maps directly to a scoring dimension that the missing data
 * would improve — no invented suggestions.
 *
 * Never writes to any table. Safe to call in preview (draft) or on
 * dashboard load (published listing).
 */
export function computeListingNudges(listing: {
  accessibilityTags: string[];
  availabilityRules: Array<{ daysOfWeek: number[]; openTime: string; closeTime: string }>;
  priceMin?: number | null;
  priceMax?: number | null;
  mediaUrls: string[];
  description?: string | null;
}): NudgeItem[] {
  const nudges: NudgeItem[] = [];

  // ── w6_authenticity / accessibility visibility ────────────────────────────
  if (!listing.accessibilityTags || listing.accessibilityTags.length === 0) {
    nudges.push({
      dimension: 'accessibilityMatch',
      message:
        'Add accessibility details — your listing is currently invisible to travelers filtering by accessibility needs.',
      impact: 'HIGH',
    });
  }

  // ── w4_timeAvailability ───────────────────────────────────────────────────
  if (!listing.availabilityRules || listing.availabilityRules.length === 0) {
    nudges.push({
      dimension: 'timeAvailability',
      message:
        'Set your actual hours — listings without specific availability score lower on time-fit matching.',
      impact: 'HIGH',
    });
  }

  // ── w3_budgetFit ──────────────────────────────────────────────────────────
  const hasPrice =
    listing.priceMin !== undefined &&
    listing.priceMin !== null &&
    listing.priceMax !== undefined &&
    listing.priceMax !== null;

  if (!hasPrice) {
    nudges.push({
      dimension: 'budgetFit',
      message:
        'Add a price range — listings without pricing cannot be matched to budget-filtered traveler searches.',
      impact: 'HIGH',
    });
  } else if (hasPrice && listing.priceMax! > 0 && listing.priceMax! / Math.max(listing.priceMin!, 1) > 3) {
    nudges.push({
      dimension: 'budgetFit',
      message:
        'Narrow your price range — very wide ranges reduce budget-fit match accuracy and lower your ranking score.',
      impact: 'MEDIUM',
    });
  }

  // ── w5_rating / photo signal ──────────────────────────────────────────────
  if (!listing.mediaUrls || listing.mediaUrls.length < 3) {
    nudges.push({
      dimension: 'qualitySignal',
      message: `Add ${3 - (listing.mediaUrls?.length ?? 0)} more photo${3 - (listing.mediaUrls?.length ?? 0) === 1 ? '' : 's'} — listings with 3+ photos get selected significantly more often.`,
      impact: 'MEDIUM',
    });
  }

  // ── w6_authenticity / description ─────────────────────────────────────────
  if (!listing.description || listing.description.trim().length < 20) {
    nudges.push({
      dimension: 'authenticityRating',
      message:
        'Add a description — travelers see this before choosing you, and it contributes to your authenticity score.',
      impact: 'MEDIUM',
    });
  }

  return nudges;
}
