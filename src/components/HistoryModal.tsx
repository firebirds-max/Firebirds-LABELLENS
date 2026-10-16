import React from 'react';
import { X, History, Trash2, ArrowUpRight } from 'lucide-react';
import { FoodAnalysisResult } from '../types/food';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: FoodAnalysisResult[];
  onSelectFood: (food: FoodAnalysisResult) => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectFood,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Scan History</h2>
              <p className="text-xs text-slate-400">
                {history.length} recent packaged food scan{history.length === 1 ? '' : 's'}
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

        {/* List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-2.5">
          {history.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>No recent scans saved yet.</p>
              <p className="text-slate-500 mt-1">
                Scan any food package or try one of the instant samples!
              </p>
            </div>
          ) : (
            history.map((item, index) => {
              const formattedTime = item.timestamp
                ? new Date(item.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recent';

              return (
                <div
                  key={index}
                  onClick={() => {
                    onSelectFood(item);
                    onClose();
                  }}
                  className="p-3.5 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 cursor-pointer transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                        item.healthScore >= 80
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : item.healthScore >= 50
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {item.healthScore}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition truncate max-w-[200px] sm:max-w-xs">
                        {item.productName}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {item.brand} • {formattedTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                      NOVA {item.novaGroup}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/60 flex justify-between items-center">
            <button
              onClick={onClearHistory}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
