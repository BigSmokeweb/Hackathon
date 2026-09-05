'use client';

import { NudgeItem } from '@experience-platform/shared';
import { AlertCircle, TrendingUp } from 'lucide-react';

interface NudgesPanelProps {
  nudges: NudgeItem[];
  compact?: boolean;
}

export default function NudgesPanel({ nudges, compact = false }: NudgesPanelProps) {
  if (nudges.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-[#8FAF82]/15 border border-[#8FAF82]/40 rounded-xl text-xs font-mono text-[#347F8C]">
        <TrendingUp className="w-4 h-4 shrink-0" />
        <span className="font-semibold">Listing fully optimised — all scoring dimensions covered.</span>
      </div>
    );
  }

  const high = nudges.filter((n) => n.impact === 'HIGH');
  const medium = nudges.filter((n) => n.impact === 'MEDIUM');

  return (
    <div className={`space-y-2 ${compact ? '' : 'mt-4'}`}>
      {!compact && (
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#347F8C] font-bold mb-3">
          Visibility nudges ({nudges.length})
        </p>
      )}
      {[...high, ...medium].map((nudge, idx) => (
        <div
          key={idx}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-xs font-mono ${
            nudge.impact === 'HIGH'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-[#F7F4EA] border-[#D8D4C8] text-[#5C6460]'
          }`}
        >
          <AlertCircle
            className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
              nudge.impact === 'HIGH' ? 'text-amber-500' : 'text-[#347F8C]'
            }`}
          />
          <span>{nudge.message}</span>
          {nudge.impact === 'HIGH' && (
            <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wider font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
              High impact
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
