import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { ScannerModal } from './components/ScannerModal';
import { DietarySettingsModal } from './components/DietarySettingsModal';
import { ManualEditModal } from './components/ManualEditModal';
import { HealthScoreCard } from './components/HealthScoreCard';
import { DietaryEvidenceInspector } from './components/DietaryEvidenceInspector';
import { LabelEvidenceInspector } from './components/LabelEvidenceInspector';
import { NutritionFactsTable } from './components/NutritionFactsTable';
import { IngredientsInspector } from './components/IngredientsInspector';
import { AdditivesMatrix } from './components/AdditivesMatrix';
import { ClaimsCheckCard } from './components/ClaimsCheckCard';
import { AlternativesCard } from './components/AlternativesCard';
import { AskFoodChat } from './components/AskFoodChat';
import { CompareModal } from './components/CompareModal';
import { HistoryModal } from './components/HistoryModal';
import { HelpModal } from './components/HelpModal';
import { TraceabilityAuditModal } from './components/TraceabilityAuditModal';
import { SAMPLE_FOODS, SampleFoodItem } from './data/sampleFoods';
import { FoodAnalysisResult, UserDietaryProfile } from './types/food';
import { evaluateDietaryEvidence } from './utils/dietaryMatcher';
import { Scan, Sparkles, AlertCircle, ArrowRight, ShieldCheck, HeartPulse, Edit3 } from 'lucide-react';

const DEFAULT_PROFILE: UserDietaryProfile = {
  allergies: ['Peanuts'],
  diets: ['Vegan'],
  healthGoals: ['Avoid Ultra-Processed Foods (NOVA 4)'],
};

export default function App() {
  // Active food state - initialized with the Contradiction Test sample to demonstrate grounded comparison immediately
  const [currentFood, setCurrentFood] = useState<FoodAnalysisResult>(SAMPLE_FOODS[0].data);
  const [activeSampleId, setActiveSampleId] = useState<string>(SAMPLE_FOODS[0].id);

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isDietaryOpen, setIsDietaryOpen] = useState(false);
  const [isManualEditOpen, setIsManualEditOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isTraceabilityModalOpen, setIsTraceabilityModalOpen] = useState(false);

  // Loading & error
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dietary Profile in localStorage
  const [dietaryProfile, setDietaryProfile] = useState<UserDietaryProfile>(() => {
    try {
      const saved = localStorage.getItem('labellens_dietary_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  // History in localStorage
  const [history, setHistory] = useState<FoodAnalysisResult[]>(() => {
    try {
      const saved = localStorage.getItem('labellens_history');
      if (saved) return JSON.parse(saved);
      return SAMPLE_FOODS.map((s) => s.data);
    } catch {
      return SAMPLE_FOODS.map((s) => s.data);
    }
  });

  // User confirmations on ambiguous or conflicting flags
  const [userResolutions, setUserResolutions] = useState<
    Record<string, { decision: 'approved_by_user' | 'flagged_by_user'; timestamp: number }>
  >({});
  const [highlightedEvidencePhrase, setHighlightedEvidencePhrase] = useState<string | null>(null);

  const handleResolveFlag = (flagId: string, decision: 'approved_by_user' | 'flagged_by_user') => {
    setUserResolutions((prev) => ({
      ...prev,
      [flagId]: { decision, timestamp: Date.now() },
    }));
  };

  const handleInspectLabelEvidence = (phrase: string) => {
    setHighlightedEvidencePhrase(phrase);
    const element = document.getElementById('label-evidence-inspector');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Dynamic Evidence-Grounded Dietary Evaluation
  const { flags, contradictions, ambiguous, auditReport } = useMemo(() => {
    return evaluateDietaryEvidence(currentFood, dietaryProfile, userResolutions);
  }, [currentFood, dietaryProfile, userResolutions]);

  // Merge dynamic comparison flags into current food for children
  const enrichedFood: FoodAnalysisResult = useMemo(() => {
    return {
      ...currentFood,
      dietaryComparisonFlags: flags,
      contradictionsDetected: contradictions,
      ambiguousIngredients: ambiguous,
      evidenceAuditReport: auditReport,
    };
  }, [currentFood, flags, contradictions, ambiguous, auditReport]);

  // Save dietary profile
  const handleUpdateProfile = (newProfile: UserDietaryProfile) => {
    setDietaryProfile(newProfile);
    try {
      localStorage.setItem('labellens_dietary_profile', JSON.stringify(newProfile));
    } catch (e) {
      console.warn('Could not save dietary profile', e);
    }
  };

  // Add item to history
  const addToHistory = (food: FoodAnalysisResult) => {
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.productName !== food.productName);
      const updated = [food, ...filtered].slice(0, 20);
      try {
        localStorage.setItem('labellens_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save history', e);
      }
      return updated;
    });
  };

  // Clear history
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('labellens_history');
    } catch (e) {
      console.warn('Could not clear history', e);
    }
  };

  // Select sample item
  const handleSelectSample = (sample: SampleFoodItem) => {
    setCurrentFood(sample.data);
    setActiveSampleId(sample.id);
    addToHistory(sample.data);
  };

  // Analyze photo via backend Gemini endpoint
  const handleAnalyzeImage = async (base64Data: string, mimeType: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Data,
          mimeType,
          userDietaryProfile: dietaryProfile,
        }),
      });

      if (!response.ok) {
        let errMessage = 'Failed to analyze food package';
        try {
          const errorData = await response.json();
          errMessage = errorData.details || errorData.error || errMessage;
        } catch {
          errMessage = `Server error (${response.status}). Please try again or test with preset samples.`;
        }
        throw new Error(errMessage);
      }

      const analyzedFood: FoodAnalysisResult = await response.json();
      analyzedFood.id = `scan-${Date.now()}`;
      analyzedFood.timestamp = Date.now();
      analyzedFood.imageThumbnail = base64Data;

      setCurrentFood(analyzedFood);
      setActiveSampleId('');
      addToHistory(analyzedFood);
      setIsScannerOpen(false);
    } catch (err: any) {
      console.warn('Scan processing notice:', err?.message || err);
      setErrorMessage(
        err.message || 'The food package analysis encountered a temporary delay. Please try again or use the sample presets.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle manual user corrections & recalculate
  const handleSaveManualCorrections = async (updatedFood: FoodAnalysisResult) => {
    setIsRecalculating(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/recalculate-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updatedFood,
          userDietaryProfile: dietaryProfile,
        }),
      });

      if (res.ok) {
        const freshAnalysis: FoodAnalysisResult = await res.json();
        setCurrentFood(freshAnalysis);
        addToHistory(freshAnalysis);
      } else {
        setCurrentFood(updatedFood);
        addToHistory(updatedFood);
      }
    } catch (err: any) {
      console.warn('Recalculation error, applying direct edits:', err);
      setCurrentFood(updatedFood);
      addToHistory(updatedFood);
    } finally {
      setIsRecalculating(false);
    }
  };

  const getConditionColor = (tag: string) => {
    switch (tag) {
      case 'Contradiction Test':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Ambiguous E471 Test':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Torn & Cut-Off Label':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'Motion Blurred':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Pristine & Clear':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Navigation Header */}
      <Header
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenDietaryModal={() => setIsDietaryOpen(true)}
        onOpenCompareModal={() => setIsCompareOpen(true)}
        onOpenHistoryModal={() => setIsHistoryOpen(true)}
        onOpenHelpModal={() => setIsHelpOpen(true)}
        dietaryProfile={dietaryProfile}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-slate-400 hover:text-white font-semibold ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* HERO BANNER & SAMPLE FOODS QUICK SWITCHER */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Forensic Evidence Traceability & Grounding</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Evidence-Grounded Label Audit. Zero Hallucinations.
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mt-1 leading-relaxed">
                Every dietary conflict is anchored to exact extracted phrases. Detects marketing contradictions (e.g. "Plant-Powered" vs animal whey), resolves ambiguous additives (E471), and enforces strict non-medical guardrails.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setIsTraceabilityModalOpen(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Traceability Audit</span>
              </button>
              <button
                onClick={() => setIsManualEditOpen(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition"
              >
                <Edit3 className="w-4 h-4 text-teal-400" />
                <span>Verify / Edit</span>
              </button>
              <button
                onClick={() => setIsScannerOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                <Scan className="w-5 h-5 stroke-[2.5]" />
                <span>Scan Food</span>
              </button>
            </div>
          </div>

          {/* Quick Real-World Test Presets */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>Dietary Test Bench & Quality Scenarios</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  (Test contradiction detection, ambiguous E471, torn label, and clean benchmark)
                </span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {SAMPLE_FOODS.map((sample) => {
                const isActive = activeSampleId === sample.id || currentFood.productName === sample.name;
                return (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`group p-2.5 rounded-2xl border text-left transition flex items-center gap-3 ${
                      isActive
                        ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 shrink-0 relative">
                      <img
                        src={sample.imageUrl}
                        alt={sample.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-white truncate block">
                        {sample.name}
                      </span>
                      <span className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border ${getConditionColor(sample.labelConditionTag)}`}>
                        {sample.labelConditionTag}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Profile Test Switcher (Requirement 8) */}
            <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                Test Profile:
              </span>
              <button
                onClick={() =>
                  handleUpdateProfile({
                    allergies: ['Peanuts'],
                    diets: ['Vegan'],
                    healthGoals: ['Avoid Ultra-Processed Foods (NOVA 4)'],
                  })
                }
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-emerald-300 border border-emerald-500/30 transition hover:border-emerald-400"
              >
                Vegan + Peanut Allergy
              </button>
              <button
                onClick={() =>
                  handleUpdateProfile({
                    allergies: ['Wheat / Gluten'],
                    diets: ['Gluten-Free Diet'],
                    healthGoals: ['General wellness'],
                  })
                }
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-500/30 transition hover:border-amber-400"
              >
                Gluten-Free (Celiac)
              </button>
              <button
                onClick={() =>
                  handleUpdateProfile({
                    allergies: [],
                    diets: ['Low Sodium (Cardiac/DASH)'],
                    healthGoals: ['Heart Health'],
                  })
                }
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-cyan-500/30 transition hover:border-cyan-400"
              >
                Low Sodium DASH
              </button>
              <button
                onClick={() =>
                  handleUpdateProfile({
                    allergies: [],
                    diets: ['Diabetic / Sugar Watch'],
                    healthGoals: ['Blood Sugar Control'],
                  })
                }
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-rose-300 border border-rose-500/30 transition hover:border-rose-400"
              >
                Diabetic / Sugar Watch
              </button>
              <button
                onClick={() =>
                  handleUpdateProfile({
                    allergies: ['Milk / Dairy'],
                    diets: ['Dairy-Free Diet'],
                    healthGoals: ['Lactose Free'],
                  })
                }
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-purple-300 border border-purple-500/30 transition hover:border-purple-400"
              >
                Dairy-Free Profile
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 1: Health Score, Legibility Banner, NOVA & Personal Alerts */}
        <HealthScoreCard
          food={enrichedFood}
          dietaryProfile={dietaryProfile}
          onRetake={() => setIsScannerOpen(true)}
          onOpenManualEdit={() => setIsManualEditOpen(true)}
        />

        {/* SECTION 2: EVIDENCE-GROUNDED DIETARY COMPARISON & CONTRADICTIONS */}
        <DietaryEvidenceInspector
          food={enrichedFood}
          profile={dietaryProfile}
          flags={flags}
          contradictions={contradictions}
          ambiguous={ambiguous}
          onResolveFlag={handleResolveFlag}
          onInspectLabelEvidence={handleInspectLabelEvidence}
          onOpenAuditModal={() => setIsTraceabilityModalOpen(true)}
        />

        {/* SECTION 3: Label Evidence & Audit Inspector */}
        <LabelEvidenceInspector
          food={enrichedFood}
          onOpenManualEdit={() => setIsManualEditOpen(true)}
          highlightedPhrase={highlightedEvidencePhrase}
          onClearHighlight={() => setHighlightedEvidencePhrase(null)}
        />

        {/* SECTION 4 & 5: Nutrition Facts Table & Ingredients Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <NutritionFactsTable food={enrichedFood} />
          </div>
          <div className="lg:col-span-6">
            <IngredientsInspector food={enrichedFood} />
          </div>
        </div>

        {/* SECTION 6 & 7: Chemical Additives & Claims Reality Check */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <AdditivesMatrix food={enrichedFood} />
          </div>
          <div className="lg:col-span-6">
            <ClaimsCheckCard food={enrichedFood} />
          </div>
        </div>

        {/* SECTION 8: Healthier Swaps & Alternatives */}
        <AlternativesCard food={enrichedFood} />

        {/* SECTION 9: Interactive AI Chat Q&A */}
        <AskFoodChat food={enrichedFood} />
      </main>

      {/* Floating Scan Button */}
      <div className="fixed bottom-6 right-6 z-20">
        <button
          onClick={() => setIsScannerOpen(true)}
          className="flex items-center gap-2 px-5 py-3.5 rounded-full font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-2xl shadow-emerald-500/40 border border-emerald-300/40 transition active:scale-95"
        >
          <Scan className="w-5 h-5 stroke-[2.5]" />
          <span>Scan Food</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 px-4 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white">LabelLens</span>
          <span>• Evidence-Grounded Food Label & Nutrition Transparency</span>
        </div>
        <p className="max-w-xl mx-auto text-[11px] text-slate-500 leading-relaxed">
          LabelLens anchors all warnings to extracted visible label text. The system does not invent ingredients, certify dietary conformity, or provide medical advice. Always check physical packaging for severe food allergies or clinical conditions.
        </p>
      </footer>

      {/* Modals */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onAnalyzeImage={handleAnalyzeImage}
        onSelectSample={handleSelectSample}
        isAnalyzing={isAnalyzing}
      />

      <ManualEditModal
        isOpen={isManualEditOpen}
        onClose={() => setIsManualEditOpen(false)}
        food={enrichedFood}
        onSave={handleSaveManualCorrections}
        isRecalculating={isRecalculating}
      />

      <DietarySettingsModal
        isOpen={isDietaryOpen}
        onClose={() => setIsDietaryOpen(false)}
        profile={dietaryProfile}
        onUpdateProfile={handleUpdateProfile}
      />

      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        currentFood={enrichedFood}
        historyFoods={history}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectFood={(item) => {
          setCurrentFood(item);
          setActiveSampleId('');
        }}
        onClearHistory={handleClearHistory}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <TraceabilityAuditModal
        isOpen={isTraceabilityModalOpen}
        onClose={() => setIsTraceabilityModalOpen(false)}
        food={enrichedFood}
      />
    </div>
  );
}
