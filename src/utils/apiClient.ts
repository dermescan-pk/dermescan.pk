import type { ApiErrorPayload } from "../types/dermascan.ts";

export class ApiKeyConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiKeyConfigError";
  }
}

export class RateLimitError extends Error {
  constructor(
    message = "High traffic right now — please wait 30 seconds and try again."
  ) {
    super(message);
    this.name = "RateLimitError";
  }
}

const API_TIMEOUT_MS = 105_000;

export async function postApi<TResponse>(
  url: string,
  body: unknown,
  externalSignal?: AbortSignal
): Promise<TResponse> {
  const controller = new AbortController();
  let timedOut = false;

  const timeoutId = globalThis.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, API_TIMEOUT_MS);

  const onExternalAbort = () => {
    controller.abort();
  };

  if (externalSignal) {
    if (externalSignal.aborted) {
      globalThis.clearTimeout(timeoutId);
      controller.abort();
    } else {
      externalSignal.addEventListener("abort", onExternalAbort, { once: true });
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    if (
      timedOut ||
      (err instanceof Error &&
        (err.name === "AbortError" || err.name === "TimeoutError"))
    ) {
      throw new Error(
        timedOut
          ? "This scan took longer than 105 seconds and timed out. Please try again."
          : "The scan request was cancelled."
      );
    }
    throw new Error(
      "Could not reach the scan server. Please check your connection and try again."
    );
  } finally {
    globalThis.clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", onExternalAbort);
  }

  const rawText = await response.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    if (
      /warmup|starting|waking up|please wait/i.test(rawText) &&
      rawText.includes("<")
    ) {
      throw new RateLimitError(
        "The scan server is temporarily busy or waking up — please wait a few seconds and tap Scan again."
      );
    }
    throw new Error(
      `Server returned an unexpected response (${response.status}). Please ensure the backend server is running.`
    );
  }

  if (!response.ok) {
    const err = parsed as ApiErrorPayload;
    if (err?.errorCode === "MISSING_OR_INVALID_API_KEY") {
      throw new ApiKeyConfigError(err.message);
    }
    if (
      err?.errorCode === "HIGH_TRAFFIC_OR_OVERLOAD" ||
      response.status === 429 ||
      response.status === 502 ||
      response.status === 503 ||
      response.status === 504
    ) {
      throw new RateLimitError(
        err?.message ||
          "High traffic right now — please wait 30 seconds and try again."
      );
    }
    throw new Error(err?.message || `Request failed (${response.status}).`);
  }

  return parsed as TResponse;
}
