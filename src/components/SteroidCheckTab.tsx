import { useMemo, useRef, useState } from "react";
import {
  FlaskConical,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import {
  MultiAngleUploader,
  type AngleSlotConfig,
} from "./MultiAngleUploader.tsx";
import { ScanningLoader } from "./ScanningLoader.tsx";
import { TabHeaderIllustration } from "./TabHeaderIllustration.tsx";
import { ApiKeyAlertCard } from "./ApiKeyAlertCard.tsx";
import { RateLimitNoticeCard } from "./RateLimitNoticeCard.tsx";
import { WhatsAppShareButton } from "./WhatsAppShareButton.tsx";
import { findCatalogMatch, getAuthenticBuyUrl } from "../data/products.ts";
import {
  ApiKeyConfigError,
  RateLimitError,
  postApi,
} from "../utils/apiClient.ts";
import type {
  HealthProfile,
  Language,
  SteroidCheckResponse,
  UploadedImage,
} from "../types/dermascan.ts";

const CREAM_SLOTS: AngleSlotConfig[] = [
  {
    slotId: "cream-front",
    slotLabel: "1. Front Tube / Jar / Box",
    hint: "Brand name & whitening/treatment claims",
  },
  {
    slotId: "cream-ingredients",
    slotLabel: "2. Back Ingredients List",
    hint: "Close-up of composition / INCI panel",
  },
];

const STEROID_DURATION_CHIPS = [
  "Few Days",
  "2–6 Weeks",
  "Months / Years",
  "For Fairness / Melasma",
  "For Acne / Rash",
] as const;

const STEROID_SIDE_EFFECT_CHIPS = [
  "Thin Skin",
  "Visible Veins",
  "Rebound Darkening",
  "Excess Facial Hair",
  "Redness & Burning",
  "None Yet",
] as const;

function appendCreamChip(prev: string, chip: string): string {
  const trimmed = prev.trim();
  if (!trimmed) return chip;
  const alreadyIncluded = trimmed
    .toLowerCase()
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .includes(chip.toLowerCase());
  if (alreadyIncluded) return prev;
  const separator = trimmed.endsWith(",") ? " " : ", ";
  return `${trimmed}${separator}${chip}`;
}

interface SteroidCheckTabProps {
  language: Language;
  healthProfile: HealthProfile;
}

export function SteroidCheckTab({ language, healthProfile }: SteroidCheckTabProps) {
  const [imagesBySlot, setImagesBySlot] = useState<Record<string, UploadedImage>>(
    {}
  );
  const [productNameOrIngredients, setProductNameOrIngredients] = useState("");
  const [durationAndReason, setDurationAndReason] = useState("");
  const [sideEffectsNoticed, setSideEffectsNoticed] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const isSubmittingRef = useRef(false);
  const [result, setResult] = useState<SteroidCheckResponse | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [rateLimitNotice, setRateLimitNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const uploadedList = useMemo(
    () =>
      CREAM_SLOTS.map((s) => imagesBySlot[s.slotId]).filter(
        (img): img is UploadedImage => Boolean(img)
      ),
    [imagesBySlot]
  );

  async function handleInspectCream() {
    if (isSubmittingRef.current) return;

    setApiKeyError(null);
    setRateLimitNotice(null);
    setErrorMsg(null);

    if (!productNameOrIngredients.trim() && uploadedList.length === 0) {
      setErrorMsg(
        language === "ur"
          ? "Cream ka naam/ingredients likhein ya kam az kam 1 photo upload karein."
          : "Please enter a cream name/ingredients or upload at least 1 photo."
      );
      return;
    }

    isSubmittingRef.current = true;
    setIsChecking(true);
    setResult(null);

    try {
      const data = await postApi<SteroidCheckResponse>("/api/check-steroid", {
        productNameOrIngredients,
        durationAndReason: durationAndReason.trim(),
        sideEffectsNoticed: sideEffectsNoticed.trim(),
        healthProfile,
        images: uploadedList.map((img) => ({
          slotLabel: img.slotLabel,
          base64: img.base64,
          mimeType: img.mimeType,
        })),
      });

      setResult(data);
    } catch (err) {
      if (err instanceof ApiKeyConfigError) {
        setApiKeyError(err.message);
        return;
      }
      if (err instanceof RateLimitError) {
        setRateLimitNotice(err.message);
        return;
      }
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to check cream."
      );
    } finally {
      isSubmittingRef.current = false;
      setIsChecking(false);
    }
  }

  const hydratedReplacements = useMemo(() => {
    if (!result) return [];
    return (result.safeReplacementProductIds || []).map((pick) => {
      const match = findCatalogMatch(pick.productId, pick.brand, pick.name);
      const brand = pick.brand || match?.brand || "Safe Pharmacy Pick";
      const name = pick.name || match?.name || "Gentle Skincare";
      return {
        key: `${pick.productId || ""}-${brand}-${name}`,
        brand,
        name,
        approxPricePkr: pick.approxPricePkr || match?.approxPricePkr || "Check Pharmacy",
        buyUrl: getAuthenticBuyUrl(brand, name, pick.productId),
        bullets: pick.bullets,
      };
    });
  }, [result]);

  return (
    <div className="min-w-0 space-y-6">
      <TabHeaderIllustration variant="steroid" language={language} />

      <div className="min-w-0 overflow-x-hidden rounded-3xl border border-[#E8C5CA] bg-[#FDF4F5] p-6">
        <div className="flex min-w-0 items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#8C3B4A]" />
          <div className="min-w-0 space-y-1">
            <h2 className="font-editorial text-xl font-semibold text-[#8C3B4A]">
              {language === "ur"
                ? "Formula Creams Aur Chhupay Steroids Check Karein"
                : "Check Creams for Hidden Steroids"}
            </h2>
            <p className="break-words text-xs leading-relaxed text-[#8C3B4A]">
              {language === "ur"
                ? "Bohat si fairness aur '7-day formula creams' mein Dermovate/Clobevate ya Mercury hota hai jo jild ko patla aur kharab karta hai. Yahan check karein."
                : "Many local fairness and '7-day formula' creams hide strong steroids (like Dermovate) or mercury that thin and damage your skin. Upload a photo or type the name below."}
            </p>
          </div>
        </div>
      </div>

      <div className="min-w-0 space-y-6 overflow-x-hidden rounded-3xl border border-[#EAD8DC] bg-white/85 p-6 shadow-[0_14px_40px_-15px_rgba(181,101,118,0.14)] backdrop-blur-md sm:p-8">
        <div>
          <h3 className="font-editorial text-2xl font-semibold text-[#1E181A]">
            {language === "ur"
              ? "1. Cream / Product Ka Naam Aur Box Photo"
              : "1. Cream / Product Name & Packaging Photo"}
          </h3>
          <p className="mb-3 text-xs leading-relaxed text-[#5E5055]">
            {language === "ur"
              ? "Saaf roshni mein front aur peechay likhay ingredients ki photo lein."
              : "Take clear close-ups of the front tube/jar and the ingredients list on the back."}
          </p>
          <MultiAngleUploader
            slots={CREAM_SLOTS}
            imagesBySlot={imagesBySlot}
            onImageAdded={(img) =>
              setImagesBySlot((prev) => ({ ...prev, [img.slotId]: img }))
            }
            onImageRemoved={(slotId) =>
              setImagesBySlot((prev) => {
                const next = { ...prev };
                delete next[slotId];
                return next;
              })
            }
            language={language}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="steroid-cream-name"
            className="block text-xs font-bold text-[#1E181A]"
          >
            {language === "ur"
              ? "Cream Ka Naam / Ingredients Likhein"
              : "Type the Cream Name / Ingredients"}
          </label>
          <textarea
            id="steroid-cream-name"
            rows={2}
            value={productNameOrIngredients}
            onChange={(e) => setProductNameOrIngredients(e.target.value)}
            placeholder={
              language === "ur"
                ? "Maslan: Dermovate + Golden Pearl mix, Clobetasol, Betnovate-N, ya ingredients list likhein..."
                : "e.g., Clobetasol, Dermovate, Betnovate-N, Golden Pearl, or paste ingredients here..."
            }
            className="w-full rounded-2xl border border-[#E6D2D6] bg-white/95 p-3.5 text-xs leading-relaxed text-[#1E181A] placeholder:text-[#5E5055]/60 transition-all focus:border-[#B56576] focus:ring-2 focus:ring-[#B56576]/15 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex min-w-0 flex-col justify-between space-y-2.5 rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7]/65 p-4">
            <div className="space-y-2">
              <label
                htmlFor="steroid-duration-reason"
                className="block text-xs font-bold text-[#1E181A]"
              >
                {language === "ur"
                  ? "2. Kitne Time Se Aur Kyun Use Ki? (How Long Used & Why)"
                  : "2. How Long Used & Why (Kitne time se aur kyun?)"}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STEROID_DURATION_CHIPS.map((chip) => {
                  const selected = durationAndReason
                    .toLowerCase()
                    .split(/[,;\n]+/)
                    .map((s) => s.trim())
                    .includes(chip.toLowerCase());
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() =>
                        setDurationAndReason((prev) => appendCreamChip(prev, chip))
                      }
                      className={`min-h-[30px] rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all active:scale-95 ${
                        selected
                          ? "border-[#B56576] bg-[#F6ECEF] text-[#B56576]"
                          : "border-[#E6D2D6] bg-white/95 text-[#5E5055] hover:border-[#B56576] hover:bg-[#F6ECEF] hover:text-[#B56576]"
                      }`}
                    >
                      + {chip}
                    </button>
                  );
                })}
              </div>
            </div>
            <textarea
              id="steroid-duration-reason"
              rows={2}
              value={durationAndReason}
              onChange={(e) => setDurationAndReason(e.target.value)}
              placeholder="e.g. 4 months se daily raat ko fairness ya melasma ke liye laga rahe hain..."
              className="w-full rounded-2xl border border-[#E6D2D6] bg-white/95 px-3.5 py-2.5 text-xs leading-relaxed text-[#1E181A] placeholder:text-[#5E5055]/60 transition-all focus:border-[#B56576] focus:ring-2 focus:ring-[#B56576]/15 focus:outline-none"
            />
          </div>

          <div className="flex min-w-0 flex-col justify-between space-y-2.5 rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7]/65 p-4">
            <div className="space-y-2">
              <label
                htmlFor="steroid-side-effects"
                className="block text-xs font-bold text-[#1E181A]"
              >
                {language === "ur"
                  ? "3. Kya Side Effects Nazar Aaye? (Side Effects Noticed)"
                  : "3. Side Effects Noticed (Skin par kya asar dikha?)"}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STEROID_SIDE_EFFECT_CHIPS.map((chip) => {
                  const selected = sideEffectsNoticed
                    .toLowerCase()
                    .split(/[,;\n]+/)
                    .map((s) => s.trim())
                    .includes(chip.toLowerCase());
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() =>
                        setSideEffectsNoticed((prev) => appendCreamChip(prev, chip))
                      }
                      className={`min-h-[30px] rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all active:scale-95 ${
                        selected
                          ? "border-[#B56576] bg-[#F6ECEF] text-[#B56576]"
                          : "border-[#E6D2D6] bg-white/95 text-[#5E5055] hover:border-[#B56576] hover:bg-[#F6ECEF] hover:text-[#B56576]"
                      }`}
                    >
                      + {chip}
                    </button>
                  );
                })}
              </div>
            </div>
            <textarea
              id="steroid-side-effects"
              rows={2}
              value={sideEffectsNoticed}
              onChange={(e) => setSideEffectsNoticed(e.target.value)}
              placeholder="e.g. Chhorne par cheeks laal aur dark ho jate hain, veins dikh rahi hain, ya baal barh rahe hain..."
              className="w-full rounded-2xl border border-[#E6D2D6] bg-white/95 px-3.5 py-2.5 text-xs leading-relaxed text-[#1E181A] placeholder:text-[#5E5055]/60 transition-all focus:border-[#B56576] focus:ring-2 focus:ring-[#B56576]/15 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          disabled={isChecking}
          aria-busy={isChecking}
          onClick={handleInspectCream}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#BF6E7F] to-[#B56576] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(181,101,118,0.55)] transition-all hover:-translate-y-0.5 hover:from-[#B56576] hover:to-[#9E5263] active:scale-95 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FlaskConical className="h-4 w-4 shrink-0" />
          <span>
            {isChecking
              ? language === "ur"
                ? "Cream Check Ho Rahi Hai..."
                : "Checking Cream Ingredients..."
              : language === "ur"
                ? "Check Karein Cream Safe Hai Ya Nahi"
                : "Check If This Cream Is Safe"}
          </span>
        </button>
      </div>

      {apiKeyError && <ApiKeyAlertCard message={apiKeyError} />}

      {rateLimitNotice && (
        <RateLimitNoticeCard language={language} message={rateLimitNotice} />
      )}

      {errorMsg && (
        <div className="min-w-0 break-words rounded-3xl border border-[#E8C5CA] bg-[#FDF4F5] p-5 text-xs font-medium text-[#8C3B4A]">
          {errorMsg}
        </div>
      )}

      {isChecking && (
        <ScanningLoader
          language={language}
          customLabel={
            language === "ur"
              ? "Cream mein steroids, mercury aur tezi walay chemicals check ho rahe hain..."
              : "Checking cream ingredients for hidden steroids, mercury & harsh bleaches..."
          }
        />
      )}

      {result && !result.isReadableInput && (
        <div className="min-w-0 break-words rounded-3xl border border-[#E8C5CA] bg-[#FDF4F5] p-5 text-xs font-medium text-[#8C3B4A]">
          {result.readabilityMessage[language]}
        </div>
      )}

      {result && result.isReadableInput && (
        <div className="min-w-0 space-y-6">
          <div
            className={`min-w-0 overflow-x-hidden rounded-3xl border p-6 sm:p-8 ${
              result.safetyVerdict === "safe"
                ? "border-[#C3DFCE] bg-[#EFF7F2]"
                : result.safetyVerdict === "caution"
                  ? "border-[#E6DCE0] bg-[#F6ECEF]"
                  : "border-[#E8C5CA] bg-[#FDF4F5]"
            }`}
          >
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2.5">
                {result.safetyVerdict === "safe" ? (
                  <ShieldCheck className="h-5 w-5 shrink-0 text-[#2D6A4F]" />
                ) : (
                  <AlertTriangle
                    className={`h-5 w-5 shrink-0 ${
                      result.safetyVerdict === "caution"
                        ? "text-[#B56576]"
                        : "text-[#8C3B4A]"
                    }`}
                  />
                )}
                <h3 className="min-w-0 break-words font-editorial text-2xl font-semibold text-[#1E181A]">
                  {result.productDetectedName}
                </h3>
              </div>

              <span
                className={`inline-block max-w-full self-start whitespace-normal break-words rounded-full px-3.5 py-1 text-xs font-bold ${
                  result.safetyVerdict === "safe"
                    ? "bg-white text-[#2D6A4F]"
                    : result.safetyVerdict === "caution"
                      ? "bg-white text-[#B56576]"
                      : "bg-white text-[#8C3B4A]"
                }`}
              >
                {result.verdictBadge[language]}
              </span>
            </div>

            <ul className="mt-4 space-y-1.5 text-xs leading-relaxed text-[#1E181A]">
              {result.summaryBullets[language].map((bullet, i) => (
                <li key={i} className="flex min-w-0 items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
                  <span className="min-w-0 break-words">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {result.detectedRiskyIngredients.length > 0 && (
            <div className="min-w-0 overflow-x-hidden rounded-3xl border border-[#EAD8DC] bg-white/85 p-6 shadow-[0_14px_40px_-15px_rgba(181,101,118,0.14)] backdrop-blur-md sm:p-8">
              <h3 className="mb-4 font-editorial text-2xl font-semibold text-[#1E181A]">
                {language === "ur"
                  ? "Cream Mein Kya Shamil Hai"
                  : "What Is Inside This Cream"}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {result.detectedRiskyIngredients.map((item, idx) => (
                  <div
                    key={idx}
                    className="min-w-0 overflow-x-hidden rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7]/75 p-4"
                  >
                    <div className="mb-2 space-y-1.5">
                      <span className="inline-block max-w-full whitespace-normal break-words rounded-full border border-[#EAD8DC] bg-white/90 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#B56576]">
                        {item.category}
                      </span>
                      <p className="break-words font-editorial text-lg font-semibold text-[#1E181A]">
                        {item.ingredient}
                      </p>
                    </div>
                    <ul className="space-y-1 text-xs leading-relaxed text-[#5E5055]">
                      {item.riskBullets[language].map((b, bIdx) => (
                        <li key={bIdx} className="flex min-w-0 items-start gap-2">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#B56576]" />
                          <span className="min-w-0 break-words">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="min-w-0 overflow-x-hidden rounded-3xl border border-[#EAD8DC] bg-white/85 p-6 shadow-[0_14px_40px_-15px_rgba(181,101,118,0.14)] backdrop-blur-md sm:p-8">
            <h3 className="mb-4 font-editorial text-2xl font-semibold text-[#1E181A]">
              {language === "ur"
                ? "Mumkina Nuqsanat Aur Safe Tarika"
                : "Possible Side Effects & How to Stop Safely"}
            </h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {result.potentialSideEffects[language].length > 0 && (
                <div className="min-w-0 rounded-2xl border border-[#E8C5CA] bg-[#FDF4F5]/90 p-5">
                  <p className="mb-2.5 font-heading text-xs font-bold uppercase tracking-wider text-[#8C3B4A]">
                    {language === "ur" ? "Jild Ko Nuqsan" : "Possible Skin Damage"}
                  </p>
                  <ul className="space-y-1.5 leading-relaxed">
                    {result.potentialSideEffects[language].map((eff, i) => (
                      <li
                        key={i}
                        className="flex min-w-0 items-start gap-2 text-xs text-[#8C3B4A]"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8C3B4A]" />
                        <span className="min-w-0 break-words">{eff}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="min-w-0 rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7]/75 p-5">
                <p className="mb-2.5 font-heading text-xs font-bold uppercase tracking-wider text-[#1E181A]">
                  {language === "ur"
                    ? "Cream Aahista Chhorne Aur Jild Theek Karne Ka Plan"
                    : "How to Stop Safely & Heal Your Skin"}
                </p>
                <ul className="mb-3 space-y-1.5 text-xs leading-relaxed text-[#5E5055]">
                  {result.safeRecoveryPlan.taperingBullets[language].map(
                    (tip, i) => (
                      <li key={i} className="flex min-w-0 items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#B56576]" />
                        <span className="min-w-0 break-words">{tip}</span>
                      </li>
                    )
                  )}
                </ul>
                <ul className="space-y-1.5 border-t border-[#EAD8DC] pt-3 leading-relaxed">
                  {result.safeRecoveryPlan.steps[language].map((step, i) => (
                    <li
                      key={i}
                      className="flex min-w-0 items-start gap-2 text-xs text-[#5E5055]"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B56576]" />
                      <span className="min-w-0 break-words">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {hydratedReplacements.length > 0 && (
            <div className="min-w-0 overflow-x-hidden rounded-3xl border border-[#EAD8DC] bg-white/85 p-6 shadow-[0_14px_40px_-15px_rgba(181,101,118,0.14)] backdrop-blur-md sm:p-8">
              <h3 className="mb-4 font-editorial text-2xl font-semibold text-[#1E181A]">
                {language === "ur"
                  ? "Safe, Steroid-Free Pharmacy Badal"
                  : "Safe Steroid-Free Alternatives in Pakistan"}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {hydratedReplacements.map((item) => (
                  <div
                    key={item.key}
                    className="flex min-w-0 flex-col justify-between gap-3 overflow-x-hidden rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7]/75 p-5"
                  >
                    <div className="min-w-0 space-y-2">
                      <span className="inline-block max-w-full whitespace-normal rounded-full border border-[#C3DFCE] bg-[#EFF7F2] px-2.5 py-0.5 text-[10px] font-semibold tabular-nums text-[#2D6A4F]">
                        {item.approxPricePkr}
                      </span>
                      <p className="break-words font-editorial text-lg font-semibold text-[#1E181A]">
                        {item.brand} {item.name}
                      </p>
                      <ul className="space-y-1 text-xs leading-relaxed text-[#5E5055]">
                        {item.bullets[language].map((b, i) => (
                          <li key={i} className="flex min-w-0 items-start gap-2">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#B56576]" />
                            <span className="min-w-0 break-words">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-[#EAD8DC] pt-3">
                      {item.buyUrl ? (
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
                      ) : (
                        <span className="inline-block max-w-full whitespace-normal break-words rounded-full border border-[#EAD8DC] bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-[#8C3B4A]">
                          Available at: Official Brand Store • Dvago • Naheed • Daraz Mall
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="min-w-0 overflow-x-hidden rounded-3xl border border-[#E8C5CA] bg-[#FDF4F5]/90 p-6 text-xs leading-relaxed text-[#8C3B4A] shadow-[0_14px_40px_-15px_rgba(181,101,118,0.12)] backdrop-blur-md">
            <strong className="mb-2 block font-editorial text-xl font-semibold">
              {language === "ur"
                ? "Doctor Alert"
                : "Doctor Alert"}
            </strong>
            <ul className="space-y-1.5">
              {result.doctorEscalationBullets[language].map((b, i) => (
                <li key={i} className="flex min-w-0 items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8C3B4A]" />
                  <span className="min-w-0 break-words">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <WhatsAppShareButton
            language={language}
            summaryText={`*DerméScan — Steroid Check*\nProduct: ${result.productDetectedName}\nVerdict: ${result.verdictBadge[language]}\n${result.summaryBullets[language].map((b) => `• ${b}`).join("\n")}`}
          />
        </div>
      )}
    </div>
  );
}
