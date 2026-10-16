import React, { useState } from 'react';
import { Table, Activity, Info, Check, AlertCircle, CheckCircle2, ChevronDown, Quote } from 'lucide-react';
import { FoodAnalysisResult, FieldCertainty } from '../types/food';

interface NutritionFactsTableProps {
  food: FoodAnalysisResult;
}

export const NutritionFactsTable: React.FC<NutritionFactsTableProps> = ({ food }) => {
  const [viewMode, setViewMode] = useState<'trafficLight' | 'fda'>('trafficLight');
  const [expandedEvidence, setExpandedEvidence] = useState<string | null>(null);

  const { nutrition } = food;

  const toggleEvidence = (field: string) => {
    setExpandedEvidence((prev) => (prev === field ? null : field));
  };

  const getCertaintyDot = (certainty?: FieldCertainty, fieldName?: string) => {
    if (!certainty) return null;
    if (certainty.status === 'confirmed') {
      return (
        <span
          title={`Confirmed Fact: ${certainty.labelEvidence || 'Directly visible on label'}`}
          className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold cursor-pointer"
          onClick={() => fieldName && toggleEvidence(fieldName)}
        >
          <CheckCircle2 className="w-3 h-3" />
          <span className="hidden sm:inline">Confirmed</span>
        </span>
      );
    }
    return (
      <span
        title={`Uncertain / Smeared: ${certainty.notes || certainty.labelEvidence}`}
        className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-semibold cursor-pointer animate-pulse"
        onClick={() => fieldName && toggleEvidence(fieldName)}
      >
        <AlertCircle className="w-3 h-3" />
        <span className="hidden sm:inline">Uncertain</span>
      </span>
    );
  };

  const getLevelBadge = (level: 'low' | 'moderate' | 'high', nutrientName: string) => {
    const isGoodWhenHigh = nutrientName.toLowerCase().includes('fiber') || nutrientName.toLowerCase().includes('protein');
    
    if (isGoodWhenHigh) {
      if (level === 'high') return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">High (Great)</span>;
      if (level === 'moderate') return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">Moderate</span>;
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Low</span>;
    }

    if (level === 'low') return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Low (Healthy)</span>;
    if (level === 'moderate') return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Moderate</span>;
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">High (Caution)</span>;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Nutrition Facts Breakdown</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Per serving: {food.servingSize} {food.servingsPerContainer ? `(${food.servingsPerContainer})` : ''}
          </p>
        </div>

        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/80 self-start sm:self-auto text-xs">
          <button
            onClick={() => setViewMode('trafficLight')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              viewMode === 'trafficLight'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Traffic Light Analysis
          </button>
          <button
            onClick={() => setViewMode('fda')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              viewMode === 'fda'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            FDA Label Style
          </button>
        </div>
      </div>

      {/* VIEW 1: Traffic Light Modern Cards */}
      {viewMode === 'trafficLight' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Calories Card */}
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Energy</span>
                {getCertaintyDot(nutrition.caloriesCertainty, 'Calories')}
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-lg font-extrabold text-white">{nutrition.calories}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">
                  Calories
                </span>
              </div>
              {expandedEvidence === 'Calories' && nutrition.caloriesCertainty?.labelEvidence && (
                <div className="mt-2 pt-2 border-t border-slate-700 text-[10px] font-mono text-slate-300 flex items-start gap-1">
                  <Quote className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                  <span>{nutrition.caloriesCertainty.labelEvidence}</span>
                </div>
              )}
            </div>

            {/* Total Sugars */}
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Sugars</span>
                {getCertaintyDot(nutrition.totalSugars.certainty, 'Total Sugars')}
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <div>
                  <span className="text-lg font-extrabold text-white">{nutrition.totalSugars.value}</span>
                  {nutrition.addedSugars && (
                    <span className="text-[11px] text-slate-400 block">
                      ({nutrition.addedSugars.value} added)
                    </span>
                  )}
                </div>
                {getLevelBadge(nutrition.totalSugars.level, 'sugars')}
              </div>
              {expandedEvidence === 'Total Sugars' && nutrition.totalSugars.certainty?.labelEvidence && (
                <div className="mt-2 pt-2 border-t border-slate-700 text-[10px] font-mono text-slate-300 flex items-start gap-1">
                  <Quote className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                  <span>{nutrition.totalSugars.certainty.labelEvidence}</span>
                </div>
              )}
            </div>

            {/* Sodium */}
            <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${
              nutrition.sodium.certainty?.status === 'uncertain'
                ? 'bg-amber-500/10 border-amber-500/40'
                : 'bg-slate-800/40 border-slate-700/60'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Sodium</span>
                {getCertaintyDot(nutrition.sodium.certainty, 'Sodium')}
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className={`text-lg font-extrabold ${nutrition.sodium.certainty?.status === 'uncertain' ? 'text-amber-300' : 'text-white'}`}>
                  {nutrition.sodium.value}
                </span>
                {getLevelBadge(nutrition.sodium.level, 'sodium')}
              </div>
              {nutrition.sodium.certainty?.labelEvidence && (
                <div className="mt-2 pt-2 border-t border-slate-700/60 text-[10px] font-mono text-slate-300 flex items-start gap-1">
                  <Quote className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                  <span>Evidence: {nutrition.sodium.certainty.labelEvidence}</span>
                </div>
              )}
            </div>

            {/* Total Fat */}
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Fat</span>
                {getCertaintyDot(nutrition.totalFat.certainty, 'Total Fat')}
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-lg font-extrabold text-white">{nutrition.totalFat.value}</span>
                {getLevelBadge(nutrition.totalFat.level, 'fat')}
              </div>
            </div>

            {/* Saturated Fat */}
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Saturated Fat</span>
                {getCertaintyDot(nutrition.saturatedFat.certainty, 'Saturated Fat')}
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-lg font-extrabold text-white">{nutrition.saturatedFat.value}</span>
                {getLevelBadge(nutrition.saturatedFat.level, 'saturated fat')}
              </div>
            </div>

            {/* Dietary Fiber */}
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Dietary Fiber</span>
                {getCertaintyDot(nutrition.dietaryFiber.certainty, 'Dietary Fiber')}
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-lg font-extrabold text-white">{nutrition.dietaryFiber.value}</span>
                {getLevelBadge(nutrition.dietaryFiber.level, 'fiber')}
              </div>
            </div>

            {/* Protein */}
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Protein</span>
                {getCertaintyDot(nutrition.protein.certainty, 'Protein')}
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-lg font-extrabold text-white">{nutrition.protein.value}</span>
                {getLevelBadge(nutrition.protein.level, 'protein')}
              </div>
            </div>

            {/* Total Carbs */}
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Carbohydrates</span>
                {getCertaintyDot(nutrition.totalCarbs.certainty, 'Total Carbs')}
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-lg font-extrabold text-white">{nutrition.totalCarbs.value}</span>
                {getLevelBadge(nutrition.totalCarbs.level, 'carbs')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-800/30 p-2.5 rounded-xl border border-slate-800">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              Tap any nutrient to view verbatim label evidence. Amber badges highlight values affected by folds, blur, or glare.
            </span>
          </div>
        </div>
      ) : (
        /* VIEW 2: FDA Classic Nutrition Facts Style */
        <div className="max-w-md mx-auto bg-white text-slate-950 p-5 rounded-2xl border-4 border-slate-950 font-sans shadow-lg">
          <h2 className="text-3xl font-black tracking-tight leading-none">Nutrition Facts</h2>
          <p className="text-xs font-bold border-b-8 border-slate-950 pb-1 mt-1">
            {food.servingsPerContainer || '1 serving per container'}
          </p>
          <div className="flex justify-between items-baseline font-bold py-1 border-b-4 border-slate-950 text-sm">
            <span>Serving size</span>
            <span>{food.servingSize}</span>
          </div>

          <div className="flex justify-between items-baseline py-1 border-b-8 border-slate-950">
            <div>
              <span className="text-xs font-black block">Amount per serving</span>
              <span className="text-3xl font-black">Calories</span>
            </div>
            <span className="text-4xl font-black">{nutrition.calories.replace(/[^0-9]/g, '') || nutrition.calories}</span>
          </div>

          <div className="text-right text-xs font-bold py-1 border-b border-slate-950">
            % Daily Value*
          </div>

          <div className="divide-y divide-slate-300 text-xs">
            <div className="flex justify-between py-1 font-bold">
              <span>Total Fat <span className="font-normal">{nutrition.totalFat.value}</span></span>
            </div>
            <div className="flex justify-between py-1 pl-4">
              <span>Saturated Fat <span className="font-normal">{nutrition.saturatedFat.value}</span></span>
            </div>
            <div className="flex justify-between py-1 font-bold">
              <span>Sodium <span className="font-normal">{nutrition.sodium.value}</span></span>
              {nutrition.sodium.certainty?.status === 'uncertain' && (
                <span className="text-[10px] text-amber-600 font-bold">Uncertain OCR</span>
              )}
            </div>
            <div className="flex justify-between py-1 font-bold">
              <span>Total Carbohydrate <span className="font-normal">{nutrition.totalCarbs.value}</span></span>
            </div>
            <div className="flex justify-between py-1 pl-4">
              <span>Dietary Fiber <span className="font-normal">{nutrition.dietaryFiber.value}</span></span>
            </div>
            <div className="flex justify-between py-1 pl-4">
              <span>Total Sugars <span className="font-normal">{nutrition.totalSugars.value}</span></span>
            </div>
            {nutrition.addedSugars && (
              <div className="flex justify-between py-1 pl-8">
                <span>Includes {nutrition.addedSugars.value} Added Sugars</span>
              </div>
            )}
            <div className="flex justify-between py-1 font-bold border-b-4 border-slate-950">
              <span>Protein <span className="font-normal">{nutrition.protein.value}</span></span>
            </div>
          </div>

          <p className="text-[9px] text-slate-600 mt-2 border-t-2 border-slate-950 pt-1 leading-tight">
            * The % Daily Value (DV) tells you how much a nutrient in a serving contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.
          </p>
        </div>
      )}
    </div>
  );
};
