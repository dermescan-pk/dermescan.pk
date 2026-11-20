import { useMemo, useRef, useState } from "react";
import {
  ShieldCheck,
  Store,
  PackageCheck,
  AlertTriangle,
  CheckCircle2,
  Ban,
  Search,
} from "lucide-react";
import {
  MultiAngleUploader,
  type AngleSlotConfig,
} from "./MultiAngleUploader.tsx";
import { ScanningLoader } from "./ScanningLoader.tsx";
import { TabHeaderIllustration } from "./TabHeaderIllustration.tsx";
import { ApiKeyAlertCard } from "./ApiKeyAlertCard.tsx";
import { RateLimitNoticeCard } from "./RateLimitNoticeCard.tsx";
import {
  ApiKeyConfigError,
  RateLimitError,
  postApi,
} from "../utils/apiClient.ts";
import type {
  Language,
  UploadedImage,
  VerifyProductResponse,
} from "../types/dermascan.ts";

const PACKAGING_SLOTS: AngleSlotConfig[] = [
  {
    slotId: "pack-front",
    slotLabel: "1. Front Label / Typography",
    hint: "Logo, font spacing & spelling clarity",
  },
  {
    slotId: "pack-batch",
    slotLabel: "2. Back Barcode & Batch Code",
    hint: "Stamped/engraved batch code, expiry & INCI",
  },
  {
    slotId: "pack-seal",
    slotLabel: "3. Cap, Nozzle or Seal Close-Up",
    hint: "Bottle finish, dropper or tamper seal",
  },
];

const SUSPICIOUS_SIGNS_CHIPS = [
  "Too-Cheap Price",
  "Weird Smell/Texture",
  "Missing Batch Code",
  "Blurry Printing / Typos",
  "Broken Seal",
] as const;

function appendVerifyChip(prev: string, chip: string): string {
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

interface FakeVsRealTabProps {
  language: Language;
}

export function FakeVsRealTab({ language }: FakeVsRealTabProps) {
  const [storeInput, setStoreInput] = useState("");
  const [productName, setProductName] = useState("");
  const [suspiciousSigns, setSuspiciousSigns] = useState("");
  const [imagesBySlot, setImagesBySlot] = useState<Record<string, UploadedImage>>(
    {}
  );

  const [isVerifying, setIsVerifying] = useState(false);
  const isSubmittingRef = useRef(false);
  const [result, setResult] = useState<VerifyProductResponse | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [rateLimitNotice, setRateLimitNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const uploadedList = useMemo(
    () =>
      PACKAGING_SLOTS.map((s) => imagesBySlot[s.slotId]).filter(
        (img): img is UploadedImage => Boolean(img)
      ),
    [imagesBySlot]
  );

  async function handleVerifyProduct() {
    if (isSubmittingRef.current) return;

    setApiKeyError(null);
    setRateLimitNotice(null);
    setErrorMsg(null);

    if (
      !storeInput.trim() &&
      !productName.trim() &&
      uploadedList.length === 0
    ) {
      setErrorMsg(
        language === "ur"
          ? "Store URL/naam, product ka naam, ya packaging photo mein se kuch add karein."
          : "Please enter a store URL/name, product name, or upload packaging photos."
      );
      return;
    }

    isSubmittingRef.current = true;
    setIsVerifying(true);
    setResult(null);

    try {
      const data = await postApi<VerifyProductResponse>("/api/verify-product", {
        storeInput,
        websiteOrSeller: storeInput,
        productName,
        suspiciousSigns: suspiciousSigns.trim(),
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
        err instanceof Error ? err.message : "Product verification failed."
      );
    } finally {
      isSubmittingRef.current = false;
      setIsVerifying(false);
    }
  }

  return (
    <div className="min-w-0 space-y-6">
      <TabHeaderIllustration variant="verify" language={language} />

      <div className="min-w-0 space-y-6 overflow-x-hidden rounded-3xl border border-[#EAD8DC] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(181,101,118,0.12)] sm:p-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="min-w-0 space-y-1.5">
            <label
              htmlFor="verify-product-name"
              className="block text-xs font-bold text-[#1E181A]"
            >
              {language === "ur"
                ? "1. Brand Aur Product Ka Naam"
                : "1. Brand & Product Name"}
            </label>
            <input
              id="verify-product-name"
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g., The Ordinary Niacinamide 10%, CeraVe Cleanser"
              className="w-full rounded-2xl border border-[#E6D2D6] bg-white/95 px-4 py-3 text-xs leading-relaxed text-[#1E181A] placeholder:text-[#5E5055]/60 transition-all focus:border-[#B56576] focus:ring-2 focus:ring-[#B56576]/15 focus:outline-none"
            />
          </div>

          <div className="min-w-0 space-y-1.5">
            <label
              htmlFor="verify-store-input"
              className="block text-xs font-bold text-[#1E181A]"
            >
              {language === "ur"
                ? "2. Website / Seller Link Ya Store Ka Naam"
                : "2. Website / Seller Link or Store Name"}
            </label>
            <input
              id="verify-store-input"
              type="text"
              value={storeInput}
              onChange={(e) => setStoreInput(e.target.value)}
              placeholder="e.g., theordinary.com, urapra.com, dvago.pk, Instagram page..."
              className="w-full rounded-2xl border border-[#E6D2D6] bg-white/95 px-4 py-3 text-xs leading-relaxed text-[#1E181A] placeholder:text-[#5E5055]/60 transition-all focus:border-[#B56576] focus:ring-2 focus:ring-[#B56576]/15 focus:outline-none"
            />
          </div>

          <div className="flex min-w-0 flex-col justify-between space-y-2.5 rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7]/65 p-4 md:col-span-2">
            <div className="space-y-2">
              <label
                htmlFor="verify-suspicious-signs"
                className="block text-xs font-bold text-[#1E181A]"
              >
                {language === "ur"
                  ? "3. Shakk Wali Baatein (Suspicious Signs)"
                  : "3. Suspicious Signs (Kya ajeeb ya fake laga?)"}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SUSPICIOUS_SIGNS_CHIPS.map((chip) => {
                  const selected = suspiciousSigns
                    .toLowerCase()
                    .split(/[,;\n]+/)
                    .map((s) => s.trim())
                    .includes(chip.toLowerCase());
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() =>
                        setSuspiciousSigns((prev) => appendVerifyChip(prev, chip))
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
              id="verify-suspicious-signs"
              rows={2}
              value={suspiciousSigns}
              onChange={(e) => setSuspiciousSigns(e.target.value)}
              placeholder="e.g. Price market se aadhi hai, smell ajeeb/tezi wali hai, ya bottom par batch code nahi hai..."
              className="w-full rounded-2xl border border-[#E6D2D6] bg-white/95 px-3.5 py-2.5 text-xs leading-relaxed text-[#1E181A] placeholder:text-[#5E5055]/60 transition-all focus:border-[#B56576] focus:ring-2 focus:ring-[#B56576]/15 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-bold text-[#1E181A]">
            {language === "ur"
              ? "4. Bottle / Box Aur Batch Code Photos (Optional)"
              : "4. Bottle, Box & Batch Code Photos (Optional)"}
          </h3>
          <MultiAngleUploader
            slots={PACKAGING_SLOTS}
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

        <button
          type="button"
          disabled={isVerifying}
          aria-busy={isVerifying}
          onClick={handleVerifyProduct}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#BF6E7F] to-[#B56576] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(181,101,118,0.55)] transition-all hover:-translate-y-0.5 hover:from-[#B56576] hover:to-[#9E5263] active:scale-95 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span>
            {isVerifying
              ? language === "ur"
                ? "Store Aur Photos Check Ho Rahi Hain..."
                : "Checking Store & Photos..."
              : language === "ur"
                ? "Store Aur Asli-Naqli Check Karein"
                : "Check Store & Product"}
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

      {isVerifying && (
        <ScanningLoader
          language={language}
          customLabel={
            language === "ur"
              ? "Store ki trust list aur bottle ki printing / batch code check ho raha hai..."
              : "Checking store trust list and looking at bottle printing & batch codes..."
          }
        />
      )}

      {result && (
        <div className="min-w-0 space-y-6">
          <div
            className={`min-w-0 overflow-x-hidden rounded-3xl border p-6 shadow-[0_8px_24px_-12px_rgba(181,101,118,0.1)] sm:p-8 ${
              result.storeCheck.status === "verified"
                ? "border-[#C3DFCE] bg-[#EFF7F2]"
                : result.storeCheck.status === "unverified" ||
                    result.storeCheck.status === "potential_copycat"
                  ? "border-[#E8C5CA] bg-[#FDF4F5]"
                  : "border-[#EAD8DC] bg-white"
            }`}
          >
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2.5">
                <Store
                  className={`h-5 w-5 shrink-0 ${
                    result.storeCheck.status === "verified"
                      ? "text-[#2D6A4F]"
                      : result.storeCheck.status === "unverified" ||
                          result.storeCheck.status === "potential_copycat"
                        ? "text-[#8C3B4A]"
                        : "text-[#B56576]"
                  }`}
                />
                <h3 className="font-editorial text-2xl font-semibold text-[#1E181A]">
                  {language === "ur"
                    ? "Store Aur Brand Check Result"
                    : "Store & Brand Check"}
                </h3>
              </div>

              <span
                className={`inline-block max-w-full self-start whitespace-normal break-words rounded-full px-3.5 py-1 text-xs font-bold ${
                  result.storeCheck.status === "verified"
                    ? "bg-white/95 text-[#2D6A4F]"
                    : result.storeCheck.status === "unverified" ||
                        result.storeCheck.status === "potential_copycat"
                      ? "bg-white/95 text-[#8C3B4A]"
                      : "bg-[#F6ECEF] text-[#B56576]"
                }`}
              >
                {result.storeCheck.badgeText[language]}
              </span>
            </div>

            <p className="mt-3 break-words text-xs leading-relaxed text-[#1E181A]">
              {result.storeCheck.explanation[language]}
            </p>

            {result.storeCheck.officialDomainSuggestion && (
              <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-2xl border border-[#E8C5CA] bg-white/90 px-3.5 py-2 text-xs font-semibold text-[#8C3B4A]">
                <span>
                  {language === "ur"
                    ? "Asli Official Website:"
                    : "Exact Official Website:"}
                </span>
                <span className="font-bold underline">
                  {result.storeCheck.officialDomainSuggestion}
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 overflow-x-hidden rounded-3xl border border-[#EAD8DC] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(181,101,118,0.12)] sm:p-8">
            <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2.5">
                <PackageCheck className="h-5 w-5 shrink-0 text-[#B56576]" />
                <h3 className="font-editorial text-2xl font-semibold text-[#1E181A]">
                  {language === "ur"
                    ? "Bottle Aur Label Check"
                    : "Packaging & Label Check"}
                </h3>
              </div>

              <span
                className={`inline-block max-w-full self-start whitespace-normal break-words rounded-full px-3.5 py-1 text-xs font-bold ${
                  result.packagingVerdict === "likely_authentic"
                    ? "bg-[#EFF7F2] text-[#2D6A4F]"
                    : result.packagingVerdict === "suspicious_red_flags"
                      ? "bg-[#FDF4F5] text-[#8C3B4A]"
                      : "bg-[#F6ECEF] text-[#B56576]"
                }`}
              >
                {result.verdictBadge[language]}
              </span>
            </div>

            <ul className="space-y-1.5 text-xs leading-relaxed text-[#5E5055]">
              {result.summaryBullets[language].map((b, i) => (
                <li key={i} className="flex min-w-0 items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B56576]" />
                  <span className="min-w-0 break-words">{b}</span>
                </li>
              ))}
            </ul>

            {result.packagingChecks.length > 0 && (
              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                {result.packagingChecks.map((chk, idx) => (
                  <div
                    key={idx}
                    className="flex min-w-0 items-start gap-2.5 overflow-x-hidden rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7]/75 p-4"
                  >
                    {chk.status === "pass" ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2D6A4F]" />
                    ) : chk.status === "fail" ? (
                      <Ban className="mt-0.5 h-4 w-4 shrink-0 text-[#8C3B4A]" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B56576]" />
                    )}
                    <div className="min-w-0">
                      <p className="break-words font-heading text-xs font-bold text-[#1E181A]">
                        {chk.checkName[language]}
                      </p>
                      <p className="mt-1 break-words text-xs leading-relaxed text-[#5E5055]">
                        {chk.detail[language]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7]/75 p-5">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[#1E181A]">
                {language === "ur"
                  ? "Pakistan Mein Naqli Product Pehchanne Ke Tareeqay"
                  : "How to Spot Fakes in Pakistan"}
              </h4>
              <ul className="mt-3 space-y-2 leading-relaxed">
                {result.pakistanCounterfeitTips[language].map((tip, i) => (
                  <li
                    key={i}
                    className="flex min-w-0 items-start gap-2 text-xs text-[#5E5055]"
                  >
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B56576]" />
                    <span className="min-w-0 break-words">{tip}</span>
                  </li>
                ))}
              </ul>
              <ul className="mt-4 space-y-1.5 border-t border-[#EAD8DC] pt-3 text-xs font-medium leading-relaxed text-[#1E181A]">
                {result.nextStepBullets[language].map((step, i) => (
                  <li key={i} className="flex min-w-0 items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B56576]" />
                    <span className="min-w-0 break-words">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
