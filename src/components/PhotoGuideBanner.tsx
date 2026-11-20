import { Sun, Droplets, Focus } from "lucide-react";
import type { Language } from "../types/dermascan.ts";

interface PhotoGuideBannerProps {
  language: Language;
}

export function PhotoGuideBanner({ language }: PhotoGuideBannerProps) {
  const isUr = language === "ur";

  return (
    <div className="min-w-0 overflow-x-hidden rounded-3xl border border-[#EAD8DC] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(181,101,118,0.12)] sm:p-8">
      <div className="mb-5 flex min-w-0 items-center gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#EAD8DC] bg-[#FAF6F7] text-[#B56576]">
          <Sun className="h-4 w-4" />
        </span>
        <h3 className="font-editorial min-w-0 text-xl font-semibold text-[#1E181A] sm:text-2xl">
          {isUr
            ? "Saaf Photo Lene Ka Asaan Tareeqa"
            : "How to Take Clear Photos"}
        </h3>
      </div>

      <ul className="grid grid-cols-1 gap-4 text-xs leading-relaxed text-[#5E5055] md:grid-cols-3">
        <li className="min-w-0 rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7]/70 px-4 py-4">
          <div className="mb-1.5 flex items-center gap-2 font-semibold text-[#1E181A]">
            <Sun className="h-3.5 w-3.5 shrink-0 text-[#B56576]" />
            <span>{isUr ? "Tez Aur Saaf Roshni" : "Bright, Even Light"}</span>
          </div>
          <p className="break-words">
            {isUr
              ? "Khirki ya tez white light ke samne baithen taake shadows na hon."
              : "Sit near a sunny window or bright white light with no shadows."}
          </p>
        </li>

        <li className="min-w-0 rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7]/70 px-4 py-4">
          <div className="mb-1.5 flex items-center gap-2 font-semibold text-[#1E181A]">
            <Droplets className="h-3.5 w-3.5 shrink-0 text-[#B56576]" />
            <span>
              {isUr ? "Saaf Jild, No Filter" : "Clean Skin & No Filters"}
            </span>
          </div>
          <p className="break-words">
            {isUr
              ? "Makeup ya tel saaf karein, lens ponchein aur filter band rakhein."
              : "Remove makeup or oil, wipe your lens, and turn off beauty filters."}
          </p>
        </li>

        <li className="min-w-0 rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7]/70 px-4 py-4">
          <div className="mb-1.5 flex items-center gap-2 font-semibold text-[#1E181A]">
            <Focus className="h-3.5 w-3.5 shrink-0 text-[#B56576]" />
            <span>{isUr ? "Nazdeek Se Saaf Photo" : "Clear Close-Up"}</span>
          </div>
          <p className="break-words">
            {isUr
              ? "Phone 6–10 inch door rakhein aur screen tap kar ke focus karein."
              : "Hold phone 6–10 inches away and tap screen for crisp focus."}
          </p>
        </li>
      </ul>
    </div>
  );
}
