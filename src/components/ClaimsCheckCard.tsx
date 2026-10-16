import React from 'react';
import { BadgeCheck, AlertCircle, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { FoodAnalysisResult } from '../types/food';

interface ClaimsCheckCardProps {
  food: FoodAnalysisResult;
}

export const ClaimsCheckCard: React.FC<ClaimsCheckCardProps> = ({ food }) => {
  const { claimsCheck = [] } = food;

  if (claimsCheck.length === 0) return null;

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'Accurate':
        return (
          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Accurate Claim
          </span>
        );
      case 'Misleading':
        return (
          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            Misleading
          </span>
        );
      case 'Exaggerated':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            Exaggerated
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <BadgeCheck className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Marketing Claims vs. Reality Check</h3>
          <p className="text-xs text-slate-400">
            Debunking front-of-box claims with back-of-box factual nutrition data
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {claimsCheck.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Claim:
                </span>
                <span className="text-sm font-extrabold text-white">
                  "{item.claim}"
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-emerald-400">The Reality: </strong>
                {item.explanation}
              </p>
            </div>
            <div className="shrink-0 self-start sm:self-center">
              {getVerdictBadge(item.verdict)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
