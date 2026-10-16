import React, { useState } from 'react';
import { X, Scale, ArrowRight, Check, AlertTriangle, Trophy } from 'lucide-react';
import { FoodAnalysisResult } from '../types/food';
import { SAMPLE_FOODS } from '../data/sampleFoods';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFood: FoodAnalysisResult | null;
  historyFoods: FoodAnalysisResult[];
  onSelectFoodToCompare?: (food: FoodAnalysisResult) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  currentFood,
  historyFoods,
}) => {
  // Available pool of items to pick for comparison: current item + history + sample foods
  const availablePool = [
    ...(currentFood ? [currentFood] : []),
    ...historyFoods.filter((h) => h.productName !== currentFood?.productName),
    ...SAMPLE_FOODS.map((s) => s.data).filter(
      (s) => s.productName !== currentFood?.productName
    ),
  ];

  // Remove duplicates by productName
  const uniquePool = Array.from(
    new Map(availablePool.map((item) => [item.productName, item])).values()
  );

  const [foodA, setFoodA] = useState<FoodAnalysisResult | null>(
    currentFood || uniquePool[0] || null
  );
  const [foodB, setFoodB] = useState<FoodAnalysisResult | null>(
    uniquePool[1] || uniquePool[0] || null
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Side-by-Side Food Comparison</h2>
              <p className="text-xs text-slate-400">
                Compare nutritional density, processing levels, and hidden ingredients
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Selectors */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Selector A */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              Product A (Current or Select):
            </label>
            <select
              value={foodA?.productName || ''}
              onChange={(e) => {
                const found = uniquePool.find((p) => p.productName === e.target.value);
                if (found) setFoodA(found);
              }}
              className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              {uniquePool.map((item, idx) => (
                <option key={idx} value={item.productName}>
                  {item.productName} ({item.brand})
                </option>
              ))}
            </select>
          </div>

          {/* Selector B */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              Product B (To Compare Against):
            </label>
            <select
              value={foodB?.productName || ''}
              onChange={(e) => {
                const found = uniquePool.find((p) => p.productName === e.target.value);
                if (found) setFoodB(found);
              }}
              className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              {uniquePool.map((item, idx) => (
                <option key={idx} value={item.productName}>
                  {item.productName} ({item.brand})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Matrix Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {foodA && foodB ? (
            <div className="space-y-4">
              {/* Score Duel Banner */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-2xl border text-center ${
                    foodA.healthScore >= foodB.healthScore
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-slate-800/40 border-slate-800'
                  }`}
                >
                  {foodA.healthScore > foodB.healthScore && (
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                      <Trophy className="w-3 h-3" /> Healthier Pick
                    </div>
                  )}
                  <h3 className="text-sm font-bold text-white truncate">{foodA.productName}</h3>
                  <div className="text-3xl font-black text-white mt-2">
                    {foodA.healthScore}
                    <span className="text-xs text-slate-400 font-normal"> / 100</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-300 block mt-1">
                    {foodA.healthRating}
                  </span>
                </div>

                <div
                  className={`p-4 rounded-2xl border text-center ${
                    foodB.healthScore >= foodA.healthScore
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-slate-800/40 border-slate-800'
                  }`}
                >
                  {foodB.healthScore > foodA.healthScore && (
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                      <Trophy className="w-3 h-3" /> Healthier Pick
                    </div>
                  )}
                  <h3 className="text-sm font-bold text-white truncate">{foodB.productName}</h3>
                  <div className="text-3xl font-black text-white mt-2">
                    {foodB.healthScore}
                    <span className="text-xs text-slate-400 font-normal"> / 100</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-300 block mt-1">
                    {foodB.healthRating}
                  </span>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/60 text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-800/80 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                      <th className="p-3">Metric</th>
                      <th className="p-3">{foodA.productName}</th>
                      <th className="p-3">{foodB.productName}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    <tr>
                      <td className="p-3 font-semibold text-slate-400">NOVA Level</td>
                      <td className="p-3 font-bold">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${foodA.novaGroup === 1 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                          Group {foodA.novaGroup}
                        </span>
                      </td>
                      <td className="p-3 font-bold">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${foodB.novaGroup === 1 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                          Group {foodB.novaGroup}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-400">Serving Size</td>
                      <td className="p-3">{foodA.servingSize}</td>
                      <td className="p-3">{foodB.servingSize}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-400">Calories</td>
                      <td className="p-3 font-semibold">{foodA.nutrition.calories}</td>
                      <td className="p-3 font-semibold">{foodB.nutrition.calories}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-400">Sugars</td>
                      <td className={`p-3 font-semibold ${foodA.nutrition.totalSugars.level === 'high' ? 'text-rose-400' : 'text-slate-200'}`}>
                        {foodA.nutrition.totalSugars.value}
                      </td>
                      <td className={`p-3 font-semibold ${foodB.nutrition.totalSugars.level === 'high' ? 'text-rose-400' : 'text-slate-200'}`}>
                        {foodB.nutrition.totalSugars.value}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-400">Sodium</td>
                      <td className={`p-3 font-semibold ${foodA.nutrition.sodium.level === 'high' ? 'text-rose-400' : 'text-slate-200'}`}>
                        {foodA.nutrition.sodium.value}
                      </td>
                      <td className={`p-3 font-semibold ${foodB.nutrition.sodium.level === 'high' ? 'text-rose-400' : 'text-slate-200'}`}>
                        {foodB.nutrition.sodium.value}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-400">Saturated Fat</td>
                      <td className="p-3">{foodA.nutrition.saturatedFat.value}</td>
                      <td className="p-3">{foodB.nutrition.saturatedFat.value}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-400">Dietary Fiber</td>
                      <td className="p-3 font-bold text-emerald-400">{foodA.nutrition.dietaryFiber.value}</td>
                      <td className="p-3 font-bold text-emerald-400">{foodB.nutrition.dietaryFiber.value}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-400">Protein</td>
                      <td className="p-3 font-bold">{foodA.nutrition.protein.value}</td>
                      <td className="p-3 font-bold">{foodB.nutrition.protein.value}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-400">Chemical Additives</td>
                      <td className="p-3">{foodA.additives.length} additives</td>
                      <td className="p-3">{foodB.additives.length} additives</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-400">
              Please select two foods to compare.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
