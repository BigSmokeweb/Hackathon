'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { TripStateBar } from '@/components/TripStateBar';
import { ItineraryStopCard } from '@/components/ItineraryStopCard';

interface StopConditionResult {
  shouldStop: boolean;
  stopReason: string | null;
  wrapUpFlag: boolean;
  wrapUpTriggerReason: string | null;
}

interface RecommendationItem {
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
  scoreBreakdown?: {
    finalScore: number;
    locationMatch: number;
    intentMatch: number;
    routeContinuityScore?: number;
    diversityScore?: number;
    rejectionPenalty?: number;
  };
}

interface SelectedExperience {
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
}

interface SessionData {
  id: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  remainingTimeMinutes: number;
  remainingBudget: number;
  totalBudget: number;
  selectedExperienceIds: string[];
  selectedCategories: string[];
  selectedExperiences?: SelectedExperience[];
  city?: string;
}

interface RecommendApiResponse {
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

export default function TripSessionLoopPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [stopCondition, setStopCondition] = useState<StopConditionResult | null>(null);
  const [wrapUpPrompt, setWrapUpPrompt] = useState<RecommendApiResponse['wrapUpPrompt']>(null);
  const [weatherAdaptPrompt, setWeatherAdaptPrompt] = useState<RecommendApiResponse['weatherAdaptPrompt']>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  const loadSessionAndRecommendations = useCallback(async () => {
    if (!sessionId) return;
    setIsLoading(true);
    setErrorMessage(null);

    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // 1. Fetch current session detail (with selected experiences)
      const sessionRes = await fetch(`http://localhost:4000/api/v1/trip-sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!sessionRes.ok) {
        if (sessionRes.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to load trip session.');
      }

      const sessionData: SessionData = await sessionRes.json();
      setSession(sessionData);

      if (sessionData.status === 'COMPLETED') {
        setIsCompleted(true);
        setIsLoading(false);
        return;
      }

      // 2. Fetch next recommendations
      const recRes = await fetch(`http://localhost:4000/api/v1/trip-sessions/${sessionId}/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (recRes.ok) {
        const recData: RecommendApiResponse = await recRes.json();
        setRecommendations(recData.recommendations || []);
        setStopCondition(recData.sessionState.stopCondition);
        setWrapUpPrompt(recData.wrapUpPrompt);
        setWeatherAdaptPrompt(recData.weatherAdaptPrompt);

        if (recData.sessionState.stopCondition?.shouldStop) {
          setIsCompleted(true);
        }
      } else {
        const err = await recRes.json().catch(() => ({}));
        setErrorMessage(err.message || 'Could not fetch recommendations.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error loading session.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, router]);

  useEffect(() => {
    loadSessionAndRecommendations();
  }, [loadSessionAndRecommendations]);

  // Handler: Add selection
  async function handleSelect(cand: RecommendationItem) {
    setIsActionLoading(true);
    setErrorMessage(null);
    const token = getAuthToken();

    try {
      const res = await fetch(`http://localhost:4000/api/v1/trip-sessions/${sessionId}/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          experienceId: cand.id,
          nextLatitude: cand.candidateLat ?? 18.922,
          nextLongitude: cand.candidateLng ?? 72.8347,
          experienceCost: cand.priceMin || 0,
          durationMinutes: cand.durationMinutes || 60,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to select stop.');
      }

      // Refresh loop with updated context
      await loadSessionAndRecommendations();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsActionLoading(false);
    }
  }

  // Handler: Reject candidate (session-scoped)
  async function handleReject(cand: RecommendationItem) {
    setIsActionLoading(true);
    setErrorMessage(null);
    const token = getAuthToken();

    try {
      const res = await fetch(`http://localhost:4000/api/v1/trip-sessions/${sessionId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          experienceId: cand.id,
          category: cand.category,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to record rejection.');
      }

      // Re-run recommendations with updated rejection penalty
      await loadSessionAndRecommendations();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsActionLoading(false);
    }
  }

  // Handler: Remove a stop (adapt flow Section 5A)
  async function handleRemoveStop(experienceId: string) {
    setIsActionLoading(true);
    setErrorMessage(null);
    const token = getAuthToken();

    try {
      const res = await fetch(`http://localhost:4000/api/v1/trip-sessions/${sessionId}/stops/${experienceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to remove stop.');
      }

      await loadSessionAndRecommendations();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsActionLoading(false);
    }
  }

  // Handler: Finish / Mark Complete
  async function handleComplete() {
    setIsActionLoading(true);
    const token = getAuthToken();

    try {
      await fetch(`http://localhost:4000/api/v1/trip-sessions/${sessionId}/complete`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsCompleted(true);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsActionLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Scoring next best stops for your journey...</p>
        </div>
      </div>
    );
  }

  const selectedStops = session?.selectedExperiences || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sticky Progress Bar */}
      {session && (
        <TripStateBar
          remainingTimeMinutes={session.remainingTimeMinutes}
          remainingBudget={session.remainingBudget}
          totalBudget={session.totalBudget}
          selectedCount={selectedStops.length}
          currentCity={session.city}
          isAdverseWeather={!!weatherAdaptPrompt}
          weatherDescription={weatherAdaptPrompt?.advisory}
        />
      )}

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-red-500 font-bold ml-4">✕</button>
          </div>
        )}

        {/* Weather Alert Banner */}
        {weatherAdaptPrompt && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5 text-blue-900 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">🌧️</span>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-blue-950">Weather Advisory Detected</h4>
                <p className="text-xs sm:text-sm text-blue-800 mt-1">{weatherAdaptPrompt.advisory}</p>
                {weatherAdaptPrompt.alternativeStrategy && (
                  <p className="text-xs text-blue-700 mt-2 font-medium bg-blue-100/70 rounded-lg px-3 py-2">
                    💡 Suggested: {weatherAdaptPrompt.alternativeStrategy}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Wrap-Up Advisory Banner */}
        {wrapUpPrompt && !isCompleted && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 text-amber-900 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">⏱️</span>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-amber-950">Almost Time to Wrap Up</h4>
                <p className="text-xs sm:text-sm text-amber-800 mt-1">{wrapUpPrompt.message}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={handleComplete}
                    className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
                  >
                    Finish & Wrap Up Now
                  </button>
                  {wrapUpPrompt.quickResponses?.map((qr, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center text-xs bg-white border border-amber-300 text-amber-900 px-3 py-1.5 rounded-xl font-medium"
                    >
                      {qr}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inline Completion Screen */}
        {isCompleted ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              🎉
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">Your Custom Itinerary Is Ready!</h2>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              {stopCondition?.stopReason || 'You have finalized your trip stops. Review your planned journey below.'}
            </p>

            <div className="mt-8 text-left space-y-3">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-slate-500">
                Itinerary Summary ({selectedStops.length} Stops)
              </h3>
              {selectedStops.map((stop, idx) => (
                <ItineraryStopCard
                  key={stop.id}
                  stopNumber={idx + 1}
                  title={stop.title}
                  category={stop.category}
                  city={stop.city}
                  distanceKm={0}
                  priceMin={stop.priceMin}
                  priceMax={stop.priceMax}
                  ratingAverage={stop.ratingAverage}
                  authenticityRating={stop.authenticityRating}
                  mediaUrl={stop.mediaUrls?.[0]}
                />
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/trip"
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition text-sm text-center"
              >
                Plan Another Trip
              </Link>
              <Link
                href="/"
                className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3 rounded-xl transition text-sm text-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          /* Active Step-by-Step Selection Loop */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Recommendations */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Choose Your Next Stop</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Step {selectedStops.length + 1} • Ranked by proximity, heading continuity, and category diversity
                  </p>
                </div>
                <button
                  onClick={handleComplete}
                  disabled={selectedStops.length === 0 || isActionLoading}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 border border-orange-200 hover:border-orange-300 bg-orange-50 px-3 py-1.5 rounded-xl transition disabled:opacity-40"
                >
                  Finish Early
                </button>
              </div>

              {recommendations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                  <span className="text-4xl">🏁</span>
                  <h3 className="font-bold text-slate-900 mt-3 text-lg">No more stops match remaining criteria</h3>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1">
                    Your remaining budget or time does not fit nearby candidate experiences.
                  </p>
                  <button
                    onClick={handleComplete}
                    className="mt-4 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-md"
                  >
                    Finalize Itinerary ({selectedStops.length} stops)
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((cand) => (
                    <div
                      key={cand.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="flex gap-4 items-start">
                        {cand.mediaUrls?.[0] && (
                          <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                            <img
                              src={cand.mediaUrls[0]}
                              alt={cand.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md">
                              {cand.category}
                            </span>
                            <span className="text-xs text-slate-400">• {cand.city}</span>
                          </div>
                          <h3 className="font-bold text-slate-900 text-base leading-snug">
                            {cand.title}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span>🚶 {cand.distanceKm.toFixed(1)} km away</span>
                            <span>⏱️ ~{cand.durationMinutes || 60}m</span>
                            <span className="font-semibold text-slate-700">₹{cand.priceMin}–{cand.priceMax}</span>
                            <span className="text-amber-600 font-medium">★ {cand.ratingAverage.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>

                      {/* AI Phrased Explanation */}
                      {cand.aiExplanation && (
                        <div className="mt-3 bg-orange-50/70 border border-orange-100 rounded-xl px-3 py-2 text-xs text-orange-950">
                          <span className="font-semibold text-orange-800">💡 Why this next: </span>
                          {cand.aiExplanation}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleReject(cand)}
                          disabled={isActionLoading}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-xl transition disabled:opacity-40"
                        >
                          ✕ Not Interested
                        </button>
                        <button
                          onClick={() => handleSelect(cand)}
                          disabled={isActionLoading}
                          className="px-5 py-1.5 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm hover:shadow transition disabled:opacity-40 flex items-center gap-1.5"
                        >
                          {isActionLoading ? 'Updating...' : '+ Select This Stop'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Itinerary Built So Far */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-lg">Your Itinerary</h3>
                <span className="text-xs font-semibold text-slate-500 bg-slate-200/70 px-2.5 py-1 rounded-full">
                  {selectedStops.length} {selectedStops.length === 1 ? 'stop' : 'stops'}
                </span>
              </div>

              {selectedStops.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400">
                  <span className="text-3xl">🗺️</span>
                  <p className="mt-2 text-xs font-medium">No stops added yet.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Select a recommended stop on the left to begin your journey.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedStops.map((stop, idx) => (
                    <ItineraryStopCard
                      key={stop.id}
                      stopNumber={idx + 1}
                      title={stop.title}
                      category={stop.category}
                      city={stop.city}
                      distanceKm={0}
                      priceMin={stop.priceMin}
                      priceMax={stop.priceMax}
                      ratingAverage={stop.ratingAverage}
                      authenticityRating={stop.authenticityRating}
                      mediaUrl={stop.mediaUrls?.[0]}
                      onRemove={() => handleRemoveStop(stop.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
