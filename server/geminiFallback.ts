import {
  GoogleGenAI,
  ThinkingLevel,
  type GenerateContentParameters,
  type GenerateContentResponse,
} from "@google/genai";

export const GEMINI_35_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
] as const;

export const API_KEY_ALERT_MESSAGE =
  "GEMINI_API_KEY is not configured yet. Add your Google AI Studio key in Project Settings -> Secrets / Environment Variables to activate live scans.";

export const HIGH_TRAFFIC_MESSAGE =
  "High traffic right now — please wait 30 seconds and try again.";

export const MODEL_OVERLOAD_MESSAGE =
  "Gemini servers are temporarily busy right now — please wait a few seconds and tap Scan again.";

export const TIMEOUT_TRAFFIC_MESSAGE =
  "The AI scan took too long under high demand — please wait a few seconds and tap Scan again.";

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

export function getConfiguredGeminiKeys(): string[] {
  const candidates = [
    process.env.GEMINI_API_KEY,
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
    code?: number;
    message?: string;
    cause?: unknown;
  };
  let httpStatus =
    typeof errObj.status === "number"
      ? errObj.status
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
    httpStatus === 503 ||
    httpStatus === 504 ||
    lower.includes("quota") ||
    lower.includes("resource_exhausted") ||
    lower.includes("rate limit") ||
    lower.includes("unavailable") ||
    lower.includes("overloaded") ||
    lower.includes("high demand") ||
    lower.includes("not found") ||
    lower.includes("no longer available") ||
    lower.includes("timed out") ||
    lower.includes("took too long") ||
    lower.includes("abort")
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

  if (httpStatus === 429) {
    return {
      status: 429,
      message: HIGH_TRAFFIC_MESSAGE,
    };
  }

  if (httpStatus === 503) {
    return {
      status: 503,
      message: MODEL_OVERLOAD_MESSAGE,
    };
  }

  if (httpStatus === 504) {
    return {
      status: 504,
      message: TIMEOUT_TRAFFIC_MESSAGE,
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

/**
 * Multi-key Gemini 3.5 failover:
 * 1) Tries `gemini-3.5-flash` across GEMINI_API_KEY -> GEMINI_API_KEY_2 -> GEMINI_API_KEY_3
 * 2) If all keys hit 429/404/503/timeout on `gemini-3.5-flash`, falls back to `gemini-3.5-flash-lite` across the same keys.
 * 3) If Pass 1 fails solely due to transient 503/504/429 spikes and budget remains, waits briefly and runs a recovery pass on `gemini-3.5-flash-lite`.
 */
export async function generateContentWithGemini35Fallback(
  params: Omit<GenerateContentParameters, "model">
): Promise<GenerateContentResponse> {
  const keys = getConfiguredGeminiKeys();
  if (keys.length === 0) {
    throw new GeminiKeyError(API_KEY_ALERT_MESSAGE);
  }

  const startedAt = Date.now();
  const maxTotalBudgetMs = 92_000;
  let lastError: unknown;
  let sawNonKeyFailure = false;

  const attemptSequence: Array<{
    model: (typeof GEMINI_35_MODELS)[number];
    apiKey: string;
    keyNumber: number;
  }> = [];

  for (const model of GEMINI_35_MODELS) {
    keys.forEach((apiKey, idx) => {
      attemptSequence.push({ model, apiKey, keyNumber: idx + 1 });
    });
  }

  const runSingleAttempt = async (
    model: (typeof GEMINI_35_MODELS)[number],
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
    const requestConfig = !baseConfig.thinkingConfig
      ? {
          ...baseConfig,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.MINIMAL,
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
      if (!baseConfig.thinkingConfig && isThinkingConfigRejection(err)) {
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

  for (let i = 0; i < attemptSequence.length; i++) {
    const { model, apiKey, keyNumber } = attemptSequence[i];
    const elapsedMs = Date.now() - startedAt;
    const remainingBudgetMs = maxTotalBudgetMs - elapsedMs;
    if (i > 0 && remainingBudgetMs < 14_000) {
      break;
    }
    const isLastInPass1 = i === attemptSequence.length - 1;

    const defaultAttemptTimeout =
      keys.length === 1
        ? model === "gemini-3.5-flash"
          ? 40_000
          : 45_000
        : isLastInPass1
          ? 40_000
          : 28_000;

    const timeoutMs = Math.min(defaultAttemptTimeout, Math.max(14_000, remainingBudgetMs));

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

      if (!isLastInPass1 && (details.httpStatus === 503 || details.httpStatus === 429)) {
        const remainingAfter = maxTotalBudgetMs - (Date.now() - startedAt);
        if (remainingAfter > 22_000) {
          await sleep(900);
        }
      }
    }
  }

  // Pass 2 transient recovery on gemini-3.5-flash-lite if Pass 1 failed on 503/504/429 and time remains
  const elapsedAfterPass1 = Date.now() - startedAt;
  if (
    sawNonKeyFailure &&
    isRetryableTransientFailure(lastError) &&
    maxTotalBudgetMs - elapsedAfterPass1 > 18_000
  ) {
    await sleep(1_500);
    for (let kIdx = 0; kIdx < keys.length; kIdx++) {
      const remaining = maxTotalBudgetMs - (Date.now() - startedAt);
      if (remaining < 14_000) break;

      const apiKey = keys[kIdx];
      const timeoutMs = Math.min(32_000, remaining);
      try {
        return await runSingleAttempt("gemini-3.5-flash-lite", apiKey, timeoutMs);
      } catch (retryErr) {
        lastError = retryErr;
        if (!isRetryableTransientFailure(retryErr) && !isGeminiKeyFailure(retryErr)) {
          throw retryErr;
        }
      }
    }
  }

  if (isGeminiKeyFailure(lastError) && !sawNonKeyFailure) {
    throw new GeminiKeyError(API_KEY_ALERT_MESSAGE);
  }

  throw lastError;
}
