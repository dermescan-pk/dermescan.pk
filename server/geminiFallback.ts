import {
  GoogleGenAI,
  type GenerateContentParameters,
  type GenerateContentResponse,
} from "@google/genai";

export const GEMINI_FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
] as const;

export const GEMINI_35_MODELS = GEMINI_FALLBACK_MODELS;

export const FALLBACK_BACKOFF_MS = 800;

export const API_KEY_ALERT_MESSAGE =
  "GEMINI_API_KEY is not configured yet. Add your Google AI Studio key in Project Settings -> Secrets / Environment Variables to activate live scans.";

export const PEAK_DEMAND_RETRY_MESSAGE =
  "Our AI skin specialist is experiencing peak demand right now — please tap Scan again in 5 seconds.";

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
  const primaryKey =
    cleanUserKey && !PLACEHOLDER_KEYS.has(cleanUserKey)
      ? cleanUserKey
      : process.env.GEMINI_API_KEY;

  const candidates = [
    primaryKey,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
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
    httpStatus === 404 ||
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
    lower.includes("not found") ||
    lower.includes("no longer available") ||
    lower.includes("timed out") ||
    lower.includes("took too long") ||
    lower.includes("abort") ||
    lower.includes("fetch failed") ||
    lower.includes("econnreset")
  );
}

function isThinkingConfigRejection(error: unknown): boolean {
  const { httpStatus, readableMessage } = extractGeminiErrorDetails(error);
  if (httpStatus !== 400) return false;
  const lower = readableMessage.toLowerCase();
  return lower.includes("thinking");
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
 * For primary key (`x-user-gemini-key` header if provided, else `process.env.GEMINI_API_KEY`):
 *   1) `gemini-2.5-flash` (with `thinkingConfig: { thinkingBudget: 0 }`)
 *   2) `gemini-2.5-flash-lite`
 *   3) `gemini-2.0-flash`
 * Then retries the exact same 3-model chain with `GEMINI_API_KEY_2` (and `GEMINI_API_KEY_3` if set),
 * applying a fast 800ms backoff on 429, 503, or 500 errors.
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

    const baseConfig = params.config || {};
    const shouldSetZeroThinking =
      model === "gemini-2.5-flash" && !baseConfig.thinkingConfig;

    const requestConfig = shouldSetZeroThinking
      ? {
          ...baseConfig,
          thinkingConfig: {
            thinkingBudget: 0,
          },
          abortSignal: AbortSignal.timeout(timeoutMs),
        }
      : {
          ...baseConfig,
          abortSignal: AbortSignal.timeout(timeoutMs),
        };

    try {
      return await ai.models.generateContent({
        ...params,
        model,
        config: requestConfig,
      });
    } catch (err) {
      if (shouldSetZeroThinking && isThinkingConfigRejection(err)) {
        return await ai.models.generateContent({
          ...params,
          model,
          config: {
            ...baseConfig,
            abortSignal: AbortSignal.timeout(timeoutMs),
          },
        });
      }
      throw err;
    }
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

      const preferredTimeout = isFinalAttemptOverall
        ? 38_000
        : model === "gemini-2.5-flash"
          ? 28_000
          : 24_000;

      const timeoutMs = Math.min(
        preferredTimeout,
        Math.max(8_000, remainingBudgetMs)
      );

      try {
        return await runSingleAttempt(model, apiKey, timeoutMs);
      } catch (err) {
        lastError = err;
        const keyFailure = isGeminiKeyFailure(err);
        if (!keyFailure) {
          sawNonKeyFailure = true;
        }

        const canRotate = keyFailure || isRetryableTransientFailure(err);
        if (!canRotate) {
          throw err;
        }

        const details = extractGeminiErrorDetails(err);
        console.info(
          `[DerméScan] Model "${model}" with key #${keyNumber} failed (${details.httpStatus ?? "err"}); failing over...`
        );

        // If the API key itself is invalid/unauthorized, skip remaining models on this key
        // and rotate straight to the next configured key.
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

  throw lastError;
}

export const generateContentWithGemini35Fallback =
  generateContentWithGeminiFallback;
