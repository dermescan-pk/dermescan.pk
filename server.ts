import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  apiRouter,
  handleAnalyzeHair,
  handleAnalyzeSkin,
  handleCheckCream,
  handleVerifyProduct,
} from "./server/routes.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isApiRequest(req: Request): boolean {
  return (
    req.path === "/api" ||
    req.path.startsWith("/api/") ||
    req.originalUrl === "/api" ||
    req.originalUrl.startsWith("/api/")
  );
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === "production";

  app.use(express.json({ limit: "25mb" }));

  // Ensure every /api/* response is uncached JSON and never rewritten by HTML fallbacks
  app.use("/api", (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    next();
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  // Explicitly register all 4 scan endpoints BEFORE Vite's static/HTML middleware
  app.post("/api/analyze-skin", handleAnalyzeSkin);
  app.post("/api/analyze-hair", handleAnalyzeHair);
  app.post("/api/check-steroid", handleCheckCream);
  app.post("/api/check-cream", handleCheckCream);
  app.post("/api/verify-product", handleVerifyProduct);

  app.use("/api", apiRouter);

  // Guarantee /api/* requests NEVER fall through to Vite/SPA HTML fallback
  app.all("/api/*", (_req, res) => {
    res.status(404).json({ message: "API endpoint not found." });
  });
  app.use("/api", (_req, res) => {
    res.status(404).json({ message: "API endpoint not found." });
  });

  // Catch body-parser / JSON errors cleanly as JSON instead of HTML
  app.use(
    (err: unknown, req: Request, res: Response, next: NextFunction) => {
      if (isApiRequest(req)) {
        const msg =
          err instanceof Error
            ? err.message
            : "Unexpected server error while processing API request.";
        return res.status(400).json({ message: msg });
      }
      return next(err);
    }
  );

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use((req, res, next) => {
      if (isApiRequest(req)) {
        return res.status(404).json({ message: "API endpoint not found." });
      }
      return vite.middlewares(req, res, next);
    });
  } else {
    const distDir = path.resolve(__dirname, "dist");
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get("*", (req, res) => {
        if (isApiRequest(req)) {
          return res.status(404).json({ message: "API endpoint not found." });
        }
        return res.sendFile(path.join(distDir, "index.html"));
      });
    }
  }

  const httpServer = app.listen(PORT, "0.0.0.0", () => {
    console.log(`DerméScan server listening on http://localhost:${PORT}`);
  });
  httpServer.requestTimeout = 115_000;
  httpServer.headersTimeout = 120_000;
}

startServer().catch((err) => {
  console.error("Failed to start DerméScan server:", err);
  process.exit(1);
});
