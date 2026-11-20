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
    targetProgress: 34,
    stepTitle: { en: "Texture & Light", ur: "Jaanch" },
    label: {
      en: "Examining surface texture & lighting...",
      ur: "Jild aur texture ko saaf roshni mein check kiya ja raha hai...",
    },
  },
  {
    minSec: 4,
    targetProgress: 68,
    stepTitle: { en: "Ingredients & Fit", ur: "Ingredients" },
    label: {
      en: "Screening active ingredients & local climate fit...",
      ur: "Ingredients aur Pakistani mausam ke mutabiq jaanch ho rahi hai...",
    },
  },
  {
    minSec: 9,
    targetProgress: 94,
    stepTitle: { en: "Your Routine", ur: "Routine" },
    label: {
      en: "Curating your personalized routine...",
      ur: "Aapke liye khaas aur safe routine tayyar ki ja rahi hai...",
    },
  },
];

function getStagesForMode(
  _scanMode: NonNullable<ScanningLoaderProps["scanMode"]>
): ScanStage[] {
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
    const prevBase = stageIndex === 0 ? 10 : stages[stageIndex - 1].targetProgress;
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
      className="min-w-0 overflow-x-hidden rounded-3xl border border-[#EAD8DC] bg-white/85 p-6 shadow-[0_14px_40px_-15px_rgba(181,101,118,0.16)] backdrop-blur-md sm:p-8"
    >
      <div className="mx-auto max-w-xl space-y-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#EAD8DC] bg-[#FAF6F7] ring-4 ring-[#B56576]/15">
            <div className="absolute -inset-1 animate-ping rounded-full border border-[#B56576]/30 bg-[#B56576]/10" />
            <div className="absolute inset-1.5 animate-pulse rounded-full border border-[#B56576]/25" />
            <ScanLine className="relative h-6 w-6 animate-pulse text-[#B56576]" />
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EAD8DC] bg-[#FAF6F7] px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#B56576]">
                <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#B56576]" />
                <span>
                  {language === "ur"
                    ? `Step ${stageIndex + 1} / 3`
                    : `Step ${stageIndex + 1} of 3`}
                </span>
              </span>
              <span className="text-xs font-bold tabular-nums text-[#B56576]">
                {progressPercent}%
              </span>
            </div>

            <p className="break-words font-editorial text-xl font-semibold leading-snug text-[#1E181A] sm:text-2xl">
              {currentStage.label[language]}
            </p>
            <p className="break-words text-xs font-medium leading-relaxed text-[#7A686D]">
              {language === "ur"
                ? "Aapki photos aur details ko ghaur se check kiya ja raha hai — is mein aam taur par 1 minute se kam waqt lagta hai. Meharbani kar ke screen khuli rakhein."
                : "Reviewing your photos and care notes — this usually takes under a minute. Please keep this page open."}
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#F3E7EA]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#D393A0] via-[#B56576] to-[#9E5263] transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-3">
            {SCAN_STAGES.map((stage, idx) => {
              const isDone = idx < stageIndex;
              const isActive = idx === stageIndex;
              return (
                <div
                  key={stage.minSec}
                  className={`flex min-w-0 items-center gap-2 rounded-2xl border px-3 py-2 text-[11px] font-semibold transition-all ${
                    isDone
                      ? "border-[#EAD8DC] bg-[#F6ECEF]/80 text-[#8C3B4A]"
                      : isActive
                        ? "border-[#B56576]/60 bg-[#FDF4F5] text-[#1E181A] shadow-2xs"
                        : "border-[#E6D2D6] bg-[#FAF6F7]/70 text-[#5E5055]/75"
                  }`}
                >
                  <span
                    className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                      isDone
                        ? "bg-[#B56576] text-white"
                        : isActive
                          ? "bg-[#B56576]/20 text-[#B56576]"
                          : "bg-[#EAD8DC]/70 text-[#5E5055]"
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

        <p className="break-words text-center text-xs leading-relaxed text-[#5E5055]">
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
