import { Router } from "express";
import {
  API_KEY_ALERT_MESSAGE,
  PEAK_DEMAND_RETRY_MESSAGE,
  extractUserGeminiKey,
  generateContentWithGeminiFallback,
  getFriendlyGeminiErrorMessage,
  isGeminiKeyFailure,
} from "./geminiFallback.ts";
import {
  type AnalyzeHairRequestBody,
  type AnalyzeSkinRequestBody,
  type CheckCreamRequestBody,
  type VerifyProductRequestBody,
  buildCheckCreamPrompt,
  buildHairAnalysisPrompt,
  buildSkinAnalysisPrompt,
  buildVerifyProductPrompt,
  checkStoreDeterministic,
  hairResponseSchema,
  hydrateProductPicks,
  safeParseGeminiJson,
  skinResponseSchema,
  steroidResponseSchema,
  verifyPackagingSchema,
} from "./dermascanCore.ts";
import type {
  BentoPrescriptionResponse,
  SteroidCheckResponse,
  VerifyProductResponse,
} from "../src/types/dermascan.ts";

export interface ApiRequestLike {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
}

export interface ApiResponseLike {
  status: (code: number) => ApiResponseLike;
  json: (payload: unknown) => unknown;
  setHeader?: (name: string, value: string) => void;
  end?: (chunk?: string) => void;
}

function parseRequestBody<T>(req: ApiRequestLike): T {
  if (typeof req.body === "string") {
    return JSON.parse(req.body) as T;
  }
  return (req.body || {}) as T;
}

function handleRouteError(
  res: ApiResponseLike,
  error: unknown,
  fallbackMsg: string
) {
  res.setHeader?.("Content-Type", "application/json; charset=utf-8");
  if (isGeminiKeyFailure(error)) {
    return res.status(401).json({
      errorCode: "MISSING_OR_INVALID_API_KEY",
      message: API_KEY_ALERT_MESSAGE,
    });
  }
  const friendly = getFriendlyGeminiErrorMessage(error, fallbackMsg);
  const isTransientOverload =
    friendly.status === 429 ||
    friendly.status === 500 ||
    friendly.status === 502 ||
    friendly.status === 503 ||
    friendly.status === 504;

  const rawErrorMessage =
    error instanceof Error ? error.message : String(error);

  if (isTransientOverload) {
    console.error(
      `[DerméScan] ${fallbackMsg} (${friendly.status}): ${rawErrorMessage}`
    );
    return res.status(friendly.status === 429 ? 429 : 503).json({
      errorCode: "HIGH_TRAFFIC_OR_OVERLOAD",
      message: PEAK_DEMAND_RETRY_MESSAGE,
    });
  }

  console.error(`[DerméScan] ${fallbackMsg} (${friendly.status}): ${rawErrorMessage}`);
  const safeStatus = friendly.status === 403 ? 400 : friendly.status;
  return res.status(safeStatus).json({
    message: friendly.message,
  });
}

const MASTER_TRUSTED_BRANDS_SUMMARY = `MASTER TRUSTED PAKISTANI & PHARMACY BRAND CATALOG (DRAW WIDELY ACROSS THIS FULL LIST):
- Trusted Brands: CeraVe, Physiogel, Cetaphil, Simple, Bioderma, La Roche-Posay, Neutrogena, Sebamed, Skinoren, AccuFix Cosmetics (all 14 verified formulations), Conatural, Trego, Saeed Ghani, BNB, The Ordinary, Garnier, Eucerin, Vaseline, Aquaphor, plus all 22 verified Jenpharm formulations below.
- DIVERSITY & ANTI-REPETITION RULE (MANDATORY):
  * Draw widely across the full Master Trusted Pakistani Brand Catalog — do NOT repeat the same 3 default products for every scan.
  * Every product recommended (in both "routine" steps and "recommendedProducts") MUST state the **exact active ingredient** and **why it fits this exact body zone or hair porosity**.
  * Never force an unrelated Jenpharm, AccuFix, or non-affiliate SKU just to fill a slot; recommend any of the 22 verified Jenpharm SKUs or 14 verified AccuFix Cosmetics SKUs ONLY when genuinely indicated using its exact full name below.`;

const SKIN_CLINICAL_INDICATION_RULES = `${MASTER_TRUSTED_BRANDS_SUMMARY}

STRICT ZONE-BY-ZONE SKIN & BODY ROUTINE DIFFERENTIATION (NEVER OUTPUT A GENERIC FACE ROUTINE FOR NON-FACE ZONES):
- You MUST enforce distinct, anatomically appropriate brands and active ingredients for the user's selected Body Area:
  * **Face:** Match strictly to skin type & concern across our full catalog:
    - Gentle / Sensitive / Dry Barrier: "Simple Refreshing Facial Wash", "Cetaphil Gentle Skin Cleanser", "CeraVe Hydrating Facial Cleanser", "Bioderma Sensibio Gel Moussant", "Physiogel Daily Moisture Therapy Cream", "La Roche-Posay Cicaplast Baume B5+", "AccuFix Hydrating Gentle Cleanser", "Jenpharm Dermive Moisturizing Face Wash", "Jenpharm Dermive Sensitive Moisturizer", "Jenpharm Dermive Oily Moisturizer" (for very dry skin without fungal acne).
    - Oily / Clogged Pores / Active Acne / Texture: "CeraVe Foaming Facial Cleanser", "La Roche-Posay Effaclar Purifying Foaming Gel", "AccuFix Salicylic Acid Cleanser", "AccuFix Salicylic Acid Serum" (2–3x/week PM on blackheads/congested pores; avoid during pregnancy), "AccuFix Glycolic Acid Toner" (2–3x/week PM for bumpy texture/post-acne marks; never with Retinol), "AccuFix Pimple Patches" (overnight hydrocolloid on surfaced whiteheads to prevent picking), "The Ordinary Niacinamide 10% + Zinc 1%", "Jenpharm Clarevo Salicylic Acid Facewash" (avoid in pregnancy or damaged barrier), "Jenpharm Dermive Oil-Free Moisturizer" (or "Jenpharm Dermive Oil-Free Moisturizer SPF 20"), "Jenpharm Spectramatt SPF 50 Sebum Control Gel Sunscreen", "Jenpharm MandelAC Face Wash" / "Jenpharm MandelAC Serum" / "Jenpharm MandelAC Cream" (2–3x/week; NEVER with Retinol).
    - Redness / Dark Marks / Melasma: "Skinoren Cream (Azelaic Acid 20%)", "AccuFix Glycolic Acid Toner" (2–3x/week PM on non-sensitive skin), "The Ordinary Alpha Arbutin 2% + HA", "Jenpharm Spectra Block Tinted Sunscreen SPF 100" (visible light shield for melasma), "Jenpharm Spectra Block Aqua Fluid Sunscreen SPF 60", "Jenpharm Maxdif Serum" / "Jenpharm Maxdif Skin Brightening Cream" / "Jenpharm Maxdif Brightening Moisturizer", "Jenpharm Cerulic Glow Boosting Serum" (only on intact, non-irritated skin).
    - Adult Anti-Aging / Fine Lines: "Jenpharm Eternyx Advanced Retinol Serum" (PM only, 1–2x/week; STRICTLY NEVER with MandelAC/Clarevo/AccuFix Salicylic/Glycolic acids, NEVER under 18, and STRICTLY FORBIDDEN during pregnancy or breastfeeding).
  * **Under-Eyes:** Gentle orbital-safe actives ONLY ("The Ordinary Caffeine Solution 5% + EGCG", "CeraVe Eye Repair Cream", "Neutrogena Hydro Boost Eye Gel-Cream", "Garnier Vitamin C Eye Cream" / "Garnier Bright Complete Eye Serum", "Bioderma Sensibio Eye"). Distinguish structural hollowness (cannot be filled by creams) vs. vascular vs. pigmented dark circles, and warn against heavy oils/Vaseline near eyes if milia are present.
  * **Neck & Underarms (Acanthosis / Friction Darkening):** Gentle barrier-safe brightening ("AccuFix Glycolic Acid Toner" max 2x/week PM on intact body/underarms ONLY — warn NEVER right after shaving or waxing!, "The Ordinary Glycolic Acid 7% Toning Solution", "Conatural" gentle cleansers/brightening care, "Simple" fragrance-free lotion, "Physiogel"). Explicitly warn against harsh scrubbing/loofahs; advise blood sugar/PCOS check if velvety acanthosis nigricans is visible.
  * **Back & Chest (Body Acne / Keratosis Pilaris / Strawberry Skin / Dry Body):** Body-strength actives ("AccuFix AHA BHA Body Wash" for back/chest acne, clogged body pores & keratosis pilaris; "AccuFix Oats and Lipid Hydrating Body Wash" for dry, itchy, or eczema-prone body skin; "CeraVe SA Smoothing Cream" / "CeraVe SA Smoothing Cleanser", "Neutrogena Body Clear Body Wash", "Cetaphil Moisturizing Lotion", "Vaseline Intensive Care" light non-greasy lotion, plus "Conaz 2%" / "Selsun Blue" short-contact if fungal folliculitis/tinea versicolor).
  * **Arms & Legs / Hands & Nails (Tan, Dryness, Eczema):** Hand/arm barrier & UV care ("AccuFix Oats and Lipid Hydrating Body Wash" for dry/eczema-prone skin, "AccuFix AHA BHA Body Wash" for strawberry skin/KP bumps, "Neutrogena Norwegian Formula Hand Cream", "CeraVe Therapeutic Hand Cream" / "CeraVe Reparative Hand Cream", "Physiogel Calming Relief A.I. Cream" / "Physiogel Daily Moisture Therapy Body Lotion", "Eucerin UreaRepair 5% Hand Cream", "La Roche-Posay Cicaplast Mains", "Vaseline Intensive Care" / SPF body lotions or "Jenpharm Spectra Block Aqua Fluid Sunscreen SPF 60" for exposed arms/hands, plus "Saeed Ghani" / "Conatural" Sweet Almond Oil on brittle cuticles). Never prescribe harsh facial acne acids on eczema-prone hands!
  * **Feet & Heels (Cracked Heels, Hard Calluses, Athlete's Foot):** High-urea & occlusive foot care ONLY ("Eucerin UreaRepair Foot Cream", "CeraVe SA Renewing Foot Cream", "Vaseline Pure Petroleum Jelly" + clean cotton socks overnight, "Hydrophil 20% Urea Heel & Foot Cream", "Jenpharm Dermive Urea Moisturizer", "Saeed Ghani" / "Conatural" foot care, or "Canesten"/"Lamisil" if fungal toe-web peeling). **STRICT BAN:** NEVER recommend delicate face serums, eye creams, or facial cleansers for feet!`;

function getZoneClinicalFocusDirective(
  bodyArea: string,
  skinType?: string
): string {
  switch (bodyArea) {
    case "Face":
      return `ACTIVE ZONE FOCUS — FACE: Match Cleanser + Treatment/Serum + Moisturizer + Sunscreen strictly to the user's Face skin type (${skinType || "specified in Context"}) and visible concerns across the full catalog (Simple, Cetaphil, CeraVe, Physiogel, AccuFix Salicylic Acid Cleanser, AccuFix Hydrating Gentle Cleanser, AccuFix Glycolic Acid Toner, AccuFix Salicylic Acid Serum, AccuFix Pimple Patches, Skinoren, La Roche-Posay, Bioderma, The Ordinary, and matching Jenpharm SKUs). State exact active ingredient and why it fits this face concern in every product bullet.`;
    case "Under-Eyes":
      return `ACTIVE ZONE FOCUS — UNDER-EYES: Recommend ONLY orbital-safe eye care ("The Ordinary Caffeine Solution 5% + EGCG", "CeraVe Eye Repair Cream", "Neutrogena Hydro Boost Eye Gel-Cream", "Garnier Vitamin C Eye", "Bioderma Sensibio Eye") + honest structural hollowness vs. vascular vs. pigment triage. NEVER prescribe facial acne washes or peeling acids for under-eyes.`;
    case "Neck & Underarms":
      return `ACTIVE ZONE FOCUS — NECK & UNDERARMS: Recommend ONLY underarm/neck-safe brightening & barrier care ("AccuFix Glycolic Acid Toner" max 2x/week on body/underarms ONLY, "The Ordinary Glycolic Acid 7% Toning Solution", "Conatural", "Simple" fragrance-free lotion). Explicitly warn against harsh scrubbing, lemon, or applying glycolic acid right after shaving/waxing.`;
    case "Back & Chest":
      return `ACTIVE ZONE FOCUS — BACK & CHEST (BODY ACNE / FOLLICULITIS / DRY BODY): Recommend body-strength washes & lotions ("AccuFix AHA BHA Body Wash" for back/chest acne & KP, "AccuFix Oats and Lipid Hydrating Body Wash" for dry/eczema-prone body skin, "CeraVe SA Smoothing Cream", "Neutrogena Body Clear Body Wash", "Cetaphil Moisturizing Lotion", "Vaseline Intensive Care", or "Conaz 2%"/"Selsun Blue" if fungal). Do NOT prescribe tiny facial eye creams or delicate face-only serums.`;
    case "Arms & Legs":
      return `ACTIVE ZONE FOCUS — ARMS & LEGS: For Keratosis Pilaris (strawberry skin) use body keratolytics ("AccuFix AHA BHA Body Wash", "CeraVe SA Smoothing Cream", "The Ordinary Glycolic Acid 7%"); for body dryness/eczema use "AccuFix Oats and Lipid Hydrating Body Wash", "Physiogel Calming Relief", "Cetaphil Moisturizing Lotion", "Vaseline Intensive Care"; for sun tan add body UV care.`;
    case "Hands & Nails":
      return `ACTIVE ZONE FOCUS — HANDS & NAILS: Prioritize barrier-rebuilding hand creams ("Neutrogena Norwegian Formula Hand Cream", "CeraVe Therapeutic / Reparative Hand Cream", "Physiogel Calming Relief", "Eucerin UreaRepair 5% Hand Cream", "Vaseline Pure Petroleum Jelly", plus "Saeed Ghani" / "Conatural" cuticle oil or "Canesten"/"Lamisil" if nail fungus). Never prescribe drying face acne washes for hands.`;
    case "Feet & Heels":
      return `ACTIVE ZONE FOCUS — FEET & HEELS: Prescribe ONLY high-urea / foot-strength keratolytics & overnight occlusives ("Eucerin UreaRepair Foot Cream", "CeraVe SA Renewing Foot Cream", "Vaseline Pure Petroleum Jelly" + cotton socks overnight, "Hydrophil 20% Urea Heel & Foot Cream", "Jenpharm Dermive Urea Moisturizer", "Saeed Ghani" / "Conatural" foot care). STRICTLY FORBID delicate face serums or facial washes for feet.`;
    default:
      return `ACTIVE ZONE FOCUS — "${bodyArea}": Match strictly to the exact body area described by the user across the full Master Trusted Catalog, stating exact active ingredients and zone-fit reasoning.`;
  }
}

const LIPS_CLINICAL_INDICATION_RULES = `${MASTER_TRUSTED_BRANDS_SUMMARY}

CLINICAL LIP CARE RULES (STRICT — NEVER PRESCRIBE FACIAL ACIDS OR FACE WASHES FOR LIPS):
- Lip mucosa lacks oil glands and burns easily. When Body Area is "Lips" OR any uploaded photo shows lips:
  * **STRICTLY FORBIDDEN ON LIPS:** NEVER recommend facial acids (*Jenpharm MandelAC*, *Salicylic Acid*, *Glycolic Acid*, *Retinol*, *Adapalene*, *Tretinoin*) or standard foaming face washes for lips!
  * **RECOMMEND ONLY DERMATOLOGIST-TRUSTED LIP PRODUCTS AVAILABLE IN PAKISTAN (Pharmacies, Daraz Mall, Naheed, Al-Fatah, Vegas.pk):**
    - Daytime UV Protection (Essential for Dark / Pigmented Lips): "Sebamed Lip Defense SPF 30", "Nivea Sun Protect Lip Balm SPF 30", or "Neutrogena Revitalizing Lip Balm SPF 20".
    - Deep Overnight Barrier Repair & Chapping: "Vaseline Pure Petroleum Jelly (Original)", "Aquaphor Healing Ointment", "CeraVe Healing Ointment", or "Bioderma Atoderm Lèvres Moisturizing Stick".
    - Gentle Lip Pigmentation Care & Gentle Smoothing: "AccuFix Dark Lip Treatment Balm" (gentle brightening balm, paired STRICTLY with a daytime SPF 30 lip balm), "AccuFix Unscrub Lip Scrub" (gentle non-abrasive polish 1–2x/week max on flaky non-cracked lips followed by balm), or "Conatural Organic Lip Balm" — paired STRICTLY with a daytime SPF 30 lip balm.
  * **WHAT TO AVOID (STRICT SAFETY WARNING):** Warn clearly against DIY lemon, baking soda, toothpaste, and harsh kitchen sugar scrubs on lips, which strip the thin barrier and worsen lip hyperpigmentation.
  * **CLINICAL RED-FLAG TRIAGE FOR LIPS:** If the photo or description shows painful cracks at the corners of the mouth (angular cheilitis), blisters/cold sores, or noticeable lip swelling, clearly advise consulting a PMDC dermatologist or pharmacist for targeted antifungal/antiviral treatment rather than relying on cosmetic balms alone.`;

const HAIR_CLINICAL_INDICATION_RULES = `${MASTER_TRUSTED_BRANDS_SUMMARY}

STRICT LOW vs. MEDIUM vs. HIGH HAIR POROSITY DIFFERENTIATION (NEVER SUGGEST THE SAME PRODUCTS ACROSS POROSITY LEVELS):
- Pull distinct lightweight vs. balanced vs. rich formulations from our Master Trusted Catalog (CeraVe, Bioderma, Sebamed, AccuFix Cosmetics, Conatural, Trego, Saeed Ghani, BNB, The Ordinary, Garnier, L'Oréal, TRESemmé, plus matching Jenpharm SKUs) tailored strictly to the user's Hair Porosity:
  * **Low Porosity (Cuticles tightly closed; heavy oils/butters cause greasy buildup):**
    - MUST recommend lightweight, water-based, humectant-rich formulas: "Conatural Hair Growth Water (Rosemary & Mint)", "Conatural Hair Growth Shampoo (Sulfate-Free)", "Simple" lightweight cleanser / "Garnier Fructis Hair Food Aloe" (Aloe Vera lightweight), "L'Oréal Paris Elvive Hyaluron Moisture 72H", "Jenpharm Anagrow Foamy Hair Growth Serum", plus warm-water rinse and 1x/week clarifying ("AccuFix Salicylic Acid Shampoo" for dry flaky scalp buildup OR "AccuFix Clarify and Rebalance Shampoo" for oily scalp & hard-water buildup, or "Pantene Lively Clean").
    - **EXPLICIT SAFETY BAN:** Explicitly warn against heavy castor oil, thick coconut oil, or thick shea butters (SheaMoisture) because they cannot penetrate closed cuticles and cause greasy buildup!
  * **Medium / Normal Porosity (Balanced cuticle; needs gentle maintenance & hard-water defense):**
    - Recommend balanced moisture-protein rotation: "Conatural Intense Repair Shampoo (Sulfate-Free)" / daily gentle wash, "AccuFix Strength & Shine Leave-In Conditioner" (mid-lengths and ends), "AccuFix Clarify and Rebalance Shampoo" (1x/week hard-water clarifying), "Trego" / "BNB" balanced conditioners, "Jenpharm Anagrow Anti Hair Loss Shampoo" (for shedding), light leave-in mist ("Conatural Hair Growth Water"), plus hard-water chelating defense.
  * **High Porosity (Raised/damaged cuticles from heat, bleach, or hard water; frizzes & dries fast):**
    - MUST recommend cuticle-sealing proteins, rich masks, and sealing serums: "AccuFix Hair Mask" (weekly deep moisture for damaged high-porosity hair), "AccuFix Strength & Shine Leave-In Conditioner", "AccuFix Frizz Control Serum" (mid-lengths & ends ONLY — never on scalp roots), "Garnier Fructis Hair Food Banana / Papaya Mask", "Conatural Hair Repair Mask", "L'Oréal Paris Elvive Extraordinary Oil / Total Repair 5", "TRESemmé Keratin Smooth", "Jenpharm Anagrow Anti-Frizz Serum" (mid-lengths & ends ONLY), and "Jenpharm Rosemary Oil" diluted pre-wash ONLY if scalp has NO dandruff, NO oily flakes, and NO fungal/pimply scalp.
  * **Dandruff / Seborrheic Flakes / Scalp Pimples Override:**
    - Use "AccuFix Salicylic Acid Shampoo" (for dry/flaky scalp buildup 1–2x/week), "AccuFix Clarify and Rebalance Shampoo" (for oily scalp & hard-water buildup 1–2x/week), "Jenpharm Anti-Dandruff Drops Serum", "Conaz 2%", "Selsun Blue", or "Sebamed Anti-Dandruff" 1–2x/week rotated with a porosity-matched everyday shampoo — and STRICTLY forbid applying raw oils (including Rosemary/Castor/Coconut oil) onto a dandruff or oily/pimply scalp!
  * **Alopecia Areata / Bald Patch Safety:** NEVER claim shampoos, serums, or oils regrow circular autoimmune bald patches.`;

function getPorosityClinicalFocusDirective(hairPorosity: string): string {
  const normalized = (hairPorosity || "").toLowerCase();
  if (normalized.includes("low")) {
    return `ACTIVE POROSITY MANDATE — LOW POROSITY: Prescribe ONLY lightweight, water-based, humectant-rich formulas ("Conatural Hair Growth Water", "Conatural Sulfate-Free Shampoo", "Simple" / "Garnier Fructis Hair Food Aloe", "L'Oréal Elvive Hyaluron Moisture 72H", "Jenpharm Anagrow Foamy Hair Growth Serum", plus 1x/week "AccuFix Clarify and Rebalance Shampoo" or "AccuFix Salicylic Acid Shampoo" if flaky/hard-water buildup, warm-water rinse) and EXPLICITLY warn against heavy castor oil, coconut oil, and thick butters!`;
  }
  if (normalized.includes("high")) {
    return `ACTIVE POROSITY MANDATE — HIGH POROSITY: Prescribe cuticle-sealing proteins, rich masks, and sealing serums ("AccuFix Hair Mask", "AccuFix Strength & Shine Leave-In Conditioner", "AccuFix Frizz Control Serum" on ends, "Garnier Fructis Hair Food Banana / Papaya Mask", "Conatural Hair Repair Mask", "L'Oréal Elvive Extraordinary Oil / Total Repair 5", "TRESemmé Keratin Smooth", "Jenpharm Anagrow Anti-Frizz Serum" on ends, and "Jenpharm Rosemary Oil" pre-wash ONLY if scalp has zero dandruff/flakes).`;
  }
  return `ACTIVE POROSITY MANDATE — MEDIUM / NORMAL POROSITY (${hairPorosity || "Balanced"}): Prescribe balanced moisture-protein rotation ("Conatural Intense Repair / Daily Shampoo", "AccuFix Strength & Shine Leave-In Conditioner", "AccuFix Clarify and Rebalance Shampoo" 1x/week for hard water, "Trego" / "BNB" balanced conditioners, "Jenpharm Anagrow Anti Hair Loss Shampoo", light leave-in mist) plus hard-water defense without overly heavy butters or overly stripping clarifying every wash.`;
}

export async function handleAnalyzeSkin(
  req: ApiRequestLike,
  res: ApiResponseLike
) {
  try {
    res.setHeader?.("Content-Type", "application/json; charset=utf-8");
    const body = parseRequestBody<AnalyzeSkinRequestBody>(req);

    if (!body?.images || !Array.isArray(body.images) || body.images.length === 0) {
      return res.status(400).json({
        message: "Please upload at least 1 photo angle before running a scan.",
      });
    }

    if (body.images.length > 4) {
      return res.status(400).json({
        message: "Maximum 4 photo angles are allowed per scan.",
      });
    }

    const indicationRules =
      body.bodyArea === "Lips"
        ? LIPS_CLINICAL_INDICATION_RULES
        : `${SKIN_CLINICAL_INDICATION_RULES}\n\n${getZoneClinicalFocusDirective(
            body.bodyArea,
            body.context?.skinType
          )}`;
    const systemPrompt = `${buildSkinAnalysisPrompt(body)}\n\n${indicationRules}`;

    const parts: Array<
      { text: string } | { inlineData: { mimeType: string; data: string } }
    > = [{ text: systemPrompt }];

    for (const img of body.images) {
      parts.push({ text: `Angle label: ${img.slotLabel}` });
      parts.push({
        inlineData: {
          mimeType: img.mimeType || "image/jpeg",
          data: img.base64,
        },
      });
    }

    const response = await generateContentWithGeminiFallback({
      userApiKey: extractUserGeminiKey(req.headers),
      contents: { parts },
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: skinResponseSchema,
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error("Empty structured response received from Gemini.");
    }

    const parsed = safeParseGeminiJson<BentoPrescriptionResponse>(rawText);
    parsed.recommendedProducts = hydrateProductPicks(parsed.recommendedProducts);

    return res.status(200).json(parsed);
  } catch (error) {
    return handleRouteError(
      res,
      error,
      "Failed to analyze skin photos. Please try again."
    );
  }
}

export async function handleAnalyzeHair(
  req: ApiRequestLike,
  res: ApiResponseLike
) {
  try {
    res.setHeader?.("Content-Type", "application/json; charset=utf-8");
    const body = parseRequestBody<AnalyzeHairRequestBody>(req);

    if (!body?.images || !Array.isArray(body.images) || body.images.length === 0) {
      return res.status(400).json({
        message: "Please upload at least 1 hair or scalp photo angle.",
      });
    }

    if (body.images.length > 4) {
      return res.status(400).json({
        message: "Maximum 4 photo angles are allowed per scan.",
      });
    }

    const porosityDirective = getPorosityClinicalFocusDirective(
      body.context?.hairPorosity || "Not Sure"
    );
    const systemPrompt = `${buildHairAnalysisPrompt(body)}\n\n${HAIR_CLINICAL_INDICATION_RULES}\n\n${porosityDirective}`;

    const parts: Array<
      { text: string } | { inlineData: { mimeType: string; data: string } }
    > = [{ text: systemPrompt }];

    for (const img of body.images) {
      parts.push({ text: `Angle label: ${img.slotLabel}` });
      parts.push({
        inlineData: {
          mimeType: img.mimeType || "image/jpeg",
          data: img.base64,
        },
      });
    }

    const response = await generateContentWithGeminiFallback({
      userApiKey: extractUserGeminiKey(req.headers),
      contents: { parts },
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: hairResponseSchema,
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error("Empty structured response received from Gemini.");
    }

    const parsed = safeParseGeminiJson<BentoPrescriptionResponse>(rawText);
    parsed.recommendedProducts = hydrateProductPicks(parsed.recommendedProducts);

    return res.status(200).json(parsed);
  } catch (error) {
    return handleRouteError(
      res,
      error,
      "Failed to analyze hair photos. Please try again."
    );
  }
}

export async function handleCheckCream(
  req: ApiRequestLike,
  res: ApiResponseLike
) {
  try {
    res.setHeader?.("Content-Type", "application/json; charset=utf-8");
    const body = parseRequestBody<CheckCreamRequestBody>(req);

    const textInput = (body?.productNameOrIngredients || "").trim();
    const images = Array.isArray(body?.images) ? body.images : [];

    if (!textInput && images.length === 0) {
      return res.status(400).json({
        message:
          "Please upload a cream/ingredient photo or enter a cream name/ingredients list to inspect.",
      });
    }

    const prompt = buildCheckCreamPrompt(body);

    const parts: Array<
      { text: string } | { inlineData: { mimeType: string; data: string } }
    > = [{ text: prompt }];

    for (const img of images) {
      parts.push({ text: `Uploaded photo slot: ${img.slotLabel}` });
      parts.push({
        inlineData: {
          mimeType: img.mimeType || "image/jpeg",
          data: img.base64,
        },
      });
    }

    const response = await generateContentWithGeminiFallback({
      userApiKey: extractUserGeminiKey(req.headers),
      contents: { parts },
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: steroidResponseSchema,
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error("Empty response from Gemini.");
    }

    const parsed = safeParseGeminiJson<SteroidCheckResponse>(rawText);
    parsed.safeReplacementProductIds = hydrateProductPicks(
      parsed.safeReplacementProductIds
    );

    return res.status(200).json(parsed);
  } catch (error) {
    return handleRouteError(
      res,
      error,
      "Failed to inspect cream safety. Please try again."
    );
  }
}

export async function handleVerifyProduct(
  req: ApiRequestLike,
  res: ApiResponseLike
) {
  try {
    res.setHeader?.("Content-Type", "application/json; charset=utf-8");
    const body = parseRequestBody<VerifyProductRequestBody>(req);

    const storeInput = (body?.websiteOrSeller ?? body?.storeInput ?? "").trim();
    const brandName = (body?.brandName || "").trim();
    const rawProductName = (body?.productName || "").trim();
    const productName =
      brandName &&
      rawProductName &&
      !rawProductName.toLowerCase().includes(brandName.toLowerCase())
        ? `${brandName} ${rawProductName}`
        : rawProductName || brandName;
    const images = Array.isArray(body?.images) ? body.images : [];

    if (!storeInput && !productName && images.length === 0) {
      return res.status(400).json({
        message:
          "Please enter a store URL/name, product name, or upload packaging photos to decode and verify.",
      });
    }

    const userApiKey = extractUserGeminiKey(req.headers);
    const storeCheck = checkStoreDeterministic(storeInput, productName);

    const buildImageParts = (promptText: string) => {
      const parts: Array<
        { text: string } | { inlineData: { mimeType: string; data: string } }
      > = [{ text: promptText }];

      for (const img of images) {
        parts.push({ text: `Packaging view: ${img.slotLabel}` });
        parts.push({
          inlineData: {
            mimeType: img.mimeType || "image/jpeg",
            data: img.base64,
          },
        });
      }
      return parts;
    };

    type AiDecoderPayload = Omit<
      VerifyProductResponse,
      "storeCheck" | "isSearchGrounded" | "groundingSources"
    >;

    let aiParsed: AiDecoderPayload | null = null;
    let isSearchGrounded = false;
    let groundingSources: { title: string; uri: string }[] = [];

    // 1) Primary call: Live Google Search Grounding (no responseMimeType allowed alongside tools)
    try {
      const groundedPrompt = buildVerifyProductPrompt(body, storeCheck, true);
      const groundedResponse = await generateContentWithGeminiFallback({
        userApiKey,
        contents: { parts: buildImageParts(groundedPrompt) },
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.2,
        },
      });

      const groundedText = groundedResponse.text;
      if (!groundedText) {
        throw new Error("Empty grounded response from Gemini.");
      }

      aiParsed = safeParseGeminiJson<AiDecoderPayload>(groundedText);
      isSearchGrounded = true;

      const rawChunks =
        groundedResponse.candidates?.[0]?.groundingMetadata?.groundingChunks ||
        [];
      const seenUris = new Set<string>();
      for (const chunk of rawChunks) {
        const uri = chunk?.web?.uri?.trim();
        const title = chunk?.web?.title?.trim();
        if (uri && !seenUris.has(uri)) {
          seenUris.add(uri);
          groundingSources.push({
            title: title || uri.replace(/^https?:\/\/(www\.)?/, "").split("/")[0],
            uri,
          });
        }
        if (groundingSources.length >= 5) break;
      }
    } catch (groundedError) {
      if (isGeminiKeyFailure(groundedError)) {
        throw groundedError;
      }

      const groundedErrMsg =
        groundedError instanceof Error
          ? groundedError.message
          : String(groundedError);
      console.error(
        `[DerméScan] Grounded /api/verify-product failed, falling back to structured JSON mode: ${groundedErrMsg}`
      );

      // 2) Graceful fallback if Google Search temporarily hits rate limits or returns non-JSON
      const fallbackPrompt = buildVerifyProductPrompt(body, storeCheck, false);
      const fallbackResponse = await generateContentWithGeminiFallback({
        userApiKey,
        contents: { parts: buildImageParts(fallbackPrompt) },
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: verifyPackagingSchema,
        },
      });

      const fallbackText = fallbackResponse.text;
      if (!fallbackText) {
        throw new Error("Empty response from Gemini.");
      }
      aiParsed = safeParseGeminiJson<AiDecoderPayload>(fallbackText);
      isSearchGrounded = false;
      groundingSources = [];
    }

    const hydratedSaferAlt = aiParsed.saferAlternative
      ? hydrateProductPicks([aiParsed.saferAlternative])[0] || null
      : null;

    const fullResult: VerifyProductResponse = {
      storeCheck,
      isSearchGrounded,
      groundingSources,
      identifiedProductName:
        aiParsed.identifiedProductName || productName || "Scanned Product",
      identifiedBrand: aiParsed.identifiedBrand || brandName || "",
      packagingVerdict: aiParsed.packagingVerdict || "inconclusive",
      verdictBadge: aiParsed.verdictBadge || {
        en: "Inspection Complete",
        ur: "Jaanch Mukammal",
      },
      summaryBullets: aiParsed.summaryBullets || { en: [], ur: [] },
      packagingChecks: Array.isArray(aiParsed.packagingChecks)
        ? aiParsed.packagingChecks
        : [],
      pakistanCounterfeitTips: aiParsed.pakistanCounterfeitTips || {
        en: [],
        ur: [],
      },
      nextStepBullets: aiParsed.nextStepBullets || { en: [], ur: [] },
      bestForSummary: aiParsed.bestForSummary || {
        en: "See decoded active ingredients below for skin and hair suitability.",
        ur: "Skin aur baalon ki munasibat ke liye neeche ingredients ki tafseel dekhein.",
      },
      bestForTags: Array.isArray(aiParsed.bestForTags)
        ? aiParsed.bestForTags
        : [],
      profileMatchVerdict: aiParsed.profileMatchVerdict || {
        status: "general_info",
        badge: {
          en: "General Suitability Overview",
          ur: "Aam Suitability Jaiza",
        },
        explanation: {
          en: "Select your skin or hair type above for a personalized match check.",
          ur: "Apni skin ya baal ki qism ke mutabiq check karne ke liye upar dropdown chunein.",
        },
      },
      keyActives: Array.isArray(aiParsed.keyActives) ? aiParsed.keyActives : [],
      whoShouldAvoid: aiParsed.whoShouldAvoid || { en: [], ur: [] },
      routineClashes: aiParsed.routineClashes || { en: [], ur: [] },
      howToUse: aiParsed.howToUse || {
        scheduleBadge: { en: "Follow Label", ur: "Label Ke Mutabiq" },
        steps: [],
      },
      saferAlternative: hydratedSaferAlt,
    };

    return res.status(200).json(fullResult);
  } catch (error) {
    return handleRouteError(
      res,
      error,
      "Failed to decode and verify product. Please try again."
    );
  }
}

export function createVercelHandler(
  handler: (req: ApiRequestLike, res: ApiResponseLike) => Promise<unknown>
) {
  return async function vercelEndpoint(
    req: ApiRequestLike,
    res: ApiResponseLike
  ) {
    res.setHeader?.("Content-Type", "application/json; charset=utf-8");
    res.setHeader?.("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader?.("Pragma", "no-cache");

    if (req.method === "OPTIONS") {
      res.status(204).end?.();
      return;
    }

    if (req.method && req.method.toUpperCase() !== "POST") {
      return res.status(405).json({ message: "Method not allowed. Use POST." });
    }

    return handler(req, res);
  };
}

export const apiRouter = Router();
apiRouter.post("/analyze-skin", handleAnalyzeSkin);
apiRouter.post("/analyze-hair", handleAnalyzeHair);
apiRouter.post("/check-steroid", handleCheckCream);
apiRouter.post("/check-cream", handleCheckCream);
apiRouter.post("/verify-product", handleVerifyProduct);
