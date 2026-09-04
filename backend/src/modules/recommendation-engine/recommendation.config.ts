export interface RecommendationWeights {
  w1_locationMatch: number;     // weight for proximity
  w2_intentMatch: number;       // weight for category / user intent match
  w3_budgetFit: number;         // weight for budget band compatibility
  w4_timeAvailability: number;  // weight for open/available slot
  w5_rating: number;            // weight for average user ratings
  w6_authenticity: number;      // weight for local authenticity rating
  w7_distancePenalty: number;   // penalty weight per kilometer distance
}

export const DEFAULT_RECOMMENDATION_WEIGHTS: RecommendationWeights = {
  w1_locationMatch: 0.20,
  w2_intentMatch: 0.25,
  w3_budgetFit: 0.15,
  w4_timeAvailability: 0.10,
  w5_rating: 0.15,
  w6_authenticity: 0.15,
  w7_distancePenalty: 0.05,
};
