'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['FOOD', 'CULTURE', 'ADVENTURE', 'HIDDEN_GEMS', 'NIGHTLIFE', 'EVENTS', 'WORKSHOPS', 'SHOPPING'];
const CATEGORY_LABELS: Record<string, string> = {
  FOOD: '🍛 Food & Culinary',
  CULTURE: '🏛️ Heritage & Culture',
  ADVENTURE: '🧗 Adventure',
  HIDDEN_GEMS: '💎 Hidden Gems',
  NIGHTLIFE: '🌙 Nightlife',
  EVENTS: '🎭 Events',
  WORKSHOPS: '🎨 Artisan Workshops',
  SHOPPING: '🛍️ Shopping',
};

export default function TripStartPage() {
  const router = useRouter();
  const [step, setStep] = useState<'location' | 'preferences' | 'budget'>('location');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    latitude: '',
    longitude: '',
    cityLabel: '',
    totalBudget: '',
    totalTimeMinutes: '',
    groupSize: '1',
    interests: [] as string[],
    accessibilityRequirements: [] as string[],
  });

  function toggleInterest(cat: string) {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(cat)
        ? f.interests.filter((c) => c !== cat)
        : [...f.interests, cat],
    }));
  }

  async function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser.');
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: String(pos.coords.latitude),
          longitude: String(pos.coords.longitude),
          cityLabel: 'Current Location',
        }));
        setIsLoading(false);
      },
      () => {
        setError('Could not get location. Enter coordinates manually.');
        setIsLoading(false);
      },
    );
  }

  async function handleSubmit() {
    if (form.interests.length === 0) {
      setError('Pick at least one interest to get started.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:4000/api/v1/trip-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          totalBudget: parseFloat(form.totalBudget),
          totalTimeMinutes: parseInt(form.totalTimeMinutes, 10),
          groupSize: parseInt(form.groupSize, 10),
          interests: form.interests,
          accessibilityRequirements: form.accessibilityRequirements,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.message ?? 'Failed to start session. Please try again.');
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      router.push(`/trip/${data.id}`);
    } catch {
      setError('Network error. Please check your connection.');
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/40 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200 mb-4">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Adaptive Itinerary Builder
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Plan Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">Local Adventure</span>
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Tell us where you are and what you love. We'll build your itinerary one stop at a time.
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(['location', 'preferences', 'budget'] as const).map((s, i) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === s ? 'w-8 bg-orange-500' : i < ['location', 'preferences', 'budget'].indexOf(step) ? 'w-2 bg-orange-300' : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">

          {/* Step 1: Location */}
          {step === 'location' && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg text-slate-900">📍 Where are you starting from?</h2>

              <button
                id="use-current-location-btn"
                onClick={useCurrentLocation}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
              >
                {isLoading ? '📡 Getting location...' : '📡 Use My Current Location'}
              </button>

              <div className="text-center text-xs text-slate-400">— or enter manually —</div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Latitude</label>
                  <input
                    id="trip-latitude-input"
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
                    placeholder="e.g. 18.9220"
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Longitude</label>
                  <input
                    id="trip-longitude-input"
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
                    placeholder="e.g. 72.8347"
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>

              {form.cityLabel && (
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  ✓ {form.cityLabel} captured
                </p>
              )}

              <button
                id="trip-next-location-btn"
                disabled={!form.latitude || !form.longitude}
                onClick={() => setStep('preferences')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-40"
              >
                Next: Your Interests →
              </button>
            </div>
          )}

          {/* Step 2: Preferences */}
          {step === 'preferences' && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg text-slate-900">🎯 What do you love?</h2>
              <p className="text-xs text-slate-500">Pick at least one category to personalize your recommendations.</p>

              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    id={`interest-${cat.toLowerCase()}-btn`}
                    key={cat}
                    onClick={() => toggleInterest(cat)}
                    className={`text-left text-sm font-medium px-3 py-2.5 rounded-xl border transition ${
                      form.interests.includes(cat)
                        ? 'bg-orange-600 border-orange-600 text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-orange-300'
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep('location')}
                  className="flex-1 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition text-sm"
                >
                  ← Back
                </button>
                <button
                  id="trip-next-preferences-btn"
                  disabled={form.interests.length === 0}
                  onClick={() => setStep('budget')}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-40 text-sm"
                >
                  Next: Budget & Time →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Budget & Time */}
          {step === 'budget' && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg text-slate-900">⏱️ Budget & Time</h2>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Total Budget (₹)</label>
                <input
                  id="trip-budget-input"
                  type="number"
                  min="0"
                  value={form.totalBudget}
                  onChange={(e) => setForm((f) => ({ ...f, totalBudget: e.target.value }))}
                  placeholder="e.g. 3000"
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Total Time Available (minutes)</label>
                <div className="flex gap-2">
                  {[120, 180, 240, 360].map((min) => (
                    <button
                      id={`time-preset-${min}-btn`}
                      key={min}
                      onClick={() => setForm((f) => ({ ...f, totalTimeMinutes: String(min) }))}
                      className={`flex-1 text-xs font-semibold py-2 rounded-lg border transition ${
                        form.totalTimeMinutes === String(min)
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300'
                      }`}
                    >
                      {min / 60}h
                    </button>
                  ))}
                </div>
                <input
                  id="trip-time-input"
                  type="number"
                  min="30"
                  max="1440"
                  value={form.totalTimeMinutes}
                  onChange={(e) => setForm((f) => ({ ...f, totalTimeMinutes: e.target.value }))}
                  placeholder="Or enter custom minutes"
                  className="mt-2 w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Group Size</label>
                <select
                  id="trip-group-size-select"
                  value={form.groupSize}
                  onChange={(e) => setForm((f) => ({ ...f, groupSize: e.target.value }))}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={String(n)}>{n} {n === 1 ? 'person' : 'people'}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setStep('preferences')}
                  className="flex-1 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition text-sm"
                >
                  ← Back
                </button>
                <button
                  id="trip-start-btn"
                  disabled={!form.totalBudget || !form.totalTimeMinutes || isLoading}
                  onClick={handleSubmit}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-40 text-sm flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Starting...
                    </>
                  ) : (
                    '🗺️ Start My Itinerary'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
