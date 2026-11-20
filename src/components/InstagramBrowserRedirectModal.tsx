import { useEffect, useState } from "react";
import { ExternalLink, Copy, Check, MoreHorizontal, X } from "lucide-react";
import type { Language } from "../types/dermascan.ts";

const INSTA_AUTO_REDIRECT_KEY = "dermescan_insta_auto_redirected";

export interface InstagramEnvInfo {
  isInstagram: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  currentUrl: string;
  androidChromeIntentUrl: string;
  iosChromeSchemeUrl: string;
}

export function detectInstagramBrowser(): InstagramEnvInfo {
  if (typeof navigator === "undefined" || typeof window === "undefined") {
    return {
      isInstagram: false,
      isAndroid: false,
      isIOS: false,
      currentUrl: "",
      androidChromeIntentUrl: "",
      iosChromeSchemeUrl: "",
    };
  }

  const ua = navigator.userAgent || "";
  const isInstagram = /\bInstagram\b/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const currentUrl = window.location.href;

  let androidChromeIntentUrl = currentUrl;
  let iosChromeSchemeUrl = currentUrl;

  try {
    const parsed = new URL(currentUrl);
    const scheme = parsed.protocol === "http:" ? "http" : "https";
    const withoutScheme = `${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}`;
    androidChromeIntentUrl = `intent://${withoutScheme}#Intent;scheme=${scheme};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(currentUrl)};end`;
    iosChromeSchemeUrl =
      scheme === "http"
        ? `googlechrome://${withoutScheme}`
        : `googlechromes://${withoutScheme}`;
  } catch {
    // Fallback to raw currentUrl
  }

  return {
    isInstagram,
    isAndroid,
    isIOS,
    currentUrl,
    androidChromeIntentUrl,
    iosChromeSchemeUrl,
  };
}

interface InstagramBrowserRedirectModalProps {
  env: InstagramEnvInfo;
  isOpen: boolean;
  language: Language;
  onContinueInsideInstagram: () => void;
}

export function InstagramBrowserRedirectModal({
  env,
  isOpen,
  language,
  onContinueInsideInstagram,
}: InstagramBrowserRedirectModalProps) {
  const [copied, setCopied] = useState(false);

  // On Android Instagram, attempt one automatic redirect into Google Chrome
  useEffect(() => {
    if (!env.isInstagram || !env.isAndroid || !env.androidChromeIntentUrl) {
      return;
    }

    try {
      if (sessionStorage.getItem(INSTA_AUTO_REDIRECT_KEY) === "1") {
        return;
      }
      sessionStorage.setItem(INSTA_AUTO_REDIRECT_KEY, "1");
    } catch {
      // Proceed once if sessionStorage is unavailable
    }

    const timer = window.setTimeout(() => {
      try {
        window.location.href = env.androidChromeIntentUrl;
      } catch {
        // Stay on fallback modal if Instagram blocks programmatic intent navigation
      }
    }, 150);

    return () => window.clearTimeout(timer);
  }, [env.isInstagram, env.isAndroid, env.androidChromeIntentUrl]);

  if (!isOpen || !env.isInstagram) return null;

  const isUr = language === "ur";
  const primaryHref = env.isAndroid
    ? env.androidChromeIntentUrl
    : env.iosChromeSchemeUrl;

  async function handleCopyLink() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(env.currentUrl);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
        return;
      }
    } catch {
      // Fallback below
    }

    try {
      const tempInput = document.createElement("input");
      tempInput.value = env.currentUrl;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore if copy unsupported
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="insta-chrome-redirect-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#1E181A]/65 p-4 sm:items-center"
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#E6DCE0] bg-[#FAF6F7] shadow-[0_24px_60px_rgba(35,24,28,0.32)]">
        <div className="flex items-start justify-between gap-3 border-b border-[#E6DCE0] bg-white px-6 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#B56576]">
              {isUr ? "Instagram Browser Notice" : "Better in Chrome"}
            </p>
            <h2
              id="insta-chrome-redirect-title"
              className="font-editorial text-2xl font-semibold text-[#1E181A]"
            >
              {isUr
                ? "Google Chrome Mein Kholein"
                : "Open DerméScan in Chrome"}
            </h2>
          </div>

          <button
            type="button"
            aria-label="Continue inside Instagram browser"
            onClick={onContinueInsideInstagram}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E6DCE0] bg-[#FAF6F7] text-[#5E5055] transition-colors hover:bg-[#F6ECEF] hover:text-[#1E181A]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <p className="text-xs leading-relaxed text-[#5E5055]">
            {isUr
              ? "Instagram ka andar wala browser camera permission block karta hai. Saaf skin aur product photos kheinchnay ke liye is link ko Chrome mein kholein."
              : "Instagram's built-in browser often blocks camera permissions. Open DerméScan in Chrome so you can take clear skin, hair, and product photos."}
          </p>

          {env.isIOS && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-[#E8C5CA] bg-[#FDF4F5] px-4 py-3 text-xs font-medium text-[#8C3B4A]">
              <MoreHorizontal className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {isUr
                  ? "iPhone par: Upar/neeche corner mein '···' par tap karein aur 'Open in external browser' chunein."
                  : "On iPhone: Tap the '···' menu in Instagram's corner and choose 'Open in browser', or tap Open in Chrome below."}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-2.5 pt-1">
            <a
              href={primaryHref}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#B56576] px-5 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#9E5263] active:scale-95"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              <span>
                {isUr ? "Chrome Mein Kholein →" : "Open in Chrome →"}
              </span>
            </a>

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-[#E6DCE0] bg-white px-5 py-2.5 text-xs font-semibold text-[#1E181A] transition-colors hover:bg-[#F6ECEF]"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 shrink-0 text-[#2D6A4F]" />
                  <span className="text-[#2D6A4F]">
                    {isUr
                      ? "Link Copy Ho Gaya! Chrome Mein Paste Karein"
                      : "Link Copied! Paste in Chrome"}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 shrink-0 text-[#B56576]" />
                  <span>
                    {isUr ? "Website Link Copy Karein" : "Copy Website Link"}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onContinueInsideInstagram}
              className="py-1.5 text-center text-[11px] font-medium text-[#5E5055] underline underline-offset-2 hover:text-[#1E181A]"
            >
              {isUr
                ? "Abhi Yahin Jaari Rakhein"
                : "Continue Inside Instagram Anyway"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
