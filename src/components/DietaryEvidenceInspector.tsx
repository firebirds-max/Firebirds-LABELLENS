import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Zap,
  ExternalLink,
  Quote,
  Check,
  X,
  Sparkles,
  Info,
  Scale,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Eye
} from 'lucide-react';
import {
  FoodAnalysisResult,
  UserDietaryProfile,
  DietaryConflictFlag,
  ContradictionItem,
  AmbiguousIngredient
} from '../types/food';

interface DietaryEvidenceInspectorProps {
  food: FoodAnalysisResult;
  profile: UserDietaryProfile;
  flags: DietaryConflictFlag[];
  contradictions: ContradictionItem[];
  ambiguous: AmbiguousIngredient[];
  onResolveFlag?: (flagId: string, decision: 'approved_by_user' | 'flagged_by_user') => void;
  onOpenAuditModal: () => void;
  onInspectLabelEvidence?: (phrase: string) => void;
}

export const DietaryEvidenceInspector: React.FC<DietaryEvidenceInspectorProps> = ({
  food,
  profile,
  flags,
  contradictions,
  ambiguous,
  onResolveFlag,
  onOpenAuditModal,
  onInspectLabelEvidence,
}) => {
  const [filter, setFilter] = useState<'all' | 'conflicts' | 'ambiguous' | 'safe'>('all');

  const handleUserDecision = (flagId: string, decision: 'approved' | 'rejected') => {
    if (onResolveFlag) {
      onResolveFlag(
        flagId,
        decision === 'approved' ? 'approved_by_user' : 'flagged_by_user'
      );
    }
  };

  const filteredFlags = flags.filter((f) => {
    if (filter === 'all') return true;
    if (filter === 'conflicts')
      return (
        f.status === 'confirmed_conflict' ||
        f.status === 'contradiction_detected' ||
        f.status === 'unresolved_missing_data'
      );
    if (filter === 'ambiguous') return f.status === 'ambiguous_requires_confirmation';
    if (filter === 'safe') return f.status === 'safe';
    return true;
  });

  const conflictCount = flags.filter(
    (f) =>
      f.status === 'confirmed_conflict' ||
      f.status === 'contradiction_detected' ||
      f.status === 'unresolved_missing_data'
  ).length;

  const ambiguousCount = flags.filter(
    (f) => f.status === 'ambiguous_requires_confirmation'
  ).length;

  const safeCount = flags.filter((f) => f.status === 'safe').length;

  const getStatusBadge = (status: DietaryConflictFlag['status']) => {
    switch (status) {
      case 'confirmed_conflict':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>Confirmed Conflict</span>
          </span>
        );
      case 'contradiction_detected':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Contradiction Detected</span>
          </span>
        );
      case 'unresolved_missing_data':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/30">
            <ShieldAlert className="w-3 h-3 text-orange-400" />
            <span>Missing OCR (Unresolved)</span>
          </span>
        );
      case 'ambiguous_requires_confirmation':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
            <HelpCircle className="w-3 h-3 text-yellow-400" />
            <span>Ambiguous Origin</span>
          </span>
        );
      case 'safe':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Verified Compliant</span>
          </span>
        );
    }
  };

  return (
    <div id="dietary-evidence-inspector" className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
      {/* 1. Header with Audit Score & Anti-Certification Note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Evidence-Grounded Dietary Comparison
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Every conflict is anchored to exact extracted label text • Zero assumed certifications
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAuditModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Traceability Audit & Limitations</span>
          </button>
        </div>
      </div>

      {/* 2. CONTRADICTIONS ALERT BANNER (If front claims or model interpretations contradict back facts) */}
      {contradictions.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-200 space-y-3 shadow-lg shadow-amber-500/5">
          <div className="flex items-start gap-2.5">
            <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-extrabold text-amber-100 flex items-center gap-2">
                <span>Contradiction Detected: Claim / Interpretation vs Physical Label Facts</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                  {contradictions.length} Found
                </span>
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                The food package contains direct factual contradictions between marketing terminology, automated model classifications, and the physical ingredients or nutrition facts panel.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {contradictions.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 text-xs space-y-2 font-sans"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{c.title}</span>
                  <span className="text-[10px] text-amber-400 font-bold uppercase">
                    Severity: {c.severity}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Claimed / Interpreted:
                    </span>
                    <strong className="text-white">"{c.claimOrInterpretation}"</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-rose-400 block text-[10px] uppercase font-semibold">
                      Contradictory Fact on Physical Label:
                    </span>
                    <strong className="text-rose-300">"{c.conflictingFact}"</strong>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px]">
                  <div className="flex items-center gap-1.5 font-mono text-emerald-300 truncate">
                    <Quote className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">Verbatim Evidence: "{c.exactEvidencePhrase}"</span>
                  </div>
                  {onInspectLabelEvidence && (
                    <button
                      onClick={() => onInspectLabelEvidence(c.exactEvidencePhrase)}
                      className="shrink-0 inline-flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 font-medium underline transition"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Jump to visible evidence</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Non-Medical & Anti-Certification Guardrail Banner */}
      <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <strong className="text-slate-200">Anti-Certification & Non-Medical Guardrail: </strong>
          LabelLens extracts and quotes visible label facts to assist your review. It does not certify products (certifications require verified factory supply chain inspections), cannot detect unprinted facility cross-contamination, and does not provide clinical medical advice.
        </div>
      </div>

      {/* 4. Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filter === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            All Rules ({flags.length})
          </button>
          <button
            onClick={() => setFilter('conflicts')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filter === 'conflicts'
                ? 'bg-rose-500 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            Violations & Contradictions ({conflictCount})
          </button>
          {ambiguousCount > 0 && (
            <button
              onClick={() => setFilter('ambiguous')}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                filter === 'ambiguous'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-amber-300 hover:text-white border border-slate-700'
              }`}
            >
              Ambiguous Ingredients ({ambiguousCount})
            </button>
          )}
          <button
            onClick={() => setFilter('safe')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filter === 'safe'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            Verified Compliant ({safeCount})
          </button>
        </div>

        <span className="text-[11px] text-slate-400">
          Audited against <strong>{(profile.allergies || []).length} allergies</strong> and <strong>{(profile.diets || []).length} diets</strong>
        </span>
      </div>

      {/* 5. Detailed Comparison Cards */}
      <div className="space-y-3">
        {filteredFlags.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-800/20 border border-slate-800 text-center text-xs text-slate-400">
            No items matching this filter.
          </div>
        ) : (
          filteredFlags.map((flag) => {
            const isConflict =
              flag.status === 'confirmed_conflict' ||
              flag.status === 'contradiction_detected' ||
              flag.status === 'unresolved_missing_data';
            const isAmbiguous = flag.status === 'ambiguous_requires_confirmation';
            const isSafe = flag.status === 'safe';
            const userRes = flag.userResolution;

            return (
              <div
                key={flag.id}
                className={`p-4 rounded-2xl border transition space-y-3 ${
                  isConflict
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : isAmbiguous
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-slate-800/40 border-slate-700/60'
                }`}
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isConflict ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : isAmbiguous ? (
                      <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}

                    <h4 className="text-xs font-bold text-white">
                      {flag.title}
                    </h4>

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      Rule: {flag.preference}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {getStatusBadge(flag.status)}
                  </div>
                </div>

                {/* Explanation */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {flag.explanation}
                </p>

                {/* Exact Extracted Phrase Linking Box (Requirement 2 & 3) */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start gap-2 text-xs font-mono flex-1">
                    <Quote className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-slate-400 text-[10px] uppercase font-sans block mb-0.5">
                        Exact Extracted Visible Label Evidence ({flag.sourceField}):
                      </span>
                      <span className="text-emerald-300 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded inline-block">
                        "{flag.extractedPhrase}"
                      </span>
                    </div>
                  </div>

                  {onInspectLabelEvidence && (
                    <button
                      onClick={() => onInspectLabelEvidence(flag.extractedPhrase)}
                      className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-teal-400 hover:text-teal-300 border border-slate-700 text-xs font-semibold transition"
                      title="Locate in Label Evidence Inspector"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Label Evidence</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Ambiguity Resolution Drawer (Requirement 5) */}
                {isAmbiguous && flag.ambiguityDetails && (
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/30 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-amber-200 font-bold">
                      <span className="flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-amber-400" />
                        <span>User Confirmation Required: {flag.ambiguityDetails.term}</span>
                      </span>
                      <span className="text-[10px] text-amber-400/80 uppercase font-semibold">Action Required</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {flag.ambiguityDetails.userPrompt}
                    </p>
                    <div className="text-[11px] text-slate-400">
                      <strong>Possible Origins: </strong>
                      {flag.ambiguityDetails.possibleOrigins.join(' OR ')}
                    </div>

                    {/* Interactive resolution buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => handleUserDecision(flag.id, 'approved')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          userRes?.decision === 'approved_by_user'
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>I confirm this is plant-derived / acceptable</span>
                      </button>

                      <button
                        onClick={() => handleUserDecision(flag.id, 'rejected')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          userRes?.decision === 'flagged_by_user'
                            ? 'bg-rose-500 text-white border-rose-400'
                            : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject / Mark as Incompatible</span>
                      </button>
                    </div>

                    {userRes && (
                      <span className="text-[10px] font-bold text-teal-300 block pt-1">
                        ✓ Preference recorded: You marked this as{' '}
                        {userRes.decision === 'approved_by_user' ? 'Approved (Safe)' : 'Rejected (Incompatible)'}.
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
