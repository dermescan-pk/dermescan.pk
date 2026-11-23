import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlaskConical,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ShoppingBag,
} from "lucide-react";
import {
  MultiAngleUploader,
  type AngleSlotConfig,
} from "./MultiAngleUploader.tsx";
import { ScanningLoader } from "./ScanningLoader.tsx";
import { TabHeaderIllustration } from "./TabHeaderIllustration.tsx";
import { PhotoGuideBanner } from "./PhotoGuideBanner.tsx";
import { ApiKeyAlertCard } from "./ApiKeyAlertCard.tsx";
import { RateLimitNoticeCard } from "./RateLimitNoticeCard.tsx";
import { WhatsAppShareButton } from "./WhatsAppShareButton.tsx";
import { findCatalogMatch, getAuthenticBuyUrl } from "../data/products.ts";
import { getVerifiedAffiliateUrl } from "../data/affiliates.ts";
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

function AutoGrowTextarea({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    if (value) {
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      id={id}
      rows={2}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full resize-none overflow-hidden rounded-xl border border-[#EAD6DB] bg-[#FAF4F5] px-3.5 py-2.5 text-sm leading-relaxed text-[#1E181A] placeholder:text-[#7A686D]/75 transition-colors duration-200 focus:border-[#B56576] focus:outline-none focus:ring-1 focus:ring-[#B56576]/30 dark:border-[#34262B] dark:bg-[#151012] dark:text-[#F7EFEF] dark:placeholder:text-[#9A848B] dark:focus:border-[#D48395]"
    />
  );
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
      const verifiedAffiliateUrl = getVerifiedAffiliateUrl({
        brand,
        name,
        productId: pick.productId,
      });
      return {
        key: `${pick.productId || ""}-${brand}-${name}`,
        brand,
        name,
        approxPricePkr: pick.approxPricePkr || match?.approxPricePkr || "Check Pharmacy",
        verifiedAffiliateUrl,
        buyUrl: getAuthenticBuyUrl(brand, name, pick.productId),
        bullets: pick.bullets,
      };
    });
  }, [result]);

  return (
    <div className="min-w-0 space-y-8">
      <TabHeaderIllustration variant="steroid" language={language} />

      <div className="min-w-0 overflow-x-hidden rounded-2xl border border-[#E8C5CA] bg-[#FDF4F5] p-5 dark:border-[#59353F] dark:bg-[#23161A]">
        <div className="flex min-w-0 items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#8C3B4A]" />
          <div className="min-w-0 space-y-1">
            <h3 className="font-editorial text-xl font-semibold text-[#8C3B4A]">
              {language === "ur"
                ? "Formula Creams Aur Chhupay Steroids Check Karein"
                : "Check Creams for Hidden Steroids"}
            </h3>
            <p className="break-words text-xs leading-relaxed text-[#8C3B4A]">
              {language === "ur"
                ? "Bohat si fairness aur '7-day formula creams' mein Dermovate/Clobevate ya Mercury hota hai jo jild ko patla aur kharab karta hai. Yahan check karein."
                : "Many local fairness and '7-day formula' creams hide strong steroids (like Dermovate) or mercury that thin and damage your skin. Upload a photo or type the name below."}
            </p>
          </div>
        </div>
      </div>

      <div className="min-w-0 space-y-6 overflow-x-hidden rounded-3xl border border-[#DFC6CE] bg-white p-6 shadow-[0_14px_34px_-12px_rgba(140,74,92,0.20)] transition-colors duration-300 dark:border-[#49323A] dark:bg-[#1E1619] dark:shadow-[0_16px_38px_-14px_rgba(0,0,0,0.52)] sm:p-8">
        <div className="divide-y divide-[#F0E4E7] dark:divide-[#2D2125]">
          <div className="pb-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="font-editorial text-2xl font-semibold text-[#1E181A] dark:text-[#F7EFEF]">
                {language === "ur"
                  ? "Cream Ka Naam Aur Photos"
                  : "Cream Name & Photos"}
              </h3>
              <PhotoGuideBanner language={language} />
            </div>
            <p className="mb-4 mt-1.5 text-xs leading-relaxed text-[#7A686D] dark:text-[#C9B6BC]">
              {language === "ur"
                ? "Saaf roshni mein front aur peechay likhay ingredients ki photo lein."
                : "Upload clear photos of the front tube and back ingredients."}
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

          <div className="space-y-3 py-5">
            <label
              htmlFor="steroid-cream-name"
              className="block text-sm font-semibold text-[#1E181A] dark:text-[#F7EFEF]"
            >
              {language === "ur"
                ? "Cream ka naam ya ingredients"
                : "Cream name or ingredients"}
            </label>
            <AutoGrowTextarea
              id="steroid-cream-name"
              value={productNameOrIngredients}
              onChange={setProductNameOrIngredients}
              placeholder={
                language === "ur"
                  ? "e.g., Dermovate, Golden Pearl, ya ingredients"
                  : "e.g., Clobetasol, Dermovate, Golden Pearl"
              }
            />
          </div>

          <div className="space-y-3 py-5">
            <label
              htmlFor="steroid-duration-reason"
              className="block text-sm font-semibold text-[#1E181A] dark:text-[#F7EFEF]"
            >
              {language === "ur"
                ? "Kitne time se use kar rahe hain?"
                : "How long have you used it?"}
            </label>
            <div className="flex flex-wrap gap-2">
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
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200 active:scale-95 ${
                      selected
                        ? "border-[#B56576] bg-[#B56576]/12 text-[#8F4556] dark:border-[#D48395] dark:bg-[#D48395]/20 dark:text-[#F0B2C0]"
                        : "border-transparent bg-[#FAF4F5] text-[#5E5055] hover:border-[#EAD6DB] hover:bg-[#F3E7EA]/70 hover:text-[#8F4556] dark:bg-[#171113] dark:text-[#C9B6BC] dark:hover:bg-[#2A1F23] dark:hover:text-[#D48395]"
                    }`}
                  >
                    + {chip}
                  </button>
                );
              })}
            </div>
            <AutoGrowTextarea
              id="steroid-duration-reason"
              value={durationAndReason}
              onChange={setDurationAndReason}
              placeholder="e.g., 4 months nightly for fairness or melasma"
            />
          </div>

          <div className="space-y-3 pt-5">
            <label
              htmlFor="steroid-side-effects"
              className="block text-sm font-semibold text-[#1E181A] dark:text-[#F7EFEF]"
            >
              {language === "ur"
                ? "Skin par kya asar dikha?"
                : "Any side effects noticed?"}
            </label>
            <div className="flex flex-wrap gap-2">
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
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200 active:scale-95 ${
                      selected
                        ? "border-[#B56576] bg-[#B56576]/12 text-[#8F4556] dark:border-[#D48395] dark:bg-[#D48395]/20 dark:text-[#F0B2C0]"
                        : "border-transparent bg-[#FAF4F5] text-[#5E5055] hover:border-[#EAD6DB] hover:bg-[#F3E7EA]/70 hover:text-[#8F4556] dark:bg-[#171113] dark:text-[#C9B6BC] dark:hover:bg-[#2A1F23] dark:hover:text-[#D48395]"
                    }`}
                  >
                    + {chip}
                  </button>
                );
              })}
            </div>
            <AutoGrowTextarea
              id="steroid-side-effects"
              value={sideEffectsNoticed}
              onChange={setSideEffectsNoticed}
              placeholder="e.g., red cheeks, visible veins, or dark rebound"
            />
          </div>
        </div>

        <button
          type="button"
          disabled={isChecking}
          aria-busy={isChecking}
          onClick={handleInspectCream}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#B56576] to-[#9E4E5F] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_28px_-6px_rgba(181,101,118,0.45)] transition-all duration-200 hover:brightness-105 active:scale-[0.99] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 dark:from-[#D48395] dark:to-[#B56576] dark:text-[#140F11]"
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
            <div className="min-w-0 overflow-x-hidden rounded-3xl border border-[#DFC6CE] bg-white p-6 shadow-[0_14px_34px_-12px_rgba(140,74,92,0.20)] dark:border-[#49323A] dark:bg-[#1E1619] dark:shadow-[0_16px_38px_-14px_rgba(0,0,0,0.52)] sm:p-8">
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

          <div className="min-w-0 overflow-x-hidden rounded-3xl border border-[#DFC6CE] bg-white p-6 shadow-[0_14px_34px_-12px_rgba(140,74,92,0.20)] dark:border-[#49323A] dark:bg-[#1E1619] dark:shadow-[0_16px_38px_-14px_rgba(0,0,0,0.52)] sm:p-8">
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
            <div className="min-w-0 overflow-x-hidden rounded-3xl border border-[#DFC6CE] bg-white p-6 shadow-[0_14px_34px_-12px_rgba(140,74,92,0.20)] dark:border-[#49323A] dark:bg-[#1E1619] dark:shadow-[0_16px_38px_-14px_rgba(0,0,0,0.52)] sm:p-8">
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
                      {item.verifiedAffiliateUrl ? (
                        <a
                          href={item.verifiedAffiliateUrl}
                          target="_blank"
                          rel="sponsored noopener noreferrer"
                          className="inline-flex min-h-[40px] max-w-full items-center justify-center gap-2 rounded-full border border-[#732839]/40 bg-gradient-to-b from-[#9E4358] to-[#7D2E40] px-5 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_-6px_rgba(125,46,64,0.48)] transition-all duration-200 hover:-translate-y-0.5 hover:from-[#8C374B] hover:to-[#692233] hover:shadow-[0_14px_28px_-6px_rgba(125,46,64,0.58)] active:scale-[0.98] dark:border-[#C76379]/40 dark:from-[#B5546A] dark:to-[#913B4F] dark:text-white dark:hover:from-[#C76379] dark:hover:to-[#A0455B]"
                        >
                          <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
                          <span>Buy at the best price here</span>
                          <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                        </a>
                      ) : item.buyUrl ? (
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

          <div className="min-w-0 overflow-x-hidden rounded-3xl border border-[#E8C5CA] bg-[#FDF4F5] p-6 text-xs leading-relaxed text-[#8C3B4A] shadow-[0_8px_24px_-12px_rgba(181,101,118,0.1)]">
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
            summaryText={`*DerméScan: Steroid Check*\nProduct: ${result.productDetectedName}\nVerdict: ${result.verdictBadge[language]}\n${result.summaryBullets[language].map((b) => `• ${b}`).join("\n")}`}
          />
        </div>
      )}
    </div>
  );
}
