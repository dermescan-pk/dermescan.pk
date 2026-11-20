import { useEffect, useState } from "react";
import { Check, ScanLine } from "lucide-react";
import type { Language } from "../types/dermascan.ts";

interface ScanningLoaderProps {
  language: Language;
  customLabel?: string;
  scanMode?: "skin" | "hair" | "cream" | "verify";
}

interface ScanStage {
  minSec: number;
  targetProgress: number;
  label: {
    en: string;
    ur: string;
  };
  stepTitle: {
    en: string;
    ur: string;
  };
}

const SCAN_STAGES: ScanStage[] = [
  {
    minSec: 0,
    targetProgress: 24,
    stepTitle: { en: "Initialize", ur: "Shuru" },
    label: {
      en: "Starting your skin & hair scan...",
      ur: "Aapka skin aur hair scan shuru ho raha hai...",
    },
  },
  {
    minSec: 3,
    targetProgress: 52,
    stepTitle: { en: "Angles", ur: "Photos" },
    label: {
      en: "Inspecting uploaded angles & texture in uniform light...",
      ur: "Tamam angles aur texture ko saaf roshni mein check kiya ja raha hai...",
    },
  },
  {
    minSec: 7,
    targetProgress: 80,
    stepTitle: { en: "Matching", ur: "Products" },
    label: {
      en: "Matching safe Pakistani pharmacy & skincare products...",
      ur: "Safe Pakistani pharmacy aur skincare products match kiye ja rahe hain...",
    },
  },
  {
    minSec: 12,
    targetProgress: 94,
    stepTitle: { en: "Routine", ur: "Plan" },
    label: {
      en: "Almost there! Your personalized routine is nearly ready...",
      ur: "Bas thora intezar! Aapka personalized routine taqreeban tayyar hai...",
    },
  },
];

function getStagesForMode(
  scanMode: NonNullable<ScanningLoaderProps["scanMode"]>
): ScanStage[] {
  if (scanMode === "hair") {
    return [
      {
        ...SCAN_STAGES[0],
        label: {
          en: "Starting your hair & scalp scan...",
          ur: "Aapka hair aur scalp scan shuru ho raha hai...",
        },
      },
      SCAN_STAGES[1],
      {
        ...SCAN_STAGES[2],
        label: {
          en: "Matching famous Pakistani shampoos, masks & serums...",
          ur: "Mashhoor Pakistani shampoos, masks aur serums match ho rahe hain...",
        },
      },
      SCAN_STAGES[3],
    ];
  }
  return SCAN_STAGES;
}

export function ScanningLoader({
  language,
  customLabel,
  scanMode = "skin",
}: ScanningLoaderProps) {
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const timer = window.setInterval(() => {
      const seconds = (Date.now() - startTime) / 1000;
      setElapsedSec(seconds);
    }, 250);

    return () => window.clearInterval(timer);
  }, []);

  const stages = getStagesForMode(scanMode);

  let stageIndex = 0;
  for (let i = stages.length - 1; i >= 0; i--) {
    if (elapsedSec >= stages[i].minSec) {
      stageIndex = i;
      break;
    }
  }

  const currentStage = stages[stageIndex];

  const nextStage = stages[stageIndex + 1];
  let progressPercent = currentStage.targetProgress;
  if (nextStage) {
    const span = nextStage.minSec - currentStage.minSec;
    const within = Math.min(1, Math.max(0, (elapsedSec - currentStage.minSec) / span));
    const prevBase = stageIndex === 0 ? 8 : stages[stageIndex - 1].targetProgress;
    progressPercent = Math.round(
      prevBase + (currentStage.targetProgress - prevBase) * (0.4 + 0.6 * within)
    );
  } else {
    const extra = Math.min(4, Math.floor((elapsedSec - currentStage.minSec) / 2));
    progressPercent = Math.min(97, currentStage.targetProgress + extra);
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="min-w-0 overflow-x-hidden rounded-3xl border border-[#E6DCE0] bg-white p-6 shadow-[0_12px_40px_rgba(35,24,28,0.06)] sm:p-8"
    >
      <div className="mx-auto max-w-xl space-y-5">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#E8C5CA] bg-[#F6ECEF]">
            <div className="absolute inset-0 animate-ping rounded-2xl bg-[#B56576]/20" />
            <ScanLine className="relative h-6 w-6 animate-pulse text-[#B56576]" />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F6ECEF] px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#B56576]">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#B56576]" />
                <span>
                  {language === "ur"
                    ? `Step ${stageIndex + 1} / 4`
                    : `Step ${stageIndex + 1} of 4`}
                </span>
              </span>
              <span className="text-xs font-bold tabular-nums text-[#B56576]">
                {progressPercent}%
              </span>
            </div>

            <p className="break-words font-editorial text-xl font-semibold leading-snug text-[#1E181A]">
              {currentStage.label[language]}
            </p>
            <p className="break-words text-xs font-medium leading-relaxed text-[#7A686D]">
              {language === "ur"
                ? "Aapki photos aur details ko ghaur se check kiya ja raha hai — is mein aam taur par 1 minute se kam waqt lagta hai. Meharbani kar ke screen khuli rakhein."
                : "Reviewing your photos and care notes — this usually takes under a minute. Please keep this page open."}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F6ECEF]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#C98492] via-[#B56576] to-[#9E5263] transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
            {SCAN_STAGES.map((stage, idx) => {
              const isDone = idx < stageIndex;
              const isActive = idx === stageIndex;
              return (
                <div
                  key={stage.minSec}
                  className={`flex min-w-0 items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                    isDone
                      ? "border-[#E8C5CA] bg-[#F6ECEF]/70 text-[#8C3B4A]"
                      : isActive
                        ? "border-[#B56576] bg-[#FDF4F5] text-[#1E181A]"
                        : "border-[#E6DCE0] bg-[#F8F5F4]/60 text-[#5E5055]/70"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                      isDone
                        ? "bg-[#B56576] text-white"
                        : isActive
                          ? "bg-[#B56576]/20 text-[#B56576]"
                          : "bg-[#E6DCE0] text-[#5E5055]"
                    }`}
                  >
                    {isDone ? <Check className="h-2.5 w-2.5" /> : idx + 1}
                  </span>
                  <span className="truncate">{stage.stepTitle[language]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="break-words text-center text-xs text-[#5E5055]">
          {customLabel
            ? customLabel
            : language === "ur"
              ? "Chand seconds mein aapka asaan skin aur hair plan tayyar ho jayega."
              : "Preparing your daily routine and safe Pakistani pharmacy options..."}
        </p>
      </div>
    </div>
  );
}
