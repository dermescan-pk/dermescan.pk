import { useMemo, useRef, useState } from "react";
import { Scissors, AlertTriangle, RefreshCw } from "lucide-react";
import { PhotoGuideBanner } from "./PhotoGuideBanner.tsx";
import { TabHeaderIllustration } from "./TabHeaderIllustration.tsx";
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
    <div className="min-w-0 space-y-2">
      <label className="block text-xs font-bold text-[#1E181A]">
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
              className={`min-h-[38px] rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                active
                  ? "bg-gradient-to-b from-[#BF6E7F] to-[#B56576] text-white shadow-[0_6px_16px_-4px_rgba(181,101,118,0.45)]"
                  : "border border-[#E6D2D6] bg-[#FAF6F7]/80 text-[#5E5055] hover:border-[#B56576]/40 hover:bg-[#F6ECEF]"
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

function HairStructuredBox({
  id,
  label,
  instruction,
  chips,
  value,
  onChange,
  placeholder,
  fullWidth = false,
}: {
  id: string;
  label: string;
  instruction: string;
  chips: readonly string[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 flex-col justify-between space-y-2.5 rounded-2xl border border-[#E6D2D6] bg-[#FAF6F7]/65 p-4 ${
        fullWidth ? "md:col-span-2" : ""
      }`}
    >
      <div className="space-y-2">
        <div className="space-y-0.5">
          <label htmlFor={id} className="block text-xs font-bold text-[#1E181A]">
            {label}
          </label>
          <p className="text-[11px] leading-relaxed text-[#5E5055]">{instruction}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
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
                className={`min-h-[30px] rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all active:scale-95 ${
                  isSelected
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
        id={id}
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#E6D2D6] bg-white/95 px-3.5 py-2.5 text-xs leading-relaxed text-[#1E181A] placeholder:text-[#5E5055]/60 transition-all focus:border-[#B56576] focus:ring-2 focus:ring-[#B56576]/15 focus:outline-none"
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
    <div className="min-w-0 space-y-6">
      <TabHeaderIllustration variant="hair" language={language} />

      <PhotoGuideBanner language={language} />

      <div className="min-w-0 overflow-x-hidden rounded-3xl border border-[#EAD8DC] bg-white/85 p-6 shadow-[0_14px_40px_-15px_rgba(181,101,118,0.14)] backdrop-blur-md sm:p-8">
        <div className="mb-4 flex min-w-0 items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-editorial text-2xl font-semibold text-[#1E181A]">
              {language === "ur"
                ? "Step 1: Sar, Hairline Aur Baalon Ki Photos Add Karein"
                : "Step 1: Add Hair & Scalp Photos"}
            </h2>
            <p className="text-xs leading-relaxed text-[#5E5055]">
              {language === "ur"
                ? "1 se 4 photos add karein taake sar, baal aur neeche ke hissay alag check hon."
                : "Add 1 to 4 photos so we can check your scalp, hair body, and ends separately."}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-[#EAD8DC] bg-[#FAF6F7] px-3 py-1 text-xs font-bold tabular-nums text-[#B56576]">
            {uploadedList.length}/4
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

      <div className="min-w-0 space-y-6 overflow-x-hidden rounded-3xl border border-[#EAD8DC] bg-white/85 p-6 shadow-[0_14px_40px_-15px_rgba(181,101,118,0.14)] backdrop-blur-md sm:p-8">
        <h2 className="font-editorial text-2xl font-semibold text-[#1E181A]">
          {language === "ur"
            ? "Step 2: Baal Ki Type, Paani Aur Masla Likhein"
            : "Step 2: Hair Type, Water & Your Concerns"}
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
            label={
              language === "ur" ? "Baal Ka Style (Strand Type)" : "Hair Strand Type"
            }
            options={["Straight", "Wavy", "Curly / Coily", "Chemically Treated"]}
            value={hairStrandType}
            onChange={setHairStrandType}
          />

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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <HairStructuredBox
            id="hair-box-symptoms"
            label="1. Hair & Scalp Symptoms + Duration (Masla aur kitne time se hai?)"
            instruction={
              language === "ur"
                ? "Baal girna, maang chori hona ya bald patch kab se shuru hua?"
                : "Describe hair shedding, receding hairline, itchy spots, or bald patches and how long it has lasted."
            }
            chips={HAIR_SYMPTOM_CHIPS}
            value={symptomsAndDuration}
            onChange={setSymptomsAndDuration}
            placeholder="e.g. 4 months se hair fall bohat tez hai aur front hairline thin ho rahi hai (or sudden circular patch)..."
          />

          <HairStructuredBox
            id="hair-box-scalp"
            label="2. Scalp Feel & Flake Texture (Sar ki jild aur khushki kaisi hai?)"
            instruction={
              language === "ur"
                ? "Kya khushki sookhi powder jaisi hai ya oily chipchipi flakes aur dane hain?"
                : "Does your scalp feel oily/itchy with sticky yellow scales, dry powdery flakes, or painful pimples?"
            }
            chips={SCALP_TEXTURE_CHIPS}
            value={scalpFeelAndFlakes}
            onChange={setScalpFeelAndFlakes}
            placeholder="e.g. Wash ke 2 din baad scalp oily/itchy ho jata hai aur yellow sticky flakes ya chhote dane bante hain..."
          />

          <HairStructuredBox
            id="hair-box-water"
            label="3. Water Type & Climate Notes (Paani aur mausam ka asar)"
            instruction={
              language === "ur"
                ? "Bore water ki wajah se baal sakht ho rahe hain ya garmi/paseene ka asar?"
                : "Share any hard/bore water buildup, humidity, or tight hijab/sweat notes."
            }
            chips={HAIR_WATER_CLIMATE_CHIPS}
            value={waterAndClimate}
            onChange={setWaterAndClimate}
            placeholder="e.g. Ghar mein khara/bore water aata hai aur humid garmi mein scalp paseene se chipchipa rehta hai..."
          />

          <HairStructuredBox
            id="hair-box-routine"
            label="4. Current Shampoo, Oil & Treatment History (Abhi kya lagate hain?)"
            instruction={
              language === "ur"
                ? "Abhi kaunsa shampoo, tel, mask, serum ya keratin/dye treatment karwaya hai?"
                : "List your current shampoo, conditioner, hair oils (how often), serums, or heat/keratin treatments."
            }
            chips={HAIR_ROUTINE_CHIPS}
            value={currentRoutineAndHistory}
            onChange={setCurrentRoutineAndHistory}
            placeholder="e.g. Hafte mein 2 baar coconut/mustard oil raat bhar lagate hain aur sulfate shampoo use karte hain..."
          />

          <HairStructuredBox
            id="hair-box-family"
            label="5. Family History (Family mein pattern thinning, thyroid ya PCOS?)"
            instruction={
              language === "ur"
                ? "Kya family mein baal patle hone ka masla hai ya aapko thyroid/PCOS ya recent illness hui hai?"
                : "Note family pattern thinning, thyroid issues, PCOS, iron deficiency, or recent fever/stress."
            }
            chips={HAIR_FAMILY_CHIPS}
            value={familyHistory}
            onChange={setFamilyHistory}
            placeholder="e.g. Father ya mother side mein pattern thinning hai, ya PCOS / thyroid / recent dengue ke baad shedding hui..."
            fullWidth
          />
        </div>

        <button
          type="button"
          disabled={isScanning}
          aria-busy={isScanning}
          onClick={handleRunHairScan}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#BF6E7F] to-[#B56576] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(181,101,118,0.55)] transition-all hover:-translate-y-0.5 hover:from-[#B56576] hover:to-[#9E5263] active:scale-95 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60"
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
