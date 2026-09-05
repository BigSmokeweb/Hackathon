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

export const CATALOG_EXPERIENCES: RecommendationItem[] = [
  // ─── AHMEDABAD (Historic UNESCO Pols & Environs) ───────────────────────────
  {
    id: 'exp-1',
    title: 'Old Ahmedabad Pols & Midnight Spice Trail',
    category: 'FOOD',
    city: 'Ahmedabad',
    distanceKm: 1.2,
    priceMin: 1800,
    priceMax: 2400,
    durationMinutes: 180,
    ratingAverage: 4.96,
    authenticityRating: 0.98,
    candidateLat: 23.0248, // Manek Chowk, Old Ahmedabad
    candidateLng: 72.5891,
    mediaUrls: ['https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1000&q=80'],
  },
  {
    id: 'exp-ahmedabad-2',
    title: 'Sarkhej Roza Stone Jali Architecture & Sufi Harmonies',
    category: 'CULTURE',
    city: 'Ahmedabad',
    distanceKm: 4.2,
    priceMin: 1500,
    priceMax: 2100,
    durationMinutes: 160,
    ratingAverage: 4.93,
    authenticityRating: 0.98,
    candidateLat: 22.9810, // Sarkhej Roza complex
    candidateLng: 72.4990,
    mediaUrls: ['https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1000&q=80'],
  },
  {
    id: 'exp-ahmedabad-3',
    title: 'Mata ni Pachedi Sacred Textile Masterclass',
    category: 'WORKSHOPS',
    city: 'Ahmedabad',
    distanceKm: 2.1,
    priceMin: 1400,
    priceMax: 2000,
    durationMinutes: 140,
    ratingAverage: 4.94,
    authenticityRating: 0.99,
    candidateLat: 23.0300, // Usmanpura Art Studio
    candidateLng: 72.5800,
    mediaUrls: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80'],
  },
  {
    id: 'exp-ahmedabad-4',
    title: 'Adalaj Stepwell Subterranean Geometry Walk',
    category: 'CULTURE',
    city: 'Ahmedabad',
    distanceKm: 5.5,
    priceMin: 800,
    priceMax: 1400,
    durationMinutes: 120,
    ratingAverage: 4.97,
    authenticityRating: 0.99,
    candidateLat: 23.1667, // Adalaj Stepwell
    candidateLng: 72.5801,
    mediaUrls: ['https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1000&q=80'],
  },

  // ─── JAIPUR (Pink City, Bagru & Amer) ──────────────────────────────────────
  {
    id: 'exp-2',
    title: 'Bagru Hand-Block Printing with 5th Gen Masters',
    category: 'WORKSHOPS',
    city: 'Jaipur',
    distanceKm: 2.8,
    priceMin: 3200,
    priceMax: 4500,
    durationMinutes: 240,
    ratingAverage: 4.98,
    authenticityRating: 0.99,
    candidateLat: 26.8122, // Chhipa Mohalla, Bagru
    candidateLng: 75.5458,
    mediaUrls: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80'],
  },
  {
    id: 'exp-jaipur-2',
    title: 'Amer Stepwell & Royal Stone Miniature Painting',
    category: 'WORKSHOPS',
    city: 'Jaipur',
    distanceKm: 3.5,
    priceMin: 2600,
    priceMax: 3500,
    durationMinutes: 190,
    ratingAverage: 4.96,
    authenticityRating: 0.97,
    candidateLat: 26.9855, // Panna Meena Ka Kund, Amer
    candidateLng: 75.8507,
    mediaUrls: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80'],
  },
  {
    id: 'exp-jaipur-3',
    title: 'Old Walled City Morning Spice & Royal Kachori Walk',
    category: 'FOOD',
    city: 'Jaipur',
    distanceKm: 1.1,
    priceMin: 600,
    priceMax: 1100,
    durationMinutes: 90,
    ratingAverage: 4.91,
    authenticityRating: 0.98,
    candidateLat: 26.9239, // Badi Chaupar, Hawa Mahal Road
    candidateLng: 75.8267,
    mediaUrls: ['https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80'],
  },
  {
    id: 'exp-jaipur-4',
    title: 'Nahargarh Fort Sunset Stargazing & Lore',
    category: 'NIGHTLIFE',
    city: 'Jaipur',
    distanceKm: 4.0,
    priceMin: 950,
    priceMax: 1600,
    durationMinutes: 120,
    ratingAverage: 4.88,
    authenticityRating: 0.95,
    candidateLat: 26.9372, // Nahargarh Fort Ridge
    candidateLng: 75.8155,
    mediaUrls: ['https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?auto=format&fit=crop&w=1000&q=80'],
  },

  // ─── MUMBAI (Colaba, Fort & Bandra) ────────────────────────────────────────
  {
    id: 'exp-3',
    title: 'Colaba Art Deco & Coastal Fisherfolk Dawn Walk',
    category: 'CULTURE',
    city: 'Mumbai',
    distanceKm: 0.8,
    priceMin: 1500,
    priceMax: 2000,
    durationMinutes: 150,
    ratingAverage: 4.92,
    authenticityRating: 0.95,
    candidateLat: 18.9137, // Sassoon Docks, Colaba
    candidateLng: 72.8258,
    mediaUrls: ['https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1000&q=80'],
  },
  {
    id: 'exp-mumbai-2',
    title: 'Irani Cafe Heritage & Horniman Circle Book Guilds',
    category: 'FOOD',
    city: 'Mumbai',
    distanceKm: 1.5,
    priceMin: 1200,
    priceMax: 1800,
    durationMinutes: 120,
    ratingAverage: 4.95,
    authenticityRating: 0.97,
    candidateLat: 18.9322, // Horniman Circle & Churchgate
    candidateLng: 72.8335,
    mediaUrls: ['https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1000&q=80'],
  },
  {
    id: 'exp-mumbai-3',
    title: 'Gateway to Colaba Secret Antique Alley & Curio Tour',
    category: 'WORKSHOPS',
    city: 'Mumbai',
    distanceKm: 0.6,
    priceMin: 2200,
    priceMax: 3000,
    durationMinutes: 180,
    ratingAverage: 4.91,
    authenticityRating: 0.96,
    candidateLat: 18.9220, // Gateway of India / Apollo Bunder
    candidateLng: 72.8347,
    mediaUrls: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80'],
  },
  {
    id: 'exp-mumbai-4',
    title: 'Kala Ghoda Contemporary Indie Art Gallery Crawl',
    category: 'WORKSHOPS',
    city: 'Mumbai',
    distanceKm: 1.2,
    priceMin: 700,
    priceMax: 1200,
    durationMinutes: 90,
    ratingAverage: 4.89,
    authenticityRating: 0.93,
    candidateLat: 18.9280, // Kala Ghoda Art Precinct, Fort
    candidateLng: 72.8315,
    mediaUrls: ['https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1000&q=80'],
  },

  // ─── VARANASI (Ghats & Weavers Colony) ─────────────────────────────────────
  {
    id: 'exp-4',
    title: 'Varanasi Dawn Boat & Classical Dhrupad Ragas',
    category: 'CULTURE',
    city: 'Varanasi',
    distanceKm: 1.0,
    priceMin: 2800,
    priceMax: 3600,
    durationMinutes: 210,
    ratingAverage: 4.99,
    authenticityRating: 0.99,
    candidateLat: 25.3080, // Dashashwamedh Ghat
    candidateLng: 83.0080,
    mediaUrls: ['https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1000&q=80'],
  },
  {
    id: 'exp-varanasi-2',
    title: 'Madhanpura Heritage Silk Weavers Loom Tour',
    category: 'WORKSHOPS',
    city: 'Varanasi',
    distanceKm: 1.8,
    priceMin: 1800,
    priceMax: 2600,
    durationMinutes: 150,
    ratingAverage: 4.96,
    authenticityRating: 0.99,
    candidateLat: 25.3176, // Madhanpura Weavers Colony
    candidateLng: 82.9950,
    mediaUrls: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80'],
  },
];

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

  // Create standalone local session
  const sessionId = 'session_' + Math.random().toString(36).substring(2, 10);
  const city = inferCityName(payload.latitude, payload.longitude);

  const localSession: SessionData = {
    id: sessionId,
    status: 'ACTIVE',
    remainingTimeMinutes: payload.totalTimeMinutes,
    remainingBudget: payload.totalBudget,
    totalBudget: payload.totalBudget,
    selectedExperienceIds: [],
    selectedCategories: payload.interests,
    selectedExperiences: [],
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

  // Standalone offline recommendation engine
  const selectedIds = session.selectedExperienceIds || [];
  const rejectedIds = session.rejectedExperienceIds || [];
  const targetCity = (session.city || 'Mumbai').toLowerCase();

  const cityMatches = CATALOG_EXPERIENCES.filter(
    (e) => e.city.toLowerCase() === targetCity && !selectedIds.includes(e.id) && !rejectedIds.includes(e.id)
  );

  const fallbackMatches = CATALOG_EXPERIENCES.filter(
    (e) => !selectedIds.includes(e.id) && !rejectedIds.includes(e.id)
  );

  const candidates = cityMatches.length > 0 ? cityMatches : fallbackMatches;

  // Keep recommending candidates as long as catalog has unselected items
  const shouldStop = candidates.length === 0;

  return {
    sessionId,
    recommendations: candidates.slice(0, 6),
    sessionState: {
      remainingTimeMinutes: session.remainingTimeMinutes,
      remainingBudget: session.remainingBudget,
      selectedCount: selectedIds.length,
      stopCondition: {
        shouldStop,
        stopReason: shouldStop ? 'All available curated stops in this enclave added.' : null,
        wrapUpFlag: false,
        wrapUpTriggerReason: null,
      },
    },
    wrapUpPrompt:
      session.remainingBudget < 1500 || session.remainingTimeMinutes < 60
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
