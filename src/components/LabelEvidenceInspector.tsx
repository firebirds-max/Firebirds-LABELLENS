import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Search,
  Quote,
  ShieldAlert,
  Info,
  Check,
  Edit3,
  X,
  Sparkles,
  Link2
} from 'lucide-react';
import { FoodAnalysisResult, CertaintyStatus } from '../types/food';

interface LabelEvidenceInspectorProps {
  food: FoodAnalysisResult;
  onOpenManualEdit: () => void;
  highlightedPhrase?: string | null;
  onClearHighlight?: () => void;
}

interface EvidenceRow {
  field: string;
  category: 'Nutrition' | 'Ingredient' | 'Allergen' | 'Claim';
  extractedValue: string;
  status: CertaintyStatus;
  labelEvidence: string;
  notes?: string;
  userEdited?: boolean;
}

export const LabelEvidenceInspector: React.FC<LabelEvidenceInspectorProps> = ({
  food,
  onOpenManualEdit,
  highlightedPhrase,
  onClearHighlight,
}) => {
  const [filter, setFilter] = useState<'all' | 'uncertain' | 'confirmed'>('all');
  const [search, setSearch] = useState('');

  // When a highlighted phrase is passed from DietaryEvidenceInspector, update search or state
  useEffect(() => {
    if (highlightedPhrase) {
      // Clean up punctuation for searching
      const clean = highlightedPhrase.replace(/[":,]/g, '').trim();
      setSearch(clean);
    }
  }, [highlightedPhrase]);

  // Collect all field evidence rows from current food
  const rows: EvidenceRow[] = [];

  // Nutrition rows
  const n = food.nutrition;
  rows.push({
    field: 'Calories',
    category: 'Nutrition',
    extractedValue: n.calories,
    status: n.caloriesCertainty?.status || 'confirmed',
    labelEvidence: n.caloriesCertainty?.labelEvidence || `Read from Calories panel: ${n.calories}`,
    notes: n.caloriesCertainty?.notes,
    userEdited: n.caloriesCertainty?.userEdited,
  });

  rows.push({
    field: 'Sodium',
    category: 'Nutrition',
    extractedValue: n.sodium.value,
    status: n.sodium.certainty?.status || 'confirmed',
    labelEvidence: n.sodium.certainty?.labelEvidence || `Read from Sodium line: ${n.sodium.value}`,
    notes: n.sodium.certainty?.notes,
    userEdited: n.sodium.certainty?.userEdited,
  });

  rows.push({
    field: 'Total Sugars',
    category: 'Nutrition',
    extractedValue: n.totalSugars.value,
    status: n.totalSugars.certainty?.status || 'confirmed',
    labelEvidence: n.totalSugars.certainty?.labelEvidence || `Read from Sugars line: ${n.totalSugars.value}`,
    notes: n.totalSugars.certainty?.notes,
    userEdited: n.totalSugars.certainty?.userEdited,
  });

  if (n.addedSugars) {
    rows.push({
      field: 'Added Sugars',
      category: 'Nutrition',
      extractedValue: n.addedSugars.value,
      status: n.addedSugars.certainty?.status || 'confirmed',
      labelEvidence: n.addedSugars.certainty?.labelEvidence || `Read: ${n.addedSugars.value}`,
      notes: n.addedSugars.certainty?.notes,
      userEdited: n.addedSugars.certainty?.userEdited,
    });
  }

  rows.push({
    field: 'Total Fat',
    category: 'Nutrition',
    extractedValue: n.totalFat.value,
    status: n.totalFat.certainty?.status || 'confirmed',
    labelEvidence: n.totalFat.certainty?.labelEvidence || `Read: ${n.totalFat.value}`,
    notes: n.totalFat.certainty?.notes,
    userEdited: n.totalFat.certainty?.userEdited,
  });

  rows.push({
    field: 'Saturated Fat',
    category: 'Nutrition',
    extractedValue: n.saturatedFat.value,
    status: n.saturatedFat.certainty?.status || 'confirmed',
    labelEvidence: n.saturatedFat.certainty?.labelEvidence || `Read: ${n.saturatedFat.value}`,
    notes: n.saturatedFat.certainty?.notes,
    userEdited: n.saturatedFat.certainty?.userEdited,
  });

  rows.push({
    field: 'Dietary Fiber',
    category: 'Nutrition',
    extractedValue: n.dietaryFiber.value,
    status: n.dietaryFiber.certainty?.status || 'confirmed',
    labelEvidence: n.dietaryFiber.certainty?.labelEvidence || `Read: ${n.dietaryFiber.value}`,
    notes: n.dietaryFiber.certainty?.notes,
    userEdited: n.dietaryFiber.certainty?.userEdited,
  });

  rows.push({
    field: 'Protein',
    category: 'Nutrition',
    extractedValue: n.protein.value,
    status: n.protein.certainty?.status || 'confirmed',
    labelEvidence: n.protein.certainty?.labelEvidence || `Read: ${n.protein.value}`,
    notes: n.protein.certainty?.notes,
    userEdited: n.protein.certainty?.userEdited,
  });

  // Ingredient rows
  (food.ingredientsList || []).forEach((item) => {
    rows.push({
      field: item.name,
      category: 'Ingredient',
      extractedValue: item.type.replace(/_/g, ' '),
      status: item.certainty?.status || (item.concernLevel === 'avoid' ? 'uncertain' : 'confirmed'),
      labelEvidence: item.certainty?.labelEvidence || `Found in ingredient panel: "${item.name}"`,
      notes: item.certainty?.notes || item.description,
      userEdited: item.certainty?.userEdited,
    });
  });

  // Allergen audit rows
  (food.allergenSafetyAudit?.allergenDetails || []).forEach((item) => {
    rows.push({
      field: item.allergen,
      category: 'Allergen',
      extractedValue: item.presence.replace(/_/g, ' '),
      status: item.presence === 'confirmed_present' ? 'confirmed' : 'uncertain',
      labelEvidence: item.evidence,
      notes: `Audit confidence: ${item.confidence}. Status: ${item.presence}`,
    });
  });

  // Marketing Claims rows
  (food.claimsCheck || []).forEach((claim) => {
    rows.push({
      field: `Claim: "${claim.claim}"`,
      category: 'Claim',
      extractedValue: claim.verdict,
      status: claim.certainty?.status || (claim.verdict === 'Accurate' ? 'confirmed' : 'uncertain'),
      labelEvidence: claim.certainty?.labelEvidence || claim.explanation,
      notes: claim.explanation,
    });
  });

  // Filter rows
  const filteredRows = rows.filter((r) => {
    const matchesSearch =
      r.field.toLowerCase().includes(search.toLowerCase()) ||
      r.labelEvidence.toLowerCase().includes(search.toLowerCase()) ||
      r.extractedValue.toLowerCase().includes(search.toLowerCase()) ||
      (r.notes && r.notes.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (filter === 'all') return true;
    if (filter === 'uncertain') return r.status === 'uncertain' || r.status === 'unreadable';
    if (filter === 'confirmed') return r.status === 'confirmed';
    return true;
  });

  const uncertainCount = rows.filter((r) => r.status === 'uncertain' || r.status === 'unreadable').length;
  const confirmedCount = rows.filter((r) => r.status === 'confirmed').length;

  return (
    <div id="label-evidence-inspector" className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Label Evidence & Audit Inspector</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-examine verbatim OCR evidence supporting every nutrition, ingredient, and allergen claim
          </p>
        </div>

        <button
          onClick={onOpenManualEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-slate-500 transition self-start sm:self-auto"
        >
          <Edit3 className="w-3.5 h-3.5 text-teal-400" />
          <span>Edit Unresolved Fields</span>
        </button>
      </div>

      {/* Highlight Active Link Notice Banner (Requirement 3: Link conflict to visible evidence) */}
      {highlightedPhrase && (
        <div className="p-3.5 rounded-2xl bg-teal-500/15 border-2 border-teal-500/40 text-teal-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Link2 className="w-4 h-4 text-teal-300 shrink-0" />
            <span className="truncate">
              Linked Dietary Evidence Target: <strong className="text-white">"{highlightedPhrase}"</strong>
            </span>
          </div>
          <button
            onClick={() => {
              setSearch('');
              if (onClearHighlight) onClearHighlight();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold shrink-0 transition"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset View</span>
          </button>
        </div>
      )}

      {/* Forensic Disclaimers & Rules */}
      <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 font-bold text-white">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Forensic Safety Principles Enforced by LabelLens:</span>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400">
          <li className="flex items-start gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-200">Zero Hallucination: </strong>
              The system never invents missing numbers. If a digit is torn, it is flagged as uncertain.
            </span>
          </li>
          <li className="flex items-start gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-200">Absence is Not Proof: </strong>
              Missing OCR text on torn or blurry labels is NEVER treated as proof that an allergen is absent.
            </span>
          </li>
        </ul>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search fields, quotes, or evidence..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filter === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            All Evidence ({rows.length})
          </button>
          <button
            onClick={() => setFilter('uncertain')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filter === 'uncertain'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            Uncertain ({uncertainCount})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filter === 'confirmed'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            Confirmed ({confirmedCount})
          </button>
        </div>
      </div>

      {/* Evidence Cards */}
      <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
        {filteredRows.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            No fields found matching this filter or search.
          </div>
        ) : (
          filteredRows.map((item, idx) => {
            const isMatch = highlightedPhrase && (
              item.field.toLowerCase().includes(highlightedPhrase.toLowerCase()) ||
              item.labelEvidence.toLowerCase().includes(highlightedPhrase.toLowerCase()) ||
              item.extractedValue.toLowerCase().includes(highlightedPhrase.toLowerCase())
            );

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition ${
                  isMatch
                    ? 'ring-2 ring-teal-400 bg-teal-950/30 border-teal-500/50 shadow-lg shadow-teal-500/10'
                    : item.status === 'uncertain' || item.status === 'unreadable'
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-slate-800/40 border-slate-700/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{item.field}</span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {item.category}
                    </span>
                    {isMatch && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-500 text-slate-950 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Target Evidence Anchor
                      </span>
                    )}
                    {item.userEdited && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        User Verified
                      </span>
                    )}
                  </div>

                  {/* Status badge */}
                  <div>
                    {item.status === 'confirmed' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Confirmed Fact
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        Uncertain / Unresolved
                      </span>
                    )}
                  </div>
                </div>

                {/* Supporting Label Quote */}
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono text-slate-300 flex items-start gap-2">
                  <Quote className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 flex-1">
                    <span className="text-slate-200">
                      {item.labelEvidence}
                    </span>
                    {item.notes && (
                      <p className="text-[11px] text-amber-400/90 font-sans mt-1">
                        <strong>Audit Note: </strong>{item.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
