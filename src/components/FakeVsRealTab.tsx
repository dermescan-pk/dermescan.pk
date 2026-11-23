import { useEffect, useMemo, useRef, useState } from "react";
import {
  ShieldCheck,
  Store,
  PackageCheck,
  AlertTriangle,
  CheckCircle2,
  Ban,
  Search,
  Sparkles,
  FlaskConical,
  Clock,
  Globe,
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
import {
  ApiKeyConfigError,
  RateLimitError,
  postApi,
} from "../utils/apiClient.ts";
import { getJenpharmAffiliateUrl } from "../data/jenpharmAffiliates.ts";
import { getAuthenticBuyUrl } from "../data/products.ts";
import type {
  Language,
  UploadedImage,
  VerifyProductResponse,
} from "../types/dermascan.ts";

const PACKAGING_SLOTS: AngleSlotConfig[] = [
  {
    slotId: "pack-front",
    slotLabel: "1. Front Label / Product Name",
    hint: "Brand name, typography & front packaging",
  },
  {
    slotId: "pack-batch",
    slotLabel: "2. Back Ingredients, Barcode & Batch",
    hint: "INCI ingredient list, stamped batch code & expiry",
  },
  {
    slotId: "pack-seal",
    slotLabel: "3. Cap, Nozzle or Seal Close-Up",
    hint: "Bottle finish, dropper or tamper seal",
  },
];

const USER_PROFILE_TYPES = [
  "Oily / Acne-Prone",
  "Dry / Sensitive",
  "Combination",
  "Melasma / Pigmentation",
  "Low-Porosity Hair",
  "High-Porosity Hair",
  "Dandruff Scalp",
] as const;

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
  const [userProfileType, setUserProfileType] = useState("");
  const [suspiciousSigns, setSuspiciousSigns] = useState("");
  const suspiciousSignsRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = suspiciousSignsRef.current;
    if (!el) return;
    el.style.height = "auto";
    if (suspiciousSigns) {
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [suspiciousSigns]);
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
          ? "Product ka naam, store URL, ya bottle ki photo mein se kam az kam ek cheez add karein."
          : "Please upload packaging photos or enter a product name or store link."
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
        userProfileType: userProfileType || undefined,
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

  const saferAltAffiliateUrl = result?.saferAlternative
    ? getJenpharmAffiliateUrl({
        brand: result.saferAlternative.brand,
        name: result.saferAlternative.name,
        productId: result.saferAlternative.productId,
      })
    : null;

  const saferAltBuyUrl = result?.saferAlternative
    ? getAuthenticBuyUrl(
        result.saferAlternative.brand,
        result.saferAlternative.name,
        result.saferAlternative.productId
      )
    : "";

  return (
    <div className="min-w-0 space-y-8">
      <TabHeaderIllustration variant="verify" language={language} />

      <div className="min-w-0 space-y-6 overflow-x-hidden rounded-3xl border border-[#EAD6DB] bg-gradient-to-b from-[#FFF9FA] via-white to-white p-6 shadow-[0_12px_36px_-14px_rgba(181,101,118,0.16)] transition-colors duration-300 dark:border-[#34262B] dark:from-[#23181C] dark:via-[#1C1417] dark:to-[#1C1417] dark:shadow-[0_14px_38px_-14px_rgba(0,0,0,0.45)] sm:p-8">
        <div className="divide-y divide-[#F0E4E7] dark:divide-[#2D2125]">
          <div className="grid grid-cols-1 gap-5 pb-5 md:grid-cols-2">
            <div className="min-w-0 space-y-2">
              <label
                htmlFor="verify-product-name"
                className="block text-sm font-semibold text-[#1E181A] dark:text-[#F7EFEF]"
              >
                {language === "ur" ? "Product ka naam" : "Product name"}
              </label>
              <input
                id="verify-product-name"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Or type product name / brand if label is blurry"
                className="w-full rounded-xl border border-[#EAD6DB] bg-[#FAF4F5] px-3.5 py-2.5 text-sm leading-relaxed text-[#1E181A] placeholder:text-[#7A686D]/75 transition-colors focus:border-[#B56576] focus:outline-none focus:ring-1 focus:ring-[#B56576]/30 dark:border-[#34262B] dark:bg-[#151012] dark:text-[#F7EFEF] dark:placeholder:text-[#9A848B] dark:focus:border-[#D48395]"
              />
            </div>

            <div className="min-w-0 space-y-2">
              <label
                htmlFor="verify-profile-type"
                className="block text-sm font-semibold text-[#1E181A] dark:text-[#F7EFEF]"
              >
                {language === "ur" ? "Skin ya hair type" : "Your skin or hair type"}
              </label>
              <select
                id="verify-profile-type"
                value={userProfileType}
                onChange={(e) => setUserProfileType(e.target.value)}
                className="w-full rounded-xl border border-[#EAD6DB] bg-[#FAF4F5] px-3.5 py-2.5 text-sm leading-relaxed text-[#1E181A] transition-colors focus:border-[#B56576] focus:outline-none focus:ring-1 focus:ring-[#B56576]/30 dark:border-[#34262B] dark:bg-[#151012] dark:text-[#F7EFEF] dark:focus:border-[#D48395]"
              >
                <option value="">
                  {language === "ur"
                    ? "Munasibat check karne ke liye chunein"
                    : "Select to check suitability"}
                </option>
                {USER_PROFILE_TYPES.map((typeOption) => (
                  <option key={typeOption} value={typeOption}>
                    {typeOption}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 py-5">
            <label
              htmlFor="verify-store-input"
              className="block text-sm font-semibold text-[#1E181A] dark:text-[#F7EFEF]"
            >
              {language === "ur" ? "Website ya store link" : "Store or website"}
            </label>
            <input
              id="verify-store-input"
              type="text"
              value={storeInput}
              onChange={(e) => setStoreInput(e.target.value)}
              placeholder="e.g., dvago.pk, naheed.pk, theordinary.com, or Instagram seller..."
              className="w-full rounded-xl border border-[#EAD6DB] bg-[#FAF4F5] px-3.5 py-2.5 text-sm leading-relaxed text-[#1E181A] placeholder:text-[#7A686D]/75 transition-colors focus:border-[#B56576] focus:outline-none focus:ring-1 focus:ring-[#B56576]/30 dark:border-[#34262B] dark:bg-[#151012] dark:text-[#F7EFEF] dark:placeholder:text-[#9A848B] dark:focus:border-[#D48395]"
            />
          </div>

          <div className="space-y-3 py-5">
            <label
              htmlFor="verify-suspicious-signs"
              className="block text-sm font-semibold text-[#1E181A] dark:text-[#F7EFEF]"
            >
              {language === "ur" ? "Shakk wali baatein" : "Anything look off?"}
            </label>
            <div className="flex flex-wrap gap-2">
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
            <textarea
              ref={suspiciousSignsRef}
              id="verify-suspicious-signs"
              rows={2}
              value={suspiciousSigns}
              onChange={(e) => setSuspiciousSigns(e.target.value)}
              placeholder="e.g., half price, odd smell, or missing batch code"
              className="w-full resize-none overflow-hidden rounded-xl border border-[#EAD6DB] bg-[#FAF4F5] px-3.5 py-2.5 text-sm leading-relaxed text-[#1E181A] placeholder:text-[#7A686D]/75 transition-colors duration-200 focus:border-[#B56576] focus:outline-none focus:ring-1 focus:ring-[#B56576]/30 dark:border-[#34262B] dark:bg-[#151012] dark:text-[#F7EFEF] dark:placeholder:text-[#9A848B] dark:focus:border-[#D48395]"
            />
          </div>

          <div className="pt-5">
            <h3 className="mb-4 font-editorial text-2xl font-semibold text-[#1E181A] dark:text-[#F7EFEF]">
              {language === "ur"
                ? "Packaging aur batch code photos"
                : "Packaging & batch photos"}
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
        </div>

        <button
          type="button"
          disabled={isVerifying}
          aria-busy={isVerifying}
          onClick={handleVerifyProduct}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#B56576] to-[#9E4E5F] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_28px_-6px_rgba(181,101,118,0.45)] transition-all duration-200 hover:brightness-105 active:scale-[0.99] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 dark:from-[#D48395] dark:to-[#B56576] dark:text-[#140F11]"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span>
            {isVerifying
              ? language === "ur"
                ? "Live Search Se Product Decode Ho Raha Hai..."
                : "Decoding Formula & Checking Authenticity..."
              : language === "ur"
                ? "Product Decode Aur Asli-Naqli Check Karein"
                : "Decode Product & Check Authenticity"}
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
              ? "Live search se product ke official ingredients, skin suitability aur bottle batch code ki jaanch ho rahi hai..."
              : "Searching official ingredient lists, skin/hair suitability, and packaging authenticity markers..."
          }
        />
      )}

      {result && (
        <div className="min-w-0 space-y-6">
          {/* Card 1: Product Identified & Authenticity Verdict */}
          <div className="min-w-0 overflow-x-hidden rounded-3xl border border-[#EAD8DC] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(181,101,118,0.12)] sm:p-8">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <PackageCheck className="h-5 w-5 shrink-0 text-[#B56576]" />
                  {result.isSearchGrounded && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#E6D2D6] bg-[#FAF6F7] px-2.5 py-0.5 text-[10px] font-semibold text-[#8C3B4A]">
                      <Globe className="h-3 w-3 text-[#B56576]" />
                      {language === "ur"
                        ? "Live Search Verified"
                        : "Verified via Live Google Search"}
                    </span>
                  )}
                </div>
                <h3 className="font-editorial break-words text-2xl font-semibold text-[#1E181A] sm:text-[26px]">
                  {result.identifiedBrand &&
                  !result.identifiedProductName
                    .toLowerCase()
                    .includes(result.identifiedBrand.toLowerCase())
                    ? `${result.identifiedBrand} ${result.identifiedProductName}`
                    : result.identifiedProductName}
                </h3>
              </div>

              <span
                className={`inline-block max-w-full self-start whitespace-normal break-words rounded-full px-3.5 py-1.5 text-xs font-bold ${
                  result.packagingVerdict === "likely_authentic"
                    ? "border border-[#C3DFCE] bg-[#EFF7F2] text-[#2D6A4F]"
                    : result.packagingVerdict === "suspicious_red_flags"
                      ? "border border-[#E8C5CA] bg-[#FDF4F5] text-[#8C3B4A]"
                      : "border border-[#EAD8DC] bg-[#F6ECEF] text-[#B56576]"
                }`}
              >
                {result.verdictBadge[language]}
              </span>
            </div>

            <ul className="mt-4 space-y-1.5 text-xs leading-relaxed text-[#5E5055]">
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
                    className="flex min-w-0 items-start gap-2.5 overflow-x-hidden rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7] p-4"
                  >
                    {chk.status === "pass" ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2D6A4F]" />
                    ) : chk.status === "fail" ? (
                      <Ban className="mt-0.5 h-4 w-4 shrink-0 text-[#8C3B4A]" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B56576]" />
                    )}
                    <div className="min-w-0">
                      <p className="break-words text-xs font-bold text-[#1E181A]">
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

            <div className="mt-5 rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7] p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E181A]">
                {language === "ur"
                  ? "Pakistan Mein Naqli Product Pehchanne Ke Tareeqay"
                  : "Batch Code & Fake-Spotting Markers in Pakistan"}
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
              {result.nextStepBullets[language].length > 0 && (
                <ul className="mt-4 space-y-1.5 border-t border-[#EAD8DC] pt-3 text-xs font-medium leading-relaxed text-[#1E181A]">
                  {result.nextStepBullets[language].map((step, i) => (
                    <li key={i} className="flex min-w-0 items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B56576]" />
                      <span className="min-w-0 break-words">{step}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {result.groundingSources && result.groundingSources.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#EAD8DC] pt-4">
                <span className="text-[11px] font-semibold text-[#5E5055]">
                  {language === "ur" ? "Search Sources:" : "Live Sources:"}
                </span>
                {result.groundingSources.map((src, i) => (
                  <a
                    key={i}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-full items-center gap-1 rounded-full border border-[#EAD8DC] bg-[#FAF6F7] px-2.5 py-1 text-[11px] font-medium text-[#8C3B4A] transition-colors hover:border-[#B56576] hover:text-[#B56576]"
                  >
                    <span className="max-w-[180px] truncate">{src.title}</span>
                    <ArrowUpRight className="h-3 w-3 shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Store & Seller Whitelist Card */}
          <div
            className={`min-w-0 overflow-x-hidden rounded-3xl border p-6 shadow-[0_8px_24px_-12px_rgba(181,101,118,0.1)] sm:p-7 ${
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
                <h3 className="font-editorial text-xl font-semibold text-[#1E181A]">
                  {language === "ur"
                    ? "Store Aur Seller Check"
                    : "Store & Seller Authenticity"}
                </h3>
              </div>

              <span
                className={`inline-block max-w-full self-start whitespace-normal break-words rounded-full px-3.5 py-1 text-xs font-bold ${
                  result.storeCheck.status === "verified"
                    ? "bg-white text-[#2D6A4F]"
                    : result.storeCheck.status === "unverified" ||
                        result.storeCheck.status === "potential_copycat"
                      ? "bg-white text-[#8C3B4A]"
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
              <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-2xl border border-[#E8C5CA] bg-white px-3.5 py-2 text-xs font-semibold text-[#8C3B4A]">
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

          {/* Card 2: What It Is Actually Best For & Profile Fit */}
          <div className="min-w-0 overflow-x-hidden rounded-3xl border border-[#EAD8DC] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(181,101,118,0.12)] sm:p-8">
            <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2.5">
                <Sparkles className="h-5 w-5 shrink-0 text-[#B56576]" />
                <h3 className="font-editorial text-2xl font-semibold text-[#1E181A]">
                  {language === "ur"
                    ? "Yeh Product Asal Mein Kis Cheez Ke Liye Best Hai"
                    : "What It Is Actually Best For"}
                </h3>
              </div>

              <span
                className={`inline-block max-w-full self-start whitespace-normal break-words rounded-full px-3.5 py-1 text-xs font-bold ${
                  result.profileMatchVerdict.status === "great_match"
                    ? "border border-[#C3DFCE] bg-[#EFF7F2] text-[#2D6A4F]"
                    : result.profileMatchVerdict.status === "not_recommended"
                      ? "border border-[#E8C5CA] bg-[#FDF4F5] text-[#8C3B4A]"
                      : result.profileMatchVerdict.status === "use_with_caution"
                        ? "border border-[#E8C5CA] bg-[#FDF4F5] text-[#B56576]"
                        : "border border-[#EAD8DC] bg-[#F6ECEF] text-[#8C3B4A]"
                }`}
              >
                {result.profileMatchVerdict.badge[language]}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-[#1E181A]">
              {result.bestForSummary[language]}
            </p>

            {result.bestForTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {result.bestForTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="rounded-full border border-[#EAD8DC] bg-[#FAF6F7] px-3 py-1 text-[11px] font-semibold text-[#8C3B4A]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7] p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#B56576]">
                {userProfileType
                  ? language === "ur"
                    ? `Aapki Profile (${userProfileType}) Ke Liye Verdict`
                    : `Suitability for ${userProfileType}`
                  : language === "ur"
                    ? "Suitability Summary"
                    : "Skin & Hair Profile Fit"}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-[#5E5055]">
                {result.profileMatchVerdict.explanation[language]}
              </p>
            </div>
          </div>

          {/* Card 3: Key Active Ingredients Decoded */}
          {result.keyActives.length > 0 && (
            <div className="min-w-0 overflow-x-hidden rounded-3xl border border-[#EAD8DC] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(181,101,118,0.12)] sm:p-8">
              <div className="mb-4 flex items-center gap-2.5">
                <FlaskConical className="h-5 w-5 shrink-0 text-[#B56576]" />
                <h3 className="font-editorial text-2xl font-semibold text-[#1E181A]">
                  {language === "ur"
                    ? "Key Active Ingredients Ki Asaan Tafseel"
                    : "Key Active Ingredients Decoded"}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {result.keyActives.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex min-w-0 flex-col justify-between gap-2 rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="break-words text-xs font-bold text-[#1E181A]">
                        {item.ingredient}
                      </h4>
                      <span className="rounded-full border border-[#EAD8DC] bg-white px-2.5 py-0.5 text-[10px] font-semibold text-[#B56576]">
                        {item.roleBadge[language]}
                      </span>
                    </div>
                    <p className="break-words text-xs leading-relaxed text-[#5E5055]">
                      {item.howItWorks[language]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card 4: Who Should Avoid It & Routine Clashes */}
          <div className="min-w-0 overflow-x-hidden rounded-3xl border border-[#E8C5CA] bg-[#FDF4F5] p-6 shadow-[0_8px_24px_-12px_rgba(181,101,118,0.12)] sm:p-8">
            <div className="mb-4 flex items-center gap-2.5">
              <AlertTriangle className="h-5 w-5 shrink-0 text-[#8C3B4A]" />
              <h3 className="font-editorial text-2xl font-semibold text-[#1E181A]">
                {language === "ur"
                  ? "Kin Logon Ko Avoid Karna Chahiye Aur Routine Clashes"
                  : "Who Should Avoid It & Routine Clashes"}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[#E8C5CA] bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#8C3B4A]">
                  {language === "ur" ? "Who Should Avoid" : "Who Should Avoid It"}
                </p>
                <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-[#5E5055]">
                  {result.whoShouldAvoid[language].map((warn, i) => (
                    <li key={i} className="flex min-w-0 items-start gap-2">
                      <Ban className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8C3B4A]" />
                      <span className="min-w-0 break-words">{warn}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-[#E8C5CA] bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#8C3B4A]">
                  {language === "ur"
                    ? "In Cheezon Ke Saath Na Lagayein"
                    : "Do Not Mix / Routine Clashes"}
                </p>
                <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-[#5E5055]">
                  {result.routineClashes[language].map((clash, i) => (
                    <li key={i} className="flex min-w-0 items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B56576]" />
                      <span className="min-w-0 break-words">{clash}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Card 5: How & When to Use (+ Safer Jenpharm Affiliate Pick if recommended) */}
          <div className="min-w-0 overflow-x-hidden rounded-3xl border border-[#EAD8DC] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(181,101,118,0.12)] sm:p-8">
            <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="h-5 w-5 shrink-0 text-[#B56576]" />
                <h3 className="font-editorial text-2xl font-semibold text-[#1E181A]">
                  {language === "ur"
                    ? "Kab Aur Kaise Istemal Karein"
                    : "How & When to Use"}
                </h3>
              </div>

              <span className="inline-block self-start rounded-full border border-[#EAD8DC] bg-[#F6ECEF] px-3.5 py-1 text-xs font-bold text-[#8C3B4A]">
                {result.howToUse.scheduleBadge[language]}
              </span>
            </div>

            {result.howToUse.steps.length > 0 && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {result.howToUse.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex min-w-0 flex-col gap-2 rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7] p-4"
                  >
                    <span className="inline-block self-start rounded-full border border-[#EAD8DC] bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8C3B4A]">
                      {step.timingBadge[language]}
                    </span>
                    <p className="break-words text-xs leading-relaxed text-[#1E181A]">
                      {step.instruction[language]}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {result.saferAlternative && (
              <div className="mt-5 rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7] p-5">
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#B56576]">
                      {language === "ur"
                        ? "Safer / Behtar Pharmacy Alternative"
                        : "Recommended Safer Match"}
                    </p>
                    <h4 className="font-editorial break-words text-xl font-semibold text-[#1E181A]">
                      {result.saferAlternative.brand}{" "}
                      {result.saferAlternative.name}
                    </h4>
                    <p className="text-xs text-[#5E5055]">
                      {result.saferAlternative.subCategory} ·{" "}
                      {result.saferAlternative.approxPricePkr}
                    </p>
                  </div>

                  {saferAltAffiliateUrl ? (
                    <a
                      href={saferAltAffiliateUrl}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      className="inline-flex min-h-[40px] shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#BF6E7F] to-[#B56576] px-5 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_-6px_rgba(181,101,118,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#B56576] hover:to-[#9E5263] active:scale-95 dark:from-[#D48395] dark:to-[#D48395] dark:text-[#161012] dark:hover:from-[#B56576] dark:hover:to-[#B56576] dark:hover:text-[#F7EFEF]"
                    >
                      Buy at the best price here →
                    </a>
                  ) : saferAltBuyUrl ? (
                    <a
                      href={saferAltBuyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-1.5 rounded-full border border-[#E6D2D6] bg-white px-4 py-2 text-xs font-semibold text-[#1E181A] transition-all hover:border-[#B56576] hover:text-[#B56576]"
                    >
                      <span>
                        {language === "ur"
                          ? "Asli Online Khareedein"
                          : "Buy Original Online"}
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  ) : null}
                </div>

                {result.saferAlternative.bullets?.[language]?.length > 0 && (
                  <ul className="mt-3 space-y-1 text-xs leading-relaxed text-[#5E5055]">
                    {result.saferAlternative.bullets[language].map((b, i) => (
                      <li key={i} className="flex min-w-0 items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B56576]" />
                        <span className="min-w-0 break-words">{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
