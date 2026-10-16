import React from 'react';
import {
  AlertTriangle,
  Camera,
  Edit3,
  CheckCircle2,
  HelpCircle,
  Eye,
  ShieldAlert,
  ZapOff,
  Sun,
  Maximize2
} from 'lucide-react';
import { LegibilityAssessment } from '../types/food';

interface LabelQualityBannerProps {
  legibility: LegibilityAssessment;
  onRetake: () => void;
  onOpenManualEdit: () => void;
}

export const LabelQualityBanner: React.FC<LabelQualityBannerProps> = ({
  legibility,
  onRetake,
  onOpenManualEdit,
}) => {
  const {
    overallQuality,
    qualityScore,
    issuesDetected = [],
    issueDescriptions = [],
    needsClearerImage,
    clarificationMessage,
  } = legibility;

  const getQualityBadge = () => {
    switch (overallQuality) {
      case 'severely_degraded':
        return {
          bg: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
          indicator: 'bg-rose-500',
          title: 'Severely Degraded / High Uncertainty',
          icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
        };
      case 'partially_readable':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
          indicator: 'bg-amber-400',
          title: 'Partially Obscured / Incomplete OCR',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
        };
      case 'clear':
      default:
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
          indicator: 'bg-emerald-400',
          title: 'Pristine & High Legibility',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
        };
    }
  };

  const badge = getQualityBadge();

  const getIssueLabel = (issue: string) => {
    switch (issue) {
      case 'motion_blur':
        return 'Motion Blur';
      case 'partial_obstruction_or_tear':
        return 'Torn / Obstructed Packaging';
      case 'curved_surface':
        return 'Cylindrical Curvature';
      case 'glare_reflection':
        return 'Specular Glare / Reflection';
      case 'low_lighting':
        return 'Low Lighting';
      case 'cut_off_margins':
        return 'Cut-Off Margin Text';
      case 'crinkled_packaging':
        return 'Foil Wrinkles';
      default:
        return issue.replace(/_/g, ' ');
    }
  };

  return (
    <div className={`p-4 rounded-2xl border ${badge.bg} transition-all space-y-3`}>
      {/* Top Status Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-center shrink-0">
            {badge.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Label Legibility:
              </span>
              <span className="text-xs font-bold text-white">
                {badge.title}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300">
                Score: {qualityScore}/100
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {overallQuality === 'clear'
                ? 'All ingredient and nutrition panels are flat, sharp, and verifiable.'
                : 'Optical issues or packaging distortions may obscure vital ingredients or allergens.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={onOpenManualEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-slate-500 transition shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5 text-teal-400" />
            <span>Verify & Edit Values</span>
          </button>
          {needsClearerImage && (
            <button
              onClick={onRetake}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition active:scale-95"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Retake Clearer Photo</span>
            </button>
          )}
        </div>
      </div>

      {/* Issues Detected Badges */}
      {issuesDetected.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">
            Optical Factors:
          </span>
          {issuesDetected.map((issue, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-lg bg-slate-900/80 border border-slate-700/80 text-[10px] font-medium text-slate-200 flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{getIssueLabel(issue)}</span>
            </span>
          ))}
        </div>
      )}

      {/* Clarification Alert if crucial fields obscured */}
      {needsClearerImage && clarificationMessage && (
        <div className="p-3 rounded-xl bg-slate-950/70 border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-200">
              Action Required: Incomplete Information Detected
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {clarificationMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
