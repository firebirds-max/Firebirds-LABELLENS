import {
  FoodAnalysisResult,
  UserDietaryProfile,
  DietaryConflictFlag,
  ContradictionItem,
  AmbiguousIngredient,
  EvidenceAuditReport
} from '../types/food';

/**
 * Known ambiguous ingredients whose origin (plant vs animal vs synthetic) cannot be confirmed
 * from standard food labels without manufacturer clarification or kosher/vegan certification.
 */
const AMBIGUOUS_DATABASE: Array<{
  term: string;
  aliases: string[];
  reason: string;
  potentialSources: string[];
  affectedLifestyles: string[];
}> = [
  {
    term: 'Mono- and Diglycerides (E471)',
    aliases: ['mono and diglycerides', 'e471', 'monoglycerides', 'diglycerides', 'e 471', 'distilled monoglycerides'],
    reason: 'Can be manufactured from either plant oils (soybean, palm) or animal slaughterhouse fats (pork/beef tallow). Source is rarely declared on packaging.',
    potentialSources: ['Plant oils (Soybean, Palm)', 'Animal fats (Bovine or Porcine tallow)'],
    affectedLifestyles: ['Vegan', 'Vegetarian', 'Halal', 'Kosher']
  },
  {
    term: 'Natural Flavors / Flavors',
    aliases: ['natural flavor', 'natural flavors', 'natural flavoring', 'flavor', 'flavors'],
    reason: 'Defined broadly by FDA as derived from spices, fruits, vegetables, yeast, herbs, or meat/dairy/poultry/eggs. May contain animal-derived carriers or dairy fractions.',
    potentialSources: ['Botanical distillates / essential oils', 'Animal glandular extracts or dairy derivatives'],
    affectedLifestyles: ['Vegan', 'Vegetarian']
  },
  {
    term: 'Modified Food Starch',
    aliases: ['modified food starch', 'modified starch'],
    reason: 'In non-US or imported products, starch may be derived from wheat (containing gluten) if not specifically declared as corn or tapioca starch.',
    potentialSources: ['Corn starch (Gluten-free)', 'Wheat starch (Contains gluten)'],
    affectedLifestyles: ['Gluten-Free Diet']
  },
  {
    term: 'Lecithin (Unspecified Origin)',
    aliases: ['lecithin'],
    reason: 'Usually soy or sunflower, but can rarely be derived from egg yolk if unspecified.',
    potentialSources: ['Soybeans or Sunflower seeds', 'Egg yolk'],
    affectedLifestyles: ['Vegan', 'Dairy-Free Diet']
  },
  {
    term: 'Enzymes (Unspecified)',
    aliases: ['enzymes', 'microbial enzymes', 'rennet'],
    reason: 'Often used in dairy and baked goods; can be microbial (vegetarian) or animal rennet from calf stomach lining.',
    potentialSources: ['Microbial / Fungal fermentation', 'Animal rennet (Calf abomasum)'],
    affectedLifestyles: ['Vegetarian', 'Vegan', 'Kosher', 'Halal']
  }
];

/**
 * Searches verbatim text and returns the exact matching clause containing the target term.
 */
function extractEvidencePhrase(text: string, term: string): string {
  if (!text) return term;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(term.toLowerCase());
  if (idx === -1) return term;

  // Extract surrounding context (e.g. between commas or up to 60 chars)
  const start = Math.max(0, text.lastIndexOf(',', idx) + 1);
  let end = text.indexOf(',', idx + term.length);
  if (end === -1) end = text.length;

  const phrase = text.substring(start, end).trim();
  return phrase.length > 0 ? phrase : term;
}

/**
 * Evaluates dietary rules against extracted food data with strict evidence grounding.
 * Returns grounded comparison flags, detected contradictions, and ambiguous ingredients.
 */
export function evaluateDietaryEvidence(
  food: FoodAnalysisResult,
  profile: UserDietaryProfile,
  userResolutions: Record<string, { decision: 'approved_by_user' | 'flagged_by_user'; timestamp: number }> = {}
): {
  flags: DietaryConflictFlag[];
  contradictions: ContradictionItem[];
  ambiguous: AmbiguousIngredient[];
  auditReport: EvidenceAuditReport;
} {
  const flags: DietaryConflictFlag[] = [];
  const contradictions: ContradictionItem[] = [];
  const ambiguous: AmbiguousIngredient[] = [];

  const rawIngredients = food.ingredientsRaw || '';
  const lowerIngredients = rawIngredients.toLowerCase();
  const allergenList = [
    ...(food.allergensDetected || []),
    ...(food.mayContainAllergens || []),
    ...(food.uncertainAllergens || [])
  ];

  // ----------------------------------------------------
  // 1. ALLERGEN EVALUATIONS
  // ----------------------------------------------------
  (profile.allergies || []).forEach((allergy) => {
    const simplified = allergy.split('/')[0].trim().toLowerCase();
    const flagId = `allergy-${simplified}`;
    const userRes = userResolutions[flagId];

    const isUncertainAllergen = (food.uncertainAllergens || []).some((u) =>
      u.toLowerCase().includes(simplified)
    );
    const isConfirmedAllergen = (food.allergensDetected || []).some((a) =>
      a.toLowerCase().includes(simplified)
    );
    const isTracesAllergen = (food.mayContainAllergens || []).some((m) =>
      m.toLowerCase().includes(simplified)
    );

    // Direct match in verbatim ingredients text
    const inIngredients = lowerIngredients.includes(simplified);

    if (isConfirmedAllergen || inIngredients) {
      const phrase = inIngredients
        ? extractEvidencePhrase(rawIngredients, simplified)
        : `Allergen statement: "Contains ${allergy}"`;

      flags.push({
        id: flagId,
        preference: allergy,
        preferenceType: 'allergy',
        status: userRes?.decision === 'approved_by_user' ? 'safe' : 'confirmed_conflict',
        title: userRes?.decision === 'approved_by_user'
          ? `User Cleared Allergen Alert: ${allergy}`
          : `Confirmed Allergen: ${allergy}`,
        explanation: userRes?.decision === 'approved_by_user'
          ? `User manually acknowledged and permitted this item.`
          : `The product explicitly lists ${allergy} in the ingredient panel or allergen declaration statement.`,
        extractedPhrase: phrase,
        sourceField: inIngredients ? 'ingredients' : 'allergen_statement',
        userResolution: userRes ? {
          resolved: true,
          decision: userRes.decision,
          timestamp: userRes.timestamp
        } : undefined
      });

      // Contradiction Check: Did front package or model claim allergen-free?
      const claims = food.claimsCheck || [];
      const freeClaim = claims.find((c) =>
        c.claim.toLowerCase().includes(simplified) || c.claim.toLowerCase().includes('free')
      );
      if (freeClaim) {
        contradictions.push({
          id: `contra-allergen-${simplified}`,
          title: `Allergen Contradiction: Front Claim vs Back Panel`,
          claimOrInterpretation: freeClaim.claim,
          conflictingFact: `Visible ingredients list verbatim declares "${phrase}"`,
          exactEvidencePhrase: phrase,
          severity: 'high',
          actionPrompt: `Never consume if you suffer from an acute allergy to ${allergy}.`
        });
      }
    } else if (isTracesAllergen) {
      flags.push({
        id: `allergy-trace-${simplified}`,
        preference: allergy,
        preferenceType: 'allergy',
        status: userRes?.decision === 'approved_by_user' ? 'safe' : 'confirmed_conflict',
        title: userRes?.decision === 'approved_by_user'
          ? `User Permitted Facility Trace: ${allergy}`
          : `Advisory / Facility Trace: ${allergy}`,
        explanation: `Manufacturer advisory declares shared equipment or cross-contact risk for ${allergy}.`,
        extractedPhrase: `May contain traces of ${allergy}`,
        sourceField: 'allergen_statement'
      });
    } else if (isUncertainAllergen || !food.allergenSafetyAudit?.isAllergenSectionComplete) {
      flags.push({
        id: `allergy-uncertain-${simplified}`,
        preference: allergy,
        preferenceType: 'allergy',
        status: userRes?.decision === 'approved_by_user' ? 'safe' : 'unresolved_missing_data',
        title: userRes?.decision === 'approved_by_user'
          ? `User Cleared Unreadable Field: ${allergy}`
          : `Unresolved Risk: ${allergy}`,
        explanation: `Label is torn, curved, or blurred. Absence of evidence is NOT proof of absence: ${allergy} cannot be confirmed absent without clearer packaging.`,
        extractedPhrase: food.allergenSafetyAudit?.safetyWarning || 'Incomplete OCR extraction on physical package',
        sourceField: 'allergen_statement'
      });
    } else {
      // Safe
      flags.push({
        id: `allergy-safe-${simplified}`,
        preference: allergy,
        preferenceType: 'allergy',
        status: 'safe',
        title: `No ${allergy} Detected`,
        explanation: `Verified against intact ingredient statement and allergen declaration box.`,
        extractedPhrase: 'Complete ingredient statement audited; term absent.',
        sourceField: 'ingredients'
      });
    }
  });

  // ----------------------------------------------------
  // 2. DIETARY LIFESTYLE EVALUATIONS
  // ----------------------------------------------------
  (profile.diets || []).forEach((diet) => {
    switch (diet) {
      case 'Vegan': {
        const flagId = 'diet-vegan-conflict';
        const userRes = userResolutions[flagId];

        const animalMarkers = [
          'whey', 'milk', 'casein', 'caseinate', 'gelatin', 'honey', 'beeswax',
          'egg', 'eggs', 'albumin', 'butter', 'ghee', 'beef', 'chicken', 'pork',
          'carmine', 'cochineal', 'lard', 'tallow'
        ];
        const foundMarker = animalMarkers.find((m) => lowerIngredients.includes(m));

        if (foundMarker) {
          const phrase = extractEvidencePhrase(rawIngredients, foundMarker);
          flags.push({
            id: flagId,
            preference: 'Vegan',
            preferenceType: 'diet',
            status: userRes?.decision === 'approved_by_user' ? 'safe' : 'confirmed_conflict',
            title: userRes?.decision === 'approved_by_user'
              ? `User Permitted Ingredient: ${foundMarker.toUpperCase()}`
              : `Non-Vegan Ingredient Detected: ${foundMarker.toUpperCase()}`,
            explanation: `Contains animal-derived ingredient "${foundMarker}". Not suitable for a strict vegan lifestyle.`,
            extractedPhrase: phrase,
            sourceField: 'ingredients'
          });

          // Contradiction 1: Front label claimed "Plant-Based", "100% Plant", or "Vegan"
          const claims = food.claimsCheck || [];
          const plantClaim = claims.find((c) =>
            c.claim.toLowerCase().includes('plant') || c.claim.toLowerCase().includes('vegan')
          );
          if (plantClaim || food.productName.toLowerCase().includes('plant')) {
            contradictions.push({
              id: 'contra-vegan-plant',
              title: 'Front Label "Plant-Based" vs Animal Ingredients',
              claimOrInterpretation: plantClaim ? plantClaim.claim : 'Product marketed with plant-based branding',
              conflictingFact: `Contains animal-derived ${foundMarker}`,
              exactEvidencePhrase: phrase,
              severity: 'high',
              actionPrompt: 'Verify whether manufacturer uses mixed animal proteins despite plant-based marketing.'
            });
          }

          // Contradiction 2: Model's automated interpretation marked as Vegan despite animal marker
          if (food.dietarySuitability.isVegan) {
            contradictions.push({
              id: 'contra-model-vegan-mismatch',
              title: 'Model Interpretation Contradiction: Vegan Claim vs Extracted Text',
              claimOrInterpretation: 'Automated OCR classification rated product as "Vegan: Yes"',
              conflictingFact: `Visible ingredients list contains animal-derived "${foundMarker}"`,
              exactEvidencePhrase: phrase,
              severity: 'high',
              actionPrompt: 'Model interpretation overruled by physical label evidence.'
            });
          }
        } else if (!food.dietarySuitability.isVegan) {
          flags.push({
            id: 'diet-vegan-conflict-meta',
            preference: 'Vegan',
            preferenceType: 'diet',
            status: 'confirmed_conflict',
            title: 'Not Certified Vegan',
            explanation: food.dietarySuitability.notes || 'Product formulation contains animal or dairy byproducts.',
            extractedPhrase: 'Identified via formulation audit',
            sourceField: 'ingredients'
          });
        } else {
          flags.push({
            id: 'diet-vegan-safe',
            preference: 'Vegan',
            preferenceType: 'diet',
            status: 'safe',
            title: 'Complies with Vegan Profile',
            explanation: 'Zero animal meats, dairy derivatives, eggs, or honey identified in intact ingredients list.',
            extractedPhrase: 'All visible ingredients are plant or mineral derived.',
            sourceField: 'ingredients'
          });
        }
        break;
      }

      case 'Gluten-Free Diet': {
        const flagId = 'diet-gf-conflict';
        const userRes = userResolutions[flagId];

        const glutenMarkers = ['wheat', 'barley', 'rye', 'malt', 'brewer', 'spelt', 'semolina'];
        const foundMarker = glutenMarkers.find((m) => lowerIngredients.includes(m));

        if (foundMarker) {
          const phrase = extractEvidencePhrase(rawIngredients, foundMarker);
          flags.push({
            id: flagId,
            preference: 'Gluten-Free Diet',
            preferenceType: 'diet',
            status: userRes?.decision === 'approved_by_user' ? 'safe' : 'confirmed_conflict',
            title: userRes?.decision === 'approved_by_user'
              ? `User Permitted Gluten Ingredient: ${foundMarker.toUpperCase()}`
              : `Gluten Source Identified: ${foundMarker.toUpperCase()}`,
            explanation: `Directly contains gluten-bearing grain "${foundMarker}". Unsafe for celiac disease or gluten intolerance.`,
            extractedPhrase: phrase,
            sourceField: 'ingredients'
          });

          // Contradiction: Model marked as Gluten-Free
          if (food.dietarySuitability.isGlutenFree) {
            contradictions.push({
              id: 'contra-model-gf-mismatch',
              title: 'Model Interpretation Contradiction: Gluten-Free vs Wheat Ingredients',
              claimOrInterpretation: 'Initial analysis marked product as "Gluten-Free: Yes"',
              conflictingFact: `Extracted text contains gluten source "${foundMarker}"`,
              exactEvidencePhrase: phrase,
              severity: 'high',
              actionPrompt: 'Do not consume if you have celiac disease or severe gluten allergy.'
            });
          }
        } else if (lowerIngredients.includes('oats') && !lowerIngredients.includes('certified gluten-free')) {
          const oatRes = userResolutions['diet-gf-oats'];
          flags.push({
            id: 'diet-gf-oats',
            preference: 'Gluten-Free Diet',
            preferenceType: 'diet',
            status: oatRes?.decision === 'approved_by_user'
              ? 'safe'
              : oatRes?.decision === 'flagged_by_user'
              ? 'confirmed_conflict'
              : 'ambiguous_requires_confirmation',
            title: oatRes?.decision === 'approved_by_user'
              ? 'User Confirmed: Certified Gluten-Free Oats'
              : oatRes?.decision === 'flagged_by_user'
              ? 'User Flagged: Non-Certified Oats'
              : 'Non-Certified Oats Present',
            explanation: oatRes?.decision === 'approved_by_user'
              ? 'User confirmed that the package displays a certified gluten-free seal.'
              : 'Contains oats without explicit "Certified Gluten-Free" verification. High agricultural cross-contact risk with wheat.',
            extractedPhrase: extractEvidencePhrase(rawIngredients, 'oats'),
            sourceField: 'ingredients',
            ambiguityDetails: {
              term: 'Oats',
              possibleOrigins: ['Standard field oats (Gluten cross-contact)', 'Purity protocol oats (Certified GF)'],
              userPrompt: 'Are these oats certified gluten-free on the physical packaging seal?'
            }
          });
        } else if (!food.dietarySuitability.isGlutenFree) {
          flags.push({
            id: 'diet-gf-meta',
            preference: 'Gluten-Free Diet',
            preferenceType: 'diet',
            status: 'confirmed_conflict',
            title: 'Contains Gluten / Wheat',
            explanation: 'Cross-contact or gluten ingredients present.',
            extractedPhrase: 'Declared in allergen statement or flour base',
            sourceField: 'ingredients'
          });
        } else {
          flags.push({
            id: 'diet-gf-safe',
            preference: 'Gluten-Free Diet',
            preferenceType: 'diet',
            status: 'safe',
            title: 'No Gluten Ingredients Found',
            explanation: 'No wheat, barley, rye, or malt listed in verified ingredients panel.',
            extractedPhrase: 'Gluten-containing grains absent from visible label.',
            sourceField: 'ingredients'
          });
        }
        break;
      }

      case 'Low Sodium (Cardiac/DASH)': {
        const sodiumStr = food.nutrition.sodium.value || '';
        const sodiumNum = parseInt(sodiumStr.replace(/[^0-9]/g, ''), 10) || 0;
        const flagId = 'diet-sodium-conflict';
        const userRes = userResolutions[flagId];

        // FDA Low Sodium threshold is <= 140mg per serving.
        if (sodiumNum > 140) {
          const isHigh = sodiumNum >= 400;
          flags.push({
            id: flagId,
            preference: 'Low Sodium (Cardiac/DASH)',
            preferenceType: 'diet',
            status: userRes?.decision === 'approved_by_user' ? 'safe' : 'confirmed_conflict',
            title: userRes?.decision === 'approved_by_user'
              ? `User Permitted Sodium Level (${sodiumStr})`
              : isHigh ? `High Sodium Warning (${sodiumStr})` : `Exceeds Low Sodium Target (${sodiumStr})`,
            explanation: `FDA defines low sodium as <= 140mg per serving. This product provides ${sodiumStr} per serving (${food.nutrition.sodium.level} level).`,
            extractedPhrase: `Sodium: ${food.nutrition.sodium.value}`,
            sourceField: 'nutrition'
          });

          // Check if marketed as "Healthy", "Light", or "Wholesome"
          if (food.productName.toLowerCase().includes('healthy') || food.verdictSummary.toLowerCase().includes('heart')) {
            contradictions.push({
              id: 'contra-sodium-heart',
              title: 'Heart-Healthy Marketing vs High Sodium Content',
              claimOrInterpretation: 'Marketed as health or wellness food',
              conflictingFact: `Delivers ${sodiumStr} per serving, exceeding low-sodium limits`,
              exactEvidencePhrase: `Sodium ${sodiumStr}`,
              severity: 'high',
              actionPrompt: 'Check portion size if adhering to a low-sodium cardiac DASH diet.'
            });
          }

          // Contradiction: Model marked as Low Sodium
          if (food.dietarySuitability.isLowSodium) {
            contradictions.push({
              id: 'contra-model-sodium-mismatch',
              title: 'Model Interpretation Contradiction: Low Sodium Claim vs Facts',
              claimOrInterpretation: 'Initial analysis marked product as "Low Sodium: Yes"',
              conflictingFact: `Nutrition facts panel clearly reads Sodium ${sodiumStr} (>140mg threshold)`,
              exactEvidencePhrase: `Sodium ${sodiumStr}`,
              severity: 'high',
              actionPrompt: 'Model classification overturned by verified nutrition numbers.'
            });
          }
        } else {
          flags.push({
            id: 'diet-sodium-safe',
            preference: 'Low Sodium (Cardiac/DASH)',
            preferenceType: 'diet',
            status: 'safe',
            title: `Low Sodium Verified (${sodiumStr})`,
            explanation: `Contains ${sodiumStr} per serving, well within the FDA <= 140mg low-sodium guideline.`,
            extractedPhrase: `Sodium: ${food.nutrition.sodium.value}`,
            sourceField: 'nutrition'
          });
        }
        break;
      }

      case 'Diabetic / Sugar Watch': {
        const sugarStr = food.nutrition.totalSugars.value || '';
        const sugarNum = parseInt(sugarStr.replace(/[^0-9]/g, ''), 10) || 0;
        const flagId = 'diet-sugar-conflict';
        const userRes = userResolutions[flagId];

        if (sugarNum >= 10 || food.nutrition.totalSugars.level === 'high') {
          flags.push({
            id: flagId,
            preference: 'Diabetic / Sugar Watch',
            preferenceType: 'diet',
            status: userRes?.decision === 'approved_by_user' ? 'safe' : 'confirmed_conflict',
            title: userRes?.decision === 'approved_by_user'
              ? `User Permitted Sugar Level (${sugarStr})`
              : `Elevated Sugars (${sugarStr})`,
            explanation: `Delivers ${sugarStr} total sugars per serving, triggering rapid glycemic excursions.`,
            extractedPhrase: `Total Sugars: ${food.nutrition.totalSugars.value}`,
            sourceField: 'nutrition'
          });

          // Contradiction Check: Did front claim "No Added Sugar" or "Low Sugar"?
          const noSugarClaim = (food.claimsCheck || []).find((c) =>
            c.claim.toLowerCase().includes('sugar') || c.claim.toLowerCase().includes('keto')
          );
          if (noSugarClaim && sugarNum > 5) {
            contradictions.push({
              id: 'contra-sugar-claim',
              title: 'Front Claim vs Total Sugar Concentration',
              claimOrInterpretation: noSugarClaim.claim,
              conflictingFact: `Actual sugars extracted: ${sugarStr}`,
              exactEvidencePhrase: `Total Sugars: ${sugarStr}`,
              severity: 'high',
              actionPrompt: 'Inspect whether sugars are from fruit concentrates or hidden syrups.'
            });
          }
        } else {
          flags.push({
            id: 'diet-sugar-safe',
            preference: 'Diabetic / Sugar Watch',
            preferenceType: 'diet',
            status: 'safe',
            title: `Low Glycemic Sugars (${sugarStr})`,
            explanation: `Contains only ${sugarStr} sugars per serving with minimal glycemic impact.`,
            extractedPhrase: `Total Sugars: ${food.nutrition.totalSugars.value}`,
            sourceField: 'nutrition'
          });
        }
        break;
      }

      case 'Dairy-Free Diet': {
        const flagId = 'diet-dairy-conflict';
        const userRes = userResolutions[flagId];

        const dairyMarkers = ['milk', 'whey', 'casein', 'caseinate', 'butter', 'cream', 'cheese', 'lactose', 'yogurt'];
        const foundDairy = dairyMarkers.find((d) => lowerIngredients.includes(d));

        if (foundDairy) {
          const phrase = extractEvidencePhrase(rawIngredients, foundDairy);
          flags.push({
            id: flagId,
            preference: 'Dairy-Free Diet',
            preferenceType: 'diet',
            status: userRes?.decision === 'approved_by_user' ? 'safe' : 'confirmed_conflict',
            title: userRes?.decision === 'approved_by_user'
              ? `User Permitted Dairy Derivative: ${foundDairy.toUpperCase()}`
              : `Contains Dairy Derivative: ${foundDairy.toUpperCase()}`,
            explanation: `Explicitly lists milk-derived ingredient "${foundDairy}". Unsuitable for lactose intolerance or dairy allergy.`,
            extractedPhrase: phrase,
            sourceField: 'ingredients'
          });

          // Contradiction: Model marked as Dairy-Free
          if (food.dietarySuitability.isDairyFree) {
            contradictions.push({
              id: 'contra-model-dairy-mismatch',
              title: 'Model Interpretation Contradiction: Dairy-Free Claim vs Extracted Milk',
              claimOrInterpretation: 'Initial analysis marked product as "Dairy-Free: Yes"',
              conflictingFact: `Visible ingredients panel lists "${foundDairy}"`,
              exactEvidencePhrase: phrase,
              severity: 'high',
              actionPrompt: 'Model classification overturned by verified label evidence.'
            });
          }
        } else {
          flags.push({
            id: 'diet-dairy-safe',
            preference: 'Dairy-Free Diet',
            preferenceType: 'diet',
            status: 'safe',
            title: 'No Dairy Ingredients Found',
            explanation: 'Zero milk, whey, butter, or dairy proteins identified in visible text.',
            extractedPhrase: 'Dairy derivatives absent from ingredients list.',
            sourceField: 'ingredients'
          });
        }
        break;
      }

      default:
        break;
    }
  });

  // ----------------------------------------------------
  // 3. AMBIGUOUS INGREDIENTS DETECTION
  // ----------------------------------------------------
  AMBIGUOUS_DATABASE.forEach((item) => {
    const match = item.aliases.find((alias) => lowerIngredients.includes(alias));
    if (match) {
      const phrase = extractEvidencePhrase(rawIngredients, match);
      ambiguous.push({
        term: item.term,
        verbatimExcerpt: phrase,
        reason: item.reason,
        potentialSources: item.potentialSources,
        affectedLifestyles: item.affectedLifestyles
      });

      // If user has any affected lifestyle in their profile, generate an actionable ambiguity flag
      const matchedProfileDiet = (profile.diets || []).find((d) =>
        item.affectedLifestyles.includes(d)
      );
      if (matchedProfileDiet) {
        const flagId = `ambiguous-${item.term.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
        const userRes = userResolutions[flagId];

        flags.push({
          id: flagId,
          preference: matchedProfileDiet,
          preferenceType: 'diet',
          status: userRes?.decision === 'approved_by_user'
            ? 'safe'
            : userRes?.decision === 'flagged_by_user'
            ? 'confirmed_conflict'
            : 'ambiguous_requires_confirmation',
          title: userRes?.decision === 'approved_by_user'
            ? `User Confirmed Plant Origin: ${item.term}`
            : userRes?.decision === 'flagged_by_user'
            ? `User Flagged Incompatible: ${item.term}`
            : `Ambiguous Source: ${item.term}`,
          explanation: userRes?.decision === 'approved_by_user'
            ? 'User verified physical packaging indicates 100% plant-derived origin.'
            : userRes?.decision === 'flagged_by_user'
            ? 'User marked this additive as animal-derived or unacceptable for their profile.'
            : item.reason,
          extractedPhrase: phrase,
          sourceField: 'ingredients',
          ambiguityDetails: {
            term: item.term,
            possibleOrigins: item.potentialSources,
            userPrompt: `Does your packaging indicate whether ${item.term} is 100% plant-derived?`
          },
          userResolution: userRes ? {
            resolved: true,
            decision: userRes.decision,
            timestamp: userRes.timestamp
          } : undefined
        });
      }
    }
  });

  // ----------------------------------------------------
  // 4. MODEL INTERPRETATION VS EXTRACTED TEXT CONTRADICTIONS
  // ----------------------------------------------------
  // Model scored health rating high ("Excellent") but food is classified as NOVA 4 ultra-processed
  if (food.healthRating === 'Excellent' && food.novaGroup === 4) {
    contradictions.push({
      id: 'contra-excellent-upf',
      title: 'High Rating vs Ultra-Processed Food Classification',
      claimOrInterpretation: `Model scored food ${food.healthScore}/100 (Excellent)`,
      conflictingFact: `Classified as NOVA Group 4 (Ultra-Processed Food with industrial additives)`,
      exactEvidencePhrase: food.novaTitle,
      severity: 'medium',
      actionPrompt: 'Nutritional density is high, but extensive industrial processing markers are present.'
    });
  }

  // Calculate evidence audit metrics
  const totalAnchors = flags.length + (food.ingredientsList || []).length;
  const confirmedCount = flags.filter((f) => f.status === 'safe' || f.status === 'confirmed_conflict').length;
  const uncertainCount = flags.filter((f) => f.status === 'unresolved_missing_data').length;
  const groundedPercentage = totalAnchors > 0
    ? Math.round(((totalAnchors - uncertainCount) / totalAnchors) * 100)
    : 100;

  const auditReport: EvidenceAuditReport = {
    groundedPercentage,
    totalEvidenceAnchors: totalAnchors,
    confirmedCount,
    uncertainCount,
    contradictionCount: contradictions.length,
    ambiguousCount: ambiguous.length,
    missingDataCount: uncertainCount,
    nonMedicalDisclaimer:
      'LEGAL & SCIENTIFIC DISCLAIMER: LabelLens evidence matching is provided for nutritional transparency and educational analysis only. LabelLens DOES NOT certify products as allergen-free or legally compliant with dietary regimens, nor does it provide medical advice. Individuals with anaphylactic food allergies, celiac disease, or clinical dietary restrictions must inspect physical packaging and consult a registered healthcare provider.'
  };

  return { flags, contradictions, ambiguous, auditReport };
}
