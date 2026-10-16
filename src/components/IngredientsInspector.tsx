import React, { useState } from 'react';
import {
  FileText,
  Search,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  Filter,
  ChevronDown,
  CheckCircle2,
  Quote
} from 'lucide-react';
import { FoodAnalysisResult, IngredientItem } from '../types/food';

interface IngredientsInspectorProps {
  food: FoodAnalysisResult;
}

export const IngredientsInspector: React.FC<IngredientsInspectorProps> = ({ food }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showRawText, setShowRawText] = useState<boolean>(false);
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);

  const {
    ingredientsList = [],
    ingredientsRaw,
    allergensDetected = [],
    mayContainAllergens = [],
    uncertainAllergens = [],
    allergenSafetyAudit
  } = food;

  // Filter items
  const filteredList = ingredientsList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.certainty?.labelEvidence && item.certainty.labelEvidence.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'all') return true;
    if (filterType === 'hidden_sugar') return item.type === 'hidden_sugar';
    if (filterType === 'additive') return item.type === 'additive' || item.type === 'preservative';
    if (filterType === 'whole_food') return item.type === 'whole_food' || item.type === 'healthy_nutrient';
    if (filterType === 'caution') return item.concernLevel === 'caution' || item.concernLevel === 'avoid';
    if (filterType === 'uncertain') return item.certainty?.status === 'uncertain';
    return true;
  });

  const hiddenSugarsCount = ingredientsList.filter((i) => i.type === 'hidden_sugar').length;
  const additivesCount = ingredientsList.filter(
    (i) => i.type === 'additive' || i.type === 'preservative' || i.type === 'flavor_color'
  ).length;
  const uncertainIngredientsCount = ingredientsList.filter((i) => i.certainty?.status === 'uncertain').length;

  const getConcernBadge = (level: 'safe' | 'caution' | 'avoid') => {
    switch (level) {
      case 'avoid':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Avoid / High Concern
          </span>
        );
      case 'caution':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Caution
          </span>
        );
      case 'safe':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Safe
          </span>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'hidden_sugar':
        return <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Hidden Sugar</span>;
      case 'additive':
        return <span className="text-[10px] uppercase font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">Additive</span>;
      case 'preservative':
        return <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">Preservative</span>;
      case 'flavor_color':
        return <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">Flavor / Color</span>;
      case 'healthy_nutrient':
        return <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Nutrient</span>;
      case 'whole_food':
      default:
        return <span className="text-[10px] uppercase font-bold text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">Whole Food</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Ingredient Decoder & Transparency</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {ingredientsList.length} parsed ingredients • Listed in descending order of predominance
          </p>
        </div>

        {/* Quick summary chips */}
        <div className="flex items-center gap-2">
          {uncertainIngredientsCount > 0 && (
            <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {uncertainIngredientsCount} Incomplete / Truncated
            </span>
          )}
          {hiddenSugarsCount > 0 && (
            <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              {hiddenSugarsCount} Hidden Sugar{hiddenSugarsCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Allergens Notice Bar with Incomplete Label Safeguards */}
      <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Allergen Safety Status: </span>
              {allergensDetected.length > 0 ? (
                <span className="text-rose-300 font-semibold">
                  Confirmed: {allergensDetected.join(', ')}
                </span>
              ) : (
                <span className="text-slate-400">None directly named in visible text.</span>
              )}
            </div>
          </div>
          {mayContainAllergens.length > 0 && (
            <div className="text-slate-400 text-[11px] sm:text-right">
              Facility traces: {mayContainAllergens.join(', ')}
            </div>
          )}
        </div>

        {/* Unresolved allergens warning */}
        {uncertainAllergens.length > 0 && (
          <div className="pt-2 border-t border-slate-700/60 text-[11px] text-amber-300 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Unresolved Allergens: </strong>
              {uncertainAllergens.join(', ')} (Cannot be confirmed or ruled out due to torn edges, glare, or blur).
            </span>
          </div>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ingredients, fragments, additives..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filterType === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            All ({ingredientsList.length})
          </button>
          {uncertainIngredientsCount > 0 && (
            <button
              onClick={() => setFilterType('uncertain')}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                filterType === 'uncertain'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-amber-300 hover:text-white border border-slate-700'
              }`}
            >
              Uncertain ({uncertainIngredientsCount})
            </button>
          )}
          <button
            onClick={() => setFilterType('whole_food')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filterType === 'whole_food'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            Whole Foods
          </button>
          <button
            onClick={() => setFilterType('hidden_sugar')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filterType === 'hidden_sugar'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            Sugars ({hiddenSugarsCount})
          </button>
          <button
            onClick={() => setFilterType('additive')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filterType === 'additive'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            Additives
          </button>
        </div>
      </div>

      {/* Ingredient Item Cards */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {filteredList.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No ingredients found matching your filter or query.
          </div>
        ) : (
          filteredList.map((item, index) => {
            const isUncertain = item.certainty?.status === 'uncertain';
            return (
              <div
                key={index}
                className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  isUncertain
                    ? 'bg-amber-500/10 border-amber-500/40'
                    : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white font-mono">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {item.name}
                    </span>
                    {getTypeLabel(item.type)}
                    {isUncertain && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5" />
                        Truncated / Uncertain OCR
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  {item.certainty?.labelEvidence && (
                    <div className="mt-1 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Quote className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                      <span>Evidence: {item.certainty.labelEvidence}</span>
                    </div>
                  )}
                </div>
                <div className="shrink-0 self-start sm:self-center">
                  {getConcernBadge(item.concernLevel)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Verbatim Ingredients Drawer Toggle */}
      <div className="pt-2 border-t border-slate-800">
        <button
          onClick={() => setShowRawText(!showRawText)}
          className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 font-medium transition"
        >
          <span>{showRawText ? 'Hide Verbatim Package Text' : 'View Verbatim Package Text'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition transform ${showRawText ? 'rotate-180' : ''}`} />
        </button>

        {showRawText && (
          <div className="mt-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
              Exact Ingredients Text Scanned:
            </span>
            {ingredientsRaw || 'No verbatim text available.'}
          </div>
        )}
      </div>
    </div>
  );
};
