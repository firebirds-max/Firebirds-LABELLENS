import React from 'react';
import { X, HelpCircle, Layers, Award, AlertTriangle, ShieldCheck } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">How LabelLens Works</h2>
              <p className="text-xs text-slate-400">
                Scientific methodologies, NOVA classification, and scoring algorithms
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-300 leading-relaxed">
          {/* Health Score */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Award className="w-4 h-4" />
              <span>LabelLens Health Score (0 - 100)</span>
            </div>
            <p>
              Our scoring model evaluates nutritional density per serving and per 100g, penalizing excess added sugars, saturated fats, trans fats, industrial emulsifiers, and excessive sodium, while awarding points for dietary fiber, lean protein, vitamins, minerals, and unadulterated whole food ingredients.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1 text-center font-semibold">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                80 - 100: Excellent
              </div>
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/20">
                50 - 79: Moderate
              </div>
              <div className="p-2 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/20">
                0 - 49: Poor / Caution
              </div>
            </div>
          </div>

          {/* NOVA Classification */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
              <Layers className="w-4 h-4" />
              <span>The Official NOVA Processing Classification</span>
            </div>
            <p>
              Developed by researchers at the University of São Paulo and endorsed by the United Nations and WHO, NOVA classifies foods according to the extent and purpose of industrial processing:
            </p>
            <div className="space-y-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <strong className="text-emerald-400">Group 1: Unprocessed or Minimally Processed</strong>
                <p className="text-slate-400 mt-0.5">Whole grains, fresh or frozen vegetables, raw nuts, plain milk, eggs, meats without additives.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <strong className="text-teal-400">Group 2: Processed Culinary Ingredients</strong>
                <p className="text-slate-400 mt-0.5">Oils, butter, salt, and cane sugar obtained from Group 1 foods through pressing or milling.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <strong className="text-amber-400">Group 3: Processed Foods</strong>
                <p className="text-slate-400 mt-0.5">Simple breads, canned legumes in brine, cheeses, cured meats (essentially Group 1 foods preserved with Group 2 ingredients).</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <strong className="text-rose-400">Group 4: Ultra-Processed Foods (UPF)</strong>
                <p className="text-slate-400 mt-0.5">Industrial formulations with 5+ ingredients, including substances never used in kitchens: hydrogenated oils, high-fructose corn syrup, artificial flavors, emulsifiers, and preservatives.</p>
              </div>
            </div>
          </div>

          {/* Hidden Sugars & Additives */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Hidden Sugars & Food Additives</span>
            </div>
            <p>
              Food packaging regulations require listing ingredients in descending weight order. Manufacturers frequently divide sweeteners across 3 to 4 distinct names (e.g. dextrose, maltodextrin, brown rice syrup, cane crystals) so none appears as the #1 ingredient. LabelLens automatically flags and aggregates all hidden sweeteners.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/60 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
