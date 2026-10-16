import { FoodAnalysisResult } from '../types/food';

export interface SampleFoodItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  shortDesc: string;
  imageUrl: string;
  labelConditionTag: 'Contradiction Test' | 'Ambiguous E471 Test' | 'Torn & Cut-Off Label' | 'Pristine & Clear' | 'Motion Blurred';
  data: FoodAnalysisResult;
}

export const SAMPLE_FOODS: SampleFoodItem[] = [
  {
    id: 'sample-plant-contradiction',
    name: 'Plant-Powered Whey Energy Bar',
    brand: 'GreenVitality Foods',
    category: 'Protein Bars',
    shortDesc: 'CONTRADICTION TEST: Front label boasts "100% Plant Power", but ingredients verbatim reveal Whey Protein (Milk) and Honey.',
    imageUrl: 'https://images.unsplash.com/photo-1622484216847-f3c58ce245b7?auto=format&fit=crop&w=600&q=80',
    labelConditionTag: 'Contradiction Test',
    data: {
      id: 'sample-plant-contradiction',
      timestamp: Date.now(),
      productName: 'Plant-Powered Protein Crisp',
      brand: 'GreenVitality Foods',
      category: 'Protein Bars',
      servingSize: '1 bar (55g)',
      servingsPerContainer: '1',
      healthScore: 58,
      healthRating: 'Moderate',
      healthScoreColor: 'amber',
      verdictSummary: 'CONTRADICTION DETECTED. While the front marketing boldly claims "100% Plant Powered Energy", the back ingredient statement clearly lists Whey Protein Isolate (Milk) and Honey. Contains 15g protein but is completely unsuitable for a strict vegan or dairy-free diet.',
      
      legibility: {
        overallQuality: 'clear',
        qualityScore: 94,
        issuesDetected: [],
        issueDescriptions: ['High resolution flat scan. All ingredient text and nutrition values are 100% legible.'],
        needsClearerImage: false,
        clarificationMessage: 'Label is sharp. Clear contradiction identified between front marketing claims and back-of-pack ingredients.'
      },

      allergenSafetyAudit: {
        isAllergenSectionComplete: true,
        safetyWarning: 'Explicitly contains Milk (Whey protein) and Soy (Lecithin). Directly contradicts front-of-pack plant claims.',
        allergenDetails: [
          {
            allergen: 'Milk / Dairy',
            presence: 'confirmed_present',
            evidence: 'Verbatim text read: "Whey Protein Isolate (Milk)"',
            confidence: 'high'
          },
          {
            allergen: 'Soy',
            presence: 'confirmed_present',
            evidence: 'Verbatim text read: "Soy Lecithin"',
            confidence: 'high'
          },
          {
            allergen: 'Peanuts',
            presence: 'may_contain_traces',
            evidence: 'Allergen advisory: "Manufactured in a facility that also processes peanuts"',
            confidence: 'high'
          }
        ]
      },

      novaGroup: 4,
      novaTitle: 'Group 4: Ultra-Processed Food',
      novaReason: 'Contains protein isolates (Whey Isolate, Soy Crisp), fractionated palm oil, and industrial syrups.',
      nutrition: {
        calories: '210 kcal',
        caloriesCertainty: { status: 'confirmed', labelEvidence: 'Directly read: "Calories 210"' },
        totalFat: { value: '7g (9% DV)', level: 'moderate', certainty: { status: 'confirmed', labelEvidence: 'Read: "Total Fat 7g"' } },
        saturatedFat: { value: '2.5g (13% DV)', level: 'moderate', certainty: { status: 'confirmed', labelEvidence: 'Read: "Sat Fat 2.5g"' } },
        sodium: { value: '180mg (8% DV)', level: 'moderate', certainty: { status: 'confirmed', labelEvidence: 'Read: "Sodium 180mg"' } },
        totalCarbs: { value: '22g (8% DV)', level: 'moderate', certainty: { status: 'confirmed', labelEvidence: 'Read: "Total Carb 22g"' } },
        dietaryFiber: { value: '3g (11% DV)', level: 'moderate', certainty: { status: 'confirmed', labelEvidence: 'Read: "Fiber 3g"' } },
        totalSugars: { value: '10g', level: 'moderate', certainty: { status: 'confirmed', labelEvidence: 'Read: "Total Sugars 10g"' } },
        addedSugars: { value: '8g (16% DV)', level: 'moderate', certainty: { status: 'confirmed', labelEvidence: 'Read: "Includes 8g Added Sugars"' } },
        protein: { value: '15g (30% DV)', level: 'high', certainty: { status: 'confirmed', labelEvidence: 'Read: "Protein 15g"' } }
      },
      positives: [
        'Delivers 15g protein per bar',
        'Provides 3g dietary fiber'
      ],
      concerns: [
        'MAJOR CONTRADICTION: Marketed as "Plant-Powered" but uses bovine whey protein isolate',
        'Contains honey, making it non-vegan regardless of dairy',
        'Contains fractionated palm oil and 8g added sugars'
      ],
      ingredientsRaw: 'Soy Protein Crisps, Whey Protein Isolate (Milk), Brown Rice Syrup, Rolled Oats, Honey, Palm Kernel Oil, Cocoa Powder, Soy Lecithin, Natural Vanilla Flavor.',
      ingredientsCertainty: {
        status: 'confirmed',
        labelEvidence: 'Intact, high-contrast flat scan.'
      },
      ingredientsList: [
        { name: 'Soy Protein Crisps', type: 'healthy_nutrient', description: 'Extruded plant protein isolate', concernLevel: 'safe', exactPhrase: 'Soy Protein Crisps', certainty: { status: 'confirmed', labelEvidence: 'Read verbatim' } },
        { name: 'Whey Protein Isolate (Milk)', type: 'additive', description: 'Animal dairy protein derivative', concernLevel: 'avoid', exactPhrase: 'Whey Protein Isolate (Milk)', certainty: { status: 'confirmed', labelEvidence: 'Read verbatim: "Whey Protein Isolate (Milk)"' } },
        { name: 'Brown Rice Syrup', type: 'hidden_sugar', description: 'Liquid maltose sweetener', concernLevel: 'caution', exactPhrase: 'Brown Rice Syrup', certainty: { status: 'confirmed', labelEvidence: 'Read verbatim' } },
        { name: 'Honey', type: 'hidden_sugar', description: 'Bee-derived sweetener', concernLevel: 'caution', exactPhrase: 'Honey', certainty: { status: 'confirmed', labelEvidence: 'Read verbatim: "Honey"' } }
      ],
      additives: [
        { codeOrName: 'Soy Lecithin (E322)', function: 'Emulsifier', safetyRating: 'Generally Safe', healthNotes: 'Plant-derived lipid emulsifier.', certainty: { status: 'confirmed', labelEvidence: 'Read: "Soy Lecithin"' } }
      ],
      allergensDetected: ['Milk / Dairy', 'Soy'],
      mayContainAllergens: ['Peanuts'],
      dietarySuitability: {
        isVegan: false,
        isVegetarian: true,
        isGlutenFree: false,
        isDairyFree: false,
        isKetoFriendly: false,
        isLowSodium: true,
        isLowSugar: false,
        notes: 'Strictly non-vegan and non-dairy-free due to whey protein isolate and honey.'
      },
      claimsCheck: [
        {
          claim: '100% Plant-Powered Energy',
          verdict: 'Misleading',
          explanation: 'Blatant contradiction: The second primary ingredient is bovine Whey Protein Isolate (Milk), an animal dairy product.',
          certainty: { status: 'confirmed', labelEvidence: 'Verified against "Whey Protein Isolate (Milk)"' },
          supportingLabelPhrase: 'Whey Protein Isolate (Milk)'
        }
      ],
      healthierAlternatives: [
        {
          title: 'Authentic 100% Pea & Brown Rice Bar',
          category: 'True Plant-Based Swap',
          whyBetter: 'Uses strictly organic pea and hemp protein; zero animal dairy fractions or honey.',
          exampleFoods: 'No Cow Bar or Aloha Organic Plant Protein Bar.'
        }
      ],
      dietaryComparisonFlags: [
        {
          id: 'flag-contra-vegan',
          preference: 'Vegan',
          preferenceType: 'diet',
          status: 'contradiction_detected',
          title: 'Contradiction: Front "Plant-Powered" vs Whey & Honey',
          explanation: 'The front package states "100% Plant-Powered", but the ingredient list reveals Whey Protein Isolate (Milk) and Honey.',
          extractedPhrase: 'Whey Protein Isolate (Milk), Honey',
          sourceField: 'ingredients',
          contradictionDetails: {
            claimedOrInterpreted: 'Front packaging proclaims "100% Plant-Powered Energy"',
            conflictingEvidence: 'Ingredients list verbatim reads "Whey Protein Isolate (Milk), Honey"',
            whyContradicts: 'Whey is an animal dairy byproduct and honey is bee-derived; neither is plant-derived.'
          }
        },
        {
          id: 'flag-contra-dairy',
          preference: 'Dairy-Free Diet',
          preferenceType: 'diet',
          status: 'confirmed_conflict',
          title: 'Dairy Contradiction: Contains Whey Protein',
          explanation: 'Product contains animal whey protein isolate despite plant-heavy front branding.',
          extractedPhrase: 'Whey Protein Isolate (Milk)',
          sourceField: 'ingredients'
        }
      ],
      contradictionsDetected: [
        {
          id: 'contra-whey-plant',
          title: 'Front "100% Plant Powered" vs Whey Milk Derivative',
          claimOrInterpretation: '100% Plant-Powered Energy (Front Label)',
          conflictingFact: 'Second ingredient is Whey Protein Isolate (Milk)',
          exactEvidencePhrase: 'Whey Protein Isolate (Milk)',
          severity: 'high',
          actionPrompt: 'Do not consume if following a vegan, strict dairy-free, or cow milk allergic diet.'
        }
      ],
      ambiguousIngredients: []
    }
  },
  {
    id: 'sample-ambiguous-crackers',
    name: 'Harvest Multigrain Crackers',
    brand: 'Harvest Hearth Bakery',
    category: 'Crackers & Biscuits',
    shortDesc: 'AMBIGUITY TEST: Contains Mono- and Diglycerides (E471) & Natural Flavors of indeterminate animal/plant origin.',
    imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80',
    labelConditionTag: 'Ambiguous E471 Test',
    data: {
      id: 'sample-ambiguous-crackers',
      timestamp: Date.now(),
      productName: 'Harvest Multigrain Artisan Crackers',
      brand: 'Harvest Hearth Bakery',
      category: 'Crackers & Biscuits',
      servingSize: '6 crackers (30g)',
      servingsPerContainer: '8',
      healthScore: 64,
      healthRating: 'Moderate',
      healthScoreColor: 'lime',
      verdictSummary: 'AMBIGUOUS INGREDIENTS DETECTED. Formulated with whole wheat flour and rolled oats, but includes Mono- and Diglycerides (E471) and Natural Flavors without declaring plant or animal origin. Requires user confirmation for strict Vegan, Halal, or Kosher adherence.',
      
      legibility: {
        overallQuality: 'clear',
        qualityScore: 96,
        issuesDetected: [],
        issueDescriptions: ['High resolution flat scan. Ingredient text is fully legible.'],
        needsClearerImage: false,
        clarificationMessage: 'Text is clear, but chemical origins of E471 and Natural Flavors are legally ambiguous on the label.'
      },

      allergenSafetyAudit: {
        isAllergenSectionComplete: true,
        safetyWarning: 'Contains Wheat and Soy. No dairy or nut ingredients declared.',
        allergenDetails: [
          { allergen: 'Wheat / Gluten', presence: 'confirmed_present', evidence: 'Verbatim: "Whole Wheat Flour"', confidence: 'high' },
          { allergen: 'Soy', presence: 'confirmed_present', evidence: 'Verbatim: "Soybean Oil"', confidence: 'high' }
        ]
      },

      novaGroup: 4,
      novaTitle: 'Group 4: Ultra-Processed Food',
      novaReason: 'Contains synthesized mono- and diglycerides emulsifiers and refined vegetable oils.',
      nutrition: {
        calories: '130 kcal',
        caloriesCertainty: { status: 'confirmed', labelEvidence: 'Read: "Calories 130"' },
        totalFat: { value: '4.5g (6% DV)', level: 'low', certainty: { status: 'confirmed', labelEvidence: 'Read: "Total Fat 4.5g"' } },
        saturatedFat: { value: '0.5g (3% DV)', level: 'low', certainty: { status: 'confirmed', labelEvidence: 'Read: "Sat Fat 0.5g"' } },
        sodium: { value: '190mg (8% DV)', level: 'moderate', certainty: { status: 'confirmed', labelEvidence: 'Read: "Sodium 190mg"' } },
        totalCarbs: { value: '20g (7% DV)', level: 'moderate', certainty: { status: 'confirmed', labelEvidence: 'Read: "Total Carb 20g"' } },
        dietaryFiber: { value: '3g (11% DV)', level: 'moderate', certainty: { status: 'confirmed', labelEvidence: 'Read: "Fiber 3g"' } },
        totalSugars: { value: '2g', level: 'low', certainty: { status: 'confirmed', labelEvidence: 'Read: "Sugars 2g"' } },
        protein: { value: '3g', level: 'low', certainty: { status: 'confirmed', labelEvidence: 'Read: "Protein 3g"' } }
      },
      positives: [
        'Contains whole grain wheat as first ingredient',
        'Low saturated fat (0.5g) and low sugar (2g)'
      ],
      concerns: [
        'AMBIGUOUS INGREDIENT: E471 (Mono- and diglycerides) may be plant or animal derived',
        'Unspecified Natural Flavors carrier sources',
        'Contains gluten (Whole Wheat Flour)'
      ],
      ingredientsRaw: 'Whole Wheat Flour, Enriched Flour, Soybean Oil, Sugar, Salt, Mono- and Diglycerides (E471), Baking Soda, Natural Flavors.',
      ingredientsCertainty: {
        status: 'confirmed',
        labelEvidence: 'Intact label text.'
      },
      ingredientsList: [
        { name: 'Whole Wheat Flour', type: 'whole_food', description: 'Whole grain wheat base', concernLevel: 'safe', exactPhrase: 'Whole Wheat Flour', certainty: { status: 'confirmed', labelEvidence: 'Read verbatim' } },
        { name: 'Mono- and Diglycerides (E471)', type: 'additive', description: 'Emulsifier of indeterminate plant or animal tallow origin', concernLevel: 'caution', exactPhrase: 'Mono- and Diglycerides (E471)', certainty: { status: 'confirmed', labelEvidence: 'Read: "Mono- and Diglycerides (E471)"' } },
        { name: 'Natural Flavors', type: 'flavor_color', description: 'Aromatic essences from unspecified botanical or animal sources', concernLevel: 'caution', exactPhrase: 'Natural Flavors', certainty: { status: 'confirmed', labelEvidence: 'Read: "Natural Flavors"' } }
      ],
      additives: [
        { codeOrName: 'Mono- and Diglycerides (E471)', function: 'Emulsifier', safetyRating: 'Use Caution', healthNotes: 'Widely used dough conditioner. Can be derived from plant fats or animal slaughterhouse fats.', certainty: { status: 'confirmed', labelEvidence: 'Read on center label' } }
      ],
      allergensDetected: ['Wheat / Gluten', 'Soy'],
      mayContainAllergens: [],
      dietarySuitability: {
        isVegan: false,
        isVegetarian: true,
        isGlutenFree: false,
        isDairyFree: true,
        isKetoFriendly: false,
        isLowSodium: true,
        isLowSugar: true,
        notes: 'Vegan status cannot be confirmed without manufacturer verification of E471 source.'
      },
      claimsCheck: [],
      healthierAlternatives: [],
      dietaryComparisonFlags: [
        {
          id: 'flag-ambig-e471',
          preference: 'Vegan',
          preferenceType: 'diet',
          status: 'ambiguous_requires_confirmation',
          title: 'Ambiguous Origin: Mono- and Diglycerides (E471)',
          explanation: 'E471 can be manufactured from either soybean/palm oil or animal slaughterhouse fats (pork or beef tallow). The label does not state vegetable origin.',
          extractedPhrase: 'Mono- and Diglycerides (E471)',
          sourceField: 'ingredients',
          ambiguityDetails: {
            term: 'Mono- and Diglycerides (E471)',
            possibleOrigins: ['Plant-derived (Soybean, Palm oil)', 'Animal-derived (Pork or beef tallow)'],
            userPrompt: 'Does your box display a "100% Vegetable Source" or vegan certification seal?'
          }
        }
      ],
      contradictionsDetected: [],
      ambiguousIngredients: [
        {
          term: 'Mono- and Diglycerides (E471)',
          verbatimExcerpt: 'Mono- and Diglycerides (E471)',
          reason: 'Can be manufactured from either plant oils or animal slaughterhouse tallow. Source is omitted on packaging.',
          potentialSources: ['Plant oils (Soy, Palm)', 'Animal fats (Bovine or Porcine tallow)'],
          affectedLifestyles: ['Vegan', 'Vegetarian', 'Halal', 'Kosher']
        },
        {
          term: 'Natural Flavors',
          verbatimExcerpt: 'Natural Flavors',
          reason: 'Broad regulatory classification that may include animal-derived carriers.',
          potentialSources: ['Botanical extracts', 'Animal fractions'],
          affectedLifestyles: ['Vegan']
        }
      ]
    }
  },
  {
    id: 'sample-torn-wrapper',
    name: 'Torn Peanut Honey Crunch Bar',
    brand: 'TrailPeak Provisions',
    category: 'Snack Bars',
    shortDesc: 'TEST CASE: Torn & crinkled wrapper cutting through the ingredient and allergen statement.',
    imageUrl: 'https://images.unsplash.com/photo-1606149059549-6042addafc5a?auto=format&fit=crop&w=600&q=80',
    labelConditionTag: 'Torn & Cut-Off Label',
    data: {
      id: 'sample-torn-wrapper',
      timestamp: Date.now(),
      productName: 'Peanut Honey Crunch Bar (Partial Extraction)',
      brand: 'TrailPeak Provisions',
      category: 'Snack Bars',
      servingSize: '1 bar (~40g estimated)',
      servingsPerContainer: 'Unreadable (Torn edge)',
      healthScore: 52,
      healthRating: 'Moderate',
      healthScoreColor: 'amber',
      verdictSummary: 'Analysis performed with HIGH UNCERTAINTY. The packaging wrapper is torn horizontally through the bottom of the ingredients panel and the allergen advisory statement. While rolled oats and peanuts are partially visible, cross-contamination warnings cannot be confirmed from the visible evidence.',
      
      legibility: {
        overallQuality: 'partially_readable',
        qualityScore: 45,
        issuesDetected: ['partial_obstruction_or_tear', 'crinkled_packaging', 'cut_off_margins'],
        issueDescriptions: [
          'Right margin of ingredient list is torn away across lines 3-5.',
          'Allergen advisory box is sliced through the words "May contain..." leaving remainder missing.',
          'Foil wrapper wrinkles create optical distortion over the sodium numerical digit.'
        ],
        needsClearerImage: true,
        clarificationMessage: 'The wrapper is torn across the allergen block and right-hand ingredients. Please upload an intact packaging photo or manually confirm if this product contains tree nuts or wheat.'
      },

      allergenSafetyAudit: {
        isAllergenSectionComplete: false,
        safetyWarning: 'WARNING: Missing OCR output is NOT proof of allergen absence! Because the label is torn across the advisory block, this product CANNOT be assumed free of tree nuts, wheat, or dairy.',
        allergenDetails: [
          {
            allergen: 'Peanuts',
            presence: 'confirmed_present',
            evidence: 'Verbatim text read: "Roast... Pean...ts, Salt"',
            confidence: 'high'
          },
          {
            allergen: 'Tree Nuts',
            presence: 'inconclusive_unreadable',
            evidence: 'Tear begins after "May contain traces of almon..."; rest of line missing',
            confidence: 'low'
          },
          {
            allergen: 'Soy',
            presence: 'inconclusive_unreadable',
            evidence: 'Fragment read: "...so...lecith..." (torn before completion)',
            confidence: 'medium'
          },
          {
            allergen: 'Gluten / Wheat',
            presence: 'not_detected_in_visible_text',
            evidence: 'Not present in visible fragments; however 30% of text is missing',
            confidence: 'low'
          }
        ]
      },

      novaGroup: 4,
      novaTitle: 'Group 4: Ultra-Processed Food (Probable)',
      novaReason: 'Contains fractionated vegetable fats and industrial syrups in visible fragments.',
      nutrition: {
        calories: '185 kcal (approx)',
        caloriesCertainty: {
          status: 'confirmed',
          labelEvidence: 'Directly read: "Calories 185"'
        },
        totalFat: {
          value: '8g',
          level: 'moderate',
          certainty: {
            status: 'confirmed',
            labelEvidence: 'Directly read: "Total Fat 8g (10% DV)"'
          }
        },
        saturatedFat: {
          value: '1.5g',
          level: 'low',
          certainty: {
            status: 'confirmed',
            labelEvidence: 'Directly read: "Sat Fat 1.5g"'
          }
        },
        sodium: {
          value: '1?0mg (unclear: 140 or 180mg)',
          level: 'moderate',
          certainty: {
            status: 'uncertain',
            labelEvidence: 'Fold crease over middle digit: text reads "Sodi... 1[crease]0mg"',
            notes: 'Requires manual confirmation between 140mg or 180mg.'
          }
        },
        totalCarbs: {
          value: '24g',
          level: 'moderate',
          certainty: {
            status: 'confirmed',
            labelEvidence: 'Directly read: "Total Carb 24g"'
          }
        },
        dietaryFiber: {
          value: '3g',
          level: 'moderate',
          certainty: {
            status: 'confirmed',
            labelEvidence: 'Directly read: "Fiber 3g"'
          }
        },
        totalSugars: {
          value: '11g',
          level: 'high',
          certainty: {
            status: 'confirmed',
            labelEvidence: 'Directly read: "Total Sugars 11g"'
          }
        },
        addedSugars: {
          value: '9g',
          level: 'moderate',
          certainty: {
            status: 'confirmed',
            labelEvidence: 'Directly read: "Incl. 9g Added Sugars"'
          }
        },
        protein: {
          value: '5g',
          level: 'moderate',
          certainty: {
            status: 'confirmed',
            labelEvidence: 'Directly read: "Protein 5g"'
          }
        }
      },
      positives: [
        'Contains whole rolled oats visible in first ingredients',
        'Provides 5g of protein from roasted peanuts'
      ],
      concerns: [
        'UNRESOLVED ALLERGEN HAZARD: Cannot rule out tree nuts or wheat due to torn packaging',
        'Sodium value is obscured by packaging fold (140mg vs 180mg uncertain)'
      ],
      ingredientsRaw: 'Whole Grain Oats, Roasted Pean...ts, Brown Rice Sy... [TORN] ...so...lecith... [TORN] ...Natural Fla... [TORN] ...Contains: Peanuts. May contain: Almon... [TORN]',
      ingredientsCertainty: {
        status: 'uncertain',
        labelEvidence: 'Right third of paragraph is torn off; ellipses indicate incomplete words.',
        notes: 'Incomplete OCR extraction: 4 ingredients truncated.'
      },
      ingredientsList: [
        {
          name: 'Whole Grain Oats',
          type: 'whole_food',
          description: 'Intact cereal grain base',
          concernLevel: 'safe',
          exactPhrase: 'Whole Grain Oats',
          certainty: { status: 'confirmed', labelEvidence: 'Clearly visible: "Whole Grain Oats"' }
        },
        {
          name: 'Roasted Peanuts',
          type: 'whole_food',
          description: 'Roasted legumes supplying plant protein',
          concernLevel: 'safe',
          exactPhrase: 'Roasted Pean...ts',
          certainty: { status: 'confirmed', labelEvidence: 'Read: "Roasted Pean...ts"' }
        }
      ],
      additives: [],
      allergensDetected: ['Peanuts'],
      mayContainAllergens: [],
      uncertainAllergens: ['Tree Nuts (Almonds)', 'Soy', 'Wheat / Gluten'],
      dietarySuitability: {
        isVegan: false,
        isVegetarian: true,
        isGlutenFree: false,
        isDairyFree: false,
        isKetoFriendly: false,
        isLowSodium: true,
        isLowSugar: false,
        notes: 'Cannot guarantee gluten-free or dairy-free status until unreadable torn text is manually verified.',
        uncertainties: ['Gluten-Free status unverified (oats source torn)', 'Dairy-free status unverified']
      },
      claimsCheck: [],
      healthierAlternatives: [],
      dietaryComparisonFlags: [
        {
          id: 'flag-torn-nuts',
          preference: 'Tree Nuts',
          preferenceType: 'allergy',
          status: 'unresolved_missing_data',
          title: 'Unresolved Risk: Tree Nuts (Torn Advisory)',
          explanation: 'Tear begins directly after "May contain traces of almon..."; remaining allergens missing. Absence of OCR is not proof of absence.',
          extractedPhrase: 'May contain: Almon... [TORN]',
          sourceField: 'allergen_statement'
        }
      ],
      contradictionsDetected: [],
      ambiguousIngredients: []
    }
  },
  {
    id: 'sample-almond-butter',
    name: '100% Organic Raw Almond Butter',
    brand: 'PureHarvest Organics',
    category: 'Nut Butters',
    shortDesc: 'MATCHING EVIDENCE TEST: Pristine, flat, high-contrast label with 100% confirmed OCR extraction and zero contradictions.',
    imageUrl: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=600&q=80',
    labelConditionTag: 'Pristine & Clear',
    data: {
      id: 'sample-almond-butter',
      timestamp: Date.now(),
      productName: '100% Organic Raw Almond Butter',
      brand: 'PureHarvest Organics',
      category: 'Nut Butters',
      servingSize: '2 tbsp (32g)',
      servingsPerContainer: '14 servings',
      healthScore: 94,
      healthRating: 'Excellent',
      healthScoreColor: 'green',
      verdictSummary: 'Extracted with 100% CONFIDENCE. The flat, high-contrast label is pristine. Made from a single minimally processed ingredient: stone-ground organic almonds. Zero added sugars, 0mg sodium, and zero preservatives.',
      
      legibility: {
        overallQuality: 'clear',
        qualityScore: 98,
        issuesDetected: [],
        issueDescriptions: ['High resolution, sharp focus, even studio lighting, and zero obstructions.'],
        needsClearerImage: false,
        clarificationMessage: 'Label is exceptionally legible. All nutrition numbers and single-ingredient statement are 100% confirmed.'
      },

      allergenSafetyAudit: {
        isAllergenSectionComplete: true,
        safetyWarning: 'Label is complete. Explicitly declares Tree Nuts (Almonds).',
        allergenDetails: [
          { allergen: 'Tree Nuts (Almonds)', presence: 'confirmed_present', evidence: 'Single ingredient: "100% Certified Organic Dry-Roasted Almonds"', confidence: 'high' },
          { allergen: 'Peanuts', presence: 'may_contain_traces', evidence: 'Facility advisory read: "Manufactured on equipment that also processes peanuts"', confidence: 'high' }
        ]
      },

      novaGroup: 1,
      novaTitle: 'Group 1: Minimally Processed Food',
      novaReason: 'Only mechanical grinding of raw almonds. No chemical extraction or synthetic additives.',
      nutrition: {
        calories: '190 kcal',
        caloriesCertainty: { status: 'confirmed', labelEvidence: 'Directly read: "Calories 190"' },
        totalFat: { value: '17g (22% DV)', level: 'moderate', certainty: { status: 'confirmed', labelEvidence: 'Read: "Total Fat 17g"' } },
        saturatedFat: { value: '1.5g (8% DV)', level: 'low', certainty: { status: 'confirmed', labelEvidence: 'Read: "Sat Fat 1.5g"' } },
        sodium: { value: '0mg (0% DV)', level: 'low', certainty: { status: 'confirmed', labelEvidence: 'Read: "Sodium 0mg"' } },
        totalCarbs: { value: '6g (2% DV)', level: 'low', certainty: { status: 'confirmed', labelEvidence: 'Read: "Total Carb 6g"' } },
        dietaryFiber: { value: '4g (14% DV)', level: 'high', certainty: { status: 'confirmed', labelEvidence: 'Read: "Dietary Fiber 4g"' } },
        totalSugars: { value: '1g (Naturally occurring)', level: 'low', certainty: { status: 'confirmed', labelEvidence: 'Read: "Total Sugars 1g"' } },
        addedSugars: { value: '0g (0% DV)', level: 'low', certainty: { status: 'confirmed', labelEvidence: 'Read: "Includes 0g Added Sugars"' } },
        protein: { value: '7g (14% DV)', level: 'high', certainty: { status: 'confirmed', labelEvidence: 'Read: "Protein 7g"' } },
        keyMicronutrients: [
          { name: 'Vitamin E', amount: '7.8mg', dailyValuePercentage: '50%', certainty: { status: 'confirmed', labelEvidence: 'Read clearly' } },
          { name: 'Magnesium', amount: '89mg', dailyValuePercentage: '21%', certainty: { status: 'confirmed', labelEvidence: 'Read clearly' } }
        ]
      },
      positives: [
        'Single ingredient: 100% organic dry-roasted almonds',
        'Zero added sugars, salt, or preservatives',
        'Rich in Vitamin E and monounsaturated fatty acids',
        '7g high-quality plant protein and 4g fiber'
      ],
      concerns: [
        'Calorically dense (190 kcal per 2 tbsp)'
      ],
      ingredientsRaw: '100% Certified Organic Dry-Roasted Almonds.',
      ingredientsCertainty: {
        status: 'confirmed',
        labelEvidence: '100% complete and legible text.'
      },
      ingredientsList: [
        {
          name: 'Organic Dry-Roasted Almonds',
          type: 'whole_food',
          description: 'Whole tree nuts rich in vitamin E and fiber',
          concernLevel: 'safe',
          exactPhrase: '100% Certified Organic Dry-Roasted Almonds',
          certainty: { status: 'confirmed', labelEvidence: 'Read clearly on center label' }
        }
      ],
      additives: [],
      allergensDetected: ['Tree Nuts (Almonds)'],
      mayContainAllergens: ['Peanuts'],
      dietarySuitability: {
        isVegan: true,
        isVegetarian: true,
        isGlutenFree: true,
        isDairyFree: true,
        isKetoFriendly: true,
        isLowSodium: true,
        isLowSugar: true,
        notes: 'All dietary statuses confirmed with 100% certainty from single ingredient.'
      },
      claimsCheck: [
        { claim: '100% Pure Almonds', verdict: 'Accurate', explanation: 'Ingredients confirm only almonds.', certainty: { status: 'confirmed', labelEvidence: 'Verified' } }
      ],
      healthierAlternatives: [],
      dietaryComparisonFlags: [
        {
          id: 'flag-almond-vegan',
          preference: 'Vegan',
          preferenceType: 'diet',
          status: 'safe',
          title: '100% Plant-Based Compliant',
          explanation: 'Contains exclusively dry-roasted organic almonds. Zero animal or dairy byproducts.',
          extractedPhrase: '100% Certified Organic Dry-Roasted Almonds',
          sourceField: 'ingredients'
        },
        {
          id: 'flag-almond-sodium',
          preference: 'Low Sodium (Cardiac/DASH)',
          preferenceType: 'diet',
          status: 'safe',
          title: 'Zero Sodium (0mg)',
          explanation: 'Contains zero added salt; natural sodium content is 0mg.',
          extractedPhrase: 'Sodium 0mg (0% DV)',
          sourceField: 'nutrition'
        }
      ],
      contradictionsDetected: [],
      ambiguousIngredients: []
    }
  }
];
