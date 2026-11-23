import { useEffect, useMemo, useRef, useState } from "react";
import { Scissors, AlertTriangle, RefreshCw } from "lucide-react";
import { TabHeaderIllustration } from "./TabHeaderIllustration.tsx";
import { PhotoGuideBanner } from "./PhotoGuideBanner.tsx";
import {
  MultiAngleUploader,
  type AngleSlotConfig,
} from "./MultiAngleUploader.tsx";
import { ScanningLoader } from "./ScanningLoader.tsx";
import { BentoPrescriptionResult } from "./BentoPrescriptionResult.tsx";
import { ApiKeyAlertCard } from "./ApiKeyAlertCard.tsx";
import { RateLimitNoticeCard } from "./RateLimitNoticeCard.tsx";
import {
  ApiKeyConfigError,
  RateLimitError,
  postApi,
} from "../utils/apiClient.ts";
import type {
  BentoPrescriptionResponse,
  HealthProfile,
  Language,
  UploadedImage,
} from "../types/dermascan.ts";

const HAIR_SLOTS: AngleSlotConfig[] = [
  {
    slotId: "hair-crown",
    slotLabel: "1. Top Crown / Scalp Parting",
    hint: "Flakes, oiliness, redness & hair thickness",
  },
  {
    slotId: "hair-temple",
    slotLabel: "2. Temple / Front Hairline",
    hint: "Front hairline thinning, redness or dryness",
  },
  {
    slotId: "hair-mid",
    slotLabel: "3. Mid-Lengths / Hair Body",
    hint: "Frizz, dryness, heat damage & rough feel",
  },
  {
    slotId: "hair-ends",
    slotLabel: "4. Hair Ends Close-Up",
    hint: "Split ends, dry tips & breakage",
  },
];

function SegmentedSelector({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="min-w-0 space-y-2.5">
      <label className="block text-sm font-semibold text-[#1E181A] dark:text-[#F7EFEF]">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`min-h-[36px] rounded-full border px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors duration-200 active:scale-95 ${
                active
                  ? "border-[#B56576] bg-[#B56576]/12 text-[#8F4556] dark:border-[#D48395] dark:bg-[#D48395]/20 dark:text-[#F0B2C0]"
                  : "border-transparent bg-[#FAF4F5] text-[#5E5055] hover:border-[#EAD6DB] hover:bg-[#F3E7EA]/70 hover:text-[#1E181A] dark:bg-[#171113] dark:text-[#C9B6BC] dark:hover:bg-[#2A1F23] dark:hover:text-[#F7EFEF]"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const HAIR_SYMPTOM_CHIPS = [
  "Hair Fall",
  "Itchy Dandruff",
  "Thinning Part",
  "Bald Patch",
] as const;

const SCALP_TEXTURE_CHIPS = [
  "Oily/Itchy",
  "Dry Powdery Flakes",
  "Yellow Sticky Scales",
  "Scalp Pimples",
] as const;

const HAIR_WATER_CLIMATE_CHIPS = [
  "Hard/Bore Water",
  "Humid",
  "Dry Winter",
  "Heavy Sweating",
] as const;

const HAIR_ROUTINE_CHIPS = [
  "Regular Scalp Oiling",
  "Anti-Dandruff Shampoo",
  "Keratin / Color Treated",
  "Using Nothing Special",
] as const;

const HAIR_FAMILY_CHIPS = [
  "Pattern Thinning",
  "Thyroid Issue",
  "PCOS / Hormonal",
  "Recent Illness / Stress",
  "None",
] as const;

function appendHairChip(prev: string, chip: string): string {
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

function HairStructuredRow({
  id,
  label,
  chips,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  chips: readonly string[];
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
    <div className="min-w-0 space-y-3 py-5 first:pt-0 last:pb-0">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-[#1E181A] dark:text-[#F7EFEF]"
      >
        {label}
      </label>

      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => {
          const isSelected = value
            .toLowerCase()
            .split(/[,;\n]+/)
            .map((s) => s.trim())
            .includes(chip.toLowerCase());
          return (
            <button
              key={chip}
              type="button"
              onClick={() => onChange(appendHairChip(value, chip))}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200 active:scale-95 ${
                isSelected
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
        ref={textareaRef}
        id={id}
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full resize-none overflow-hidden rounded-xl border border-[#EAD6DB] bg-[#FAF4F5] px-3.5 py-2.5 text-sm leading-relaxed text-[#1E181A] placeholder:text-[#7A686D]/75 transition-colors duration-200 focus:border-[#B56576] focus:outline-none focus:ring-1 focus:ring-[#B56576]/30 dark:border-[#34262B] dark:bg-[#151012] dark:text-[#F7EFEF] dark:placeholder:text-[#9A848B] dark:focus:border-[#D48395]"
      />
    </div>
  );
}

interface HairStudioTabProps {
  language: Language;
  healthProfile: HealthProfile;
}

export function HairStudioTab({ language, healthProfile }: HairStudioTabProps) {
  const [imagesBySlot, setImagesBySlot] = useState<Record<string, UploadedImage>>(
    {}
  );
  const [hairPorosity, setHairPorosity] = useState("Not Sure");
  const [hairStrandType, setHairStrandType] = useState("Wavy");
  const [waterSupply, setWaterSupply] = useState("Hard / Bore Water");
  const [budget, setBudget] = useState("Budget Friendly");

  const [symptomsAndDuration, setSymptomsAndDuration] = useState("");
  const [scalpFeelAndFlakes, setScalpFeelAndFlakes] = useState("");
  const [waterAndClimate, setWaterAndClimate] = useState("");
  const [currentRoutineAndHistory, setCurrentRoutineAndHistory] = useState("");
  const [familyHistory, setFamilyHistory] = useState("");

  const [isScanning, setIsScanning] = useState(false);
  const isSubmittingRef = useRef(false);
  const [result, setResult] = useState<BentoPrescriptionResponse | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [rateLimitNotice, setRateLimitNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const uploadedList = useMemo(
    () =>
      HAIR_SLOTS.map((s) => imagesBySlot[s.slotId]).filter(
        (img): img is UploadedImage => Boolean(img)
      ),
    [imagesBySlot]
  );

  async function handleRunHairScan() {
    if (isSubmittingRef.current) return;

    setApiKeyError(null);
    setRateLimitNotice(null);
    setErrorMsg(null);

    if (uploadedList.length === 0) {
      setErrorMsg(
        language === "ur"
          ? "Check karne ke liye kam az kam 1 baal ya sar ki photo add karein."
          : "Please add at least 1 hair or scalp photo first."
      );
      return;
    }

    isSubmittingRef.current = true;
    setIsScanning(true);
    setResult(null);

    const structuredInputs = {
      symptomsAndDuration: symptomsAndDuration.trim(),
      scalpFeelAndFlakes: scalpFeelAndFlakes.trim(),
      waterAndClimate: waterAndClimate.trim(),
      currentRoutineAndHistory: currentRoutineAndHistory.trim(),
      familyHistory: familyHistory.trim(),
    };

    const symptomsSummary = [
      structuredInputs.symptomsAndDuration &&
        `Symptoms & Duration: ${structuredInputs.symptomsAndDuration}`,
      structuredInputs.scalpFeelAndFlakes &&
        `Scalp Feel & Flakes: ${structuredInputs.scalpFeelAndFlakes}`,
      structuredInputs.waterAndClimate &&
        `Water & Climate: ${structuredInputs.waterAndClimate}`,
      structuredInputs.familyHistory &&
        `Family History: ${structuredInputs.familyHistory}`,
    ]
      .filter(Boolean)
      .join(" | ");

    const routineClean = structuredInputs.currentRoutineAndHistory;

    try {
      const data = await postApi<BentoPrescriptionResponse>("/api/analyze-hair", {
        userPersonalNote: [symptomsSummary, routineClean]
          .filter(Boolean)
          .join(" | "),
        healthProfile,
        structuredInputs,
        context: {
          hairPorosity,
          hairStrandType,
          waterSupply,
          budget,
          specificSymptoms: symptomsSummary,
          currentRoutine: routineClean,
        },
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
        err instanceof Error ? err.message : "Something went wrong during scan."
      );
    } finally {
      isSubmittingRef.current = false;
      setIsScanning(false);
    }
  }

  return (
    <div className="min-w-0 space-y-8">
      <TabHeaderIllustration variant="hair" language={language} />

      <div className="min-w-0 overflow-x-hidden rounded-3xl border border-[#DFC6CE] bg-white p-6 shadow-[0_14px_34px_-12px_rgba(140,74,92,0.20)] transition-colors duration-300 dark:border-[#49323A] dark:bg-[#1E1619] dark:shadow-[0_16px_38px_-14px_rgba(0,0,0,0.52)] sm:p-8">
        <div className="mb-5 flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-baseline gap-2.5">
                <span className="font-editorial text-xl font-semibold italic text-[#B56576] dark:text-[#D48395]">
                  01
                </span>
                <h3 className="font-editorial text-2xl font-semibold text-[#1E181A] dark:text-[#F7EFEF]">
                  {language === "ur" ? "Photos Add Karein" : "Add Photos"}
                </h3>
              </div>
              <PhotoGuideBanner language={language} />
            </div>
            <p className="text-xs leading-relaxed text-[#7A686D] dark:text-[#C9B6BC]">
              {language === "ur"
                ? "Sar, hairline aur baalon ki 1 se 4 saaf photos add karein."
                : "Upload 1 to 4 clear photos of your scalp, hairline, and ends."}
            </p>
          </div>
          <span className="shrink-0 pt-1 text-xs font-semibold tabular-nums text-[#B56576] dark:text-[#D48395]">
            {uploadedList.length} / 4
          </span>
        </div>

        <MultiAngleUploader
          slots={HAIR_SLOTS}
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
          highlightSlots={
            result && !result.isValidPhoto ? result.retakeSlots : []
          }
          language={language}
        />
      </div>

      <div className="min-w-0 space-y-6 overflow-x-hidden rounded-3xl border border-[#DFC6CE] bg-white p-6 shadow-[0_14px_34px_-12px_rgba(140,74,92,0.20)] transition-colors duration-300 dark:border-[#49323A] dark:bg-[#1E1619] dark:shadow-[0_16px_38px_-14px_rgba(0,0,0,0.52)] sm:p-8">
        <div className="flex items-baseline gap-2.5">
          <span className="font-editorial text-xl font-semibold italic text-[#B56576] dark:text-[#D48395]">
            02
          </span>
          <h3 className="font-editorial text-2xl font-semibold text-[#1E181A] dark:text-[#F7EFEF]">
            {language === "ur" ? "Baal Aur Paani" : "Hair & Water Details"}
          </h3>
        </div>

        <div className="divide-y divide-[#F0E4E7] dark:divide-[#2D2125]">
          <div className="grid grid-cols-1 gap-6 pb-5 sm:grid-cols-2">
            <SegmentedSelector
              label={language === "ur" ? "Baal Ki Porosity" : "Hair Porosity"}
              options={[
                "Low Porosity",
                "Medium Porosity",
                "High Porosity",
                "Not Sure",
              ]}
              value={hairPorosity}
              onChange={setHairPorosity}
            />

            <SegmentedSelector
              label={language === "ur" ? "Hair Type" : "Hair Strand Type"}
              options={["Straight", "Wavy", "Curly / Coily", "Chemically Treated"]}
              value={hairStrandType}
              onChange={setHairStrandType}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 py-5 sm:grid-cols-2">
            <SegmentedSelector
              label={language === "ur" ? "Ghar Ka Paani" : "Water Supply"}
              options={["Normal / Filtered Water", "Hard / Bore Water"]}
              value={waterSupply}
              onChange={setWaterSupply}
            />

            <SegmentedSelector
              label="Budget"
              options={["Budget Friendly", "Standard"]}
              value={budget}
              onChange={setBudget}
            />
          </div>

          <HairStructuredRow
            id="hair-box-symptoms"
            label="How long & what's happening?"
            chips={HAIR_SYMPTOM_CHIPS}
            value={symptomsAndDuration}
            onChange={setSymptomsAndDuration}
            placeholder="e.g., 4 months hair fall or hairline thinning"
          />

          <HairStructuredRow
            id="hair-box-scalp"
            label="Scalp feel & flakes"
            chips={SCALP_TEXTURE_CHIPS}
            value={scalpFeelAndFlakes}
            onChange={setScalpFeelAndFlakes}
            placeholder="e.g., oily itchy scalp or yellow flakes"
          />

          <HairStructuredRow
            id="hair-box-water"
            label="What makes it worse?"
            chips={HAIR_WATER_CLIMATE_CHIPS}
            value={waterAndClimate}
            onChange={setWaterAndClimate}
            placeholder="e.g., bore water or humid scalp sweat"
          />

          <HairStructuredRow
            id="hair-box-routine"
            label="Products you're using"
            chips={HAIR_ROUTINE_CHIPS}
            value={currentRoutineAndHistory}
            onChange={setCurrentRoutineAndHistory}
            placeholder="e.g., coconut oil twice a week + shampoo"
          />

          <HairStructuredRow
            id="hair-box-family"
            label="Anything else?"
            chips={HAIR_FAMILY_CHIPS}
            value={familyHistory}
            onChange={setFamilyHistory}
            placeholder="e.g., pattern thinning, PCOS, or recent fever"
          />
        </div>

        <button
          type="button"
          disabled={isScanning}
          aria-busy={isScanning}
          onClick={handleRunHairScan}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#B56576] to-[#9E4E5F] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_28px_-6px_rgba(181,101,118,0.45)] transition-all duration-200 hover:brightness-105 active:scale-[0.99] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 dark:from-[#D48395] dark:to-[#B56576] dark:text-[#140F11]"
        >
          <Scissors className="h-4 w-4 shrink-0" />
          <span>
            {isScanning
              ? language === "ur"
                ? "Baal Aur Sar Check Ho Raha Hai..."
                : "Checking Your Hair & Scalp..."
              : language === "ur"
                ? "Mere Baal Aur Sar Check Karein"
                : `Check My Hair & Scalp (${uploadedList.length} ${
                    uploadedList.length === 1 ? "Photo" : "Photos"
                  })`}
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

      {isScanning && (
        <ScanningLoader
          language={language}
          scanMode="hair"
          customLabel={
            language === "ur"
              ? "Sar ki jild, hairline, beech ke baal aur ends saaf roshni mein check ho rahe hain..."
              : "Looking at your scalp, hairline, hair body, and ends in clear light..."
          }
        />
      )}

      {result && !result.isValidPhoto && (
        <div className="min-w-0 overflow-x-hidden rounded-3xl border border-[#E8C5CA] bg-[#FDF4F5] p-6">
          <div className="flex min-w-0 items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#8C3B4A]" />
            <div className="min-w-0 space-y-2">
              <h3 className="font-editorial text-lg font-semibold text-[#8C3B4A]">
                {language === "ur"
                  ? "Baal Ki Photo Dubara Lein"
                  : "Please Retake Hair Photo"}
              </h3>
              <p className="break-words text-xs leading-relaxed text-[#8C3B4A]">
                {result.retakeMessage[language]}
              </p>
              <button
                type="button"
                onClick={() => setResult(null)}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-[#E8C5CA] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#8C3B4A] active:scale-95"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {language === "ur" ? "Photos Badlein" : "Change Photos"}
              </button>
            </div>
          </div>
        </div>
      )}

      {result && result.isValidPhoto && (
        <BentoPrescriptionResult
          data={result}
          language={language}
          scanTitle="Hair Studio Scan"
        />
      )}
    </div>
  );
}
