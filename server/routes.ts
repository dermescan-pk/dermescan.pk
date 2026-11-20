import { Router } from "express";
import {
  API_KEY_ALERT_MESSAGE,
  generateContentWithGemini35Fallback,
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
    friendly.status === 502 ||
    friendly.status === 503 ||
    friendly.status === 504;

  if (isTransientOverload) {
    console.info(
      `[DerméScan] ${fallbackMsg} (${friendly.status}): ${friendly.message}`
    );
    return res.status(429).json({
      errorCode: "HIGH_TRAFFIC_OR_OVERLOAD",
      message: friendly.message,
    });
  }

  console.error(fallbackMsg, error);
  const safeStatus = friendly.status === 403 ? 400 : friendly.status;
  return res.status(safeStatus).json({
    message: friendly.message,
  });
}

const SKIN_CLINICAL_INDICATION_RULES = `CLINICAL INDICATION MAPPING RULES (STRICT — RECOMMEND ONLY WHEN GENUINELY INDICATED):
- Prioritize authentic, dermatologist-trusted Pakistani pharmacy products (including CeraVe, Physiogel, Skinoren, AccuFix, Conatural, and the exact verified Jenpharm formulations below) ONLY when clinically appropriate for the user's exact photos, body area, symptoms, skin type, and Health Profile.
- NEVER force any product for an unrelated issue, and NEVER break Pregnancy/Breastfeeding or Urgent Red-Flag safety overrides.
- When a Jenpharm formulation genuinely fits the user's skin condition, use the exact full product name below in "brand", "productName", "title", and "recommendedProducts":
  * Oily / Clogged Pores / Active Acne: "Jenpharm Clarevo Salicylic Acid Facewash" (cleanser; avoid in pregnancy or damaged barrier), "Jenpharm Dermive Oil-Free Moisturizer" (or "Jenpharm Dermive Oil-Free Moisturizer SPF 20" for lightweight daytime hydration + mild SPF), "Jenpharm Spectramatt SPF 50 Sebum Control Gel Sunscreen" (matte sunscreen).
  * Mild Texture / Whiteheads / Gentle Exfoliation: "Jenpharm MandelAC Face Wash", "Jenpharm MandelAC Serum", or "Jenpharm MandelAC Cream" (2–3x/week only; NEVER combine with Retinol/Retinoids).
  * Dry / Sensitive / Post-Steroid Damaged Barrier: "Jenpharm Dermive Moisturizing Face Wash" + "Jenpharm Dermive Sensitive Moisturizer" (or "Jenpharm Dermive Oily Moisturizer" for very dry skin without fungal acne; alongside gentle barrier options like Physiogel / CeraVe).
  * Melasma / Post-Acne Dark Marks / Sun Tan: "Jenpharm Spectra Block Tinted Sunscreen SPF 100" (blocks visible light for melasma) or "Jenpharm Spectra Block Aqua Fluid Sunscreen SPF 60" + "Jenpharm Maxdif Serum" / "Jenpharm Maxdif Skin Brightening Cream" / "Jenpharm Maxdif Brightening Moisturizer" / "Jenpharm Cerulic Glow Boosting Serum" (only on intact, non-irritated skin).
  * Adult Anti-Aging / Fine Lines: "Jenpharm Eternyx Advanced Retinol Serum" (PM only, 1–2x/week; STRICTLY NEVER with exfoliating acids like MandelAC/Clarevo, NEVER under 18, and STRICTLY FORBIDDEN during pregnancy or breastfeeding).`;

const HAIR_CLINICAL_INDICATION_RULES = `CLINICAL INDICATION MAPPING RULES (STRICT — RECOMMEND ONLY WHEN GENUINELY INDICATED):
- Prioritize authentic, dermatologist-trusted Pakistani pharmacy products (including Conatural, AccuFix, CeraVe, Bioderma, L'Oréal Elvive, and the exact verified Jenpharm formulations below) ONLY when clinically appropriate for the user's exact scalp condition, hair porosity, and shedding pattern.
- NEVER force any product for an unrelated scalp/hair issue, and NEVER claim topical shampoos, serums, or oils regrow circular alopecia areata bald patches.
- When a Jenpharm formulation genuinely fits the user's hair or scalp condition, use the exact full product name below in "brand", "productName", "title", and "recommendedProducts":
  * Hair Shedding / Thinning: "Jenpharm Anagrow Anti Hair Loss Shampoo" + "Jenpharm Anagrow Foamy Hair Growth Serum".
  * Dandruff / Flaky Scalp: "Jenpharm Anti-Dandruff Drops Serum" (paired with dual-shampoo rotation, and STRICTLY avoid raw hair oils on dandruff or seborrheic/fungal scalp).
  * Dry Scalp Pre-Wash Care (STRICTLY NO dandruff, NO oily flakes, NO fungal/pimply scalp): "Jenpharm Rosemary Oil" (diluted pre-wash care only).
  * High-Porosity / Frizzy Hair Ends: "Jenpharm Anagrow Anti-Frizz Serum" (apply strictly on mid-lengths & ends only — never on scalp roots).`;

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

    const systemPrompt = `${buildSkinAnalysisPrompt(body)}\n\n${SKIN_CLINICAL_INDICATION_RULES}`;

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

    const response = await generateContentWithGemini35Fallback({
      contents: { parts },
      config: {
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

    const systemPrompt = `${buildHairAnalysisPrompt(body)}\n\n${HAIR_CLINICAL_INDICATION_RULES}`;

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

    const response = await generateContentWithGemini35Fallback({
      contents: { parts },
      config: {
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

    const response = await generateContentWithGemini35Fallback({
      contents: { parts },
      config: {
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
          "Please enter a store URL/name, product name, or upload packaging photos to verify authenticity.",
      });
    }

    const storeCheck = checkStoreDeterministic(storeInput, productName);
    const prompt = buildVerifyProductPrompt(body, storeCheck);

    const parts: Array<
      { text: string } | { inlineData: { mimeType: string; data: string } }
    > = [{ text: prompt }];

    for (const img of images) {
      parts.push({ text: `Packaging view: ${img.slotLabel}` });
      parts.push({
        inlineData: {
          mimeType: img.mimeType || "image/jpeg",
          data: img.base64,
        },
      });
    }

    const response = await generateContentWithGemini35Fallback({
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: verifyPackagingSchema,
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error("Empty response from Gemini.");
    }

    const aiParsed = safeParseGeminiJson<
      Omit<VerifyProductResponse, "storeCheck">
    >(rawText);

    const fullResult: VerifyProductResponse = {
      storeCheck,
      ...aiParsed,
    };

    return res.status(200).json(fullResult);
  } catch (error) {
    return handleRouteError(
      res,
      error,
      "Failed to verify product. Please try again."
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
