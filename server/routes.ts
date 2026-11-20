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

    const systemPrompt = buildSkinAnalysisPrompt(body);

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

    const systemPrompt = buildHairAnalysisPrompt(body);

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
