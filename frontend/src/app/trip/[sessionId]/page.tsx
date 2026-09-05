'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE } from '@/lib/api-client';
import { TripStateBar } from '@/components/TripStateBar';
import { ItineraryStopCard } from '@/components/ItineraryStopCard';
import { TripAreaMap } from '@/components/TripAreaMap';
import { ArrowLeft } from 'lucide-react';

import {
  fetchTripSession,
  fetchRecommendations,
  saveLocalSession,
  SessionData,
  RecommendationItem,
  RecommendApiResponse,
} from '@/lib/trip-session-store';

export default function TripSessionLoopPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [stopCondition, setStopCondition] = useState<RecommendApiResponse['sessionState']['stopCondition'] | null>(null);
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

    try {
      const sessionData = await fetchTripSession(sessionId);
      setSession(sessionData);

      if (sessionData.status === 'COMPLETED') {
        setIsCompleted(true);
        setIsLoading(false);
        return;
      }

      const recData = await fetchRecommendations(sessionId, sessionData);
      setRecommendations(recData.recommendations || []);
      setStopCondition(recData.sessionState.stopCondition);
      setWrapUpPrompt(recData.wrapUpPrompt);
      setWeatherAdaptPrompt(recData.weatherAdaptPrompt);
      // Never auto-finalize on stop addition — user decides when to finalize
    } catch (err: any) {
      setErrorMessage(err.message || 'Error loading route candidates.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadSessionAndRecommendations();
  }, [loadSessionAndRecommendations]);

  // Handler: Add selection
  async function handleSelect(cand: RecommendationItem) {
    setIsActionLoading(true);
    setErrorMessage(null);

    try {
      const current = session || (await fetchTripSession(sessionId));
      const cost = cand.priceMin || 0;
      const duration = cand.durationMinutes || 60;

      const updated: SessionData = {
        ...current,
        remainingBudget: Math.max(0, current.remainingBudget - cost),
        remainingTimeMinutes: Math.max(0, current.remainingTimeMinutes - duration),
        selectedExperienceIds: [...(current.selectedExperienceIds || []), cand.id],
        selectedCategories: Array.from(new Set([...(current.selectedCategories || []), cand.category])),
        selectedExperiences: [
          ...(current.selectedExperiences || []),
          {
            id: cand.id,
            title: cand.title,
            category: cand.category,
            city: cand.city,
            priceMin: cand.priceMin,
            priceMax: cand.priceMax,
            ratingAverage: cand.ratingAverage,
            authenticityRating: cand.authenticityRating,
            mediaUrls: cand.mediaUrls,
            durationMinutes: cand.durationMinutes,
            candidateLat: cand.candidateLat,
            candidateLng: cand.candidateLng,
          },
        ],
      };

      saveLocalSession(updated);
      setSession(updated);

      const token = getAuthToken();
      if (token) {
        fetch(`${API_BASE}/trip-sessions/${sessionId}/select`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            experienceId: cand.id,
            nextLatitude: cand.candidateLat ?? 18.922,
            nextLongitude: cand.candidateLng ?? 72.8347,
            experienceCost: cost,
            durationMinutes: duration,
          }),
        }).catch(() => {});
      }

      await loadSessionAndRecommendations();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsActionLoading(false);
    }
  }

  // Handler: Reject candidate
  async function handleReject(cand: RecommendationItem) {
    setIsActionLoading(true);
    setErrorMessage(null);

    try {
      const current = session || (await fetchTripSession(sessionId));
      const updated: SessionData = {
        ...current,
        rejectedExperienceIds: [...(current.rejectedExperienceIds || []), cand.id],
      };

      saveLocalSession(updated);
      setSession(updated);

      const token = getAuthToken();
      if (token) {
        fetch(`${API_BASE}/trip-sessions/${sessionId}/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            experienceId: cand.id,
            category: cand.category,
          }),
        }).catch(() => {});
      }

      await loadSessionAndRecommendations();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsActionLoading(false);
    }
  }

  // Handler: Remove a stop
  async function handleRemoveStop(experienceId: string) {
    setIsActionLoading(true);
    setErrorMessage(null);

    try {
      const current = session || (await fetchTripSession(sessionId));
      const removedStop = current.selectedExperiences?.find((e) => e.id === experienceId);
      const cost = removedStop?.priceMin || 0;
      const duration = removedStop?.durationMinutes || 60;

      const updated: SessionData = {
        ...current,
        remainingBudget: Math.min(current.totalBudget, current.remainingBudget + cost),
        remainingTimeMinutes: current.remainingTimeMinutes + duration,
        selectedExperienceIds: (current.selectedExperienceIds || []).filter((id) => id !== experienceId),
        selectedExperiences: (current.selectedExperiences || []).filter((e) => e.id !== experienceId),
      };

      saveLocalSession(updated);
      setSession(updated);

      const token = getAuthToken();
      if (token) {
        fetch(`${API_BASE}/trip-sessions/${sessionId}/stops/${experienceId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
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
    try {
      const current = session || (await fetchTripSession(sessionId));
      const updated: SessionData = {
        ...current,
        status: 'COMPLETED',
      };

      saveLocalSession(updated);
      setSession(updated);
      setIsCompleted(true);

      const token = getAuthToken();
      if (token) {
        fetch(`${API_BASE}/trip-sessions/${sessionId}/complete`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsActionLoading(false);
    }
  }

  // Reactivate a completed session so user can add more stops
  async function reactivateSession() {
    setIsActionLoading(true);
    setErrorMessage(null);
    try {
      const current = session || (await fetchTripSession(sessionId));
      const updated: SessionData = {
        ...current,
        status: 'ACTIVE',
      };
      saveLocalSession(updated);
      setSession(updated);
      setIsCompleted(false);

      const token = getAuthToken();
      if (token) {
        fetch(`${API_BASE}/trip-sessions/${sessionId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'ACTIVE' }),
        }).catch(() => {});
      }

      const recData = await fetchRecommendations(sessionId, updated);
      setRecommendations(recData.recommendations || []);
      setStopCondition(recData.sessionState?.stopCondition || null);
      setWrapUpPrompt(recData.wrapUpPrompt || null);
      setWeatherAdaptPrompt(recData.weatherAdaptPrompt || null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resume itinerary');
    } finally {
      setIsActionLoading(false);
    }
  }

  // Back button: if finalized, re-open editing to add stops; otherwise return to hero itinerary section
  function handleBack() {
    if (isCompleted) {
      reactivateSession();
    } else {
      router.push('/#itinerary');
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F4EA] text-[#3E4541] flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#347F8C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#3E4541]/70 font-mono text-xs uppercase tracking-widest">
            Scoring candidates for route continuity...
          </p>
        </div>
      </div>
    );
  }

  const selectedStops = session?.selectedExperiences || [];

  return (
    <div className="min-h-screen bg-[#F7F4EA] text-[#3E4541] flex flex-col pt-16 selection:bg-[#4FA3D1]/30 selection:text-[#3E4541]">
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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#3E4541]/80 hover:text-[#347F8C] border border-[#D8D4C8] hover:border-[#347F8C] px-4 py-2 rounded-xl transition bg-white shadow-sm font-semibold cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {isCompleted && (
            <button
              type="button"
              onClick={reactivateSession}
              disabled={isActionLoading}
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#F7F4EA] bg-[#347F8C] hover:bg-[#2A6772] px-4 py-2 rounded-xl transition shadow-sm font-semibold cursor-pointer active:scale-95"
            >
              + Add More Stops
            </button>
          )}
        </div>

        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-mono flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-red-700 font-bold ml-4">✕</button>
          </div>
        )}

        {/* Weather Alert Banner */}
        {weatherAdaptPrompt && (
          <div className="mb-6 bg-[#4FA3D1]/10 border border-[#4FA3D1]/30 rounded-2xl p-4 sm:p-5 text-[#3E4541] shadow-sm">
            <div className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#347F8C] mt-1 flex-shrink-0 animate-pulse" />
              <div className="flex-1">
                <h4 className="font-manifold font-bold text-xs uppercase tracking-wider text-[#347F8C]">Weather Advisory</h4>
                <p className="text-xs text-[#3E4541]/80 mt-1 font-light">{weatherAdaptPrompt.advisory}</p>
                {weatherAdaptPrompt.alternativeStrategy && (
                  <p className="text-xs text-[#347F8C] mt-2 font-mono bg-white rounded-lg px-3 py-2 border border-[#4FA3D1]/20">
                    Adaptation: {weatherAdaptPrompt.alternativeStrategy}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Wrap-Up Advisory Banner */}
        {wrapUpPrompt && !isCompleted && (
          <div className="mb-6 bg-[#8FAF82]/15 border border-[#8FAF82]/40 rounded-2xl p-4 sm:p-5 text-[#3E4541] shadow-sm">
            <div className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8FAF82] mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-manifold font-bold text-xs uppercase tracking-wider text-[#347F8C]">Budget / Temporal Threshold Approaching</h4>
                <p className="text-xs text-[#3E4541]/80 mt-1 font-light">{wrapUpPrompt.message}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={handleComplete}
                    className="bg-[#347F8C] hover:bg-[#2A6772] text-[#F7F4EA] text-xs font-mono font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition shadow-sm"
                  >
                    Finalize Journey Now
                  </button>
                  {wrapUpPrompt.quickResponses?.map((qr, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center text-[11px] font-mono bg-white border border-[#D8D4C8] text-[#3E4541]/80 px-3 py-1.5 rounded-xl"
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
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#D8D4C8] shadow-lg text-center max-w-3xl mx-auto">
            <div className="w-12 h-12 bg-[#8FAF82]/20 text-[#347F8C] rounded-2xl flex items-center justify-center text-xl mx-auto mb-4 border border-[#8FAF82]/30">
              ✓
            </div>
            <h2 className="font-manifold text-3xl font-extrabold text-[#3E4541] uppercase tracking-wide">
              Your Itinerary Is Finalized
            </h2>
            <p className="text-[#3E4541]/70 mt-2 text-xs sm:text-sm font-light">
              {stopCondition?.stopReason || 'Your personalized route has been finalized. Review your continuous schedule below.'}
            </p>

            <div className="mt-8 text-left space-y-3">
              <h3 className="font-manifold text-xs uppercase tracking-widest text-[#347F8C] font-semibold">
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

            {/* Map of Finalized Route & User Location */}
            <div className="mt-8 text-left">
              <TripAreaMap
                city={session?.city}
                initialUserLat={session?.userLat}
                initialUserLng={session?.userLng}
                stops={selectedStops}
              />
            </div>

            <div className="mt-10 pt-6 border-t border-[#D8D4C8] flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={reactivateSession}
                disabled={isActionLoading}
                className="bg-[#347F8C] hover:bg-[#2A6772] text-[#F7F4EA] font-mono font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition text-center shadow-sm cursor-pointer active:scale-95"
              >
                + Add More Stops
              </button>
              <Link
                href="/trip"
                className="border border-[#D8D4C8] hover:border-[#347F8C] text-[#3E4541] font-mono font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition text-center bg-white shadow-sm"
              >
                Plan Another Route
              </Link>
              <Link
                href="/"
                className="border border-[#D8D4C8] hover:border-[#347F8C] text-[#3E4541] font-mono text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition text-center bg-white"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : (
          /* Active Step-by-Step Selection Loop */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Recommendations */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between border-b border-[#D8D4C8] pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#347F8C] font-semibold block mb-0.5">
                    Step {selectedStops.length + 1}
                  </span>
                  <h2 className="font-manifold text-xl tracking-wide uppercase text-[#3E4541] font-bold">
                    Candidate Stops
                  </h2>
                </div>
                <button
                  onClick={handleComplete}
                  disabled={selectedStops.length === 0 || isActionLoading}
                  className="text-xs font-mono font-bold uppercase tracking-wider text-[#F7F4EA] bg-[#347F8C] hover:bg-[#2A6772] px-4 py-2 rounded-xl transition shadow-sm disabled:opacity-30 cursor-pointer active:scale-95"
                >
                  Finalize
                </button>
              </div>

              {recommendations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#D8D4C8] p-8 text-center shadow-sm">
                  <h3 className="font-manifold text-lg tracking-wide uppercase text-[#3E4541] font-bold">
                    No further stops match criteria
                  </h3>
                  <p className="text-[#3E4541]/70 text-xs mt-1.5 font-light">
                    Your remaining budget or duration window has reached optimal allocation.
                  </p>
                  <button
                    onClick={handleComplete}
                    className="mt-5 bg-[#347F8C] hover:bg-[#2A6772] text-[#F7F4EA] text-xs font-mono font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition shadow-sm"
                  >
                    Finalize Route ({selectedStops.length} stops)
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((cand) => (
                    <div
                      key={cand.id}
                      className="group bg-white border border-[#D8D4C8] hover:border-[#347F8C]/50 p-5 rounded-2xl shadow-sm transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="flex gap-4 items-start">
                        {cand.mediaUrls?.[0] && (
                          <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#F7F4EA] border border-[#D8D4C8] flex-shrink-0">
                            <img
                              src={cand.mediaUrls[0]}
                              alt={cand.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#347F8C] font-semibold">
                              {cand.category}
                            </span>
                            <span className="text-[#D8D4C8] text-xs">&bull;</span>
                            <span className="text-[10px] font-mono text-[#3E4541]/70 uppercase">{cand.city}</span>
                          </div>
                          <h3 className="font-manifold text-base tracking-wide text-[#3E4541] font-bold leading-snug">
                            {cand.title}
                          </h3>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-[#3E4541]/75">
                            <span>{cand.distanceKm.toFixed(1)} km away</span>
                            <span className="text-[#D8D4C8]">&bull;</span>
                            <span>{cand.durationMinutes || 60}m</span>
                            <span className="text-[#D8D4C8]">&bull;</span>
                            <span className="text-[#3E4541] font-semibold">
                              {(!cand.priceMin && !cand.priceMax) || (cand.priceMin === 0 && cand.priceMax === 0)
                                ? 'Free'
                                : cand.priceMin === 0
                                ? `Free – ₹${cand.priceMax}`
                                : `₹${cand.priceMin}–${cand.priceMax}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 pt-3 border-t border-[#D8D4C8] flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleReject(cand)}
                          disabled={isActionLoading}
                          className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-[#3E4541]/50 hover:text-red-500 hover:bg-red-50 border border-[#D8D4C8] rounded-xl transition disabled:opacity-30"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleSelect(cand)}
                          disabled={isActionLoading}
                          className="px-4 py-1.5 text-xs font-mono uppercase font-bold tracking-wider bg-[#347F8C] hover:bg-[#2A6772] text-[#F7F4EA] rounded-xl shadow-sm transition disabled:opacity-30 flex items-center gap-1.5"
                        >
                          {isActionLoading ? 'Updating...' : '+ Add Stop'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Itinerary Built So Far */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#D8D4C8] pb-4">
                <h3 className="font-manifold text-lg tracking-wide uppercase text-[#3E4541] font-bold">
                  Curated Route
                </h3>
                <span className="text-xs font-mono uppercase tracking-wider text-[#347F8C] bg-[#4FA3D1]/15 border border-[#4FA3D1]/30 px-2.5 py-0.5 rounded-full font-semibold">
                  {selectedStops.length} {selectedStops.length === 1 ? 'stop' : 'stops'}
                </span>
              </div>

              {selectedStops.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-[#D8D4C8] p-8 text-center text-[#3E4541]/50 shadow-sm">
                  <p className="font-mono text-xs uppercase tracking-wider">No stops added yet.</p>
                  <p className="text-xs text-[#3E4541]/60 mt-1 font-light">Select a recommended candidate stop on the left to begin your journey.</p>
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

              {/* Area Map below Curated Route */}
              <div className="pt-2">
                <TripAreaMap
                  city={session?.city}
                  initialUserLat={session?.userLat}
                  initialUserLng={session?.userLng}
                  stops={selectedStops}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
