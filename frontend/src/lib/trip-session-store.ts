import { API_BASE } from './api-client';

export interface StopConditionResult {
  shouldStop: boolean;
  stopReason: string | null;
  wrapUpFlag: boolean;
  wrapUpTriggerReason: string | null;
}

export interface RecommendationItem {
  id: string;
  title: string;
  category: string;
  city: string;
  distanceKm: number;
  priceMin: number;
  priceMax: number;
  durationMinutes?: number;
  ratingAverage: number;
  authenticityRating: number;
  mediaUrls?: string[];
  candidateLat?: number;
  candidateLng?: number;
  aiExplanation?: string;
}

export interface SelectedExperience {
  id: string;
  title: string;
  category: string;
  city: string;
  priceMin: number;
  priceMax: number;
  ratingAverage: number;
  authenticityRating: number;
  mediaUrls?: string[];
  durationMinutes?: number;
  candidateLat?: number;
  candidateLng?: number;
}

export interface SessionData {
  id: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  remainingTimeMinutes: number;
  remainingBudget: number;
  totalBudget: number;
  selectedExperienceIds: string[];
  selectedCategories: string[];
  selectedExperiences?: SelectedExperience[];
  city?: string;
  rejectedExperienceIds?: string[];
  userLat?: number;
  userLng?: number;
}

export interface RecommendApiResponse {
  sessionId: string;
  recommendations: RecommendationItem[];
  sessionState: {
    remainingTimeMinutes: number;
    remainingBudget: number;
    selectedCount: number;
    stopCondition: StopConditionResult;
  };
  wrapUpPrompt: {
    message: string;
    triggerReason: string;
    quickResponses: string[];
  } | null;
  weatherAdaptPrompt: {
    advisory: string;
    alternativeStrategy: string;
    affectedExperienceIds: string[];
  } | null;
}

import { ALL_EXPERIENCES } from './experiences-data';

export const CATALOG_EXPERIENCES: RecommendationItem[] = ALL_EXPERIENCES.map((e, idx) => ({
  id: e.id,
  title: e.title,
  category: e.category,
  city: e.city,
  distanceKm: 0.5 + (idx % 10) * 0.8,
  priceMin: e.priceMin,
  priceMax: e.priceMax,
  durationMinutes: e.durationMinutes,
  ratingAverage: e.ratingAverage,
  authenticityRating: e.authenticityRating,
  candidateLat: e.candidateLat,
  candidateLng: e.candidateLng,
  mediaUrls: e.mediaUrls,
}));

// 4-Factor Recommendation Scorer: Nearest + Intent + Budget + Rating
export function scoreCandidate(
  cand: RecommendationItem,
  userLat: number,
  userLng: number,
  interests: string[],
  remainingBudget: number
): { score: number; distanceKm: number } {
  // 1. Nearest to user (Haversine proximity)
  const cLat = cand.candidateLat ?? userLat;
  const cLng = cand.candidateLng ?? userLng;
  const dLat = ((cLat - userLat) * Math.PI) / 180;
  const dLng = ((cLng - userLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((userLat * Math.PI) / 180) *
      Math.cos((cLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const distKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const nearestScore = Math.max(0, 1 - distKm / 35); // 0-35km radius scale

  // 2. Intent match (Category alignment with user preferences)
  const intentScore = interests.length === 0 || interests.includes(cand.category) ? 1.0 : 0.25;

  // 3. Budget fit (Leaves room in remaining budget)
  let budgetScore = 0.5;
  if (remainingBudget > 0) {
    if (cand.priceMin <= remainingBudget) {
      budgetScore = 1.0 - cand.priceMin / Math.max(remainingBudget, 1);
    } else {
      budgetScore = 0;
    }
  }

  // 4. Rating (Historical user rating normalized 0-1)
  const ratingScore = Math.min(1, Math.max(0, (cand.ratingAverage || 4.5) / 5.0));

  // Multi-factor weighted score: Nearest (35%), Intent (30%), Budget (20%), Rating (15%)
  const totalScore =
    0.35 * nearestScore +
    0.30 * intentScore +
    0.20 * budgetScore +
    0.15 * ratingScore;

  return {
    score: Number(totalScore.toFixed(4)),
    distanceKm: Number(distKm.toFixed(1)),
  };
}

// Helper: infer city from coordinates or presets
export function inferCityName(lat: number, lng: number): string {
  if (Math.abs(lat - 18.922) < 0.5 && Math.abs(lng - 72.834) < 0.5) return 'Mumbai';
  if (Math.abs(lat - 23.022) < 0.5 && Math.abs(lng - 72.571) < 0.5) return 'Ahmedabad';
  if (Math.abs(lat - 26.912) < 0.5 && Math.abs(lng - 75.787) < 0.5) return 'Jaipur';
  if (Math.abs(lat - 25.317) < 0.5 && Math.abs(lng - 82.973) < 0.5) return 'Varanasi';
  return 'Mumbai';
}

export async function createTripSession(payload: {
  latitude: number;
  longitude: number;
  totalBudget: number;
  totalTimeMinutes: number;
  groupSize: number;
  interests: string[];
}): Promise<{ id: string }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  if (token) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1200);

      const res = await fetch(`${API_BASE}/trip-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...payload,
          accessibilityRequirements: [],
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback to offline session
    }
  }

  // Create standalone local session with auto-curated initial recommendations matching 4 factors
  const sessionId = 'session_' + Math.random().toString(36).substring(2, 10);
  const city = inferCityName(payload.latitude, payload.longitude);

  // Pool of city experiences
  const cityPool = CATALOG_EXPERIENCES.filter((e) => e.city.toLowerCase() === city.toLowerCase());
  const fallbackPool = CATALOG_EXPERIENCES;
  const pool = cityPool.length >= 4 ? cityPool : fallbackPool;

  // Rank candidate experiences by: Nearest + Intent + Budget + Rating
  const scoredInitial = pool
    .map((cand) => {
      const scoring = scoreCandidate(
        cand,
        payload.latitude,
        payload.longitude,
        payload.interests,
        payload.totalBudget
      );
      return {
        cand,
        ...scoring,
      };
    })
    .sort((a, b) => b.score - a.score);

  // Auto-curate top 3-4 destinations fitting within time & budget
  const initialSelected: SelectedExperience[] = [];
  let curBudget = payload.totalBudget;
  let curTime = payload.totalTimeMinutes;

  for (const item of scoredInitial) {
    if (initialSelected.length >= 4) break;
    const exp = item.cand;
    const duration = exp.durationMinutes || 90;
    if (exp.priceMin <= curBudget && duration <= curTime) {
      initialSelected.push({
        id: exp.id,
        title: exp.title,
        category: exp.category,
        city: exp.city,
        priceMin: exp.priceMin,
        priceMax: exp.priceMax,
        ratingAverage: exp.ratingAverage,
        authenticityRating: exp.authenticityRating,
        mediaUrls: exp.mediaUrls,
        durationMinutes: duration,
        candidateLat: exp.candidateLat,
        candidateLng: exp.candidateLng,
      });
      curBudget -= exp.priceMin;
      curTime -= duration;
    }
  }

  const localSession: SessionData = {
    id: sessionId,
    status: 'ACTIVE',
    remainingTimeMinutes: curTime,
    remainingBudget: curBudget,
    totalBudget: payload.totalBudget,
    selectedExperienceIds: initialSelected.map((s) => s.id),
    selectedCategories: Array.from(new Set(initialSelected.map((s) => s.category))),
    selectedExperiences: initialSelected,
    city,
    rejectedExperienceIds: [],
    userLat: payload.latitude,
    userLng: payload.longitude,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(`trip_session_${sessionId}`, JSON.stringify(localSession));
    localStorage.setItem('activeTripSessionId', sessionId);
  }

  return { id: sessionId };
}

export async function fetchTripSession(sessionId: string): Promise<SessionData> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  if (token) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1200);

      const res = await fetch(`${API_BASE}/trip-sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback to local
    }
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(`trip_session_${sessionId}`);
    if (raw) {
      const parsed: SessionData = JSON.parse(raw);
      // Synchronize exact GPS coordinates from catalog for all selected stops
      if (parsed.selectedExperiences && parsed.selectedExperiences.length > 0) {
        parsed.selectedExperiences = parsed.selectedExperiences.map((stop) => {
          const match = CATALOG_EXPERIENCES.find((c) => c.id === stop.id);
          return {
            ...stop,
            candidateLat: match?.candidateLat || stop.candidateLat,
            candidateLng: match?.candidateLng || stop.candidateLng,
          };
        });
      }
      return parsed;
    }
  }

  // default fallback if never saved
  return {
    id: sessionId,
    status: 'ACTIVE',
    remainingTimeMinutes: 180,
    remainingBudget: 5000,
    totalBudget: 5000,
    selectedExperienceIds: [],
    selectedCategories: ['FOOD', 'CULTURE'],
    selectedExperiences: [],
    city: 'Mumbai',
    rejectedExperienceIds: [],
  };
}

export async function fetchRecommendations(
  sessionId: string,
  session: SessionData
): Promise<RecommendApiResponse> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  if (token) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1200);

      const res = await fetch(`${API_BASE}/trip-sessions/${sessionId}/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
  }

  // 4-Factor Offline Scoring Engine: Nearest + Intent + Budget + Rating
  const selectedIds = session.selectedExperienceIds || [];
  const rejectedIds = session.rejectedExperienceIds || [];
  const targetCity = (session.city || 'Mumbai').toLowerCase();

  // Current coordinate anchor: last selected stop's location, or user starting GPS
  const lastStop = session.selectedExperiences && session.selectedExperiences.length > 0
    ? session.selectedExperiences[session.selectedExperiences.length - 1]
    : null;

  const anchorLat = lastStop?.candidateLat || session.userLat || 18.9220;
  const anchorLng = lastStop?.candidateLng || session.userLng || 72.8347;

  // Filter unselected, non-rejected places
  const cityMatches = CATALOG_EXPERIENCES.filter(
    (e) => e.city.toLowerCase() === targetCity && !selectedIds.includes(e.id) && !rejectedIds.includes(e.id)
  );

  const fallbackMatches = CATALOG_EXPERIENCES.filter(
    (e) => !selectedIds.includes(e.id) && !rejectedIds.includes(e.id)
  );

  const candidates = cityMatches.length > 0 ? cityMatches : fallbackMatches;

  // Apply 4-factor scoring: Nearest + Intent + Budget + Rating
  const scoredCandidates: RecommendationItem[] = candidates
    .map((cand) => {
      const scoring = scoreCandidate(
        cand,
        anchorLat,
        anchorLng,
        session.selectedCategories || [],
        session.remainingBudget
      );

      return {
        ...cand,
        distanceKm: scoring.distanceKm,
        // Tag explanation for user
        reason: `${scoring.distanceKm} km away • ${cand.category} • ★${cand.ratingAverage.toFixed(1)}`,
        _score: scoring.score,
      } as RecommendationItem & { _score: number };
    })
    .sort((a, b) => (b as any)._score - (a as any)._score);

  // Dynamic Stop Conditions (identical to spec)
  const MIN_VIABLE_TIME = 30; // minutes
  const cheapestPrice = candidates.length > 0 ? Math.min(...candidates.map((c) => c.priceMin)) : Infinity;

  const isTimeExhausted = session.remainingTimeMinutes < MIN_VIABLE_TIME;
  const isBudgetExhausted = session.remainingBudget < cheapestPrice && session.remainingBudget > 0;
  const isNoCandidates = candidates.length === 0;

  const shouldStop = isTimeExhausted || isBudgetExhausted || isNoCandidates;
  const stopReason = isTimeExhausted
    ? 'Allocated time window for this route has concluded.'
    : isBudgetExhausted
    ? 'Remaining budget is insufficient for further admissions.'
    : isNoCandidates
    ? 'All available curated stops in this enclave have been linked.'
    : null;

  const isNearlyExhausted =
    session.remainingTimeMinutes < 45 ||
    (session.totalBudget > 0 && session.remainingBudget / session.totalBudget < 0.15);

  return {
    sessionId,
    recommendations: scoredCandidates.slice(0, 6),
    sessionState: {
      remainingTimeMinutes: session.remainingTimeMinutes,
      remainingBudget: session.remainingBudget,
      selectedCount: selectedIds.length,
      stopCondition: {
        shouldStop,
        stopReason,
        wrapUpFlag: isNearlyExhausted,
        wrapUpTriggerReason: isNearlyExhausted ? (session.remainingTimeMinutes < 45 ? 'LOW_TIME' : 'LOW_BUDGET') : null,
      },
    },
    wrapUpPrompt: isNearlyExhausted
      ? {
          message: 'Your allocated budget and temporal pacing are nearing target threshold.',
          triggerReason: 'threshold_near',
          quickResponses: ['Finalize Continuous Schedule', 'Add One Quick Heritage Stop'],
        }
      : null,
    weatherAdaptPrompt: null,
  };
}

export function saveLocalSession(session: SessionData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`trip_session_${session.id}`, JSON.stringify(session));
  }
}
