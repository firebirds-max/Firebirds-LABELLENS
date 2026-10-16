import React, { useState } from 'react';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  ChevronDown,
  Sparkles,
  Edit3,
  HelpCircle,
} from 'lucide-react';
import { FoodAnalysisResult, UserDietaryProfile } from '../types/food';
import { LabelQualityBanner } from './LabelQualityBanner';

interface HealthScoreCardProps {
  food: FoodAnalysisResult;
  dietaryProfile: UserDietaryProfile;
  onRetake: () => void;
  onOpenManualEdit: () => void;
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({
  food,
  dietaryProfile,
  onRetake,
  onOpenManualEdit,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showNovaExplainer, setShowNovaExplainer] = useState(false);

  // Check personal alerts based on user profile
  const personalAlerts: string[] = [];
  if (dietaryProfile.allergies.length > 0) {
    const combinedAllergens = [
      ...food.allergensDetected,
      ...food.mayContainAllergens,
      ...(food.uncertainAllergens || []),
      food.ingredientsRaw,
    ]
      .join(' ')
      .toLowerCase();

    dietaryProfile.allergies.forEach((allergy) => {
      const simplified = allergy.split('/')[0].trim().toLowerCase();
      // If confirmed
      if (combinedAllergens.includes(simplified)) {
        const isUncertain = (food.uncertainAllergens || []).some((u) =>
          u.toLowerCase().includes(simplified)
        );
        if (isUncertain) {
          personalAlerts.push(
            `UNCERTAIN / UNVERIFIED: ${allergy} cannot be ruled out due to torn/blurry label!`
          );
        } else {
          personalAlerts.push(`Contains or may contain ${allergy} (Detected in your allergy profile)`);
        }
      } else if (!food.allergenSafetyAudit?.isAllergenSectionComplete) {
        // Missing OCR is not proof of absence!
        personalAlerts.push(
          `UNRESOLVED RISK: ${allergy} could not be confirmed absent due to incomplete label OCR!`
        );
      }
    });
  }

  // Check diet conflicts
  if (dietaryProfile.diets.includes('Vegan') && !food.dietarySuitability.isVegan) {
    personalAlerts.push('Not Vegan (Contains animal-derived ingredients or honey)');
  }
  if (dietaryProfile.diets.includes('Gluten-Free Diet') && !food.dietarySuitability.isGlutenFree) {
    personalAlerts.push('Contains Gluten (Wheat, barley, rye or non-certified oats)');
  }
  if (dietaryProfile.diets.includes('Dairy-Free Diet') && !food.dietarySuitability.isDairyFree) {
    personalAlerts.push('Contains Dairy or milk derivatives');
  }
  if (dietaryProfile.diets.includes('Low Sodium (Cardiac/DASH)') && !food.dietarySuitability.isLowSodium) {
    personalAlerts.push('High in Sodium (Not recommended for low-sodium DASH diet)');
  }
  if (dietaryProfile.diets.includes('Diabetic / Sugar Watch') && !food.dietarySuitability.isLowSugar) {
    personalAlerts.push('High added sugars or rapid glycemic impact');
  }

  // Audio Speech Synthesis for hands-free shopping
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `${food.productName} by ${food.brand}. Health Score: ${food.healthScore} out of 100, rated ${food.healthRating}. ${food.verdictSummary} Key concerns: ${food.concerns.join('. ')}.`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Determine score colors
  const getScoreColorClasses = (score: number) => {
    if (score >= 80) return { ring: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' };
    if (score >= 65) return { ring: 'text-lime-400', bg: 'bg-lime-500/10', border: 'border-lime-500/30', text: 'text-lime-400' };
    if (score >= 50) return { ring: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' };
    if (score >= 35) return { ring: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' };
    return { ring: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400' };
  };

  const scoreTheme = getScoreColorClasses(food.healthScore);

  // NOVA Badge details
  const getNovaColor = (group: number) => {
    switch (group) {
      case 1:
        return { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', label: 'Minimally Processed' };
      case 2:
        return { badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30', label: 'Culinary Ingredients' };
      case 3:
        return { badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', label: 'Processed Food' };
      case 4:
      default:
        return { badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30', label: 'Ultra-Processed Food (UPF)' };
    }
  };

  const novaInfo = getNovaColor(food.novaGroup);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
      {/* 1. LABEL LEGIBILITY & QUALITY BANNER */}
      {food.legibility && (
        <LabelQualityBanner
          legibility={food.legibility}
          onRetake={onRetake}
          onOpenManualEdit={onOpenManualEdit}
        />
      )}

      {/* 2. PERSONAL ALLERGEN/DIET ALERT BANNER */}
      {personalAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border-2 border-rose-500/40 text-rose-200 shadow-lg shadow-rose-500/5 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-rose-200">
                Personal Dietary Alert ({personalAlerts.length})
              </h4>
              <ul className="mt-1 space-y-1 text-xs text-rose-300">
                {personalAlerts.map((alert, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                    <span>{alert}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 3. INCOMPLETE OCR / ALLERGEN SAFETY AUDIT WARNING */}
      {food.allergenSafetyAudit && !food.allergenSafetyAudit.isAllergenSectionComplete && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Food Safety Rule: Incomplete Label Extraction
              </span>
            </div>
            <button
              onClick={onOpenManualEdit}
              className="text-[11px] font-bold text-teal-300 hover:text-white underline"
            >
              Confirm Allergens Manually →
            </button>
          </div>
          <p className="text-xs text-amber-300 leading-relaxed">
            {food.allergenSafetyAudit.safetyWarning}
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
            {food.allergensDetected.length > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Confirmed in text: {food.allergensDetected.join(', ')}
              </span>
            )}
            {(food.uncertainAllergens || []).length > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Unresolved due to blur/tear: {(food.uncertainAllergens || []).join(', ')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* TOP HEADER: Product Name, Brand, Audio Reader, Edit Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              {food.brand}
            </span>
            <span className="text-xs text-slate-400">
              • {food.category}
            </span>
            <span className="text-xs text-slate-400">
              • Serving: {food.servingSize}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {food.productName}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenManualEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-750 transition"
            title="Edit and correct extracted values"
          >
            <Edit3 className="w-3.5 h-3.5 text-teal-400" />
            <span>Edit Values</span>
          </button>

          <button
            onClick={toggleSpeech}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              isSpeaking
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-750'
            }`}
            title="Read summary aloud for grocery shopping"
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop Audio</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Listen Aloud</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* HERO METRICS: Health Score Circular Meter + NOVA Processing Badge */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Score Meter */}
        <div className={`md:col-span-5 rounded-2xl ${scoreTheme.bg} border ${scoreTheme.border} p-5 flex flex-col items-center justify-center text-center relative overflow-hidden`}>
          <div className="relative flex items-center justify-center mb-3">
            <div className="w-28 h-28 rounded-full border-4 border-slate-800 flex items-center justify-center relative">
              <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-800"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * Math.max(5, food.healthScore)) / 100}
                  strokeLinecap="round"
                  className={scoreTheme.ring}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white tracking-tight">
                  {food.healthScore}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  / 100
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-base font-extrabold ${scoreTheme.text}`}>
              {food.healthRating} Choice
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
            Based on fiber, micronutrients, processing, sugars & sodium
          </span>
        </div>

        {/* NOVA Ultra-Processed Level & Plain English Verdict */}
        <div className="md:col-span-7 bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Processing Classification
                </span>
              </div>
              <button
                onClick={() => setShowNovaExplainer(!showNovaExplainer)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition ${novaInfo.badge}`}
              >
                <span>NOVA {food.novaGroup}: {novaInfo.label}</span>
                <ChevronDown className={`w-3 h-3 transition transform ${showNovaExplainer ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* NOVA Explainer Dropdown */}
            {showNovaExplainer && (
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 text-xs text-slate-300 mb-3 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-white">
                  <span>Why NOVA Group {food.novaGroup}?</span>
                  <span className="text-[10px] text-emerald-400">UN Food Standard</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  {food.novaReason}
                </p>
                <div className="pt-1 text-[11px] text-slate-500 border-t border-slate-800 flex justify-between">
                  <span>Group 1: Natural foods</span>
                  <span>Group 4: Industrial formulations</span>
                </div>
              </div>
            )}

            {/* Verdict */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Plain English Verdict
              </span>
              <p className="text-sm text-slate-200 leading-relaxed">
                {food.verdictSummary}
              </p>
            </div>
          </div>

          {/* Quick Stats Pill Row with Certainty Indicators */}
          <div className="grid grid-cols-4 gap-2 pt-4 mt-3 border-t border-slate-700/60 text-center">
            <div className="bg-slate-900/60 rounded-xl p-2 border border-slate-800 relative">
              <span className="block text-[10px] text-slate-400 font-medium">Calories</span>
              <span className="text-xs font-bold text-white truncate block">
                {food.nutrition.calories}
              </span>
            </div>
            <div className="bg-slate-900/60 rounded-xl p-2 border border-slate-800 relative">
              <span className="block text-[10px] text-slate-400 font-medium">Sugars</span>
              <span className={`text-xs font-bold block truncate ${food.nutrition.totalSugars.level === 'high' ? 'text-rose-400' : 'text-slate-200'}`}>
                {food.nutrition.totalSugars.value}
              </span>
            </div>
            <div className="bg-slate-900/60 rounded-xl p-2 border border-slate-800 relative">
              <span className="block text-[10px] text-slate-400 font-medium">Sodium</span>
              <span className={`text-xs font-bold block truncate ${food.nutrition.sodium.level === 'high' ? 'text-rose-400' : 'text-slate-200'}`}>
                {food.nutrition.sodium.value}
              </span>
              {food.nutrition.sodium.certainty?.status === 'uncertain' && (
                <span className="absolute top-1 right-1 text-amber-400" title="Uncertain sodium value">
                  •
                </span>
              )}
            </div>
            <div className="bg-slate-900/60 rounded-xl p-2 border border-slate-800 relative">
              <span className="block text-[10px] text-slate-400 font-medium">Fiber</span>
              <span className={`text-xs font-bold block truncate ${food.nutrition.dietaryFiber.level === 'high' ? 'text-emerald-400' : 'text-slate-200'}`}>
                {food.nutrition.dietaryFiber.value}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* POSITIVES & CONCERNS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Positives */}
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Health Highlights ({food.positives.length})
            </h4>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {food.positives.map((pos, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                <span>{pos}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Concerns */}
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Ingredient & Health Concerns ({food.concerns.length})
            </h4>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {food.concerns.map((con, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
