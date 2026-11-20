import { useEffect, useRef, useState } from "react";

export const INTRO_SEEN_SESSION_KEY = "dermescan_intro_seen";

export function hasSeenLuxuryIntro(): boolean {
  try {
    return (
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem(INTRO_SEEN_SESSION_KEY) === "1"
    );
  } catch {
    return false;
  }
}

export function markLuxuryIntroSeen(): void {
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(INTRO_SEEN_SESSION_KEY, "1");
    }
  } catch {
    // Ignore storage access failures in private browsing
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface LuxuryIntro3DProps {
  isOpen: boolean;
  onFinish: () => void;
}

const AMBIENT_MOTES = [
  { left: "12%", top: "18%", size: 7, delay: "0s", duration: "3.2s" },
  { left: "82%", top: "16%", size: 9, delay: "0.4s", duration: "3.6s" },
  { left: "24%", top: "74%", size: 6, delay: "0.2s", duration: "3.0s" },
  { left: "76%", top: "78%", size: 8, delay: "0.7s", duration: "3.5s" },
  { left: "48%", top: "12%", size: 5, delay: "0.9s", duration: "2.9s" },
  { left: "16%", top: "46%", size: 6, delay: "0.5s", duration: "3.4s" },
  { left: "86%", top: "50%", size: 7, delay: "0.15s", duration: "3.1s" },
  { left: "58%", top: "84%", size: 6, delay: "0.6s", duration: "3.3s" },
];

function SerumDropperSvg() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-10 w-10 sm:h-11 sm:w-11"
    >
      <defs>
        <linearGradient id="introSerumGlass" x1="18" y1="22" x2="46" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
          <stop offset="55%" stopColor="#F5DCE1" stopOpacity="0.78" />
          <stop offset="100%" stopColor="#B56576" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="introRoseCap" x1="25" y1="6" x2="39" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D799A6" />
          <stop offset="100%" stopColor="#9A4E5F" />
        </linearGradient>
      </defs>
      {/* Dropper bulb & collar */}
      <path d="M27.5 8.5C27.5 6 36.5 6 36.5 8.5V16H27.5V8.5Z" fill="url(#introRoseCap)" />
      <rect x="25" y="16" width="14" height="4.5" rx="1.5" fill="#EAD0D6" stroke="#B56576" strokeWidth="1.2" />
      {/* Glass bottle */}
      <path
        d="M25 20.5H39L43.5 26.5C44.5 27.8 45 29.4 45 31V51C45 54.3 42.3 57 39 57H25C21.7 57 19 54.3 19 51V31C19 29.4 19.5 27.8 20.5 26.5L25 20.5Z"
        fill="url(#introSerumGlass)"
        stroke="#B56576"
        strokeWidth="1.35"
      />
      {/* Internal pipette & serum meniscus */}
      <path d="M32 21V45" stroke="#B56576" strokeWidth="1.15" strokeLinecap="round" strokeOpacity="0.7" />
      <path d="M20.5 39C25 37.2 39 40.8 43.5 39V51C43.5 53.5 41.5 55.5 39 55.5H25C22.5 55.5 20.5 53.5 20.5 51V39Z" fill="#B56576" fillOpacity="0.28" />
      <path d="M23.5 28.5V48" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.75" />
      <circle cx="32" cy="48.5" r="2.1" fill="#B56576" fillOpacity="0.85" />
    </svg>
  );
}

function SunscreenTubeSvg() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-10 w-10 sm:h-11 sm:w-11"
    >
      <defs>
        <linearGradient id="introTubeBody" x1="18" y1="10" x2="46" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.96" />
          <stop offset="65%" stopColor="#F9ECEF" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#E6C5CD" stopOpacity="0.72" />
        </linearGradient>
      </defs>
      {/* Top crimp seal */}
      <rect x="19" y="8" width="26" height="4.5" rx="1.5" fill="#E9CFD5" stroke="#B56576" strokeWidth="1.2" />
      {/* Sculpted tube silhouette */}
      <path
        d="M20 12.5H44L41.2 44.5C41 46 39.8 47 38.3 47H25.7C24.2 47 23 46 22.8 44.5L20 12.5Z"
        fill="url(#introTubeBody)"
        stroke="#B56576"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      {/* SPF Sunburst crest */}
      <circle cx="32" cy="26" r="5" stroke="#B56576" strokeWidth="1.25" fill="#B56576" fillOpacity="0.14" />
      <path d="M32 18.5V17M32 35V33.5M24.5 26H23M41 26H39.5" stroke="#B56576" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M26.5 38H37.5" stroke="#B56576" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.65" />
      {/* Faceted flip cap */}
      <path
        d="M25.5 47H38.5L37.5 55.5C37.3 56.4 36.6 57 35.7 57H28.3C27.4 57 26.7 56.4 26.5 55.5L25.5 47Z"
        fill="#B56576"
        fillOpacity="0.82"
        stroke="#8C4858"
        strokeWidth="1.2"
      />
      <path d="M23.5 16.5L25 41" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" strokeOpacity="0.82" />
    </svg>
  );
}

function CeramideJarSvg() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-10 w-10 sm:h-11 sm:w-11"
    >
      <defs>
        <linearGradient id="introJarLid" x1="15" y1="16" x2="49" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E6C3CC" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#B56576" />
        </linearGradient>
        <linearGradient id="introJarBody" x1="14" y1="27" x2="50" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.94" />
          <stop offset="100%" stopColor="#F2DCE1" stopOpacity="0.75" />
        </linearGradient>
      </defs>
      {/* Chamfered rose-gold lid */}
      <rect x="15" y="16" width="34" height="9.5" rx="3.5" fill="url(#introJarLid)" stroke="#B56576" strokeWidth="1.3" />
      <path d="M19 19.5H45" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.7" />
      {/* Glass apothecary jar */}
      <path
        d="M14 27.5C14 26.4 14.9 25.5 16 25.5H48C49.1 25.5 50 26.4 50 27.5V46C50 50.4 46.4 54 42 54H22C17.6 54 14 50.4 14 46V27.5Z"
        fill="url(#introJarBody)"
        stroke="#B56576"
        strokeWidth="1.35"
      />
      {/* Inner cream vessel silhouette */}
      <path
        d="M18 32H46V45C46 47.8 43.8 50 41 50H23C20.2 50 18 47.8 18 45V32Z"
        fill="#B56576"
        fillOpacity="0.16"
      />
      <path d="M23 39.5H41" stroke="#B56576" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.65" />
      <path d="M26 43.5H38" stroke="#B56576" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.45" />
      <path d="M17.5 30V45" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.8" />
    </svg>
  );
}

function BotanicalElixirSvg() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-10 w-10 sm:h-11 sm:w-11"
    >
      <defs>
        <linearGradient id="introElixirGlass" x1="20" y1="20" x2="44" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.94" />
          <stop offset="60%" stopColor="#F7E3E7" stopOpacity="0.82" />
          <stop offset="100%" stopColor="#C97D8D" stopOpacity="0.52" />
        </linearGradient>
      </defs>
      {/* Crystal stopper & neck */}
      <rect x="27" y="7" width="10" height="8" rx="2.5" fill="#B56576" fillOpacity="0.85" stroke="#8C4858" strokeWidth="1.2" />
      <rect x="25.5" y="15" width="13" height="4" rx="1.2" fill="#EAD0D6" stroke="#B56576" strokeWidth="1.15" />
      {/* Slender flacon */}
      <path
        d="M26.5 19H37.5L43 27.5C44 29 44.5 30.8 44.5 32.6V50.5C44.5 54.1 41.6 57 38 57H26C22.4 57 19.5 54.1 19.5 50.5V32.6C19.5 30.8 20 29 21 27.5L26.5 19Z"
        fill="url(#introElixirGlass)"
        stroke="#B56576"
        strokeWidth="1.35"
      />
      {/* Botanical leaf filigree inside elixir */}
      <path d="M32 49V31" stroke="#B56576" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M32 42C28 40 26.5 36.5 28 33.5C30.8 34.8 32 38 32 42Z" fill="#B56576" fillOpacity="0.28" stroke="#B56576" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M32 39.5C36 37.5 37.5 34 36 31C33.2 32.3 32 35.5 32 39.5Z" fill="#B56576" fillOpacity="0.28" stroke="#B56576" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M23 30.5V48" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.8" />
    </svg>
  );
}

function FacialTopographyWireframe() {
  return (
    <svg
      viewBox="0 0 240 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-full w-full"
    >
      {/* Subtle diagnostic grid arcs */}
      <circle cx="120" cy="138" r="102" stroke="#B56576" strokeOpacity="0.14" strokeWidth="0.8" strokeDasharray="3 4" />
      <circle cx="120" cy="138" r="76" stroke="#B56576" strokeOpacity="0.16" strokeWidth="0.8" />
      {/* Sculptural facial silhouette */}
      <path
        d="M120 38C82 38 56 69 56 112C56 135 61 159 69 180C79 208 98 232 120 232C142 232 161 208 171 180C179 159 184 135 184 112C184 69 158 38 120 38Z"
        stroke="#B56576"
        strokeOpacity="0.65"
        strokeWidth="1.25"
      />
      {/* Forehead & temple contour topography */}
      <path
        d="M72 90C88 78 152 78 168 90"
        stroke="#B56576"
        strokeOpacity="0.4"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M78 72C94 61 146 61 162 72"
        stroke="#B56576"
        strokeOpacity="0.28"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      {/* Brow & nose bridge continuous filigree */}
      <path
        d="M78 109C91 101 105 104 114 110C118 113 120 129 119 148C119 153 122 156 126 154"
        stroke="#8C4858"
        strokeOpacity="0.58"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M162 109C149 101 135 104 126 110"
        stroke="#8C4858"
        strokeOpacity="0.58"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {/* Delicate orbital curves */}
      <path d="M84 119C92 115 104 116 110 120" stroke="#B56576" strokeOpacity="0.45" strokeWidth="1" strokeLinecap="round" />
      <path d="M130 120C136 116 148 115 156 119" stroke="#B56576" strokeOpacity="0.45" strokeWidth="1" strokeLinecap="round" />
      {/* Cheekbone topographic rings (melanin & barrier mapping) */}
      <path
        d="M66 138C74 152 94 162 108 156C96 172 78 171 69 158"
        stroke="#B56576"
        strokeOpacity="0.34"
        strokeWidth="0.95"
        strokeLinecap="round"
      />
      <path
        d="M174 138C166 152 146 162 132 156C144 172 162 171 171 158"
        stroke="#B56576"
        strokeOpacity="0.34"
        strokeWidth="0.95"
        strokeLinecap="round"
      />
      {/* Sculpted lips contour */}
      <path
        d="M101 182C109 177 115 178 120 181C125 178 131 177 139 182C132 190 108 190 101 182Z"
        stroke="#B56576"
        strokeOpacity="0.62"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      {/* Chin & jawline contour mesh */}
      <path
        d="M84 198C97 215 143 215 156 198"
        stroke="#B56576"
        strokeOpacity="0.32"
        strokeWidth="0.95"
        strokeLinecap="round"
      />
      {/* Calibration crosshair corner ticks */}
      <path d="M28 42V28H42M198 28H212V42M28 238V252H42M198 252H212V238" stroke="#B56576" strokeOpacity="0.45" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function LuxuryIntro3D({ isOpen, onFinish }: LuxuryIntro3DProps) {
  const [isDissolving, setIsDissolving] = useState(false);
  const reducedMotion = prefersReducedMotion();
  const onFinishRef = useRef(onFinish);
  const skipTimerRef = useRef<number | null>(null);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    if (!isOpen) {
      setIsDissolving(false);
      return;
    }

    markLuxuryIntroSeen();
    setIsDissolving(false);

    const dissolveDelayMs = reducedMotion ? 1100 : 2600;
    const unmountDelayMs = dissolveDelayMs + 520;

    const dissolveTimer = window.setTimeout(() => {
      setIsDissolving(true);
    }, dissolveDelayMs);

    const finishTimer = window.setTimeout(() => {
      onFinishRef.current();
    }, unmountDelayMs);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDissolving(true);
        if (skipTimerRef.current !== null) {
          window.clearTimeout(skipTimerRef.current);
        }
        skipTimerRef.current = window.setTimeout(() => {
          onFinishRef.current();
        }, 280);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(dissolveTimer);
      window.clearTimeout(finishTimer);
      if (skipTimerRef.current !== null) {
        window.clearTimeout(skipTimerRef.current);
        skipTimerRef.current = null;
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, reducedMotion]);

  if (!isOpen) {
    return null;
  }

  function handleSkip() {
    markLuxuryIntroSeen();
    setIsDissolving(true);
    if (skipTimerRef.current !== null) {
      window.clearTimeout(skipTimerRef.current);
    }
    skipTimerRef.current = window.setTimeout(() => {
      onFinishRef.current();
    }, 320);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="DerméScan 3D Brand Intro"
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#FAF6F7]/75 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isDissolving
          ? "pointer-events-none scale-[1.03] opacity-0 backdrop-blur-none"
          : "scale-100 opacity-100 backdrop-blur-xl"
      }`}
    >
      {/* Soft radial champagne glow behind the 3D stage */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(255,255,255,0.68)_0%,rgba(245,232,235,0.35)_45%,rgba(181,101,118,0.08)_100%)]"
      />

      {/* Lightweight CSS champagne-rose floating light motes */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {AMBIENT_MOTES.map((mote, index) => (
          <span
            key={index}
            className="intro-mote absolute rounded-full bg-gradient-to-br from-[#F4DCE2] to-[#B56576]/45 shadow-[0_0_12px_rgba(181,101,118,0.32)]"
            style={{
              left: mote.left,
              top: mote.top,
              width: `${mote.size}px`,
              height: `${mote.size}px`,
              animationDelay: mote.delay,
              animationDuration: mote.duration,
            }}
          />
        ))}
      </div>

      {/* Top-Right Minimal Skip Intro Button */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute right-4 top-4 z-30 min-h-[36px] rounded-full border border-[#EAD8DC] bg-white/70 px-4 py-1.5 text-xs font-medium tracking-widest uppercase text-[#B56576]/80 shadow-xs backdrop-blur-md transition-all hover:border-[#B56576]/50 hover:bg-white/95 hover:text-[#B56576] active:scale-95 sm:right-6 sm:top-6"
      >
        Skip Intro
      </button>

      {/* Center 3D Perspective Stage */}
      <div className="intro-3d-stage relative flex h-full w-full items-center justify-center px-4">
        {/* ACT I (0.0s - 1.1s): 3D Frosted-Crystal Biometric Diagnostic Lens Card */}
        {!reducedMotion && (
          <div className="intro-lens-card intro-preserve-3d pointer-events-none relative flex h-[320px] w-[264px] items-center justify-center overflow-hidden rounded-[28px] border border-white/85 bg-white/55 p-4 shadow-[0_24px_60px_-18px_rgba(181,101,118,0.28),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-md sm:h-[372px] sm:w-[310px]">
            <FacialTopographyWireframe />

            {/* Optical Rose Laser Scan Line */}
            <div className="intro-laser-beam pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2">
              <div className="h-10 w-full bg-gradient-to-b from-transparent via-[#B56576]/15 to-[#B56576]/35 blur-[1px]" />
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#B56576] to-transparent shadow-[0_0_14px_2px_rgba(181,101,118,0.75)]" />
            </div>

            {/* Luminous Diagnostic Nodes & Micro-Callouts */}
            <div className="intro-node-1 absolute left-[18%] top-[24%] flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#B56576] ring-4 ring-[#B56576]/25 shadow-[0_0_10px_#B56576]" />
              <span className="rounded bg-white/85 px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.18em] text-[#8C4858] shadow-2xs">
                BARRIER
              </span>
            </div>

            <div className="intro-node-2 absolute right-[12%] top-[47%] flex items-center gap-1.5">
              <span className="rounded bg-white/85 px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.18em] text-[#8C4858] shadow-2xs">
                MELANIN
              </span>
              <span className="h-2.5 w-2.5 rounded-full bg-[#B56576] ring-4 ring-[#B56576]/25 shadow-[0_0_10px_#B56576]" />
            </div>

            <div className="intro-node-3 absolute left-[17%] top-[69%] flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#B56576] ring-4 ring-[#B56576]/25 shadow-[0_0_10px_#B56576]" />
              <span className="rounded bg-white/85 px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.18em] text-[#8C4858] shadow-2xs">
                POROSITY
              </span>
            </div>
          </div>
        )}

        {/* ACT II (1.1s - 2.2s): 4 Sculptural 3D Glassmorphic Pharmacy Vessels Converge */}
        {!reducedMotion && (
          <div className="intro-preserve-3d pointer-events-none absolute inset-0 flex items-center justify-center">
            {/* Top-Left: Serum Dropper */}
            <div className="intro-vessel-tl absolute flex items-center justify-center">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -left-12 -top-10 h-20 w-28 -rotate-45 rounded-full bg-gradient-to-r from-transparent via-[#B56576]/25 to-transparent blur-md"
              />
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/85 bg-white/70 shadow-[0_14px_34px_-10px_rgba(181,101,118,0.34)] backdrop-blur-md sm:h-20 sm:w-20">
                <SerumDropperSvg />
              </div>
            </div>

            {/* Top-Right: Sunscreen Tube */}
            <div className="intro-vessel-tr absolute flex items-center justify-center">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-10 h-20 w-28 rotate-45 rounded-full bg-gradient-to-r from-transparent via-[#B56576]/25 to-transparent blur-md"
              />
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/85 bg-white/70 shadow-[0_14px_34px_-10px_rgba(181,101,118,0.34)] backdrop-blur-md sm:h-20 sm:w-20">
                <SunscreenTubeSvg />
              </div>
            </div>

            {/* Bottom-Left: Ceramide Jar */}
            <div className="intro-vessel-bl absolute flex items-center justify-center">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-10 -left-12 h-20 w-28 rotate-45 rounded-full bg-gradient-to-r from-transparent via-[#B56576]/25 to-transparent blur-md"
              />
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/85 bg-white/70 shadow-[0_14px_34px_-10px_rgba(181,101,118,0.34)] backdrop-blur-md sm:h-20 sm:w-20">
                <CeramideJarSvg />
              </div>
            </div>

            {/* Bottom-Right: Botanical Hair & Lip Elixir */}
            <div className="intro-vessel-br absolute flex items-center justify-center">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-10 -right-12 h-20 w-28 -rotate-45 rounded-full bg-gradient-to-r from-transparent via-[#B56576]/25 to-transparent blur-md"
              />
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/85 bg-white/70 shadow-[0_14px_34px_-10px_rgba(181,101,118,0.34)] backdrop-blur-md sm:h-20 sm:w-20">
                <BotanicalElixirSvg />
              </div>
            </div>
          </div>
        )}

        {/* Convergence Shockwave Pulse Rings (at 2.1s) */}
        {!reducedMotion && (
          <div className="intro-preserve-3d pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="intro-shockwave-ring h-48 w-48 rounded-full border-2 border-[#B56576]/70 shadow-[0_0_32px_rgba(181,101,118,0.4)] sm:h-60 sm:w-60" />
            <div className="intro-shockwave-halo absolute h-56 w-56 rounded-full border border-[#D49AA7]/60 bg-[#B56576]/5 sm:h-72 sm:w-72" />
          </div>
        )}

        {/* ACT III (2.2s - 2.8s): Signature Emblem Bloom + Satin Shimmer */}
        <div
          className={`intro-preserve-3d pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center ${
            reducedMotion ? "opacity-100" : "intro-emblem-bloom"
          }`}
        >
          <div className="relative overflow-hidden rounded-3xl px-6 py-5">
            {/* Satin Shimmer Sweep Overlay */}
            {!reducedMotion && (
              <div
                aria-hidden="true"
                className="intro-satin-shimmer pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-transparent via-white/75 to-transparent"
              />
            )}

            <h2 className="font-['Alex_Brush',_'Great_Vibes',_cursive] relative text-6xl leading-tight tracking-normal text-[#1E181A] drop-shadow-[0_6px_18px_rgba(181,101,118,0.18)] sm:text-7xl">
              DerméScan
            </h2>

            <div className="mx-auto mt-1 h-px w-28 bg-gradient-to-r from-transparent via-[#B56576]/65 to-transparent" />

            <p className="mt-3 font-sans text-[11px] font-medium tracking-[0.28em] uppercase text-[#7A5660] sm:text-xs">
              CLINICAL SKIN &amp; HAIR INTELLIGENCE
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
