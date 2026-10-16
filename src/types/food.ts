export type CertaintyStatus = 'confirmed' | 'uncertain' | 'unreadable';

export interface FieldCertainty {
  status: CertaintyStatus;
  labelEvidence?: string; // Supporting label quote or observation
  userEdited?: boolean;
  originalValue?: string;
  notes?: string;
}

export interface NutritionDetail {
  value: string;
  level: 'low' | 'moderate' | 'high';
  certainty?: FieldCertainty;
}

export interface Micronutrient {
  name: string;
  amount: string;
  dailyValuePercentage?: string;
  certainty?: FieldCertainty;
}

export interface IngredientItem {
  name: string;
  type: 'whole_food' | 'additive' | 'hidden_sugar' | 'preservative' | 'flavor_color' | 'healthy_nutrient';
  description?: string;
  concernLevel: 'safe' | 'caution' | 'avoid';
  certainty?: FieldCertainty;
  exactPhrase?: string; // Exact verbatim quote from label
}

export interface AdditiveItem {
  codeOrName: string;
  function: string;
  safetyRating: 'Generally Safe' | 'Use Caution' | 'High Concern / Avoid';
  healthNotes: string;
  certainty?: FieldCertainty;
  exactPhrase?: string;
}

export interface ClaimVerification {
  claim: string;
  verdict: 'Accurate' | 'Misleading' | 'Exaggerated';
  explanation: string;
  certainty?: FieldCertainty;
  supportingLabelPhrase?: string;
}

export interface HealthierAlternative {
  title: string;
  category: string;
  whyBetter: string;
  exampleFoods: string;
}

export interface LegibilityAssessment {
  overallQuality: 'clear' | 'partially_readable' | 'severely_degraded';
  qualityScore: number; // 0 - 100
  issuesDetected: Array<
    | 'motion_blur'
    | 'partial_obstruction_or_tear'
    | 'curved_surface'
    | 'glare_reflection'
    | 'low_lighting'
    | 'cut_off_margins'
    | 'crinkled_packaging'
  >;
  issueDescriptions: string[];
  needsClearerImage: boolean;
  clarificationMessage: string;
}

export interface AllergenAssessment {
  allergen: string;
  presence: 'confirmed_present' | 'may_contain_traces' | 'inconclusive_unreadable' | 'not_detected_in_visible_text';
  evidence: string;
  confidence: 'high' | 'medium' | 'low';
  userConfirmed?: boolean;
}

export interface AllergenSafetyAudit {
  isAllergenSectionComplete: boolean;
  safetyWarning: string;
  allergenDetails: AllergenAssessment[];
}

// ----------------------------------------------------
// EVIDENCE-GROUNDED DIETARY COMPARISON TYPES
// ----------------------------------------------------

export type DietaryComparisonStatus =
  | 'safe'
  | 'confirmed_conflict'
  | 'contradiction_detected'
  | 'ambiguous_requires_confirmation'
  | 'unresolved_missing_data';

export interface DietaryConflictFlag {
  id: string;
  preference: string; // e.g. "Vegan", "Gluten-Free", "Low Sodium", "Peanut Allergy"
  preferenceType: 'allergy' | 'diet' | 'health_goal';
  status: DietaryComparisonStatus;
  title: string;
  explanation: string;
  
  // Requirement 2 & 3: exact extracted phrase and linking evidence
  extractedPhrase: string; // Verbatim snippet from label (e.g. "Whey Protein Isolate (Milk)", "Sodium 920mg")
  sourceField: 'ingredients' | 'nutrition' | 'allergen_statement' | 'front_claim';
  
  // Requirement 4: Contradiction detection between interpretation / claims and extracted text
  contradictionDetails?: {
    claimedOrInterpreted: string; // e.g. "Front packaging proclaims '100% Plant-Powered'"
    conflictingEvidence: string; // e.g. "Ingredients list verbatim reads 'Honey' and 'Whey (Milk)'"
    whyContradicts: string;
  };

  // Requirement 5: Ambiguous ingredients requiring user confirmation
  ambiguityDetails?: {
    term: string; // e.g. "Mono- and Diglycerides (E471)", "Natural Flavors", "Modified Food Starch"
    possibleOrigins: string[]; // e.g. ["Plant-derived (Soy/Palm)", "Animal-derived (Pork/Beef tallow)"]
    userPrompt: string;
  };

  userResolution?: {
    resolved: boolean;
    decision: 'approved_by_user' | 'flagged_by_user';
    userNote?: string;
    timestamp: number;
  };
}

export interface ContradictionItem {
  id: string;
  title: string;
  claimOrInterpretation: string;
  conflictingFact: string;
  exactEvidencePhrase: string;
  severity: 'high' | 'medium';
  actionPrompt: string;
}

export interface AmbiguousIngredient {
  term: string;
  verbatimExcerpt: string;
  reason: string;
  potentialSources: string[];
  affectedLifestyles: string[]; // ["Vegan", "Vegetarian", "Halal", "Kosher"]
}

export interface EvidenceAuditReport {
  groundedPercentage: number; // e.g. 96%
  totalEvidenceAnchors: number;
  confirmedCount: number;
  uncertainCount: number;
  contradictionCount: number;
  ambiguousCount: number;
  missingDataCount: number;
  nonMedicalDisclaimer: string;
}

export interface FoodAnalysisResult {
  id?: string;
  timestamp?: number;
  imageThumbnail?: string;
  productName: string;
  brand: string;
  category: string;
  servingSize: string;
  servingsPerContainer?: string;
  healthScore: number; // 1-100
  healthRating: 'Excellent' | 'Good' | 'Moderate' | 'Caution' | 'Poor';
  healthScoreColor: 'green' | 'lime' | 'amber' | 'orange' | 'red';
  verdictSummary: string;
  
  // Legibility and OCR Quality
  legibility: LegibilityAssessment;
  allergenSafetyAudit: AllergenSafetyAudit;

  novaGroup: 1 | 2 | 3 | 4;
  novaTitle: string;
  novaReason: string;

  nutrition: {
    calories: string;
    caloriesCertainty?: FieldCertainty;
    totalFat: NutritionDetail;
    saturatedFat: NutritionDetail;
    transFat?: string;
    transFatCertainty?: FieldCertainty;
    sodium: NutritionDetail;
    totalCarbs: NutritionDetail;
    dietaryFiber: NutritionDetail;
    totalSugars: NutritionDetail;
    addedSugars?: NutritionDetail;
    protein: NutritionDetail;
    keyMicronutrients?: Micronutrient[];
  };

  positives: string[];
  concerns: string[];

  ingredientsRaw: string;
  ingredientsCertainty?: FieldCertainty;
  ingredientsList: IngredientItem[];
  additives: AdditiveItem[];

  allergensDetected: string[];
  mayContainAllergens: string[];
  uncertainAllergens?: string[];

  dietarySuitability: {
    isVegan: boolean;
    isVegetarian: boolean;
    isGlutenFree: boolean;
    isDairyFree: boolean;
    isKetoFriendly: boolean;
    isLowSodium: boolean;
    isLowSugar: boolean;
    notes?: string;
    uncertainties?: string[];
  };

  personalizedWarnings?: string[];
  claimsCheck: ClaimVerification[];
  healthierAlternatives: HealthierAlternative[];

  // User manual edits tracking
  userEditedFields?: Record<string, { original: string; updated: string; timestamp: number }>;

  // ----------------------------------------------------
  // EVIDENCE-GROUNDED COMPARISONS & CONTRADICTIONS
  // ----------------------------------------------------
  dietaryComparisonFlags: DietaryConflictFlag[];
  contradictionsDetected: ContradictionItem[];
  ambiguousIngredients: AmbiguousIngredient[];
  evidenceAuditReport?: EvidenceAuditReport;
}

export interface UserDietaryProfile {
  allergies: string[];
  diets: string[];
  healthGoals: string[];
}
