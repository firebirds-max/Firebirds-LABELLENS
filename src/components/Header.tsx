import React from 'react';
import { Scan, ShieldAlert, Sparkles, Scale, History, HelpCircle, Utensils } from 'lucide-react';
import { UserDietaryProfile } from '../types/food';

interface HeaderProps {
  onOpenScanner: () => void;
  onOpenDietaryModal: () => void;
  onOpenCompareModal: () => void;
  onOpenHistoryModal: () => void;
  onOpenHelpModal: () => void;
  dietaryProfile: UserDietaryProfile;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenScanner,
  onOpenDietaryModal,
  onOpenCompareModal,
  onOpenHistoryModal,
  onOpenHelpModal,
  dietaryProfile,
  historyCount,
}) => {
  const activeRestrictionsCount =
    (dietaryProfile.allergies?.length || 0) + (dietaryProfile.diets?.length || 0);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
            <Scan className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-white font-sans">
                Label<span className="text-emerald-400">Lens</span>
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AI Vision
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Packaged Food & Nutrition Decoder
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dietary Filter Trigger */}
          <button
            onClick={onOpenDietaryModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 transition-all hover:border-slate-600"
            title="Configure personal allergies and dietary lifestyle"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Dietary Profile</span>
            {activeRestrictionsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                {activeRestrictionsCount}
              </span>
            )}
          </button>

          {/* Comparison */}
          <button
            onClick={onOpenCompareModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 transition-all hover:border-slate-600"
            title="Compare two food products"
          >
            <Scale className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden md:inline">Compare</span>
          </button>

          {/* History */}
          <button
            onClick={onOpenHistoryModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 transition-all hover:border-slate-600"
            title="View recent scans"
          >
            <History className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">History</span>
            {historyCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>

          {/* Guide / How it works */}
          <button
            onClick={onOpenHelpModal}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
            title="How LabelLens works (NOVA & Nutri-Score)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Main Action: Scan Photo */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Scan className="w-4 h-4 stroke-[2.5]" />
            <span>Scan Food</span>
          </button>
        </div>
      </div>
    </header>
  );
};
