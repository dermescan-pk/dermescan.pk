import { useEffect, useRef, useState } from "react";
import type { Language, TabId } from "../types/dermascan.ts";

interface TabHeaderIllustrationProps {
  variant: TabId;
  language: Language;
  isActive?: boolean;
}

const TAB_BANNER_COPY: Record<
  TabId,
  {
    eyebrow: { en: string; ur: string };
    title: { en: string; ur: string };
    subtitle: { en: string; ur: string };
  }
> = {
  skin: {
    eyebrow: {
      en: "Dermatology Studio",
      ur: "Skin & Body Studio",
    },
    title: {
      en: "Face, Body & Barrier Analysis",
      ur: "Chehre Aur Jism Ki Skin Check",
    },
    subtitle: {
      en: "Climate-aware care tailored for Pakistani water & sun.",
      ur: "Pakistani paani aur dhoop ke mutabiq asaan routine.",
    },
  },
  hair: {
    eyebrow: {
      en: "Trichology Care",
      ur: "Hair & Scalp Studio",
    },
    title: {
      en: "Porosity, Scalp & Strand Studio",
      ur: "Baal Ki Porosity Aur Sar Ka Check",
    },
    subtitle: {
      en: "Balanced hydration & targeted scalp rotation without dryness.",
      ur: "Khushki ke baghair baal aur sar ki mukammal hifazat.",
    },
  },
  steroid: {
    eyebrow: {
      en: "Safety Audit",
      ur: "Formula Cream Audit",
    },
    title: {
      en: "Steroid & Mercury Screening",
      ur: "Steroids Aur Tezi Chemicals Check",
    },
    subtitle: {
      en: "Spot hidden topical steroids & switch safely to clinic-grade care.",
      ur: "Chhupay steroids pehchanein aur safe pharmacy badal paayein.",
    },
  },
  verify: {
    eyebrow: {
      en: "Authenticity Seal",
      ur: "Asli vs Naqli Tasdeeq",
    },
    title: {
      en: "Official Store & Batch Inspector",
      ur: "Store URL Aur Bottle Printing Check",
    },
    subtitle: {
      en: "Exact-domain check and close-up packaging inspection.",
      ur: "Official website aur bottle ke label, seal aur batch code ki jaanch.",
    },
  },
};

function SkinFaceLineArt() {
  return (
    <svg
      viewBox="0 0 132 76"
      fill="none"
      aria-hidden="true"
      className="h-16 w-28 shrink-0 sm:h-20 sm:w-36"
    >
      <defs>
        <linearGradient id="skinBeamGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B56576" stopOpacity="0" />
          <stop offset="55%" stopColor="#B56576" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#B56576" stopOpacity="0.72" />
        </linearGradient>
      </defs>

      {/* Soft champagne outer frame arc */}
      <circle
        cx="66"
        cy="38"
        r="31"
        stroke="#E6DCE0"
        strokeWidth="1.15"
        strokeDasharray="3 3"
      />

      {/* Continuous-line editorial face & collarbone silhouette */}
      <path
        d="M52 19C52 11.8 58 8 66 8C74 8 80 12.2 80 19.5C80 28.5 75.2 38.2 66 40.4C56.8 38.2 52 28.5 52 19ZM58.5 39.2L57.2 47.6C51.5 50.8 41.5 54 36 57.5M73.5 39.2L74.8 47.6C80.5 50.8 90.5 54 96 57.5M53 53.5C58.8 57.2 73.2 57.2 79 53.5"
        stroke="#B56576"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Delicate brow & nose contour */}
      <path
        d="M58.5 22.5C60.5 21.4 62.5 21.6 64 22.4M68 22.4C69.5 21.6 71.5 21.4 73.5 22.5M66 23.2V29.5C66 30.6 67.1 31.1 67.8 30.5"
        stroke="#B56576"
        strokeOpacity="0.7"
        strokeWidth="1.1"
        strokeLinecap="round"
      />

      {/* Vertical glowing dusty-rose scanner beam */}
      <g className="animate-dermal-scan-y">
        <rect
          x="38"
          y="19"
          width="56"
          height="10"
          rx="5"
          fill="url(#skinBeamGrad)"
        />
        <line
          x1="36"
          y1="29"
          x2="96"
          y2="29"
          stroke="#B56576"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </g>

      {/* Floating skin-glow sparkles */}
      <path
        d="M27 22L28.3 25.2L31.5 26.5L28.3 27.8L27 31L25.7 27.8L22.5 26.5L25.7 25.2L27 22Z"
        stroke="#B56576"
        strokeWidth="1.1"
        fill="#E6DCE0"
        fillOpacity="0.65"
        className="animate-dermal-sparkle"
      />
      <path
        d="M104 29L105 31.5L107.5 32.5L105 33.5L104 36L103 33.5L100.5 32.5L103 31.5L104 29Z"
        stroke="#B56576"
        strokeWidth="1.05"
        fill="#E6DCE0"
        fillOpacity="0.7"
        className="animate-dermal-sparkle-delayed"
      />
      <circle
        cx="97"
        cy="17"
        r="2"
        fill="#E6DCE0"
        stroke="#B56576"
        strokeWidth="0.9"
        className="animate-dermal-sparkle"
      />
    </svg>
  );
}

function HairStrandsLineArt() {
  return (
    <svg
      viewBox="0 0 132 76"
      fill="none"
      aria-hidden="true"
      className="h-16 w-28 shrink-0 sm:h-20 sm:w-36"
    >
      {/* Warm champagne background halo */}
      <ellipse
        cx="66"
        cy="38"
        rx="44"
        ry="25"
        stroke="#E6DCE0"
        strokeWidth="1.15"
      />

      {/* Flowing continuous wavy hair strands — primary group */}
      <g className="animate-hair-sway">
        <path
          d="M22 24C34 15 44 33 56 24C68 15 78 33 90 24C99 17 106 23 112 27"
          stroke="#B56576"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M18 39C31 29 42 47 55 38C68 29 79 47 92 38C101 31 108 37 115 41"
          stroke="#B56576"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M24 53C36 44 47 60 59 52C71 44 82 60 95 51C103 45 109 50 113 53"
          stroke="#B56576"
          strokeOpacity="0.72"
          strokeWidth="1.15"
          strokeLinecap="round"
        />
      </g>

      {/* Secondary interlacing champagne-rose strand */}
      <g className="animate-hair-sway-alt">
        <path
          d="M25 31.5C38 23.5 48 40 61 31C74 22 85 39 98 30C104 26 109 29 113 32"
          stroke="#D3B9C2"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M22 46C35 38 45 54 58 45.5C71 37 82 53 95 44.5C102 40 108 43 112 46"
          stroke="#D3B9C2"
          strokeWidth="1.15"
          strokeLinecap="round"
        />
      </g>

      {/* Floating champagne-rose shimmer dots */}
      <circle
        cx="38"
        cy="18"
        r="2.2"
        fill="#E6DCE0"
        stroke="#B56576"
        strokeWidth="0.95"
        className="animate-dermal-sparkle"
      />
      <circle
        cx="84"
        cy="19"
        r="1.8"
        fill="#E6DCE0"
        stroke="#B56576"
        strokeWidth="0.95"
        className="animate-dermal-sparkle-delayed"
      />
      <circle
        cx="102"
        cy="56"
        r="2"
        fill="#E6DCE0"
        stroke="#B56576"
        strokeWidth="0.95"
        className="animate-dermal-sparkle"
      />
    </svg>
  );
}

function SteroidTubeShieldLineArt() {
  return (
    <svg
      viewBox="0 0 132 76"
      fill="none"
      aria-hidden="true"
      className="h-16 w-28 shrink-0 sm:h-20 sm:w-36"
    >
      {/* Gentle pulsing dermatological safety ring */}
      <circle
        cx="78"
        cy="39"
        r="21"
        stroke="#E6DCE0"
        strokeWidth="1.4"
        className="animate-shield-pulse"
      />

      {/* Minimalist cosmetic cream tube */}
      <path
        d="M32 15H54L51 50H35L32 15Z"
        stroke="#B56576"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      {/* Crimp & label lines on tube */}
      <line
        x1="31.5"
        y1="19"
        x2="54.5"
        y2="19"
        stroke="#E6DCE0"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <rect
        x="37.5"
        y="26"
        width="11"
        height="13"
        rx="2"
        stroke="#E6DCE0"
        strokeWidth="1.1"
      />
      <line
        x1="40"
        y1="30.5"
        x2="46"
        y2="30.5"
        stroke="#B56576"
        strokeOpacity="0.65"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <line
        x1="40"
        y1="34.5"
        x2="45"
        y2="34.5"
        stroke="#B56576"
        strokeOpacity="0.65"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {/* Tube neck & cap */}
      <path
        d="M38 50H48V54.5H38V50ZM36.5 54.5H49.5V60.5C49.5 61.3 48.8 62 48 62H38C37.2 62 36.5 61.3 36.5 60.5V54.5Z"
        stroke="#B56576"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />

      {/* Dermatological shield silhouette */}
      <path
        d="M78 21L94 26.8V38.5C94 48.2 87 55.6 78 59C69 55.6 62 48.2 62 38.5V26.8L78 21Z"
        stroke="#B56576"
        strokeWidth="1.35"
        strokeLinejoin="round"
        fill="#FDF8F9"
        fillOpacity="0.7"
      />
      <path
        d="M72.5 39.5L76.3 43.2L84 35.2"
        stroke="#B56576"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Delicate magnifying / radar sweep checking ingredients */}
      <g className="animate-radar-sweep">
        <circle
          cx="58"
          cy="35"
          r="9"
          stroke="#B56576"
          strokeWidth="1.2"
          fill="#E6DCE0"
          fillOpacity="0.22"
        />
        <line
          x1="64.5"
          y1="41.5"
          x2="70"
          y2="47"
          stroke="#B56576"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

function AuthenticityDropperLineArt() {
  return (
    <svg
      viewBox="0 0 132 76"
      fill="none"
      aria-hidden="true"
      className="h-16 w-28 shrink-0 sm:h-20 sm:w-36"
    >
      <defs>
        <linearGradient id="laserBeamGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#B56576" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#B56576" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#B56576" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {/* Dropper bottle silhouette */}
      {/* Rubber bulb & collar */}
      <path
        d="M46 16C46 13 48.2 11 51 11C53.8 11 56 13 56 16V20H46V16Z"
        stroke="#B56576"
        strokeWidth="1.3"
      />
      <rect
        x="43"
        y="20"
        width="16"
        height="6"
        rx="1.5"
        stroke="#B56576"
        strokeWidth="1.3"
      />
      {/* Bottle shoulders & body */}
      <path
        d="M45 26H57L63 32.5V60C63 62.2 61.2 64 59 64H43C40.8 64 39 62.2 39 60V32.5L45 26Z"
        stroke="#B56576"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      {/* Bottle label + minimalist barcode lines */}
      <rect
        x="43"
        y="36"
        width="16"
        height="21"
        rx="2"
        stroke="#E6DCE0"
        strokeWidth="1.2"
      />
      <path
        d="M46.5 41.5V48.5M49 41.5V48.5M51.5 41.5V48.5M54 41.5V48.5M55.5 41.5V48.5"
        stroke="#B56576"
        strokeOpacity="0.6"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="46.5"
        y1="52.5"
        x2="55.5"
        y2="52.5"
        stroke="#E6DCE0"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Clean laser scan line gliding across the bottle label */}
      <g className="animate-laser-scan">
        <line
          x1="34"
          y1="45"
          x2="68"
          y2="45"
          stroke="url(#laserBeamGrad)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </g>

      {/* Soft pulsing authenticity ring */}
      <circle
        cx="88"
        cy="39"
        r="16"
        stroke="#E6DCE0"
        strokeWidth="1.35"
        className="animate-shield-pulse"
      />

      {/* Verified checkmark badge */}
      <circle
        cx="88"
        cy="39"
        r="13.5"
        stroke="#B56576"
        strokeWidth="1.35"
        fill="#FDF8F9"
      />
      <circle
        cx="88"
        cy="39"
        r="10.2"
        stroke="#E6DCE0"
        strokeWidth="1"
        strokeDasharray="2.5 2.5"
      />
      <path
        d="M83 39.2L86.4 42.6L93.5 35.4"
        stroke="#B56576"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TabHeaderIllustration({
  variant,
  language,
  isActive = true,
}: TabHeaderIllustrationProps) {
  const copy = TAB_BANNER_COPY[variant];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPageVisible, setIsPageVisible] = useState<boolean>(() =>
    typeof document !== "undefined" ? document.visibilityState !== "hidden" : true
  );
  const [isInViewport, setIsInViewport] = useState<boolean>(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(document.visibilityState !== "hidden");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsInViewport(entry.isIntersecting);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, []);

  const isAnimationPaused = !isActive || !isPageVisible || !isInViewport;

  return (
    <div
      ref={containerRef}
      className="min-w-0 overflow-hidden rounded-3xl border border-[#E6DCE0] bg-gradient-to-r from-white via-[#FDF8F9] to-[#F6ECEF]/75 px-5 py-3.5 shadow-[0_10px_30px_rgba(35,24,28,0.04)] sm:px-7"
    >
      <div className="flex min-w-0 items-center justify-between gap-4">
        <div className="min-w-0 space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B56576]">
            {copy.eyebrow[language]}
          </p>
          <h2 className="font-editorial break-words text-xl font-semibold leading-tight text-[#1E181A] sm:text-2xl">
            {copy.title[language]}
          </h2>
          <p className="break-words text-xs leading-snug text-[#5E5055]">
            {copy.subtitle[language]}
          </p>
        </div>

        <div
          data-anim-paused={isAnimationPaused ? "true" : "false"}
          className="tab-anim-stage flex min-h-16 min-w-28 shrink-0 items-center justify-center rounded-2xl border border-[#E6DCE0]/80 bg-white/80 px-2 py-1 sm:min-h-20 sm:min-w-36"
        >
          {isActive && (
            <>
              {variant === "skin" && <SkinFaceLineArt />}
              {variant === "hair" && <HairStrandsLineArt />}
              {variant === "steroid" && <SteroidTubeShieldLineArt />}
              {variant === "verify" && <AuthenticityDropperLineArt />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
