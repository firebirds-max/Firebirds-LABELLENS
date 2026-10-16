import React from 'react';
import { Beaker, AlertTriangle, CheckCircle, ShieldCheck, HelpCircle } from 'lucide-react';
import { FoodAnalysisResult, AdditiveItem } from '../types/food';

interface AdditivesMatrixProps {
  food: FoodAnalysisResult;
}

export const AdditivesMatrix: React.FC<AdditivesMatrixProps> = ({ food }) => {
  const { additives = [] } = food;

  const getSafetyBadge = (rating: AdditiveItem['safetyRating']) => {
    switch (rating) {
      case 'High Concern / Avoid':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Avoid / High Concern
          </span>
        );
      case 'Use Caution':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Use Caution
          </span>
        );
      case 'Generally Safe':
      default:
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            Generally Safe
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
            <Beaker className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Food Additives & E-Numbers</h3>
            <p className="text-xs text-slate-400">
              Evaluated against EFSA (European Food Safety) and FDA toxicology benchmarks
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 self-start sm:self-auto">
          {additives.length} Additive{additives.length === 1 ? '' : 's'} Identified
        </span>
      </div>

      {additives.length === 0 ? (
        <div className="p-8 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white mb-1">Clean Formulation!</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Zero chemical preservatives, synthetic food dyes, or artificial sweeteners detected. This product relies on authentic whole ingredients.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {additives.map((additive, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="text-sm font-bold text-white">
                    {additive.codeOrName}
                  </h4>
                  {getSafetyBadge(additive.safetyRating)}
                </div>
                <span className="inline-block text-[11px] font-semibold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded mb-2">
                  Role: {additive.function}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {additive.healthNotes}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
