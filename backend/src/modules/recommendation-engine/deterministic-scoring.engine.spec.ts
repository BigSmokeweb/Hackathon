import { DeterministicScoringEngine, RawCandidateInput } from './deterministic-scoring.engine';
import { Category, BudgetBand } from '@experience-platform/shared';
import { DEFAULT_RECOMMENDATION_WEIGHTS } from './recommendation.config';

describe('DeterministicScoringEngine (Pure Unit Tests)', () => {
  const mockCandidates: RawCandidateInput[] = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      title: 'Heritage Pol Food Walk',
      category: Category.FOOD,
      city: 'Ahmedabad',
      distanceKm: 2.5,
      priceMin: 400,
      priceMax: 600,
      budgetBand: BudgetBand.MODERATE,
      ratingAverage: 4.8,
      reviewCount: 42,
      authenticityRating: 0.95,
      accessibilityTags: ['WHEELCHAIR_ACCESSIBLE'],
      mediaUrls: ['https://example.com/food.jpg'],
      availabilityRules: [
        { daysOfWeek: [0, 1, 2, 3, 4, 5, 6], openTime: '08:00', closeTime: '22:00' },
      ],
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      title: 'Midnight Astronomy Adventure',
      category: Category.ADVENTURE,
      city: 'Ahmedabad',
      distanceKm: 18.0,
      priceMin: 2500,
      priceMax: 3500,
      budgetBand: BudgetBand.PREMIUM,
      ratingAverage: 4.5,
      reviewCount: 15,
      authenticityRating: 0.85,
      accessibilityTags: [],
      mediaUrls: ['https://example.com/adventure.jpg'],
      availabilityRules: [
        { daysOfWeek: [5, 6], openTime: '20:00', closeTime: '23:59' },
      ],
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      title: 'Block Printing Workshop',
      category: Category.WORKSHOPS,
      city: 'Ahmedabad',
      distanceKm: 4.0,
      priceMin: 800,
      priceMax: 1200,
      budgetBand: BudgetBand.MODERATE,
      ratingAverage: 4.9,
      reviewCount: 60,
      authenticityRating: 0.98,
      accessibilityTags: ['WHEELCHAIR_ACCESSIBLE', 'INDOOR'],
      mediaUrls: ['https://example.com/workshop.jpg'],
      availabilityRules: [
        { daysOfWeek: [1, 2, 3, 4, 5], openTime: '10:00', closeTime: '18:00' },
      ],
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      title: 'Distant Oasis',
      category: Category.HIDDEN_GEMS,
      city: 'Outskirts',
      distanceKm: 45.0, // beyond 20km radius
      priceMin: 300,
      priceMax: 500,
      budgetBand: BudgetBand.BUDGET,
      ratingAverage: 4.2,
      reviewCount: 5,
      authenticityRating: 0.7,
      accessibilityTags: [],
      mediaUrls: ['https://example.com/oasis.jpg'],
      availabilityRules: [
        { daysOfWeek: [0, 6], openTime: '06:00', closeTime: '18:00' },
      ],
    },
  ];

  describe('Layer 1: Hard Filters', () => {
    it('should exclude candidates exceeding maximum distance radius', () => {
      const filtered = DeterministicScoringEngine.applyHardFilters(mockCandidates, {
        maxDistanceKm: 20,
      });
      expect(filtered.map((c) => c.id)).not.toContain('44444444-4444-4444-4444-444444444444');
      expect(filtered.length).toBe(3);
    });

    it('should filter strictly by requested categories', () => {
      const filtered = DeterministicScoringEngine.applyHardFilters(mockCandidates, {
        maxDistanceKm: 25,
        categories: [Category.FOOD, Category.WORKSHOPS],
      });
      expect(filtered.length).toBe(2);
      expect(filtered.map((c) => c.category)).toEqual([Category.FOOD, Category.WORKSHOPS]);
    });

    it('should filter by required accessibility tags', () => {
      const filtered = DeterministicScoringEngine.applyHardFilters(mockCandidates, {
        maxDistanceKm: 25,
        requiredAccessibilityTags: ['WHEELCHAIR_ACCESSIBLE', 'INDOOR'],
      });
      expect(filtered.length).toBe(1);
      expect(filtered[0].title).toBe('Block Printing Workshop');
    });

    it('should filter by opening hours on given day and time', () => {
      // Monday (day 1) at 12:00 (720 minutes)
      const filteredMondayNoon = DeterministicScoringEngine.applyHardFilters(mockCandidates, {
        maxDistanceKm: 25,
        targetDayOfWeek: 1,
        targetTimeMinutes: 720,
      });
      // Food Walk (all week 8-22) and Workshop (Mon-Fri 10-18) should pass, Midnight Adventure should fail
      expect(filteredMondayNoon.length).toBe(2);
      expect(filteredMondayNoon.map((c) => c.id)).toEqual([
        '11111111-1111-1111-1111-111111111111',
        '33333333-3333-3333-3333-333333333333',
      ]);
    });
  });

  describe('Layer 2: Weighted Scoring & Ranking', () => {
    it('should rank closer and higher rated experiences higher', () => {
      const ranked = DeterministicScoringEngine.rankCandidates(
        mockCandidates,
        {
          maxDistanceKm: 20,
          userCategories: [Category.FOOD],
          userBudgetBand: BudgetBand.MODERATE,
        },
        DEFAULT_RECOMMENDATION_WEIGHTS,
      );

      expect(ranked.length).toBe(3);
      // Food walk is closest (2.5km), matches category FOOD, and matches budget MODERATE
      expect(ranked[0].id).toBe('11111111-1111-1111-1111-111111111111');
      expect(ranked[0].scoreBreakdown.finalScore).toBeGreaterThan(ranked[1].scoreBreakdown.finalScore);
      expect(ranked[0].scoreBreakdown.intentMatch).toBe(1.0);
    });

    it('should calculate deterministic scores with no NaN or undefined fields', () => {
      const score = DeterministicScoringEngine.calculateScore(
        mockCandidates[0],
        {
          userCategories: [Category.FOOD],
          userBudgetBand: BudgetBand.MODERATE,
          maxSearchRadiusKm: 20,
        },
        DEFAULT_RECOMMENDATION_WEIGHTS,
      );

      expect(score.finalScore).toBeGreaterThan(0);
      expect(score.finalScore).toBeLessThanOrEqual(1.0);
      expect(score.locationMatch).toBeGreaterThan(0.8);
      expect(score.budgetFit).toBe(1.0);
    });
  });
});
