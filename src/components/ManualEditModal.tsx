import React, { useState } from 'react';
import { X, Check, Edit3, RotateCcw, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { FoodAnalysisResult } from '../types/food';

interface ManualEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  food: FoodAnalysisResult;
  onSave: (updatedFood: FoodAnalysisResult) => Promise<void>;
  isRecalculating?: boolean;
}

const COMMON_ALLERGENS = [
  'Peanuts',
  'Tree Nuts',
  'Milk / Dairy',
  'Wheat / Gluten',
  'Soy',
  'Eggs',
  'Fish',
  'Shellfish',
  'Sesame',
];

export const ManualEditModal: React.FC<ManualEditModalProps> = ({
  isOpen,
  onClose,
  food,
  onSave,
  isRecalculating = false,
}) => {
  if (!isOpen) return null;

  // Form states initialized from current food
  const [productName, setProductName] = useState(food.productName);
  const [brand, setBrand] = useState(food.brand);
  const [servingSize, setServingSize] = useState(food.servingSize);
  const [calories, setCalories] = useState(food.nutrition.calories);
  const [totalFat, setTotalFat] = useState(food.nutrition.totalFat.value);
  const [saturatedFat, setSaturatedFat] = useState(food.nutrition.saturatedFat.value);
  const [sodium, setSodium] = useState(food.nutrition.sodium.value);
  const [totalCarbs, setTotalCarbs] = useState(food.nutrition.totalCarbs.value);
  const [dietaryFiber, setDietaryFiber] = useState(food.nutrition.dietaryFiber.value);
  const [totalSugars, setTotalSugars] = useState(food.nutrition.totalSugars.value);
  const [addedSugars, setAddedSugars] = useState(food.nutrition.addedSugars?.value || '');
  const [protein, setProtein] = useState(food.nutrition.protein.value);
  const [ingredientsRaw, setIngredientsRaw] = useState(food.ingredientsRaw);

  const [allergens, setAllergens] = useState<string[]>(food.allergensDetected || []);

  const toggleAllergen = (item: string) => {
    setAllergens((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clone food and mark modified fields
    const updated: FoodAnalysisResult = {
      ...food,
      productName,
      brand,
      servingSize,
      ingredientsRaw,
      allergensDetected: allergens,
      nutrition: {
        ...food.nutrition,
        calories,
        caloriesCertainty: {
          status: 'confirmed',
          labelEvidence: 'User confirmed / manually verified',
          userEdited: true,
        },
        totalFat: {
          ...food.nutrition.totalFat,
          value: totalFat,
          certainty: {
            status: 'confirmed',
            labelEvidence: 'User confirmed / manually verified',
            userEdited: true,
          },
        },
        saturatedFat: {
          ...food.nutrition.saturatedFat,
          value: saturatedFat,
          certainty: {
            status: 'confirmed',
            labelEvidence: 'User confirmed / manually verified',
            userEdited: true,
          },
        },
        sodium: {
          ...food.nutrition.sodium,
          value: sodium,
          certainty: {
            status: 'confirmed',
            labelEvidence: 'User confirmed / manually verified',
            userEdited: true,
          },
        },
        totalCarbs: {
          ...food.nutrition.totalCarbs,
          value: totalCarbs,
          certainty: {
            status: 'confirmed',
            labelEvidence: 'User confirmed / manually verified',
            userEdited: true,
          },
        },
        dietaryFiber: {
          ...food.nutrition.dietaryFiber,
          value: dietaryFiber,
          certainty: {
            status: 'confirmed',
            labelEvidence: 'User confirmed / manually verified',
            userEdited: true,
          },
        },
        totalSugars: {
          ...food.nutrition.totalSugars,
          value: totalSugars,
          certainty: {
            status: 'confirmed',
            labelEvidence: 'User confirmed / manually verified',
            userEdited: true,
          },
        },
        addedSugars: addedSugars
          ? {
              value: addedSugars,
              level: food.nutrition.addedSugars?.level || 'moderate',
              certainty: {
                status: 'confirmed',
                labelEvidence: 'User confirmed / manually verified',
                userEdited: true,
              },
            }
          : food.nutrition.addedSugars,
        protein: {
          ...food.nutrition.protein,
          value: protein,
          certainty: {
            status: 'confirmed',
            labelEvidence: 'User confirmed / manually verified',
            userEdited: true,
          },
        },
      },
      // Clear uncertainAllergens if user verified
      uncertainAllergens: [],
      // Update legibility status to confirmed
      legibility: {
        ...food.legibility,
        overallQuality: 'clear',
        qualityScore: 100,
        needsClearerImage: false,
        clarificationMessage: 'Values manually verified and confirmed by user.',
      },
      allergenSafetyAudit: {
        ...food.allergenSafetyAudit,
        isAllergenSectionComplete: true,
        safetyWarning: 'User has manually verified and confirmed the allergen list.',
      },
    };

    await onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Verify & Correct Extracted Label Info
              </h2>
              <p className="text-xs text-slate-400">
                Fix torn text, smeared numbers, or unreadable allergens
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Note */}
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-slate-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Saving corrections will automatically recalculate the Health Score, NOVA rating, and personal dietary alerts.
            </span>
          </div>

          {/* Product & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Product Name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Brand Name</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Nutrition Numbers (Crucial for blurred digits) */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="font-bold text-slate-200 uppercase tracking-wider block">
              Nutrition Values (Per Serving)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-slate-400 block mb-1">Serving Size</label>
                <input
                  type="text"
                  value={servingSize}
                  onChange={(e) => setServingSize(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Calories</label>
                <input
                  type="text"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Sodium (mg)</label>
                <input
                  type="text"
                  value={sodium}
                  onChange={(e) => setSodium(e.target.value)}
                  placeholder="e.g. 140mg"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-bold text-emerald-400"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Total Sugars</label>
                <input
                  type="text"
                  value={totalSugars}
                  onChange={(e) => setTotalSugars(e.target.value)}
                  placeholder="e.g. 12g"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Added Sugars</label>
                <input
                  type="text"
                  value={addedSugars}
                  onChange={(e) => setAddedSugars(e.target.value)}
                  placeholder="e.g. 10g"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Total Fat</label>
                <input
                  type="text"
                  value={totalFat}
                  onChange={(e) => setTotalFat(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Dietary Fiber</label>
                <input
                  type="text"
                  value={dietaryFiber}
                  onChange={(e) => setDietaryFiber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Protein</label>
                <input
                  type="text"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Allergens Manual Confirmation */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 uppercase tracking-wider block">
                Confirmed Allergens
              </span>
              <span className="text-[11px] text-slate-400">
                Check all allergens present in packaging
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_ALLERGENS.map((allergen) => {
                const isSelected = allergens.some(
                  (a) => a.toLowerCase().includes(allergen.toLowerCase().split('/')[0].trim())
                );
                return (
                  <button
                    type="button"
                    key={allergen}
                    onClick={() => toggleAllergen(allergen)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                      isSelected
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{allergen}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-rose-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ingredients Verbatim Text */}
          <div className="space-y-1 pt-2 border-t border-slate-800">
            <label className="text-slate-300 font-semibold block">
              Ingredients Text (Edit or paste full ingredients)
            </label>
            <textarea
              rows={3}
              value={ingredientsRaw}
              onChange={(e) => setIngredientsRaw(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
            />
          </div>

          {/* Footer Save */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRecalculating}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
            >
              {isRecalculating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Recalculating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save & Recalculate Assessment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
