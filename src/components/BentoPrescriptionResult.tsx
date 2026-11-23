import {
  FileText,
  Sun,
  Moon,
  ShoppingBag,
  Droplets,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Eye,
} from "lucide-react";
import {
  findCatalogMatch,
  getAuthenticBuyUrl,
} from "../data/products.ts";
import { getVerifiedAffiliateUrl } from "../data/affiliates.ts";
import { WhatsAppShareButton } from "./WhatsAppShareButton.tsx";
import type {
  BentoPrescriptionResponse,
  Language,
  RoutineStep,
} from "../types/dermascan.ts";

interface BentoPrescriptionResultProps {
  data: BentoPrescriptionResponse;
  language: Language;
  scanTitle: string;
}

function resolveStepBuyUrl(step: RoutineStep): string {
  return getAuthenticBuyUrl(
    step.brand || "",
    step.productName || step.title.en,
    step.productId
  );
}

export function BentoPrescriptionResult({
  data,
  language,
  scanTitle,
}: BentoPrescriptionResultProps) {
  const t = (b: { en: string; ur: string }) => b[language];
  const tl = (b: { en: string[]; ur: string[] }) => b[language];

  const hydratedProducts = (data.recommendedProducts || []).map((pick) => {
    const match = findCatalogMatch(pick.productId, pick.brand, pick.name);
    const brand = pick.brand || match?.brand || "Trusted Brand";
    const name = pick.name || match?.name || "Recommended Product";
    const verifiedAffiliateUrl = getVerifiedAffiliateUrl({
      brand,
      name,
      productId: pick.productId,
    });
    return {
      key: `${pick.productId || ""}-${brand}-${name}`,
      brand,
      name,
      subCategory: pick.subCategory || match?.subCategory || "Skincare / Haircare",
      approxPricePkr: pick.approxPricePkr || match?.approxPricePkr || "Check Pharmacy",
      whereToBuy:
        pick.whereToBuy ||
        match?.whereToBuy ||
        "Official Brand Store • Dvago • Naheed • Daraz Mall",
      verifiedAffiliateUrl,
      buyUrl: getAuthenticBuyUrl(brand, name, pick.productId),
      bullets: pick.bullets,
    };
  });

  const shareText = [
    `*DerméScan: ${scanTitle}*`,
    `Focus: ${t(data.primaryConcernTag)}`,
    ``,
    `*1. What Your Photos Show:*`,
    ...tl(data.assessment.summaryBullets).map((b) => `• ${b}`),
    ``,
    `*2. Safe Pharmacy Picks:*`,
    ...hydratedProducts.map(
      (p) => `• ${p.brand} ${p.name} (${p.approxPricePkr})`
    ),
    ``,
    `*3. Water & Daily Habits:*`,
    ...tl(data.lifestyleAndWater.waterAndClimateBullets).map((b) => `• ${b}`),
    ``,
    `*Note:* Simple everyday skin & hair tips. Visit a skin doctor for a medical checkup.`,
  ].join("\n");

  const isHairScan = Boolean(data.assessment.hairBreakdown);
  const triageStatus =
    data.triageDecision?.status ??
    (data.redFlags.urgencyLevel === "urgent"
      ? "see_dermatologist_directly"
      : "home_routine_safe");
  const isUrgentDoctorTriage = triageStatus === "see_dermatologist_directly";
  const triageBadgeText =
    data.triageDecision?.badge?.[language] ||
    (isUrgentDoctorTriage
      ? language === "ur"
        ? "🚨 Seedha PMDC Skin Doctor Ko Dikhayein"
        : "🚨 Go Directly to a PMDC Dermatologist / Doctor"
      : language === "ur"
        ? "✓ Ghar Aur Pharmacy Routine Ke Liye Safe"
        : "✓ Safe for Targeted Home & Pharmacy Routine");
  const triageReasonText =
    data.triageDecision?.reason?.[language] ||
    (isUrgentDoctorTriage
      ? tl(data.redFlags.warningBullets)[0] ||
        (language === "ur"
          ? "Tez alamaat ki wajah se koi bhi active cream lagane se pehle PMDC skin doctor se checkup karwayein."
          : "Urgent signs need an in-person PMDC dermatologist checkup before applying active skincare products.")
      : language === "ur"
        ? "Aapki photos aur 7-box maloomat ke mutabiq yeh ghar aur verified pharmacy routine se safe tareeqe se manage ho sakta hai."
        : "Based on your photos and clinical answers, this is safe to manage with a targeted home and pharmacy routine.");

  function renderRoutineStepCard(step: RoutineStep) {
    const verifiedAffiliateUrl = getVerifiedAffiliateUrl({
      brand: step.brand,
      name: step.productName,
      title: step.title.en,
      productId: step.productId,
    });
    const buyUrl = resolveStepBuyUrl(step);
    const hasProduct = Boolean(step.brand || step.productName || step.productId);
    const usageCautionText = step.usageCaution?.[language]?.trim();
    const formattedStepNumber = String(step.stepNumber).padStart(2, "0");

    return (
      <div
        key={`${step.stepNumber}-${step.title.en}`}
        className="flex min-w-0 flex-col justify-between gap-4 overflow-x-hidden rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7]/75 p-5 shadow-[0_6px_20px_-10px_rgba(181,101,118,0.12)] transition-all"
      >
        <div className="min-w-0 space-y-3">
          {/* Row 1: Editorial step number + AM/PM/Weekly pill badge + caution pill */}
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <span className="inline-block max-w-full whitespace-normal break-words rounded-full border border-[#EAD8DC] bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8C3B4A]">
                {t(step.timingBadge)}
              </span>
              {usageCautionText && (
                <span className="inline-block max-w-full whitespace-normal break-words rounded-full border border-[#E8C5CA] bg-[#FDF4F5] px-2.5 py-1 text-[10px] font-semibold text-[#8C3B4A]">
                  ⚠ {usageCautionText}
                </span>
              )}
            </div>
            <span className="font-editorial text-xl font-semibold italic leading-none text-[#B56576]/85">
              {formattedStepNumber}
            </span>
          </div>

          {verifiedAffiliateUrl && (
            <div className="flex min-w-0 items-start">
              <a
                href={verifiedAffiliateUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className="inline-flex min-h-[38px] max-w-full items-center justify-center rounded-full bg-gradient-to-b from-[#BF6E7F] to-[#B56576] px-4.5 py-1.5 text-xs font-semibold text-white shadow-[0_8px_20px_-6px_rgba(181,101,118,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#B56576] hover:to-[#9E5263] active:scale-95 dark:from-[#D48395] dark:to-[#D48395] dark:text-[#161012] dark:hover:from-[#B56576] dark:hover:to-[#B56576] dark:hover:text-[#F7EFEF]"
              >
                Buy at the best price here →
              </a>
            </div>
          )}

          {/* Row 2: Editorial Product / Step Name */}
          <h4 className="min-w-0 break-words font-editorial text-lg font-semibold leading-snug text-[#1E181A]">
            {t(step.title)}
          </h4>

          {/* Row 3: 3 crisp, scannable micro-bullets with relaxed leading */}
          <ul className="min-w-0 space-y-1.5 text-xs leading-relaxed text-[#5E5055]">
            <li className="min-w-0 break-words">
              <strong className="font-semibold text-[#1E181A]">
                {isHairScan
                  ? language === "ur"
                    ? "Faisla / Miqdar: "
                    : "Verdict / Dose: "
                  : language === "ur"
                    ? "Kitna Lagana Hai: "
                    : "How Much to Use: "}
              </strong>
              <span>{t(step.dose)}</span>
            </li>
            <li className="min-w-0 break-words">
              <strong className="font-semibold text-[#1E181A]">
                {language === "ur" ? "Tarika: " : "How to Do It: "}
              </strong>
              <span>{t(step.method)}</span>
            </li>
            <li className="min-w-0 break-words">
              <strong className="font-semibold text-[#1E181A]">
                {language === "ur" ? "Zaroori Baat: " : "Helpful Tip: "}
              </strong>
              <span>{t(step.note)}</span>
            </li>
          </ul>
        </div>

        {/* Row 4: Real affiliate button if configured, else safe stockist / link */}
        {!verifiedAffiliateUrl &&
          (buyUrl ? (
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-2xl border border-[#E6D2D6] bg-white/95 px-4 py-2 text-xs font-semibold text-[#1E181A] transition-all hover:-translate-y-0.5 hover:border-[#B56576] hover:bg-[#F6ECEF]/75 hover:text-[#B56576] active:scale-95"
            >
              <span>
                {language === "ur"
                  ? "Asli Online Khareedein"
                  : "Buy Original Online"}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
            </a>
          ) : hasProduct ? (
            <span className="inline-block max-w-full whitespace-normal break-words rounded-full border border-[#EAD8DC] bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-[#8C3B4A]">
              Available at: Official Brand Store • Dvago • Naheed • Daraz Mall
            </span>
          ) : null)}
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      {/* Top Editorial Summary Header */}
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 overflow-x-hidden rounded-3xl border border-[#EAD8DC] bg-white px-6 py-5 shadow-[0_8px_24px_-12px_rgba(181,101,118,0.12)]">
        <div className="flex min-w-0 items-center gap-2.5">
          <FileText className="h-4.5 w-4.5 shrink-0 text-[#B56576]" />
          <span className="min-w-0 break-words font-editorial text-xl font-semibold text-[#1E181A]">
            {t(data.primaryConcernTag)}
          </span>
        </div>
        <span className="inline-block max-w-full whitespace-normal rounded-full border border-[#C3DFCE] bg-[#EFF7F2] px-3.5 py-1 text-xs font-semibold text-[#2D6A4F]">
          {t(data.confidenceLabel)}
        </span>
      </div>

      {/* Clear Triage Decision Banner */}
      <div
        className={`min-w-0 overflow-x-hidden rounded-3xl border p-6 shadow-[0_8px_24px_-12px_rgba(181,101,118,0.1)] sm:px-7 ${
          isUrgentDoctorTriage
            ? "border-[#E8C5CA] bg-[#FDF4F5]"
            : "border-[#C3DFCE] bg-[#EFF7F2]"
        }`}
      >
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span
            className={`inline-flex max-w-full items-center gap-1.5 self-start whitespace-normal break-words rounded-full bg-white/95 px-4 py-1.5 text-xs font-bold shadow-2xs ${
              isUrgentDoctorTriage ? "text-[#8C3B4A]" : "text-[#2D6A4F]"
            }`}
          >
            {triageBadgeText}
          </span>
        </div>
        <p
          className={`mt-3 break-words text-xs font-medium leading-relaxed ${
            isUrgentDoctorTriage ? "text-[#8C3B4A]" : "text-[#1E181A]"
          }`}
        >
          {triageReasonText}
        </p>
      </div>

      {/* Card 1: Visual Assessment & Ranked Possibilities */}
      <section className="min-w-0 overflow-x-hidden rounded-3xl border border-[#EAD8DC] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(181,101,118,0.12)] sm:p-8">
        <div className="mb-5 flex min-w-0 items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#EAD8DC] bg-[#FAF6F7] text-[#B56576]">
            <Eye className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#B56576]">
              {language === "ur"
                ? "01 · Mumkina Wajoohat (Ranked)"
                : "01 · Ranked Possibilities"}
            </p>
            <h3 className="font-editorial break-words text-2xl font-semibold text-[#1E181A]">
              {language === "ur"
                ? "Photos Aur Jawabat Kya Dikhati Hain"
                : "What Your Photos & Answers Show"}
            </h3>
          </div>
        </div>

        <ul className="min-w-0 space-y-2.5 text-sm leading-relaxed text-[#5E5055]">
          {tl(data.assessment.summaryBullets).map((bullet, idx) => (
            <li key={idx} className="flex min-w-0 items-start gap-2.5">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B56576]" />
              <span className="min-w-0 break-words">{bullet}</span>
            </li>
          ))}
        </ul>

        {data.assessment.hairBreakdown && (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="min-w-0 overflow-x-hidden rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7]/75 p-4">
              <p className="mb-2 font-editorial text-base font-semibold text-[#1E181A]">
                Scalp &amp; Hairline
              </p>
              <ul className="space-y-1.5 text-xs leading-relaxed text-[#5E5055]">
                {tl(data.assessment.hairBreakdown.scalpAndHairline).map(
                  (item, i) => (
                    <li key={i} className="flex min-w-0 items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#B56576]" />
                      <span className="min-w-0 break-words">{item}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="min-w-0 overflow-x-hidden rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7]/75 p-4">
              <p className="mb-2 font-editorial text-base font-semibold text-[#1E181A]">
                Middle Hair
              </p>
              <ul className="space-y-1.5 text-xs leading-relaxed text-[#5E5055]">
                {tl(data.assessment.hairBreakdown.midLengths).map((item, i) => (
                  <li key={i} className="flex min-w-0 items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#B56576]" />
                    <span className="min-w-0 break-words">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0 overflow-x-hidden rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7]/75 p-4">
              <p className="mb-2 font-editorial text-base font-semibold text-[#1E181A]">
                Hair Ends
              </p>
              <ul className="space-y-1.5 text-xs leading-relaxed text-[#5E5055]">
                {tl(data.assessment.hairBreakdown.hairEnds).map((item, i) => (
                  <li key={i} className="flex min-w-0 items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#B56576]" />
                    <span className="min-w-0 break-words">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {data.assessment.angleObservations.length > 0 && (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.assessment.angleObservations.map((obs, idx) => (
              <div
                key={`${obs.slotLabel}-${idx}`}
                className="min-w-0 overflow-x-hidden rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7]/65 p-4"
              >
                <p className="mb-1.5 break-words font-heading text-xs font-bold text-[#1E181A]">
                  {obs.slotLabel}
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-[#5E5055]">
                  {tl(obs.bullets).map((b, bIdx) => (
                    <li key={bIdx} className="flex min-w-0 items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#B56576]" />
                      <span className="min-w-0 break-words">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {tl(data.assessment.triggersIdentified).length > 0 && (
          <p className="mt-5 break-words border-t border-[#EAD8DC] pt-4 text-xs leading-relaxed text-[#5E5055]">
            <strong className="font-semibold text-[#B56576]">
              {language === "ur" ? "Asal Wajoohat: " : "Possible Causes: "}
            </strong>
            {tl(data.assessment.triggersIdentified).join(" · ")}
          </p>
        )}
      </section>

      {/* Card 2: Daily Morning & Night Routine (Clinical Dossier) */}
      <section className="min-w-0 overflow-x-hidden rounded-3xl border border-[#EAD8DC] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(181,101,118,0.12)] sm:p-8">
        <div className="mb-6 flex min-w-0 items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#EAD8DC] bg-[#FAF6F7] text-[#B56576]">
            <Sun className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#B56576]">
              {isHairScan
                ? language === "ur"
                  ? "02 · Mukammal 6-Step Hair Care Plan"
                  : "02 · Complete 6-Step Hair Care Plan"
                : language === "ur"
                  ? "02 · Asaan Rozana Routine"
                  : "02 · Simple Daily Routine"}
            </p>
            <h3 className="font-editorial break-words text-2xl font-semibold text-[#1E181A]">
              {isHairScan
                ? language === "ur"
                  ? "Shampoo, Mask, Serum, Oil, Bonnet & Drying"
                  : "Shampoo, Mask, Serum, Oil, Bonnet & Drying"
                : language === "ur"
                  ? "Subah Aur Raat / Wash-Day Plan"
                  : "Morning & Night / Wash-Day Plan"}
            </h3>
          </div>
        </div>

        {data.routine.morning.length === 0 && data.routine.evening.length === 0 ? (
          <div className="rounded-2xl border border-[#E8C5CA] bg-[#FDF4F5] p-5 text-xs font-medium leading-relaxed text-[#8C3B4A]">
            {language === "ur"
              ? "Active serums ya treatment creams abhi bilkul band rakhein. Seedha PMDC skin doctor se checkup karwane ke baad hi naya ilaj shuru karein."
              : "Pause active creams, acids, and scrubs for now. Visit a PMDC dermatologist in person first before starting active treatments."}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Column 1 */}
            <div className="min-w-0 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#EAD8DC] pb-2.5">
                <Sun className="h-4 w-4 shrink-0 text-[#B56576]" />
                <h4 className="font-heading text-xs font-bold uppercase tracking-[0.12em] text-[#1E181A]">
                  {isHairScan
                    ? language === "ur"
                      ? "Steps 1–3 · Shampoo, Mask Aur Serum"
                      : "Steps 1–3 · Shampoo, Mask & Serum"
                    : language === "ur"
                      ? "Subah / Din Ka Plan"
                      : "Morning / Daytime"}
                </h4>
              </div>
              <div className="space-y-4">
                {data.routine.morning.map((step) => renderRoutineStepCard(step))}
              </div>
            </div>

            {/* Column 2 */}
            <div className="min-w-0 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#EAD8DC] pb-2.5">
                <Moon className="h-4 w-4 shrink-0 text-[#B56576]" />
                <h4 className="font-heading text-xs font-bold uppercase tracking-[0.12em] text-[#1E181A]">
                  {isHairScan
                    ? language === "ur"
                      ? "Steps 4–6 · Tel, Bonnet Aur Drying"
                      : "Steps 4–6 · Oil Verdict, Bonnet & Drying"
                    : language === "ur"
                      ? "Raat / Nahane Ka Plan"
                      : "Night / Wash Day"}
                </h4>
              </div>
              <div className="space-y-4">
                {data.routine.evening.map((step) => renderRoutineStepCard(step))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Card 3: Safe Pakistani Pharmacy Picks */}
      <section className="min-w-0 overflow-x-hidden rounded-3xl border border-[#EAD8DC] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(181,101,118,0.12)] sm:p-8">
        <div className="mb-6 flex min-w-0 items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#EAD8DC] bg-[#FAF6F7] text-[#B56576]">
            <ShoppingBag className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#B56576]">
              {language === "ur"
                ? "03 · Safe Pharmacy Products"
                : "03 · Safe Pharmacy Picks"}
            </p>
            <h3 className="font-editorial break-words text-2xl font-semibold text-[#1E181A]">
              {language === "ur"
                ? "Steroid-Free Asli Products"
                : "Safe Products You Can Trust"}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {hydratedProducts.map((item, idx) => (
            <div
              key={item.key}
              className="flex min-w-0 flex-col justify-between gap-4 overflow-x-hidden rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7]/75 p-5 shadow-[0_6px_20px_-10px_rgba(181,101,118,0.1)]"
            >
              <div className="min-w-0 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-block max-w-full whitespace-normal break-words rounded-full border border-[#C3DFCE] bg-[#EFF7F2] px-3 py-1 text-[11px] font-semibold tabular-nums text-[#2D6A4F]">
                    {item.approxPricePkr}
                  </span>
                  <span className="font-editorial text-lg font-semibold italic leading-none text-[#B56576]/75">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="min-w-0">
                  <span className="inline-block rounded-full border border-[#EAD8DC] bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#B56576]">
                    {item.brand} · {item.subCategory}
                  </span>
                  <h4 className="mt-1.5 break-words font-editorial text-lg font-semibold leading-snug text-[#1E181A]">
                    {item.name}
                  </h4>
                </div>

                <ul className="min-w-0 space-y-1.5 text-xs leading-relaxed text-[#5E5055]">
                  {tl(item.bullets).map((b, bIdx) => (
                    <li key={bIdx} className="flex min-w-0 items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#B56576]" />
                      <span className="min-w-0 break-words">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-[#EAD8DC] pt-3">
                {item.verifiedAffiliateUrl ? (
                  <div className="flex min-w-0 flex-col items-start gap-2.5">
                    <p className="break-words text-[11px] leading-relaxed text-[#5E5055]">
                      {language === "ur" ? "Kahan milega: " : "Where to buy: "}
                      <strong className="text-[#1E181A]">
                        {item.whereToBuy}
                      </strong>
                    </p>
                    <a
                      href={item.verifiedAffiliateUrl}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      className="inline-flex min-h-[38px] max-w-full items-center justify-center rounded-full bg-gradient-to-b from-[#BF6E7F] to-[#B56576] px-5 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_-6px_rgba(181,101,118,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#B56576] hover:to-[#9E5263] active:scale-95 dark:from-[#D48395] dark:to-[#D48395] dark:text-[#161012] dark:hover:from-[#B56576] dark:hover:to-[#B56576] dark:hover:text-[#F7EFEF]"
                    >
                      Buy at the best price here →
                    </a>
                  </div>
                ) : item.buyUrl ? (
                  <div className="space-y-2.5 text-[11px]">
                    <p className="break-words leading-relaxed text-[#5E5055]">
                      {language === "ur" ? "Kahan milega: " : "Where to buy: "}
                      <strong className="text-[#1E181A]">
                        {item.whereToBuy}
                      </strong>
                    </p>
                    <a
                      href={item.buyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-2xl border border-[#E6D2D6] bg-white/95 px-4 py-2 text-xs font-semibold text-[#1E181A] transition-all hover:-translate-y-0.5 hover:border-[#B56576] hover:bg-[#F6ECEF]/75 hover:text-[#B56576] active:scale-95"
                    >
                      <span>
                        {language === "ur"
                          ? "Asli Online Khareedein"
                          : "Buy Original Online"}
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  </div>
                ) : (
                  <span className="inline-block max-w-full whitespace-normal break-words rounded-full border border-[#EAD8DC] bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-[#8C3B4A]">
                    Available at: Official Brand Store • Dvago • Naheed • Daraz Mall
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Card 4 & Card 5 Split on Tablet/Laptop */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Card 4: Water & Daily Habits */}
        <section className="min-w-0 overflow-x-hidden rounded-3xl border border-[#EAD8DC] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(181,101,118,0.12)] sm:p-8">
          <div className="mb-4 flex min-w-0 items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#EAD8DC] bg-[#FAF6F7] text-[#B56576]">
              <Droplets className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#B56576]">
                {language === "ur"
                  ? "04 · Paani Aur Aadaat"
                  : "04 · Water & Daily Habits"}
              </p>
              <h3 className="font-editorial break-words text-2xl font-semibold text-[#1E181A]">
                {language === "ur"
                  ? "Paani, Mausam Aur Daily Aadaat"
                  : "Water, Climate & Daily Habits"}
              </h3>
            </div>
          </div>

          <div className="mb-4 rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7]/75 p-4">
            <ul className="space-y-1.5 text-xs leading-relaxed text-[#5E5055]">
              {tl(data.lifestyleAndWater.waterAndClimateBullets).map(
                (item, idx) => (
                  <li key={idx} className="flex min-w-0 items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B56576]" />
                    <span className="min-w-0 break-words">{item}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          <ul className="space-y-2.5">
            {tl(data.lifestyleAndWater.habitChecklist).map((item, idx) => (
              <li
                key={idx}
                className="flex min-w-0 items-start gap-2 text-xs leading-relaxed text-[#5E5055]"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#B56576]" />
                <span className="min-w-0 break-words">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Card 5: Doctor Alert */}
        <section className="min-w-0 overflow-x-hidden rounded-3xl border border-[#E8C5CA] bg-[#FDF4F5] p-6 shadow-[0_8px_24px_-12px_rgba(181,101,118,0.1)] sm:p-8">
          <div className="mb-4 flex min-w-0 items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#E8C5CA] bg-white/90 text-[#8C3B4A]">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8C3B4A]">
                {language === "ur"
                  ? "05 · Doctor Alert"
                  : "05 · Doctor Alert"}
              </p>
              <h3 className="font-editorial break-words text-2xl font-semibold text-[#8C3B4A]">
                {language === "ur"
                  ? "Kab Skin Doctor Ko Dikhayein"
                  : "When to Visit a Skin Doctor"}
              </h3>
            </div>
          </div>

          <ul className="mb-4 space-y-1.5 text-xs font-medium leading-relaxed text-[#8C3B4A]">
            {tl(data.redFlags.warningBullets).map((warn, idx) => (
              <li key={idx} className="flex min-w-0 items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8C3B4A]" />
                <span className="min-w-0 break-words">{warn}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl border border-[#E8C5CA]/80 bg-white/85 p-4">
            <ul className="space-y-1.5 text-xs leading-relaxed text-[#8C3B4A]">
              {tl(data.redFlags.whenToSeeDermatologist).map((flag, idx) => (
                <li key={idx} className="flex min-w-0 items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#8C3B4A]" />
                  <span className="min-w-0 break-words">{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <WhatsAppShareButton summaryText={shareText} language={language} />
    </div>
  );
}
