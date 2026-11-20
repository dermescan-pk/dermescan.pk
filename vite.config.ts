import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv, type Connect, type Plugin } from "vite";
import {
  handleAnalyzeHair,
  handleAnalyzeSkin,
  handleCheckCream,
  handleVerifyProduct,
  type ApiRequestLike,
  type ApiResponseLike,
} from "./server/routes.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_API_BODY_BYTES = 25 * 1024 * 1024;

type RouteHandler = (
  req: ApiRequestLike,
  res: ApiResponseLike
) => Promise<unknown>;

const POST_API_HANDLERS: Record<string, RouteHandler> = {
  "/api/analyze-skin": handleAnalyzeSkin,
  "/api/analyze-hair": handleAnalyzeHair,
  "/api/check-steroid": handleCheckCream,
  "/api/check-cream": handleCheckCream,
  "/api/verify-product": handleVerifyProduct,
};

function sendJson(
  res: ServerResponse,
  statusCode: number,
  payload: unknown
): void {
  if (res.writableEnded) return;
  res.statusCode = statusCode;
  if (!res.headersSent) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
  }
  res.end(JSON.stringify(payload));
}

function createApiResponseAdapter(res: ServerResponse): ApiResponseLike {
  const adapter: ApiResponseLike = {
    status(code: number) {
      res.statusCode = code;
      return adapter;
    },
    json(payload: unknown) {
      sendJson(res, res.statusCode || 200, payload);
      return adapter;
    },
    setHeader(name: string, value: string) {
      if (!res.headersSent) {
        res.setHeader(name, value);
      }
    },
    end(chunk?: string) {
      if (!res.writableEnded) {
        res.end(chunk);
      }
    },
  };
  return adapter;
}

class PayloadTooLargeError extends Error {
  constructor() {
    super("Request payload exceeds 25MB limit.");
    this.name = "PayloadTooLargeError";
  }
}

function readJsonRequestBody(req: IncomingMessage): Promise<unknown> {
  const existingBody = (req as IncomingMessage & { body?: unknown }).body;
  if (existingBody !== undefined) {
    if (typeof existingBody === "string") {
      return Promise.resolve(
        existingBody.trim() ? JSON.parse(existingBody) : {}
      );
    }
    return Promise.resolve(existingBody);
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    let settled = false;

    req.on("data", (chunk: Buffer | string) => {
      if (settled) return;
      const buf = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
      totalBytes += buf.length;
      if (totalBytes > MAX_API_BODY_BYTES) {
        settled = true;
        reject(new PayloadTooLargeError());
        return;
      }
      chunks.push(buf);
    });

    req.on("end", () => {
      if (settled) return;
      settled = true;
      const raw = Buffer.concat(chunks).toString("utf8").trim();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new SyntaxError("Invalid JSON request body."));
      }
    });

    req.on("error", (err) => {
      if (settled) return;
      settled = true;
      reject(err);
    });
  });
}

function normalizePathname(rawUrl: string): string {
  const withoutQuery = rawUrl.split("?")[0] || "/";
  const trimmed = withoutQuery.replace(/\/+$/, "");
  return trimmed || "/";
}

function dermascanApiMiddleware(modeLabel: string): Connect.NextHandleFunction {
  return function dermascanApiHandler(req, res, next) {
    const reqWithOriginal = req as IncomingMessage & { originalUrl?: string };
    const rawUrl = req.url || "";
    const rawOriginalUrl = reqWithOriginal.originalUrl || "";
    const pathname = normalizePathname(rawOriginalUrl || rawUrl);
    const method = (req.method || "GET").toUpperCase();
    const isApiPrefix = pathname === "/api" || pathname.startsWith("/api/");
    const mentionsApiOrVerify =
      rawUrl.toLowerCase().includes("api") ||
      rawOriginalUrl.toLowerCase().includes("api") ||
      rawUrl.toLowerCase().includes("verify-product") ||
      rawOriginalUrl.toLowerCase().includes("verify-product");

    if (mentionsApiOrVerify || isApiPrefix) {
      console.log(
        `[DerméScan Vite API][${modeLabel}] Incoming request -> method=${method} req.url="${rawUrl}" originalUrl="${rawOriginalUrl}" normalizedPath="${pathname}" isApiPrefix=${isApiPrefix}`
      );
    }

    if (!isApiPrefix) {
      if (mentionsApiOrVerify) {
        console.log(
          `[DerméScan Vite API][${modeLabel}] Passing non-/api/* request to Vite next(): method=${method} pathname="${pathname}"`
        );
      }
      next();
      return;
    }

    if (!res.headersSent) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("Pragma", "no-cache");
    }

    if (method === "OPTIONS") {
      console.log(
        `[DerméScan Vite API][${modeLabel}] Handled OPTIONS preflight -> 204 pathname="${pathname}"`
      );
      res.statusCode = 204;
      res.end();
      return;
    }

    if (pathname === "/api/health") {
      if (method === "GET") {
        console.log(
          `[DerméScan Vite API][${modeLabel}] Matched GET /api/health -> 200`
        );
        sendJson(res, 200, { ok: true });
      } else {
        console.log(
          `[DerméScan Vite API][${modeLabel}] Rejected ${method} /api/health -> 405`
        );
        sendJson(res, 405, { message: "Method not allowed. Use GET." });
      }
      return;
    }

    const handler = POST_API_HANDLERS[pathname];
    console.log(
      `[DerméScan Vite API][${modeLabel}] Route lookup: pathname="${pathname}" matchedHandler=${Boolean(handler)} registeredRoutes=${Object.keys(POST_API_HANDLERS).join(",")}`
    );

    if (!handler) {
      console.log(
        `[DerméScan Vite API][${modeLabel}] No handler matched for "${pathname}" -> 404 JSON`
      );
      sendJson(res, 404, { message: "API endpoint not found." });
      return;
    }

    if (method !== "POST") {
      console.log(
        `[DerméScan Vite API][${modeLabel}] Wrong HTTP method ${method} for "${pathname}" -> 405 JSON`
      );
      sendJson(res, 405, { message: "Method not allowed. Use POST." });
      return;
    }

    const startedAt = Date.now();
    void (async () => {
      try {
        const body = await readJsonRequestBody(req);
        const bodyKeys =
          body && typeof body === "object" && !Array.isArray(body)
            ? Object.keys(body as Record<string, unknown>)
            : [];
        console.log(
          `[DerméScan Vite API][${modeLabel}] Executing POST ${pathname} bodyKeys=[${bodyKeys.join(", ")}]`
        );
        const apiReq: ApiRequestLike = {
          method,
          body,
          headers: req.headers,
        };
        const apiRes = createApiResponseAdapter(res);
        await handler(apiReq, apiRes);
        console.log(
          `[DerméScan Vite API][${modeLabel}] Completed POST ${pathname} status=${res.statusCode} durationMs=${Date.now() - startedAt} contentType="${String(res.getHeader("Content-Type") || "")}"`
        );
      } catch (err) {
        console.log(
          `[DerméScan Vite API][${modeLabel}] Error in POST ${pathname}:`,
          err
        );
        if (err instanceof PayloadTooLargeError) {
          sendJson(res, 413, { message: err.message });
          return;
        }
        if (err instanceof SyntaxError) {
          sendJson(res, 400, { message: "Invalid JSON request body." });
          return;
        }
        const message =
          err instanceof Error
            ? err.message
            : "Unexpected server error while processing API request.";
        sendJson(res, 500, { message });
      }
    })();
  };
}

function prependMiddlewareFirst(
  middlewares: Connect.Server,
  middleware: Connect.NextHandleFunction,
  modeLabel: string
): void {
  const stack = (
    middlewares as Connect.Server & {
      stack?: Array<{ route: string; handle: Connect.HandleFunction }>;
    }
  ).stack;

  if (Array.isArray(stack)) {
    stack.unshift({ route: "", handle: middleware });
    console.log(
      `[DerméScan Vite API][${modeLabel}] Prepended dermascanApiHandler at stack[0] (stackLength=${stack.length}, stackOrder=${stack
        .slice(0, 6)
        .map((layer, idx) => {
          const handleName =
            typeof layer.handle === "function"
              ? layer.handle.name || "anonymous"
              : "server";
          return `${idx}:${handleName}`;
        })
        .join(", ")})`
    );
  } else {
    middlewares.use(middleware);
    console.log(
      `[DerméScan Vite API][${modeLabel}] Registered dermascanApiHandler via middlewares.use() (stack array unavailable)`
    );
  }
}

function dermascanApiPlugin(): Plugin {
  return {
    name: "dermascan-vite-api",
    enforce: "pre",
    configureServer(server) {
      console.log(
        `[DerméScan Vite API] Registering dev middleware in configureServer for routes: ${Object.keys(POST_API_HANDLERS).join(", ")}`
      );
      prependMiddlewareFirst(
        server.middlewares,
        dermascanApiMiddleware("dev"),
        "dev"
      );
    },
    configurePreviewServer(server) {
      console.log(
        `[DerméScan Vite API] Registering preview middleware in configurePreviewServer for routes: ${Object.keys(POST_API_HANDLERS).join(", ")}`
      );
      prependMiddlewareFirst(
        server.middlewares,
        dermascanApiMiddleware("preview"),
        "preview"
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  for (const key of [
    "GEMINI_API_KEY",
    "GEMINI_API_KEY_2",
    "GEMINI_API_KEY_3",
  ] as const) {
    if (!process.env[key] && env[key]) {
      process.env[key] = env[key];
    }
  }

  return {
    plugins: [
      dermascanApiPlugin(),
      react(),
      tailwindcss(),
      {
        name: "copy-unbundled-src-assets",
        apply: "build",
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, "dist");
          const srcAssets = path.resolve(__dirname, "src/assets");
          const distAssets = path.resolve(distDir, "src/assets");
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, { recursive: true, force: true });
          }
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== "true",
      watch: process.env.DISABLE_HMR === "true" ? null : {},
    },
  };
});
