import { Sun, Sparkles, Focus } from "lucide-react";
import type { Language } from "../types/dermascan.ts";

interface PhotoGuideBannerProps {
  language: Language;
}

export function PhotoGuideBanner({ language }: PhotoGuideBannerProps) {
  const isUr = language === "ur";

  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E8D5D9]/80 bg-white px-5 py-3.5 shadow-[0_8px_24px_-14px_rgba(181,101,118,0.12)] sm:px-6">
      <span className="font-editorial text-lg font-semibold text-[#1E181A]">
        {isUr ? "Saaf Photo Tips" : "Photo Tips"}
      </span>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8D5D9]/80 bg-[#FAF6F7]/80 px-3.5 py-1.5 text-xs font-medium text-[#5E5055]">
          <Sun className="h-3.5 w-3.5 shrink-0 text-[#B56576]" />
          <span>{isUr ? "Saaf roshni" : "Good lighting"}</span>
        </span>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8D5D9]/80 bg-[#FAF6F7]/80 px-3.5 py-1.5 text-xs font-medium text-[#5E5055]">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#B56576]" />
          <span>{isUr ? "No filters" : "No filters"}</span>
        </span>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8D5D9]/80 bg-[#FAF6F7]/80 px-3.5 py-1.5 text-xs font-medium text-[#5E5055]">
          <Focus className="h-3.5 w-3.5 shrink-0 text-[#B56576]" />
          <span>{isUr ? "Nazdeek se photo" : "Close-up"}</span>
        </span>
      </div>
    </div>
  );
}
