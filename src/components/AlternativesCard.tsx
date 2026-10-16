import React from 'react';
import { Sparkles, ArrowRight, Apple, Heart } from 'lucide-react';
import { FoodAnalysisResult } from '../types/food';

interface AlternativesCardProps {
  food: FoodAnalysisResult;
}

export const AlternativesCard: React.FC<AlternativesCardProps> = ({ food }) => {
  const { healthierAlternatives = [] } = food;

  if (healthierAlternatives.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Healthier Swaps & Alternatives</h3>
          <p className="text-xs text-slate-400">
            Nutritionally superior options with fewer additives and lower processing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {healthierAlternatives.map((alt, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/60 to-emerald-950/20 border border-emerald-500/20 hover:border-emerald-500/40 transition flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Apple className="w-4 h-4 text-emerald-400 shrink-0" />
                  {alt.title}
                </h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {alt.category}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <p className="text-slate-300 leading-relaxed">
                  <strong className="text-emerald-400">Why It's Better: </strong>
                  {alt.whyBetter}
                </p>
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">Examples: </strong>
                    {alt.exampleFoods}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
