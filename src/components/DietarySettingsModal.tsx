import React from 'react';
import { X, ShieldAlert, Check, HeartPulse, Sparkles, RotateCcw } from 'lucide-react';
import { UserDietaryProfile } from '../types/food';

interface DietarySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserDietaryProfile;
  onUpdateProfile: (newProfile: UserDietaryProfile) => void;
}

const ALLERGEN_OPTIONS = [
  'Peanuts',
  'Tree Nuts',
  'Milk / Dairy',
  'Wheat / Gluten',
  'Soy',
  'Eggs',
  'Fish',
  'Shellfish',
  'Sesame',
  'Sulfites'
];

const DIET_OPTIONS = [
  'Vegan',
  'Vegetarian',
  'Gluten-Free Diet',
  'Dairy-Free Diet',
  'Low Sodium (Cardiac/DASH)',
  'Diabetic / Sugar Watch',
  'Ketogenic',
  'Low FODMAP'
];

const GOAL_OPTIONS = [
  'Avoid Ultra-Processed Foods (NOVA 4)',
  'Avoid Artificial Sweeteners (Sucralose, Aspartame)',
  'Avoid Synthetic Food Dyes (Yellow 5, Red 40)',
  'Avoid Palm Oil & Hydrogenated Fats',
  'Prioritize High Fiber & Gut Health'
];

export const DietarySettingsModal: React.FC<DietarySettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
}) => {
  if (!isOpen) return null;

  const toggleAllergen = (item: string) => {
    const exists = profile.allergies.includes(item);
    const updated = exists
      ? profile.allergies.filter((a) => a !== item)
      : [...profile.allergies, item];
    onUpdateProfile({ ...profile, allergies: updated });
  };

  const toggleDiet = (item: string) => {
    const exists = profile.diets.includes(item);
    const updated = exists
      ? profile.diets.filter((d) => d !== item)
      : [...profile.diets, item];
    onUpdateProfile({ ...profile, diets: updated });
  };

  const toggleGoal = (item: string) => {
    const exists = profile.healthGoals.includes(item);
    const updated = exists
      ? profile.healthGoals.filter((g) => g !== item)
      : [...profile.healthGoals, item];
    onUpdateProfile({ ...profile, healthGoals: updated });
  };

  const resetProfile = () => {
    onUpdateProfile({ allergies: [], diets: [], healthGoals: [] });
  };

  const totalSelected =
    profile.allergies.length + profile.diets.length + profile.healthGoals.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Dietary & Allergen Profile</h2>
              <p className="text-xs text-slate-400">
                LabelLens will actively flag incompatible ingredients for you
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Allergens Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Personal Allergies & Intolerances
              </span>
              <span className="text-[11px] text-slate-400">
                {profile.allergies.length} selected
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              We'll display prominent critical alert banners whenever a scanned product contains or may contain these allergens.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALLERGEN_OPTIONS.map((allergen) => {
                const selected = profile.allergies.includes(allergen);
                return (
                  <button
                    key={allergen}
                    onClick={() => toggleAllergen(allergen)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition ${
                      selected
                        ? 'bg-rose-500/15 border-rose-500/50 text-rose-300'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span>{allergen}</span>
                    {selected && <Check className="w-3.5 h-3.5 text-rose-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Diets Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Lifestyles & Medical Diets
              </span>
              <span className="text-[11px] text-slate-400">{profile.diets.length} selected</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DIET_OPTIONS.map((diet) => {
                const selected = profile.diets.includes(diet);
                return (
                  <button
                    key={diet}
                    onClick={() => toggleDiet(diet)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition ${
                      selected
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span className="truncate pr-1">{diet}</span>
                    {selected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clean Label & Ingredient Preferences */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                Clean Label & Additive Filters
              </span>
              <span className="text-[11px] text-slate-400">{profile.healthGoals.length} selected</span>
            </div>
            <div className="space-y-1.5">
              {GOAL_OPTIONS.map((goal) => {
                const selected = profile.healthGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium border transition text-left ${
                      selected
                        ? 'bg-teal-500/15 border-teal-500/50 text-teal-300'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span>{goal}</span>
                    {selected && <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <button
            onClick={resetProfile}
            disabled={totalSelected === 0}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear All
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
