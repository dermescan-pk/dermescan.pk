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
  { left: "10%", top: "16%", size: 7, delay: "0s", duration: "3.4s" },
  { left: "84%", top: "15%", size: 9, delay: "0.4s", duration: "3.8s" },
  { left: "20%", top: "76%", size: 6, delay: "0.2s", duration: "3.1s" },
  { left: "78%", top: "79%", size: 8, delay: "0.7s", duration: "3.7s" },
  { left: "46%", top: "11%", size: 5, delay: "0.9s", duration: "3.0s" },
  { left: "14%", top: "48%", size: 6, delay: "0.5s", duration: "3.5s" },
  { left: "88%", top: "50%", size: 7, delay: "0.15s", duration: "3.2s" },
  { left: "58%", top: "85%", size: 6, delay: "0.6s", duration: "3.4s" },
  { left: "32%", top: "24%", size: 5, delay: "1.1s", duration: "3.6s" },
  { left: "69%", top: "28%", size: 6, delay: "0.85s", duration: "3.3s" },
];

function SerumDropperSvg() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-9 w-9 sm:h-11 sm:w-11"
    >
      <defs>
        <linearGradient id="introSerumGlass10" x1="18" y1="22" x2="46" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#F5DCE1" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#B56576" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient id="introRoseCap10" x1="25" y1="6" x2="39" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D799A6" />
          <stop offset="100%" stopColor="#9A4E5F" />
        </linearGradient>
      </defs>
      <path d="M27.5 8.5C27.5 6 36.5 6 36.5 8.5V16H27.5V8.5Z" fill="url(#introRoseCap10)" />
      <rect x="25" y="16" width="14" height="4.5" rx="1.5" fill="#EAD0D6" stroke="#B56576" strokeWidth="1.2" />
      <path
        d="M25 20.5H39L43.5 26.5C44.5 27.8 45 29.4 45 31V51C45 54.3 42.3 57 39 57H25C21.7 57 19 54.3 19 51V31C19 29.4 19.5 27.8 20.5 26.5L25 20.5Z"
        fill="url(#introSerumGlass10)"
        stroke="#B56576"
        strokeWidth="1.35"
      />
      <path d="M32 21V45" stroke="#B56576" strokeWidth="1.15" strokeLinecap="round" strokeOpacity="0.7" />
      <path d="M20.5 39C25 37.2 39 40.8 43.5 39V51C43.5 53.5 41.5 55.5 39 55.5H25C22.5 55.5 20.5 53.5 20.5 51V39Z" fill="#B56576" fillOpacity="0.28" />
      <path d="M23.5 28.5V48" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.78" />
      <circle cx="32" cy="48.5" r="2.1" fill="#B56576" fillOpacity="0.88" />
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
      className="h-9 w-9 sm:h-11 sm:w-11"
    >
      <defs>
        <linearGradient id="introTubeBody10" x1="18" y1="10" x2="46" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.96" />
          <stop offset="65%" stopColor="#F9ECEF" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#E6C5CD" stopOpacity="0.75" />
        </linearGradient>
      </defs>
      <rect x="19" y="8" width="26" height="4.5" rx="1.5" fill="#E9CFD5" stroke="#B56576" strokeWidth="1.2" />
      <path
        d="M20 12.5H44L41.2 44.5C41 46 39.8 47 38.3 47H25.7C24.2 47 23 46 22.8 44.5L20 12.5Z"
        fill="url(#introTubeBody10)"
        stroke="#B56576"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="26" r="5" stroke="#B56576" strokeWidth="1.25" fill="#B56576" fillOpacity="0.14" />
      <path d="M32 18.5V17M32 35V33.5M24.5 26H23M41 26H39.5" stroke="#B56576" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M26.5 38H37.5" stroke="#B56576" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.65" />
      <path
        d="M25.5 47H38.5L37.5 55.5C37.3 56.4 36.6 57 35.7 57H28.3C27.4 57 26.7 56.4 26.5 55.5L25.5 47Z"
        fill="#B56576"
        fillOpacity="0.82"
        stroke="#8C4858"
        strokeWidth="1.2"
      />
      <path d="M23.5 16.5L25 41" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" strokeOpacity="0.84" />
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
      className="h-9 w-9 sm:h-11 sm:w-11"
    >
      <defs>
        <linearGradient id="introJarLid10" x1="15" y1="16" x2="49" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E6C3CC" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#B56576" />
        </linearGradient>
        <linearGradient id="introJarBody10" x1="14" y1="27" x2="50" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#F2DCE1" stopOpacity="0.78" />
        </linearGradient>
      </defs>
      <rect x="15" y="16" width="34" height="9.5" rx="3.5" fill="url(#introJarLid10)" stroke="#B56576" strokeWidth="1.3" />
      <path d="M19 19.5H45" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.7" />
      <path
        d="M14 27.5C14 26.4 14.9 25.5 16 25.5H48C49.1 25.5 50 26.4 50 27.5V46C50 50.4 46.4 54 42 54H22C17.6 54 14 50.4 14 46V27.5Z"
        fill="url(#introJarBody10)"
        stroke="#B56576"
        strokeWidth="1.35"
      />
      <path d="M18 32H46V45C46 47.8 43.8 50 41 50H23C20.2 50 18 47.8 18 45V32Z" fill="#B56576" fillOpacity="0.16" />
      <path d="M23 39.5H41" stroke="#B56576" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.65" />
      <path d="M26 43.5H38" stroke="#B56576" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.45" />
      <path d="M17.5 30V45" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.82" />
    </svg>
  );
}

function LipElixirSvg() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-9 w-9 sm:h-11 sm:w-11"
    >
      <defs>
        <linearGradient id="introLipTube10" x1="22" y1="26" x2="42" y2="57" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.96" />
          <stop offset="55%" stopColor="#F5D3DB" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#B56576" stopOpacity="0.58" />
        </linearGradient>
      </defs>
      {/* Faceted crystal wand cap */}
      <rect x="26" y="7" width="12" height="15" rx="3" fill="#B56576" fillOpacity="0.85" stroke="#8C4858" strokeWidth="1.25" />
      <rect x="24" y="22" width="16" height="4.5" rx="1.5" fill="#F2DCE1" stroke="#B56576" strokeWidth="1.15" />
      {/* Glassmorphic lip elixir vial */}
      <rect
        x="22"
        y="26.5"
        width="20"
        height="30"
        rx="6"
        fill="url(#introLipTube10)"
        stroke="#B56576"
        strokeWidth="1.35"
      />
      {/* Sculpted lip silhouette emblem inside vial */}
      <path
        d="M26.5 41.5C28.8 39 30.8 39.5 32 40.6C33.2 39.5 35.2 39 37.5 41.5C35.5 44.5 28.5 44.5 26.5 41.5Z"
        fill="#B56576"
        fillOpacity="0.34"
        stroke="#8C4858"
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
      <path d="M25.5 31V50" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.82" />
    </svg>
  );
}

function ScalpDropperSvg() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-9 w-9 sm:h-11 sm:w-11"
    >
      <defs>
        <linearGradient id="introScalpVial10" x1="20" y1="22" x2="44" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.94" />
          <stop offset="65%" stopColor="#F4DCE1" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#C57B8B" stopOpacity="0.52" />
        </linearGradient>
      </defs>
      {/* Precision scalp applicator tip */}
      <path d="M30 7L34 7L36 17H28L30 7Z" fill="#EAD0D6" stroke="#B56576" strokeWidth="1.2" strokeLinejoin="round" />
      <rect x="24.5" y="17" width="15" height="4.5" rx="1.5" fill="#B56576" fillOpacity="0.82" stroke="#8C4858" strokeWidth="1.15" />
      <path
        d="M23.5 21.5H40.5L44 30.5V51C44 54.3 41.3 57 38 57H26C22.7 57 20 54.3 20 51V30.5L23.5 21.5Z"
        fill="url(#introScalpVial10)"
        stroke="#B56576"
        strokeWidth="1.35"
      />
      {/* Follicle wave & micro droplet */}
      <path d="M25 36C27.5 32 30 32 32 36C34 40 36.5 40 39 36" stroke="#B56576" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M32 42.5C32 42.5 35.5 46.8 35.5 49C35.5 50.9 33.9 52.5 32 52.5C30.1 52.5 28.5 50.9 28.5 49C28.5 46.8 32 42.5 32 42.5Z" fill="#B56576" fillOpacity="0.32" stroke="#B56576" strokeWidth="1.15" />
      <path d="M23 31V48" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.8" />
    </svg>
  );
}

function BotanicalLeafSvg() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-9 w-9 sm:h-11 sm:w-11"
    >
      <defs>
        <linearGradient id="introLeafGlass10" x1="16" y1="12" x2="48" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#F5D7DE" stopOpacity="0.82" />
          <stop offset="100%" stopColor="#B56576" stopOpacity="0.48" />
        </linearGradient>
      </defs>
      {/* Sculpted botanical leaf silhouette */}
      <path
        d="M48 13C31 13 18 24.5 18 41C18 44 18.6 46.5 19.6 48.6C21.8 49.5 24.3 50 27 50C42 50 51 36.5 48 13Z"
        fill="url(#introLeafGlass10)"
        stroke="#B56576"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Central vein & lateral ribs */}
      <path d="M15 52C22 44.5 32.5 32 45.5 17.5" stroke="#8C4858" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M27.5 38.5L26 28.5M34.5 31L33 22M29.5 36.5L39.5 37.5" stroke="#B56576" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.7" />
      <circle cx="42.5" cy="21" r="1.8" fill="#FFFFFF" fillOpacity="0.85" />
    </svg>
  );
}

const ORBITAL_VESSELS = [
  { angle: 0, label: "Serum Dropper", Icon: SerumDropperSvg },
  { angle: 60, label: "Sunscreen Tube", Icon: SunscreenTubeSvg },
  { angle: 120, label: "Ceramide Jar", Icon: CeramideJarSvg },
  { angle: 180, label: "Lip Elixir", Icon: LipElixirSvg },
  { angle: 240, label: "Scalp Dropper", Icon: ScalpDropperSvg },
  { angle: 300, label: "Botanical Leaf", Icon: BotanicalLeafSvg },
];

function FacialTopographyWireframe() {
  return (
    <svg
      viewBox="0 0 240 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-full w-full"
    >
      <circle cx="120" cy="138" r="102" stroke="#B56576" strokeOpacity="0.16" strokeWidth="0.8" strokeDasharray="3 4" />
      <circle cx="120" cy="138" r="76" stroke="#B56576" strokeOpacity="0.18" strokeWidth="0.8" />
      <path
        d="M120 38C82 38 56 69 56 112C56 135 61 159 69 180C79 208 98 232 120 232C142 232 161 208 171 180C179 159 184 135 184 112C184 69 158 38 120 38Z"
        stroke="#B56576"
        strokeOpacity="0.68"
        strokeWidth="1.25"
      />
      <path d="M72 90C88 78 152 78 168 90" stroke="#B56576" strokeOpacity="0.42" strokeWidth="1" strokeLinecap="round" />
      <path d="M78 72C94 61 146 61 162 72" stroke="#B56576" strokeOpacity="0.3" strokeWidth="0.9" strokeLinecap="round" />
      <path
        d="M78 109C91 101 105 104 114 110C118 113 120 129 119 148C119 153 122 156 126 154"
        stroke="#8C4858"
        strokeOpacity="0.6"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path d="M162 109C149 101 135 104 126 110" stroke="#8C4858" strokeOpacity="0.6" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M84 119C92 115 104 116 110 120" stroke="#B56576" strokeOpacity="0.46" strokeWidth="1" strokeLinecap="round" />
      <path d="M130 120C136 116 148 115 156 119" stroke="#B56576" strokeOpacity="0.46" strokeWidth="1" strokeLinecap="round" />
      <path d="M66 138C74 152 94 162 108 156C96 172 78 171 69 158" stroke="#B56576" strokeOpacity="0.36" strokeWidth="0.95" strokeLinecap="round" />
      <path d="M174 138C166 152 146 162 132 156C144 172 162 171 171 158" stroke="#B56576" strokeOpacity="0.36" strokeWidth="0.95" strokeLinecap="round" />
      <path
        d="M101 182C109 177 115 178 120 181C125 178 131 177 139 182C132 190 108 190 101 182Z"
        stroke="#B56576"
        strokeOpacity="0.65"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path d="M84 198C97 215 143 215 156 198" stroke="#B56576" strokeOpacity="0.34" strokeWidth="0.95" strokeLinecap="round" />
      <path d="M28 42V28H42M198 28H212V42M28 238V252H42M198 252H212V238" stroke="#B56576" strokeOpacity="0.48" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function LuxuryIntro3D({ isOpen, onFinish }: LuxuryIntro3DProps) {
  const [isDissolving, setIsDissolving] = useState(false);
  const [isQuickSkipping, setIsQuickSkipping] = useState(false);
  const reducedMotion = prefersReducedMotion();
  const onFinishRef = useRef(onFinish);
  const skipTimerRef = useRef<number | null>(null);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    if (!isOpen) {
      setIsDissolving(false);
      setIsQuickSkipping(false);
      return;
    }

    markLuxuryIntroSeen();
    setIsDissolving(false);
    setIsQuickSkipping(false);

    // Act IV dissolves at 9.4s (duration 600ms) -> cleanly finishes & unmounts at 10.0s
    const dissolveDelayMs = reducedMotion ? 1100 : 9400;
    const unmountDelayMs = reducedMotion ? 1500 : 10000;

    const dissolveTimer = window.setTimeout(() => {
      setIsDissolving(true);
    }, dissolveDelayMs);

    const finishTimer = window.setTimeout(() => {
      onFinishRef.current();
    }, unmountDelayMs);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsQuickSkipping(true);
        setIsDissolving(true);
        if (skipTimerRef.current !== null) {
          window.clearTimeout(skipTimerRef.current);
        }
        skipTimerRef.current = window.setTimeout(() => {
          onFinishRef.current();
        }, 100);
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
    setIsQuickSkipping(true);
    setIsDissolving(true);
    if (skipTimerRef.current !== null) {
      window.clearTimeout(skipTimerRef.current);
    }
    skipTimerRef.current = window.setTimeout(() => {
      onFinishRef.current();
    }, 100);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="DerméScan 3D Luxury Brand Film"
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#FAF6F7]/75 transition-all ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isQuickSkipping ? "duration-100" : "duration-[600ms]"
      } ${
        isDissolving
          ? "pointer-events-none scale-[1.03] opacity-0 backdrop-blur-none"
          : "scale-100 opacity-100 backdrop-blur-xl"
      }`}
    >
      {/* Ambient champagne-rose radial glow over frosted workspace */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(255,255,255,0.68)_0%,rgba(245,232,235,0.35)_45%,rgba(181,101,118,0.09)_100%)]"
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

      {/* Top-Right Instant Skip Control */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute right-4 top-4 z-30 min-h-[36px] rounded-full border border-[#EAD8DC] bg-white/75 px-4 py-1.5 text-xs font-medium tracking-widest uppercase text-[#B56576]/85 shadow-xs backdrop-blur-md transition-all hover:border-[#B56576]/55 hover:bg-white/95 hover:text-[#B56576] active:scale-95 sm:right-6 sm:top-6"
      >
        Skip Intro →
      </button>

      {/* Center 3D Perspective Stage (perspective: 1600px) */}
      <div className="intro-3d-stage relative flex h-full w-full items-center justify-center px-4">
        {/* ACT I (0.0s - 2.8s) & ACT II (2.8s - 5.8s): 3D Frosted-Crystal Diagnostic Frame + Dual-Pass Laser */}
        {!reducedMotion && (
          <div className="intro-lens-card-10s intro-preserve-3d pointer-events-none relative flex h-[340px] w-[274px] items-center justify-center overflow-hidden rounded-[30px] border border-white/85 bg-white/55 p-4 shadow-[0_24px_64px_-18px_rgba(181,101,118,0.3),inset_0_1px_1px_rgba(255,255,255,0.92)] backdrop-blur-md sm:h-[396px] sm:w-[324px]">
            {/* Breathing Ambient Dermal Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-6 rounded-full bg-[radial-gradient(circle,rgba(181,101,118,0.14)_0%,transparent_72%)] animate-pulse"
            />

            <FacialTopographyWireframe />

            {/* Act II Pass 1 (2.8s - 4.3s): Slow Top-to-Bottom Optical Laser */}
            <div className="intro-laser-vertical-10s pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2">
              <div className="h-10 w-full bg-gradient-to-b from-transparent via-[#B56576]/16 to-[#B56576]/36 blur-[1px]" />
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#B56576] to-transparent shadow-[0_0_14px_2px_rgba(181,101,118,0.78)]" />
            </div>

            {/* Act II Pass 2 (4.3s - 5.8s): Precision Diagnostic Cross-Scan (Left -> Right) */}
            <div className="intro-laser-cross-10s pointer-events-none absolute inset-y-4 left-1/2 -translate-x-1/2">
              <div className="flex h-full items-center">
                <div className="h-full w-8 bg-gradient-to-r from-transparent via-[#B56576]/14 to-[#B56576]/32 blur-[1px]" />
                <div className="h-full w-[2px] bg-gradient-to-b from-transparent via-[#B56576] to-transparent shadow-[0_0_14px_2px_rgba(181,101,118,0.78)]" />
              </div>
            </div>

            {/* Live Telemetry Callouts around the 3D Mesh */}
            <div className="intro-callout-1 absolute left-[8%] top-[16%] flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#B56576] ring-4 ring-[#B56576]/25 shadow-[0_0_10px_#B56576]" />
              <span className="rounded-lg border border-white/80 bg-white/85 px-2 py-0.5 text-[8.5px] font-semibold tracking-[0.16em] text-[#8C4858] shadow-2xs backdrop-blur-xs">
                BARRIER INTEGRITY
              </span>
            </div>

            <div className="intro-callout-2 absolute right-[7%] top-[36%] flex items-center gap-1.5">
              <span className="rounded-lg border border-white/80 bg-white/85 px-2 py-0.5 text-[8.5px] font-semibold tracking-[0.16em] text-[#8C4858] shadow-2xs backdrop-blur-xs">
                MELANIN MAP
              </span>
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#B56576] ring-4 ring-[#B56576]/25 shadow-[0_0_10px_#B56576]" />
            </div>

            <div className="intro-callout-3 absolute left-[7%] top-[61%] flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#B56576] ring-4 ring-[#B56576]/25 shadow-[0_0_10px_#B56576]" />
              <span className="rounded-lg border border-white/80 bg-white/85 px-2 py-0.5 text-[8.5px] font-semibold tracking-[0.16em] text-[#8C4858] shadow-2xs backdrop-blur-xs">
                POROSITY INDEX
              </span>
            </div>

            <div className="intro-callout-4 absolute right-[8%] top-[79%] flex items-center gap-1.5">
              <span className="rounded-lg border border-white/80 bg-white/85 px-2 py-0.5 text-[8.5px] font-semibold tracking-[0.16em] text-[#8C4858] shadow-2xs backdrop-blur-xs">
                STEROID SCREEN
              </span>
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#B56576] ring-4 ring-[#B56576]/25 shadow-[0_0_10px_#B56576]" />
            </div>
          </div>
        )}

        {/* ACT III (5.8s - 8.4s): 6 Sculpted 3D Pharmacy Icons in Wide Orbit -> Spiral Collision at 8.2s */}
        {!reducedMotion && (
          <div className="intro-orbit-rig-10s intro-preserve-3d pointer-events-none absolute inset-0 flex items-center justify-center">
            {/* Subtle luminous orbital track ring */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute rounded-full border border-[#B56576]/20 shadow-[0_0_40px_rgba(181,101,118,0.12)]"
              style={{
                width: "calc(var(--intro-orbit-r) * 2)",
                height: "calc(var(--intro-orbit-r) * 2)",
              }}
            />

            {ORBITAL_VESSELS.map(({ angle, label, Icon }) => (
              <div
                key={label}
                aria-hidden="true"
                className="intro-preserve-3d absolute flex items-center justify-center"
                style={{ transform: `rotateZ(${angle}deg)` }}
              >
                <div className="intro-orbit-radius-10s intro-preserve-3d flex items-center justify-center">
                  {/* Soft rose-gold orbital light trail behind each glass vessel */}
                  <span className="pointer-events-none absolute -left-10 h-14 w-24 rounded-full bg-gradient-to-r from-transparent via-[#B56576]/25 to-transparent blur-md" />

                  <div
                    className="intro-preserve-3d"
                    style={{ transform: `rotateZ(${-angle}deg)` }}
                  >
                    <div className="intro-orbit-counter-10s intro-preserve-3d">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/85 bg-white/75 shadow-[0_16px_36px_-10px_rgba(181,101,118,0.36),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-md sm:h-18 sm:w-18">
                        <Icon />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Collision Shockwave Pulse Rings at 8.2s */}
        {!reducedMotion && (
          <div className="intro-preserve-3d pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="intro-shockwave-ring-10s h-48 w-48 rounded-full border-2 border-[#B56576]/75 shadow-[0_0_36px_rgba(181,101,118,0.42)] sm:h-64 sm:w-64" />
            <div className="intro-shockwave-halo-10s absolute h-56 w-56 rounded-full border border-[#D49AA7]/65 bg-[#B56576]/6 sm:h-76 sm:w-76" />
          </div>
        )}

        {/* ACT IV (8.4s - 10.0s): Signature Emblem Bloom (translateZ 50px) + Satin Shimmer */}
        <div
          className={`intro-preserve-3d pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center ${
            reducedMotion ? "opacity-100" : "intro-emblem-bloom-10s"
          }`}
        >
          <div className="relative overflow-hidden rounded-3xl px-6 py-5">
            {!reducedMotion && (
              <div
                aria-hidden="true"
                className="intro-satin-shimmer-10s pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-transparent via-white/80 to-transparent"
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

      {/* Whisper-Thin 2px Dusty-Rose Progress Bar Along Very Bottom Edge */}
      {!reducedMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[2px] bg-[#EAD8DC]/45"
        >
          <div className="intro-progress-10s h-full w-full origin-left bg-[#B56576]" />
        </div>
      )}
    </div>
  );
}
