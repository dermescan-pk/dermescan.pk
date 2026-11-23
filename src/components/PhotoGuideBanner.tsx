import { Camera, Sun, ZoomIn } from "lucide-react";
import type { Language } from "../types/dermascan.ts";

interface PhotoGuideBannerProps {
  language: Language;
}

export function PhotoGuideBanner({ language }: PhotoGuideBannerProps) {
  const badges: readonly { label: string; icon: "sun" | "camera" | "zoom" }[] =
    language === "ur"
      ? [
          { label: "Saaf Roshni", icon: "sun" },
          { label: "No Filters / Makeup", icon: "camera" },
          { label: "Saaf Close-Up", icon: "zoom" },
        ]
      : [
          { label: "Good Lighting", icon: "sun" },
          { label: "No Filters / Makeup", icon: "camera" },
          { label: "Clear Close-Up", icon: "zoom" },
        ];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {badges.map((badge) => {
        const iconClass =
          "h-3.5 w-3.5 shrink-0 text-[#9E4358] dark:text-[#D48395]";
        return (
          <span
            key={badge.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E5D5DA] bg-white px-2.5 py-1 font-sans text-[11px] font-medium tracking-normal text-[#4E3E43] shadow-[0_1px_4px_-1px_rgba(140,74,92,0.12)] transition-colors duration-300 dark:border-[#49323A] dark:bg-[#191215] dark:text-[#EAD8DC]"
          >
            {badge.icon === "sun" ? (
              <Sun className={iconClass} strokeWidth={1.6} />
            ) : badge.icon === "camera" ? (
              <Camera className={iconClass} strokeWidth={1.6} />
            ) : (
              <ZoomIn className={iconClass} strokeWidth={1.6} />
            )}
            <span>{badge.label}</span>
          </span>
        );
      })}
    </div>
  );
}
