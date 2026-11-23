import type { Language } from "../types/dermascan.ts";

interface PhotoGuideBannerProps {
  language: Language;
}

export function PhotoGuideBanner({ language }: PhotoGuideBannerProps) {
  const isUr = language === "ur";

  return (
    <p className="px-1 text-xs font-medium tracking-wide text-[#7A686D] dark:text-[#A9939B]">
      {isUr
        ? "Saaf roshni · No filters · Nazdeek se photo"
        : "Good lighting · No filters · Close-up"}
    </p>
  );
}
