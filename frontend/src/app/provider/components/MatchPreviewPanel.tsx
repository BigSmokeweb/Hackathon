'use client';

import { useEffect, useState, useCallback } from 'react';
import { MatchPreviewResponseDto, MatchPreviewRequestDto } from '@experience-platform/shared';
import { Sparkles, TrendingUp, Loader2 } from 'lucide-react';
import NudgesPanel from './NudgesPanel';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
const DEBOUNCE_MS = 400;

interface MatchPreviewPanelProps {
  draft: Partial<MatchPreviewRequestDto>;
  token?: string;
}

function ScoreBar({ label, score, weight, tip }: { label: string; score: number; weight: number; tip?: string }) {
  const pct = Math.round(score * 100);
  const contribution = Math.round(score * weight * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="text-[#3E4541]/80 uppercase tracking-wider">{label}</span>
        <span className="text-[#347F8C] font-bold">{pct}% <span className="text-[#3E4541]/50 font-normal">({contribution}pts)</span></span>
      </div>
      <div className="h-1.5 w-full bg-[#D8D4C8] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: pct >= 70 ? '#8FAF82' : pct >= 40 ? '#4FA3D1' : '#e5a050',
          }}
        />
      </div>
      {tip && <p className="text-[9px] font-mono text-[#5C6460] leading-snug">{tip}</p>}
    </div>
  );
}

export default function MatchPreviewPanel({ draft, token }: MatchPreviewPanelProps) {
  const [preview, setPreview] = useState<MatchPreviewResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreview = useCallback(async (payload: Partial<MatchPreviewRequestDto>) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/experiences/match-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accessibilityTags: [],
          mediaUrls: [],
          availabilityRules: [],
          ...payload,
        }),
      });
      if (!res.ok) throw new Error('Preview unavailable');
      const data: MatchPreviewResponseDto = await res.json();
      setPreview(data);
    } catch {
      setError('Could not load preview — check your connection.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Debounced effect — fires 400ms after draft changes
  useEffect(() => {
    const id = setTimeout(() => fetchPreview(draft), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [draft, fetchPreview]);

  const scorePct = preview ? Math.round(preview.estimatedScore * 100) : 0;

  return (
    <div className="bg-white border border-[#D8D4C8] rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#D8D4C8] bg-[#F7F4EA]/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#347F8C]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#347F8C] font-bold">
            Live Match Preview
          </span>
        </div>
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#347F8C]" />}
      </div>

      <div className="p-5 space-y-5">
        {error && (
          <p className="text-xs font-mono text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {!preview && !loading && !error && (
          <p className="text-xs font-mono text-[#3E4541]/50 text-center py-4">
            Fill in listing details to see your match preview.
          </p>
        )}

        {preview && (
          <>
            {/* Composite score ring */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#D8D4C8" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke={scorePct >= 70 ? '#8FAF82' : scorePct >= 40 ? '#4FA3D1' : '#e5a050'}
                    strokeWidth="3"
                    strokeDasharray={`${scorePct} ${100 - scorePct}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-mono font-bold text-[#3E4541]">
                  {scorePct}
                </span>
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-[#3E4541] uppercase tracking-wide">
                  {scorePct >= 70 ? 'Strong reach' : scorePct >= 40 ? 'Good potential' : 'Needs more detail'}
                </p>
                <p className="text-[11px] font-mono text-[#5C6460] leading-snug mt-1 max-w-[180px]">
                  {preview.segmentSummary}
                </p>
              </div>
            </div>

            {/* Publish eligibility badge */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border ${
              preview.publishEligible
                ? 'bg-[#8FAF82]/15 border-[#8FAF82]/40 text-[#347F8C]'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              <TrendingUp className="w-3.5 h-3.5" />
              {preview.publishEligible
                ? 'Ready to publish'
                : 'Add name, location, price & 1 photo to publish'}
            </div>

            {/* Scoring dimensions */}
            <div className="space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#3E4541]/60 font-bold">
                Scoring breakdown
              </p>
              {preview.dimensions.map((d) => (
                <ScoreBar
                  key={d.key}
                  label={d.label}
                  score={d.score}
                  weight={d.weight}
                  tip={d.tip}
                />
              ))}
            </div>

            {/* Nudges */}
            {preview.nudges.length > 0 && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#3E4541]/60 font-bold mb-2">
                  Improve visibility
                </p>
                <NudgesPanel nudges={preview.nudges} compact />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
