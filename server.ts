import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Increase JSON body limit for photo scanning (base64)
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Candidate models in priority order for resilience against upstream load spikes
const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite'
];

async function generateWithFallback(options: {
  contents: any;
  config?: any;
}) {
  let lastError: any = null;
  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: options.config,
        });
        if (response.text) {
          return { text: response.text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini API] Model ${model} attempt ${attempt + 1} failed: ${err?.message || err}`);
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
  }
  throw lastError || new Error('All model candidates failed to respond.');
}

// Common certainty schema definition
const certaintySchema = {
  type: Type.OBJECT,
  properties: {
    status: { type: Type.STRING, description: 'confirmed, uncertain, or unreadable' },
    labelEvidence: { type: Type.STRING, description: 'Exact quote or visual observation from label supporting this value' },
    notes: { type: Type.STRING, description: 'Explanation if uncertain, blurry, or extrapolated' }
  },
  required: ['status', 'labelEvidence']
};

// Response schema for detailed food analysis
const foodAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    productName: { type: Type.STRING, description: 'Brand and product name detected from package' },
    brand: { type: Type.STRING, description: 'Manufacturer or brand name' },
    category: { type: Type.STRING, description: 'E.g. Snack Bar, Breakfast Cereal, Soda, Frozen Meal' },
    servingSize: { type: Type.STRING, description: 'Serving size, e.g., 1 bar (40g) or 1 cup (240ml)' },
    servingsPerContainer: { type: Type.STRING, description: 'E.g. About 4 servings, or 1 serving' },
    healthScore: { type: Type.INTEGER, description: 'Overall health rating from 1 to 100' },
    healthRating: { type: Type.STRING, description: 'Excellent, Good, Moderate, Caution, or Poor' },
    healthScoreColor: { type: Type.STRING, description: 'green, lime, amber, orange, or red' },
    verdictSummary: { type: Type.STRING, description: '2 to 3 sentences summary explaining the food in plain English' },

    // Legibility & Label Quality Assessment
    legibility: {
      type: Type.OBJECT,
      properties: {
        overallQuality: { type: Type.STRING, description: 'clear, partially_readable, or severely_degraded' },
        qualityScore: { type: Type.INTEGER, description: '0 to 100 visual legibility score' },
        issuesDetected: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'motion_blur, partial_obstruction_or_tear, curved_surface, glare_reflection, low_lighting, cut_off_margins, crinkled_packaging'
        },
        issueDescriptions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Human-readable description of physical label obstructions or blur'
        },
        needsClearerImage: { type: Type.BOOLEAN, description: 'True if crucial nutrition or allergen data is obscured' },
        clarificationMessage: { type: Type.STRING, description: 'Actionable guidance on what is unreadable and needs manual confirmation or retake' }
      },
      required: ['overallQuality', 'qualityScore', 'issuesDetected', 'issueDescriptions', 'needsClearerImage', 'clarificationMessage']
    },

    // Allergen Safety & Incomplete OCR Guardrails
    allergenSafetyAudit: {
      type: Type.OBJECT,
      properties: {
        isAllergenSectionComplete: { type: Type.BOOLEAN, description: 'False if allergen or ingredient block is torn, cut off, or partially unreadable' },
        safetyWarning: { type: Type.STRING, description: 'Explicit warning regarding missing OCR not being proof of allergen absence' },
        allergenDetails: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              allergen: { type: Type.STRING },
              presence: { type: Type.STRING, description: 'confirmed_present, may_contain_traces, inconclusive_unreadable, or not_detected_in_visible_text' },
              evidence: { type: Type.STRING, description: 'Verbatim text read or observation of why it is inconclusive' },
              confidence: { type: Type.STRING, description: 'high, medium, or low' }
            },
            required: ['allergen', 'presence', 'evidence', 'confidence']
          }
        }
      },
      required: ['isAllergenSectionComplete', 'safetyWarning', 'allergenDetails']
    },
    
    novaGroup: { type: Type.INTEGER, description: 'NOVA classification number 1, 2, 3, or 4' },
    novaTitle: { type: Type.STRING, description: 'E.g. Group 4: Ultra-Processed Food or Group 1: Minimally Processed' },
    novaReason: { type: Type.STRING, description: 'Specific explanation why this food received this NOVA rating' },

    nutrition: {
      type: Type.OBJECT,
      properties: {
        calories: { type: Type.STRING, description: 'Calories per serving (e.g. 190 kcal)' },
        caloriesCertainty: certaintySchema,
        totalFat: {
          type: Type.OBJECT,
          properties: {
            value: { type: Type.STRING, description: 'e.g. 8g (10% DV)' },
            level: { type: Type.STRING, description: 'low, moderate, or high' },
            certainty: certaintySchema
          },
          required: ['value', 'level']
        },
        saturatedFat: {
          type: Type.OBJECT,
          properties: {
            value: { type: Type.STRING, description: 'e.g. 1.5g' },
            level: { type: Type.STRING, description: 'low, moderate, or high' },
            certainty: certaintySchema
          },
          required: ['value', 'level']
        },
        transFat: { type: Type.STRING, description: 'e.g. 0g' },
        sodium: {
          type: Type.OBJECT,
          properties: {
            value: { type: Type.STRING, description: 'e.g. 180mg' },
            level: { type: Type.STRING, description: 'low, moderate, or high' },
            certainty: certaintySchema
          },
          required: ['value', 'level']
        },
        totalCarbs: {
          type: Type.OBJECT,
          properties: {
            value: { type: Type.STRING, description: 'e.g. 26g' },
            level: { type: Type.STRING, description: 'low, moderate, or high' },
            certainty: certaintySchema
          },
          required: ['value', 'level']
        },
        dietaryFiber: {
          type: Type.OBJECT,
          properties: {
            value: { type: Type.STRING, description: 'e.g. 4g' },
            level: { type: Type.STRING, description: 'low, moderate, or high' },
            certainty: certaintySchema
          },
          required: ['value', 'level']
        },
        totalSugars: {
          type: Type.OBJECT,
          properties: {
            value: { type: Type.STRING, description: 'e.g. 12g' },
            level: { type: Type.STRING, description: 'low, moderate, or high' },
            certainty: certaintySchema
          },
          required: ['value', 'level']
        },
        addedSugars: {
          type: Type.OBJECT,
          properties: {
            value: { type: Type.STRING, description: 'e.g. 10g' },
            level: { type: Type.STRING, description: 'low, moderate, or high' },
            certainty: certaintySchema
          },
          required: ['value', 'level']
        },
        protein: {
          type: Type.OBJECT,
          properties: {
            value: { type: Type.STRING, description: 'e.g. 5g' },
            level: { type: Type.STRING, description: 'low, moderate, or high' },
            certainty: certaintySchema
          },
          required: ['value', 'level']
        },
        keyMicronutrients: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              amount: { type: Type.STRING },
              dailyValuePercentage: { type: Type.STRING }
            },
            required: ['name', 'amount']
          }
        }
      },
      required: ['calories', 'totalFat', 'saturatedFat', 'sodium', 'totalCarbs', 'dietaryFiber', 'totalSugars', 'protein']
    },

    positives: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Key positive health or nutritional highlights'
    },
    concerns: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Key health risks, excess ingredients, or concerns'
    },

    ingredientsRaw: { type: Type.STRING, description: 'Detected verbatim ingredient list' },
    ingredientsCertainty: certaintySchema,
    ingredientsList: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          type: { type: Type.STRING, description: 'whole_food, additive, hidden_sugar, preservative, flavor_color, healthy_nutrient' },
          description: { type: Type.STRING, description: 'Brief explanation of what this ingredient does' },
          concernLevel: { type: Type.STRING, description: 'safe, caution, or avoid' },
          certainty: certaintySchema
        },
        required: ['name', 'type', 'concernLevel']
      }
    },

    additives: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          codeOrName: { type: Type.STRING, description: 'Additive name / E-number' },
          function: { type: Type.STRING, description: 'Role (e.g. Emulsifier, Artificial Color, Sweetener)' },
          safetyRating: { type: Type.STRING, description: 'Generally Safe, Use Caution, or High Concern / Avoid' },
          healthNotes: { type: Type.STRING, description: 'Scientific explanation of possible effects or safety context' },
          certainty: certaintySchema
        },
        required: ['codeOrName', 'function', 'safetyRating', 'healthNotes']
      }
    },

    allergensDetected: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Explicit allergens present in visible text'
    },
    mayContainAllergens: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Cross-contamination or facility warnings'
    },
    uncertainAllergens: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Allergens that could not be ruled out due to torn, curved, or blurry text'
    },

    dietarySuitability: {
      type: Type.OBJECT,
      properties: {
        isVegan: { type: Type.BOOLEAN },
        isVegetarian: { type: Type.BOOLEAN },
        isGlutenFree: { type: Type.BOOLEAN },
        isDairyFree: { type: Type.BOOLEAN },
        isKetoFriendly: { type: Type.BOOLEAN },
        isLowSodium: { type: Type.BOOLEAN },
        isLowSugar: { type: Type.BOOLEAN },
        notes: { type: Type.STRING },
        uncertainties: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Any dietary statuses that cannot be confirmed due to unreadable label areas'
        }
      },
      required: ['isVegan', 'isVegetarian', 'isGlutenFree', 'isDairyFree', 'isKetoFriendly', 'isLowSodium', 'isLowSugar']
    },

    personalizedWarnings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Warnings specifically targeted to user dietary preferences/allergies if provided'
    },

    claimsCheck: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          claim: { type: Type.STRING, description: 'Marketing claim printed on package' },
          verdict: { type: Type.STRING, description: 'Accurate, Misleading, or Exaggerated' },
          explanation: { type: Type.STRING, description: 'Reality check based on facts' },
          certainty: certaintySchema
        },
        required: ['claim', 'verdict', 'explanation']
      }
    },

    healthierAlternatives: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Name of the healthier alternative' },
          category: { type: Type.STRING, description: 'Type or brand category' },
          whyBetter: { type: Type.STRING, description: 'Specific nutritional advantages' },
          exampleFoods: { type: Type.STRING, description: 'Concrete product or whole food example' }
        },
        required: ['title', 'category', 'whyBetter', 'exampleFoods']
      }
    }
  },
  required: [
    'productName',
    'brand',
    'category',
    'servingSize',
    'healthScore',
    'healthRating',
    'healthScoreColor',
    'verdictSummary',
    'legibility',
    'allergenSafetyAudit',
    'novaGroup',
    'novaTitle',
    'novaReason',
    'nutrition',
    'positives',
    'concerns',
    'ingredientsRaw',
    'ingredientsList',
    'additives',
    'allergensDetected',
    'mayContainAllergens',
    'dietarySuitability',
    'claimsCheck',
    'healthierAlternatives'
  ]
};

// API Route: Analyze Food Label / Package Photo
app.post('/api/analyze-food', async (req: Request, res: Response) => {
  try {
    const { image, mimeType = 'image/jpeg', userDietaryProfile } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const profileContext = userDietaryProfile
      ? `User Dietary Profile to cross-check:
- Allergies: ${(userDietaryProfile.allergies || []).join(', ') || 'None specified'}
- Diets / Lifestyles: ${(userDietaryProfile.diets || []).join(', ') || 'Standard'}
- Health Goals / Restrictions: ${(userDietaryProfile.healthGoals || []).join(', ') || 'General wellness'}
Flag any direct conflict or unresolved risk in "personalizedWarnings".`
      : 'No specific user dietary profile specified.';

    const systemPrompt = `You are LabelLens, an elite food forensics investigator and clinical nutrition OCR auditor.
You analyze images of packaged foods, nutrition facts labels, and ingredient panels with rigorous scientific discipline.

CRITICAL FORENSIC RULES (MANDATORY):
1. **DO NOT INVENT MISSING LABEL INFORMATION**:
   - Never fabricate unreadable, torn, or cut-off numbers or words.
   - If an ingredient name is partially obscured (e.g., "...lecith..."), note the partial text in labelEvidence and mark certainty.status as "uncertain".
   - If a nutrition number is obscured by glare or blur, indicate "uncertain" or "unreadable" and provide what fragment was visible.
2. **DETECT COMPROMISED LABEL CONDITIONS**:
   - Evaluate whether the photo suffers from:
     * Motion blur or out-of-focus optics
     * Partial obscuration, rips, folds, or tears in packaging
     * Curved surfaces (e.g. aluminum cans, bottles, tubes where text wraps around the horizon)
     * Glare, specular reflection, or harsh shadows
     * Cut-off margins where ingredient or nutrition columns continue off-camera
     * Crinkled or wrinkled foil/plastic wrappers
   - Reflect this in "legibility" object: set "needsClearerImage": true whenever key ingredients, allergens, or nutrition numbers cannot be verified with certainty.
3. **ABSENCE OF EVIDENCE IS NOT EVIDENCE OF ABSENCE (FOOD ALLERGY SAFETY RULE)**:
   - If an allergen is not mentioned in the visible text of a blurry, torn, or cut-off label, you MUST NOT declare the product allergen-free!
   - Explicitly classify such allergens in "allergenSafetyAudit" as "inconclusive_unreadable".
   - State clearly in "safetyWarning": "Missing OCR output is not proof of allergen absence. Because portions of the label are unreadable, this product cannot be confirmed free of allergens."
4. **PROVIDE SUPPORTING EVIDENCE**:
   - For every extracted key value (calories, sodium, sugars, protein, fat, ingredients, additives), provide a concise quote of the actual label text visible in "labelEvidence".
5. Compute Health Score (1-100) and NOVA Classification (1-4) objectively based on verified facts.
6. ${profileContext}

Return ONLY valid JSON matching the schema.`;

    const { text: textOutput } = await generateWithFallback({
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: 'Forensically examine this food label image. Inspect for blur, curved surfaces, glare, or torn text. Identify confirmed facts vs uncertain fields, extract supporting label evidence, and audit allergen safety.',
          },
        ],
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: foodAnalysisSchema,
        temperature: 0.1,
      },
    });

    const cleanedText = textOutput.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
    const rawData = JSON.parse(cleanedText);
    const normalizedData = normalizeFoodAnalysis(rawData);
    res.json(normalizedData);
  } catch (err: any) {
    console.warn('Error analyzing food image, preparing safety fallback:', err?.message || err);
    res.status(500).json({
      error: 'Failed to analyze food package.',
      details: err?.message || 'Error occurred while communicating with vision engine.',
    });
  }
});

function normalizeFoodAnalysis(data: any): any {
  if (!data || typeof data !== 'object') return {};
  return {
    productName: data.productName || 'Scanned Food Package',
    brand: data.brand || 'Packaged Brand',
    category: data.category || 'Food & Grocery',
    servingSize: data.servingSize || '1 serving',
    servingsPerContainer: data.servingsPerContainer || '1',
    healthScore: typeof data.healthScore === 'number' ? data.healthScore : 65,
    healthRating: data.healthRating || 'Moderate',
    healthScoreColor: data.healthScoreColor || 'amber',
    verdictSummary: data.verdictSummary || 'Packaged food label scanned and analyzed.',
    legibility: {
      overallQuality: data.legibility?.overallQuality || 'clear',
      qualityScore: typeof data.legibility?.qualityScore === 'number' ? data.legibility.qualityScore : 90,
      issuesDetected: Array.isArray(data.legibility?.issuesDetected) ? data.legibility.issuesDetected : [],
      issueDescriptions: Array.isArray(data.legibility?.issueDescriptions) ? data.legibility.issueDescriptions : [],
      needsClearerImage: Boolean(data.legibility?.needsClearerImage),
      clarificationMessage: data.legibility?.clarificationMessage || 'Label processed.'
    },
    allergenSafetyAudit: {
      isAllergenSectionComplete: data.allergenSafetyAudit?.isAllergenSectionComplete !== false,
      safetyWarning: data.allergenSafetyAudit?.safetyWarning || 'Check physical packaging for severe allergens.',
      allergenDetails: Array.isArray(data.allergenSafetyAudit?.allergenDetails) ? data.allergenSafetyAudit.allergenDetails : []
    },
    novaGroup: [1, 2, 3, 4].includes(data.novaGroup) ? data.novaGroup : 3,
    novaTitle: data.novaTitle || 'Group 3: Processed Food',
    novaReason: data.novaReason || 'Contains processed ingredients.',
    nutrition: {
      calories: data.nutrition?.calories || '0 kcal',
      caloriesCertainty: data.nutrition?.caloriesCertainty || { status: 'confirmed', labelEvidence: 'Extracted' },
      totalFat: data.nutrition?.totalFat || { value: '0g', level: 'low' },
      saturatedFat: data.nutrition?.saturatedFat || { value: '0g', level: 'low' },
      transFat: data.nutrition?.transFat || '0g',
      sodium: data.nutrition?.sodium || { value: '0mg', level: 'low' },
      totalCarbs: data.nutrition?.totalCarbs || { value: '0g', level: 'low' },
      dietaryFiber: data.nutrition?.dietaryFiber || { value: '0g', level: 'low' },
      totalSugars: data.nutrition?.totalSugars || { value: '0g', level: 'low' },
      addedSugars: data.nutrition?.addedSugars,
      protein: data.nutrition?.protein || { value: '0g', level: 'low' },
      keyMicronutrients: Array.isArray(data.nutrition?.keyMicronutrients) ? data.nutrition.keyMicronutrients : []
    },
    positives: Array.isArray(data.positives) ? data.positives : [],
    concerns: Array.isArray(data.concerns) ? data.concerns : [],
    ingredientsRaw: data.ingredientsRaw || '',
    ingredientsCertainty: data.ingredientsCertainty || { status: 'confirmed', labelEvidence: 'Extracted' },
    ingredientsList: Array.isArray(data.ingredientsList) ? data.ingredientsList : [],
    additives: Array.isArray(data.additives) ? data.additives : [],
    allergensDetected: Array.isArray(data.allergensDetected) ? data.allergensDetected : [],
    mayContainAllergens: Array.isArray(data.mayContainAllergens) ? data.mayContainAllergens : [],
    uncertainAllergens: Array.isArray(data.uncertainAllergens) ? data.uncertainAllergens : [],
    dietarySuitability: {
      isVegan: Boolean(data.dietarySuitability?.isVegan),
      isVegetarian: Boolean(data.dietarySuitability?.isVegetarian),
      isGlutenFree: Boolean(data.dietarySuitability?.isGlutenFree),
      isDairyFree: Boolean(data.dietarySuitability?.isDairyFree),
      isKetoFriendly: Boolean(data.dietarySuitability?.isKetoFriendly),
      isLowSodium: Boolean(data.dietarySuitability?.isLowSodium),
      isLowSugar: Boolean(data.dietarySuitability?.isLowSugar),
      notes: data.dietarySuitability?.notes || '',
      uncertainties: Array.isArray(data.dietarySuitability?.uncertainties) ? data.dietarySuitability.uncertainties : []
    },
    personalizedWarnings: Array.isArray(data.personalizedWarnings) ? data.personalizedWarnings : [],
    claimsCheck: Array.isArray(data.claimsCheck) ? data.claimsCheck : [],
    healthierAlternatives: Array.isArray(data.healthierAlternatives) ? data.healthierAlternatives : [],
    dietaryComparisonFlags: Array.isArray(data.dietaryComparisonFlags) ? data.dietaryComparisonFlags : [],
    contradictionsDetected: Array.isArray(data.contradictionsDetected) ? data.contradictionsDetected : [],
    ambiguousIngredients: Array.isArray(data.ambiguousIngredients) ? data.ambiguousIngredients : []
  };
}

// API Route: Recalculate food assessment after manual user corrections
app.post('/api/recalculate-food', async (req: Request, res: Response) => {
  try {
    const { updatedFood, userDietaryProfile } = req.body;

    if (!updatedFood) {
      return res.status(400).json({ error: 'updatedFood object is required.' });
    }

    const systemPrompt = `You are LabelLens Nutrition Recalculation Engine.
The user has manually corrected or confirmed values on a scanned food product.
Based on the updated values provided in the JSON payload, re-evaluate:
1. Health Score (1-100) and Health Rating
2. Positives and Concerns
3. NOVA Classification (1-4)
4. Dietary Suitability (Vegan, Gluten-Free, Dairy-Free, Low Sodium, Low Sugar, Keto)
5. Personalized warnings against user profile: ${JSON.stringify(userDietaryProfile || {})}

Preserve user-confirmed values in nutrition and ingredients. Mark user-edited fields with certainty.status = 'confirmed' and userEdited = true. Return the updated food JSON adhering to the schema.`;

    const { text: textOutput } = await generateWithFallback({
      contents: `Updated Food Data with manual user corrections: ${JSON.stringify(updatedFood)}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: foodAnalysisSchema,
        temperature: 0.1,
      },
    });

    const cleanedText = (textOutput || '').replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
    const parsedData = JSON.parse(cleanedText || '{}');
    const normalizedData = normalizeFoodAnalysis(parsedData);
    res.json(normalizedData);
  } catch (err: any) {
    console.warn('Error recalculating food:', err?.message || err);
    res.status(500).json({
      error: 'Failed to recalculate food data.',
      details: err?.message || 'Error occurred while updating assessment.',
    });
  }
});

// API Route: Ask follow-up question regarding the scanned food
app.post('/api/ask-food', async (req: Request, res: Response) => {
  try {
    const { foodData, question, chatHistory = [] } = req.body;

    if (!foodData || !question) {
      return res.status(400).json({ error: 'foodData and question are required.' });
    }

    const systemPrompt = `You are the LabelLens Nutrition Assistant.
You have access to the forensic scan data for the packaged food:
Product: "${foodData.productName}" by ${foodData.brand}
Category: ${foodData.category}
Health Score: ${foodData.healthScore}/100 (${foodData.healthRating})
NOVA Group: ${foodData.novaGroup} (${foodData.novaTitle})
Label Legibility: ${foodData.legibility?.overallQuality || 'unknown'} (Score: ${foodData.legibility?.qualityScore}/100)
Nutrition summary: Calories: ${foodData.nutrition?.calories}, Fat: ${foodData.nutrition?.totalFat?.value}, Sodium: ${foodData.nutrition?.sodium?.value}, Sugars: ${foodData.nutrition?.totalSugars?.value}, Protein: ${foodData.nutrition?.protein?.value}
Ingredients: ${foodData.ingredientsRaw || JSON.stringify(foodData.ingredientsList)}
Allergens Confirmed: ${(foodData.allergensDetected || []).join(', ')}
Allergens Inconclusive/Uncertain: ${(foodData.uncertainAllergens || []).join(', ')}

Answer user questions directly, accurately, and scientifically. If any ingredient or allergen is uncertain due to label condition, explicitly remind the user of the uncertainty.`;

    const conversationPrompt = `Previous context: ${JSON.stringify(chatHistory.slice(-4))}
User Question: "${question}"
Provide a clear, helpful answer in 2-4 structured paragraphs or bullet points.`;

    const { text } = await generateWithFallback({
      contents: conversationPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
      },
    });

    res.json({ answer: text });
  } catch (err: any) {
    console.warn('Error in ask-food:', err?.message || err);
    res.status(500).json({
      error: 'Failed to process question.',
      details: err?.message || 'Error communicating with assistant.',
    });
  }
});

// Setup Vite in development or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LabelLens server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
