import {
  GoogleGenAI,
  type GenerateContentParameters,
  type GenerateContentResponse,
} from "@google/genai";

export const GEMINI_FALLBACK_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
] as const;

export const FALLBACK_BACKOFF_MS = 800;

export const API_KEY_ALERT_MESSAGE =
  "GEMINI_API_KEY is not configured yet. Add your Google AI Studio key in Project Settings -> Secrets / Environment Variables to activate live scans.";

export const PEAK_DEMAND_RETRY_MESSAGE =
  "Our AI skin specialist is experiencing peak demand right now, please tap Scan again in 5 seconds.";

export const HIGH_TRAFFIC_MESSAGE = PEAK_DEMAND_RETRY_MESSAGE;
export const MODEL_OVERLOAD_MESSAGE = PEAK_DEMAND_RETRY_MESSAGE;
export const TIMEOUT_TRAFFIC_MESSAGE = PEAK_DEMAND_RETRY_MESSAGE;

export class GeminiKeyError extends Error {
  constructor(message = API_KEY_ALERT_MESSAGE) {
    super(message);
    this.name = "GeminiKeyError";
  }
}

const PLACEHOLDER_KEYS = new Set([
  "MY_GEMINI_API_KEY",
  "your_google_ai_studio_api_key_here",
]);

export function extractUserGeminiKey(
  headers?: Record<string, string | string[] | undefined>
): string | undefined {
  if (!headers) return undefined;

  for (const [headerName, rawValue] of Object.entries(headers)) {
    if (headerName.toLowerCase() !== "x-user-gemini-key") continue;
    const candidate = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    const trimmed = typeof candidate === "string" ? candidate.trim() : "";
    if (trimmed && !PLACEHOLDER_KEYS.has(trimmed)) {
      return trimmed;
    }
  }

  return undefined;
}

export function getConfiguredGeminiKeys(userGeminiKey?: string): string[] {
  const cleanUserKey = (userGeminiKey || "").trim();
  const envKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ].filter(Boolean);

  const candidates = [
    ...(cleanUserKey && !PLACEHOLDER_KEYS.has(cleanUserKey)
      ? [cleanUserKey]
      : []),
    ...envKeys,
  ];

  const seen = new Set<string>();
  const validKeys: string[] = [];

  for (const raw of candidates) {
    const trimmed = (raw || "").trim();
    if (!trimmed || PLACEHOLDER_KEYS.has(trimmed) || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    validKeys.push(trimmed);
  }

  return validKeys;
}

function extractGeminiErrorDetails(error: unknown): {
  httpStatus?: number;
  readableMessage: string;
} {
  if (!error || typeof error !== "object") {
    return { readableMessage: String(error || "Unknown error") };
  }

  const errObj = error as {
    name?: string;
    status?: number;
    statusCode?: number;
    code?: number;
    message?: string;
    cause?: unknown;
  };
  let httpStatus =
    typeof errObj.status === "number"
      ? errObj.status
      : typeof errObj.statusCode === "number"
        ? errObj.statusCode
        : typeof errObj.code === "number"
          ? errObj.code
          : undefined;
  let readableMessage = (errObj.message || "").trim();
  const causeMsg =
    errObj.cause instanceof Error ? errObj.cause.message.toLowerCase() : "";

  if (readableMessage.startsWith("{")) {
    try {
      const parsed = JSON.parse(readableMessage) as {
        error?: { code?: number; message?: string; status?: string };
        code?: number;
        message?: string;
      };
      const inner = parsed.error ?? parsed;
      if (typeof inner.code === "number" && !httpStatus) {
        httpStatus = inner.code;
      }
      if (inner.message) {
        readableMessage = inner.message;
      }
    } catch {
      // keep raw message
    }
  } else {
    const jsonStart = readableMessage.indexOf("{");
    if (jsonStart !== -1) {
      try {
        const parsed = JSON.parse(readableMessage.slice(jsonStart)) as {
          error?: { code?: number; message?: string };
        };
        if (parsed.error?.code && !httpStatus) {
          httpStatus = parsed.error.code;
        }
        if (parsed.error?.message) {
          readableMessage = parsed.error.message;
        }
      } catch {
        // keep raw message
      }
    }
  }

  const lowerMsg = readableMessage.toLowerCase();
  const isAbortOrTimeout =
    lowerMsg.includes("timed out") ||
    lowerMsg.includes("abort") ||
    causeMsg.includes("abort") ||
    causeMsg.includes("timed out") ||
    errObj.name === "TimeoutError" ||
    errObj.name === "AbortError" ||
    (typeof DOMException !== "undefined" &&
      error instanceof DOMException &&
      (error.name === "AbortError" || error.name === "TimeoutError")) ||
    (error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError"));

  if (isAbortOrTimeout) {
    httpStatus = 504;
    readableMessage = TIMEOUT_TRAFFIC_MESSAGE;
  } else if (!httpStatus && /\b429\b|RESOURCE_EXHAUSTED/i.test(readableMessage)) {
    httpStatus = 429;
  } else if (!httpStatus && /\b503\b|UNAVAILABLE/i.test(readableMessage)) {
    httpStatus = 503;
  } else if (!httpStatus && /\b500\b|\bINTERNAL\b/i.test(readableMessage)) {
    httpStatus = 500;
  } else if (!httpStatus && /\b404\b|NOT_FOUND/i.test(readableMessage)) {
    httpStatus = 404;
  } else if (!httpStatus && /\b403\b|PERMISSION_DENIED/i.test(readableMessage)) {
    httpStatus = 403;
  } else if (!httpStatus && /\b400\b|INVALID_ARGUMENT/i.test(readableMessage)) {
    httpStatus = 400;
  }

  return { httpStatus, readableMessage };
}

export function isGeminiKeyFailure(error: unknown): boolean {
  if (error instanceof GeminiKeyError) return true;
  if (!error || typeof error !== "object") return false;

  const { httpStatus, readableMessage } = extractGeminiErrorDetails(error);
  const msg = readableMessage.toLowerCase();

  if (httpStatus === 401 || httpStatus === 403) {
    return true;
  }

  return (
    msg.includes("api_key_invalid") ||
    msg.includes("api key not valid") ||
    msg.includes("missing api key") ||
    msg.includes("gemini_api_key") ||
    msg.includes("permission_denied") ||
    msg.includes("unauthenticated")
  );
}

function isRetryableTransientFailure(error: unknown): boolean {
  const { httpStatus, readableMessage } = extractGeminiErrorDetails(error);
  const lower = readableMessage.toLowerCase();

  return (
    httpStatus === 429 ||
    httpStatus === 500 ||
    httpStatus === 502 ||
    httpStatus === 503 ||
    httpStatus === 504 ||
    lower.includes("quota") ||
    lower.includes("resource_exhausted") ||
    lower.includes("rate limit") ||
    lower.includes("unavailable") ||
    lower.includes("overloaded") ||
    lower.includes("internal error") ||
    lower.includes("high demand") ||
    lower.includes("peak demand") ||
    lower.includes("timed out") ||
    lower.includes("took too long") ||
    lower.includes("abort") ||
    lower.includes("fetch failed") ||
    lower.includes("econnreset")
  );
}

export function getFriendlyGeminiErrorMessage(
  error: unknown,
  fallbackMsg: string
): { status: number; message: string } {
  const { httpStatus, readableMessage } = extractGeminiErrorDetails(error);

  if (
    httpStatus === 429 ||
    httpStatus === 500 ||
    httpStatus === 502 ||
    httpStatus === 503 ||
    httpStatus === 504 ||
    isRetryableTransientFailure(error)
  ) {
    return {
      status: httpStatus && httpStatus >= 400 && httpStatus < 600 ? httpStatus : 503,
      message: PEAK_DEMAND_RETRY_MESSAGE,
    };
  }

  const responseStatus =
    typeof httpStatus === "number" && httpStatus >= 400 && httpStatus < 600
      ? httpStatus
      : 500;

  return {
    status: responseStatus,
    message: readableMessage || fallbackMsg,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface GeminiFallbackParams
  extends Omit<GenerateContentParameters, "model"> {
  userApiKey?: string;
}

/**
 * Multi-model + multi-key automatic fallback chain across peak traffic spikes:
 * Rotates strictly in priority order across Gemini 3.5 models:
 *   1) `gemini-3.5-flash` (primary flagship 3.5 model)
 *   2) `gemini-3.5-flash-lite` (fast high-quota 3.5 fallback)
 * Enforces `temperature: 0.2` on every call and strips `thinkingConfig`.
 * Automatically omits `responseMimeType` / `responseSchema` when `tools` (e.g. `googleSearch`)
 * are provided. Rotates across all configured API keys (`GEMINI_API_KEY`, `GEMINI_API_KEY_2`,
 * `GEMINI_API_KEY_3`, plus `x-user-gemini-key` if provided) on any error
 * (`400`, `403`, `404`, `429`, `500`, `503`), logging the exact Google API
 * error message (`err.message`) to `console.error`.
 */
export async function generateContentWithGeminiFallback({
  userApiKey,
  ...params
}: GeminiFallbackParams): Promise<GenerateContentResponse> {
  const keys = getConfiguredGeminiKeys(userApiKey);
  if (keys.length === 0) {
    throw new GeminiKeyError(API_KEY_ALERT_MESSAGE);
  }

  const startedAt = Date.now();
  const maxTotalBudgetMs = 95_000;
  let lastError: unknown;
  let lastNonKeyError: unknown;
  let sawNonKeyFailure = false;

  const runSingleAttempt = async (
    model: (typeof GEMINI_FALLBACK_MODELS)[number],
    apiKey: string,
    timeoutMs: number
  ): Promise<GenerateContentResponse> => {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
        timeout: timeoutMs,
        retryOptions: {
          attempts: 1,
        },
      },
    });

    const {
      thinkingConfig: _ignoredThinkingConfig,
      responseMimeType: rawResponseMimeType,
      responseSchema: rawResponseSchema,
      ...restConfig
    } = params.config || {};

    const hasTools =
      Array.isArray(restConfig.tools) && restConfig.tools.length > 0;

    return await ai.models.generateContent({
      ...params,
      model,
      config: {
        ...restConfig,
        ...(hasTools
          ? {}
          : {
              ...(rawResponseMimeType
                ? { responseMimeType: rawResponseMimeType }
                : {}),
              ...(rawResponseSchema
                ? { responseSchema: rawResponseSchema }
                : {}),
            }),
        temperature: restConfig.temperature ?? 0.2,
        abortSignal: AbortSignal.timeout(timeoutMs),
      },
    });
  };

  for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
    const apiKey = keys[keyIndex];
    const keyNumber = keyIndex + 1;

    for (
      let modelIndex = 0;
      modelIndex < GEMINI_FALLBACK_MODELS.length;
      modelIndex++
    ) {
      const model = GEMINI_FALLBACK_MODELS[modelIndex];
      const elapsedMs = Date.now() - startedAt;
      const remainingBudgetMs = maxTotalBudgetMs - elapsedMs;
      const isVeryFirstAttempt = keyIndex === 0 && modelIndex === 0;

      if (!isVeryFirstAttempt && remainingBudgetMs < 8_000) {
        break;
      }

      const isFinalAttemptOverall =
        keyIndex === keys.length - 1 &&
        modelIndex === GEMINI_FALLBACK_MODELS.length - 1;

      const preferredTimeout = isFinalAttemptOverall ? 35_000 : 22_000;

      const timeoutMs = Math.min(
        preferredTimeout,
        Math.max(8_000, remainingBudgetMs)
      );

      try {
        return await runSingleAttempt(model, apiKey, timeoutMs);
      } catch (err) {
        lastError = err;
        const details = extractGeminiErrorDetails(err);
        const keyFailure = isGeminiKeyFailure(err);
        if (!keyFailure) {
          sawNonKeyFailure = true;
          lastNonKeyError = err;
        }

        const isExplicitFallbackStatus =
          details.httpStatus === 400 ||
          details.httpStatus === 401 ||
          details.httpStatus === 403 ||
          details.httpStatus === 404 ||
          details.httpStatus === 429 ||
          details.httpStatus === 500 ||
          details.httpStatus === 502 ||
          details.httpStatus === 503 ||
          details.httpStatus === 504;

        const rawErrMessage =
          err instanceof Error
            ? err.message
            : typeof err === "object" && err !== null && "message" in err
              ? String((err as { message?: unknown }).message)
              : String(err);

        console.error(
          `[DerméScan] Gemini API error for model "${model}" with key #${keyNumber} (status: ${details.httpStatus ?? "unknown"}): ${rawErrMessage}`
        );

        const canRotate =
          isExplicitFallbackStatus ||
          keyFailure ||
          isRetryableTransientFailure(err);
        if (!canRotate) {
          throw err;
        }

        // If the API key itself is invalid/unauthorized (401 or invalid key message),
        // skip remaining models on this key and rotate straight to the next configured key.
        // On 400, 403, 404, 429, 500, 503 continue rotating across all models and keys.
        if (
          keyFailure &&
          (details.httpStatus === 401 ||
            details.readableMessage.toLowerCase().includes("api_key_invalid") ||
            details.readableMessage.toLowerCase().includes("api key not valid"))
        ) {
          break;
        }

        const isBackoffStatus =
          details.httpStatus === 429 ||
          details.httpStatus === 503 ||
          details.httpStatus === 500;

        if (!isFinalAttemptOverall && isBackoffStatus) {
          const remainingAfter = maxTotalBudgetMs - (Date.now() - startedAt);
          if (remainingAfter > 10_000) {
            await sleep(FALLBACK_BACKOFF_MS);
          }
        }
      }
    }
  }

  if (isGeminiKeyFailure(lastError) && !sawNonKeyFailure) {
    throw new GeminiKeyError(API_KEY_ALERT_MESSAGE);
  }

  if (sawNonKeyFailure && isGeminiKeyFailure(lastError) && lastNonKeyError) {
    throw lastNonKeyError;
  }

  throw lastError;
}
