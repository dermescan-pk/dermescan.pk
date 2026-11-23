import { useEffect, useMemo, useRef, useState } from "react";
import { ScanFace, AlertTriangle, RefreshCw } from "lucide-react";
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
  BodyArea,
  HealthProfile,
  Language,
  UploadedImage,
} from "../types/dermascan.ts";

const BODY_AREAS: BodyArea[] = [
  "Face",
  "Under-Eyes",
  "Lips",
  "Neck & Underarms",
  "Back & Chest",
  "Arms & Legs",
  "Hands & Nails",
  "Feet & Heels",
  "Other Body Area",
];

function LipIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.85}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 12.2c2.8-2.9 5.3-4.1 7.3-2.5.8.6 1.2.9 1.7.9s.9-.3 1.7-.9c2-1.6 4.5-.4 7.3 2.5-2.6 3.7-5.6 5.5-9 5.5s-6.4-1.8-9-5.5Z" />
      <path d="M4.2 12.3c2.7.8 5.2 1 7.8 1s5.1-.2 7.8-1" />
    </svg>
  );
}

function getSlotsForBodyArea(area: BodyArea): AngleSlotConfig[] {
  switch (area) {
    case "Face":
      return [
        { slotId: "face-front", slotLabel: "1. Front Full Face" },
        { slotId: "face-left", slotLabel: "2. Left Cheek & Jawline" },
        { slotId: "face-right", slotLabel: "3. Right Cheek & Jawline" },
        { slotId: "face-closeup", slotLabel: "4. Close-Up of Bumps / Spots" },
      ];
    case "Under-Eyes":
      return [
        { slotId: "eye-straight", slotLabel: "1. Straight Gaze (Uniform Light)" },
        { slotId: "eye-left", slotLabel: "2. Left Under-Eye Close-Up" },
        { slotId: "eye-right", slotLabel: "3. Right Under-Eye Close-Up" },
      ];
    case "Lips":
      return [
        { slotId: "lip-front", slotLabel: "1. Front Lips (Natural Light)" },
        { slotId: "lip-corners", slotLabel: "2. Lip Corners / Smile Folds" },
        { slotId: "lip-closeup", slotLabel: "3. Close-Up of Lip Texture / Pigment" },
      ];
    case "Feet & Heels":
      return [
        { slotId: "feet-heel", slotLabel: "1. Back of Heel (Cracks/Dryness)" },
        { slotId: "feet-sole", slotLabel: "2. Sole / Bottom of Foot" },
        { slotId: "feet-top", slotLabel: "3. Top of Foot, Toes & Nails" },
      ];
    case "Hands & Nails":
      return [
        { slotId: "hands-back", slotLabel: "1. Back of Hands" },
        { slotId: "hands-palms", slotLabel: "2. Palms" },
        { slotId: "hands-nails", slotLabel: "3. Nails & Cuticles Close-Up" },
      ];
    default:
      return [
        { slotId: "body-overview", slotLabel: "1. Full Area Overview" },
        { slotId: "body-side", slotLabel: "2. Side / Angle View" },
        { slotId: "body-texture", slotLabel: "3. Close-Up Skin Texture" },
      ];
  }
}

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

interface AreaDynamicPlaceholders {
  duration: string;
  sensation: string;
  texture: string;
  spreadingPattern: string;
  triggersAndClimate: string;
}

const AREA_DYNAMIC_PLACEHOLDERS: Record<BodyArea, AreaDynamicPlaceholders> = {
  Face: {
    duration: "e.g., 3 weeks on forehead and cheeks",
    sensation: "e.g., itchy with sweat or painful bumps",
    texture: "e.g., blackheads or small uniform bumps",
    spreadingPattern: "e.g., both cheeks, forehead, or jawline",
    triggersAndClimate: "e.g., after hair oiling, sun, or periods",
  },
  "Under-Eyes": {
    duration: "e.g., 6 months, worse in the morning",
    sensation: "e.g., tired feeling or mild stinging",
    texture: "e.g., thin creased skin, bags, or milia",
    spreadingPattern: "e.g., under both eyes or outer corners",
    triggersAndClimate: "e.g., poor sleep, screens, or eye rubbing",
  },
  Lips: {
    duration: "e.g., 3 months of dry or dark lips",
    sensation: "e.g., dryness, burning, or cracked corners",
    texture: "e.g., peeling skin or dark outer border",
    spreadingPattern: "e.g., lower lip, corners, or full border",
    triggersAndClimate: "e.g., lip licking, tea/coffee, or sun",
  },
  "Neck & Underarms": {
    duration: "e.g., 1 year of dark rough folds",
    sensation: "e.g., itching after sweat or friction",
    texture: "e.g., thick velvety skin or razor bumps",
    spreadingPattern: "e.g., neck creases or underarm folds",
    triggersAndClimate: "e.g., waxing, shaving, or scented deo",
  },
  "Back & Chest": {
    duration: "e.g., 4 weeks since hot weather",
    sensation: "e.g., painful bumps or sweat itching",
    texture: "e.g., deep cysts or tiny uniform bumps",
    spreadingPattern: "e.g., shoulders, upper back, or chest",
    triggersAndClimate: "e.g., gym sweat, tight shirts, hair oil",
  },
  "Arms & Legs": {
    duration: "e.g., 2 months of rough spots",
    sensation: "e.g., worse itching at night or flat",
    texture: "e.g., strawberry bumps or dry patches",
    spreadingPattern: "e.g., ring-shaped patches or both arms",
    triggersAndClimate: "e.g., waxing, bore water, or sun tan",
  },
  "Hands & Nails": {
    duration: "e.g., 3 weeks of dry cracks or yellow nails",
    sensation: "e.g., soap stinging or itchy fingers",
    texture: "e.g., cracked palms or thick brittle nails",
    spreadingPattern: "e.g., between fingers, palms, or 2 nails",
    triggersAndClimate: "e.g., dish soap, detergent, bore water",
  },
  "Feet & Heels": {
    duration: "e.g., 6 months of cracked heels",
    sensation: "e.g., painful heel cracks or toe itching",
    texture: "e.g., hard thick heels or soggy toe webs",
    spreadingPattern: "e.g., both heels, sole, or between toes",
    triggersAndClimate: "e.g., barefoot walking or sweaty shoes",
  },
  "Other Body Area": {
    duration: "e.g., 2 weeks on back or shoulder",
    sensation: "e.g., itching, burning, or swelling",
    texture: "e.g., rough scaly patch or flat mark",
    spreadingPattern: "e.g., one spot, rings, or skin folds",
    triggersAndClimate: "e.g., heat sweat, friction, new soap",
  },
};

interface BoxFieldSchema {
  id: string;
  label: string;
  chips: readonly string[];
  placeholder: string;
  fullWidth?: boolean;
}

interface SevenBoxConfig {
  headingEn: string;
  headingUr: string;
  boxes: [
    BoxFieldSchema,
    BoxFieldSchema,
    BoxFieldSchema,
    BoxFieldSchema,
    BoxFieldSchema,
    BoxFieldSchema,
    BoxFieldSchema,
  ];
}

type AreaSchemaGroup =
  | "under-eyes"
  | "lips"
  | "hands-nails"
  | "feet-heels"
  | "other-body"
  | "standard";

function getAreaSchemaGroup(area: BodyArea): AreaSchemaGroup {
  switch (area) {
    case "Under-Eyes":
      return "under-eyes";
    case "Lips":
      return "lips";
    case "Hands & Nails":
      return "hands-nails";
    case "Feet & Heels":
      return "feet-heels";
    case "Other Body Area":
      return "other-body";
    default:
      return "standard";
  }
}

function getSevenBoxConfig(
  bodyArea: BodyArea,
  language: Language,
  areaPlaceholders: AreaDynamicPlaceholders
): SevenBoxConfig {
  const ur = language === "ur";

  if (bodyArea === "Under-Eyes") {
    return {
      headingEn: "Tell us what you're noticing",
      headingUr: "Apni aankhon ke neeche ki skin ke baare mein batayein",
      boxes: [
        {
          id: "skin-box-duration",
          label: "How long has it been there?",
          chips: [
            "Since Childhood / Genetic",
            "Few Months",
            "Sudden (Few Days)",
            "Worse in Morning",
          ],
          placeholder: "e.g., since childhood or last 2 months",
        },
        {
          id: "skin-box-sensation",
          label: "How does it feel?",
          chips: [
            "Tired / Heavy",
            "Itchy / Watery (Allergy)",
            "Dry / Tight / Stinging",
            "Painful / Swollen Lid",
            "No Sensation",
          ],
          placeholder: "e.g., dry and tired, no pain or itching",
        },
        {
          id: "skin-box-texture",
          label: "Texture & appearance",
          chips: [
            "Brown Pigment",
            "Bluish / Purple Tint",
            "Hollow / Sunken Tear Trough",
            "Puffy Bags",
            "Dry / Crepey Fine Lines",
            "Tiny White Bumps (Milia)",
          ],
          placeholder: "e.g., brown pigment, lines, or puffy bags",
        },
        {
          id: "skin-box-spreading",
          label: "Where does it show up?",
          chips: [
            "Both Eyes Equally",
            "One Eye Only",
            "Upper + Lower Eyelids",
            "Inner Corner Only",
          ],
          placeholder: "e.g., equally dark under both eyes",
        },
        {
          id: "skin-box-triggers",
          label: "What makes it worse?",
          chips: [
            "Poor Sleep / Late Nights",
            "Heavy Mobile / Laptop Screen",
            "Frequent Eye Rubbing",
            "Dust / Sinus Allergies",
            "Sun Without Sunglasses",
          ],
          placeholder: "e.g., late nights, screen use, rubbing eyes",
        },
        {
          id: "skin-box-routine",
          label: "Products you're using",
          chips: [
            "Applied Face Actives Near Eyes",
            "Used Whitening / Formula Cream",
            "Heavy Oil / Cream (Milia Risk)",
            "Nothing Applied Yet",
          ],
          placeholder: "e.g., no eye cream yet, or used face serum",
        },
        {
          id: "skin-box-family",
          label: "Anything else?",
          chips: [
            "Genetic / Runs in Family",
            "Sinus / Allergies",
            "Anemia / Low Iron",
            "Thyroid / PCOS",
            "None",
          ],
          placeholder: "e.g., runs in family, sinus, or low iron",
          fullWidth: true,
        },
      ],
    };
  }

  if (bodyArea === "Lips") {
    return {
      headingEn: "Tell us what you're noticing",
      headingUr: "Apne lips ke baare mein batayein",
      boxes: [
        {
          id: "skin-box-duration",
          label: "How long has it been there?",
          chips: [
            "Few Days (Sudden)",
            "2–6 Weeks",
            "Months / Years",
            "Worse in Winter / Sun",
          ],
          placeholder: areaPlaceholders.duration,
        },
        {
          id: "skin-box-sensation",
          label: "How does it feel?",
          chips: [
            "Dry, Chapped & Peeling Lips",
            "Dark / Pigmented Lips & Sun Tan",
            "Cracked Lip Corners (Angular Cheilitis)",
            "Lipstick / Lip Balm Allergy & Burning",
            "Bumps, Blisters, or Cold Sores",
          ],
          placeholder: areaPlaceholders.sensation,
        },
        {
          id: "skin-box-texture",
          label: "Texture & appearance",
          chips: [
            "Flaking / Peeling Skin",
            "Two-Tone / Dark Outer Border",
            "Painful Splits at Corners",
            "Swollen / Raw & Stingy",
            "Tiny Fluid Blisters / Crusts",
          ],
          placeholder: areaPlaceholders.texture,
        },
        {
          id: "skin-box-spreading",
          label: "Where does it show up?",
          chips: [
            "Upper & Lower Lips",
            "Lower Lip Mostly",
            "Mouth Corners Only",
            "Outer Lip Border",
            "One Spot / Single Blister",
          ],
          placeholder: areaPlaceholders.spreadingPattern,
        },
        {
          id: "skin-box-triggers",
          label: "What makes it worse?",
          chips: [
            "Frequent Lip Licking / Biting",
            "Sun Exposure (No Lip SPF)",
            "Matte / Long-Wear Lipstick",
            "Spicy Food / Mint Toothpaste",
            "Hot Tea / Coffee / Smoking",
          ],
          placeholder: areaPlaceholders.triggersAndClimate,
        },
        {
          id: "skin-box-routine",
          label: "Products you're using",
          chips: [
            "Used Lemon / Sugar Scrub / Toothpaste",
            "Using Plain Vaseline Only",
            "Tried Flavored / Tinted Lip Balms",
            "Used Whitening / Steroid Cream on Lips",
            "Nothing Applied Yet",
          ],
          placeholder: "e.g., Vaseline, lip balm, or lemon scrub",
        },
        {
          id: "skin-box-family",
          label: "Anything else?",
          chips: [
            "Low Water Intake / Dehydration",
            "Iron / Vitamin B12 Deficiency",
            "On Isotretinoin / Acne Meds",
            "History of Cold Sores / Fever Blisters",
            "None",
          ],
          placeholder: "e.g., low water intake, low B12, or acne meds",
          fullWidth: true,
        },
      ],
    };
  }

  if (bodyArea === "Hands & Nails") {
    return {
      headingEn: "Tell us what you're noticing",
      headingUr: "Haathon aur nakhun ke baare mein batayein",
      boxes: [
        {
          id: "skin-box-duration",
          label: "How long has it been there?",
          chips: ["Few Days", "2–6 Weeks", "Months / Years", "Worse in Winter"],
          placeholder: "e.g., 2 months dry palms or yellow nails",
        },
        {
          id: "skin-box-sensation",
          label: "How does it feel?",
          chips: [
            "Itchy / Kharish",
            "Painful Cracks / Stinging",
            "Throbbing Around Nail Fold",
            "No Pain / Just Rough",
          ],
          placeholder: "e.g., soap stinging or night itching",
        },
        {
          id: "skin-box-texture",
          label: "Texture & appearance",
          chips: [
            "Dry / Rough / Peeling Palms",
            "Tiny Itchy Side-Finger Blisters",
            "Dark Knuckles",
            "Thick / Yellow / Crumbly Nails",
            "Brittle / Splitting Nails",
          ],
          placeholder: "e.g., side-finger blisters or thick nails",
        },
        {
          id: "skin-box-spreading",
          label: "Where does it show up?",
          chips: [
            "Finger Webs / Sides",
            "Back of Hands & Knuckles",
            "Palms Only",
            "1–2 Nails Only",
            "All Nails",
          ],
          placeholder: "e.g., finger webs, knuckles, or 2 nails",
        },
        {
          id: "skin-box-triggers",
          label: "What makes it worse?",
          chips: [
            "Frequent Dish Soap / Detergent",
            "Hard / Bore Water",
            "Frequent Hand Sanitizer",
            "Gel / Acrylic Nails / Acetone",
            "Sun Exposure (Driving/Bike)",
          ],
          placeholder: "e.g., dishwashing soap or bore water",
        },
        {
          id: "skin-box-routine",
          label: "Products you're using",
          chips: [
            "Used Steroid / Whitening Cream",
            "Using Regular Hand Lotion",
            "Applied Cuticle Oil",
            "Nothing Applied Yet",
          ],
          placeholder: "e.g., regular hand cream or antifungal",
        },
        {
          id: "skin-box-family",
          label: "Anything else?",
          chips: [
            "Someone at Home Itching Too",
            "Family Eczema / Psoriasis",
            "Iron / Biotin Deficiency",
            "Diabetes",
            "None",
          ],
          placeholder: "e.g., family itching, eczema, or low iron",
          fullWidth: true,
        },
      ],
    };
  }

  if (bodyArea === "Feet & Heels") {
    return {
      headingEn: "Tell us what you're noticing",
      headingUr: "Paon aur eriyon ke baare mein batayein",
      boxes: [
        {
          id: "skin-box-duration",
          label: "How long has it been there?",
          chips: [
            "Few Weeks",
            "Months / Years",
            "Worse in Summer / Sweat",
            "Worse in Winter",
          ],
          placeholder: "e.g., 1 year hard heels or toe itch",
        },
        {
          id: "skin-box-sensation",
          label: "How does it feel?",
          chips: [
            "Painful / Bleeding Cracks",
            "Intensely Itchy Between Toes",
            "Tender Pressure Spot (Corn)",
            "Hot / Swollen / Red",
            "Hard & Numb / Rough",
          ],
          placeholder: "e.g., painful cracks or itchy toes",
        },
        {
          id: "skin-box-texture",
          label: "Texture & appearance",
          chips: [
            "Hard / Thickened Yellow Callus",
            "Deep Cracked Heels",
            "Chalky Peeling Whole Sole",
            "Soggy White Skin Between Toes",
            "Hard Grainy Bump (Wart / Corn)",
          ],
          placeholder: "e.g., thick cracked heels or peeling sole",
        },
        {
          id: "skin-box-spreading",
          label: "Where does it show up?",
          chips: [
            "Heels & Back Edge",
            "Ball of Foot / Pressure Points",
            "Between Toes (4th & 5th Toe)",
            "Entire Sole (Moccasin Pattern)",
            "Sandal Strap Marks",
          ],
          placeholder: "e.g., both heels or between small toes",
        },
        {
          id: "skin-box-triggers",
          label: "What makes it worse?",
          chips: [
            "Walking Barefoot at Home",
            "Open-Back Sandals / Slippers",
            "Tight Closed Shoes / Sweaty Socks",
            "Wudu / Frequent Wet Feet",
            "Hard / Bore Water",
          ],
          placeholder: "e.g., barefoot at home or wet feet",
        },
        {
          id: "skin-box-routine",
          label: "Products you're using",
          chips: [
            "Used Pumice Stone / Blade",
            "Applied Vaseline / Cream",
            "Used Steroid Cream",
            "Nothing Applied Yet",
          ],
          placeholder: "e.g., Vaseline, foot cream, or pumice",
        },
        {
          id: "skin-box-family",
          label: "Anything else?",
          chips: [
            "Diabetes / High Sugar",
            "Foot Numbness / Tingling",
            "Poor Circulation",
            "Fungal Nails Too",
            "None",
          ],
          placeholder: "e.g., note if diabetic or any numbness",
          fullWidth: true,
        },
      ],
    };
  }

  if (bodyArea === "Other Body Area") {
    return {
      headingEn: "Tell us what you're noticing",
      headingUr: "Is hissay ke baare mein batayein",
      boxes: [
        {
          id: "skin-box-duration",
          label: "How long has it been there?",
          chips: ["Few Days", "2–6 Weeks", "Months / Years", "Comes & Goes"],
          placeholder: "e.g., 2 weeks behind ear or shoulder",
        },
        {
          id: "skin-box-sensation",
          label: "How does it feel?",
          chips: [
            "Itchy / Kharish",
            "Painful / Tender",
            "Burning",
            "Hot / Swollen",
            "No Feeling",
          ],
          placeholder: "e.g., itching, burning, or swelling",
        },
        {
          id: "skin-box-texture",
          label: "Texture & appearance",
          chips: [
            "Smooth & Flat",
            "Rough / Scaly",
            "Raised Bumps",
            "Blisters / Pus",
            "Thick / Hard",
          ],
          placeholder: "e.g., rough scaly patch or flat spot",
        },
        {
          id: "skin-box-spreading",
          label: "Where does it show up?",
          chips: [
            "One Small Spot",
            "Spreading Outward",
            "Multiple Patches",
            "Symmetric (Both Sides)",
          ],
          placeholder: "e.g., small spot or spreading outward",
        },
        {
          id: "skin-box-triggers",
          label: "What makes it worse?",
          chips: [
            "Sweat / Heat",
            "Tight Clothing / Friction",
            "New Soap / Perfume",
            "Sun Exposure",
            "Not Sure",
          ],
          placeholder: "e.g., sweat, friction, or new soap",
        },
        {
          id: "skin-box-routine",
          label: "Products you're using",
          chips: [
            "Used Steroid / Formula Cream",
            "Using Plain Moisturizer",
            "Used Home Remedy",
            "Nothing Applied Yet",
          ],
          placeholder: "e.g., any cream, ointment, or remedy",
        },
        {
          id: "skin-box-family",
          label: "Anything else?",
          chips: [
            "Family Eczema / Psoriasis",
            "Someone at Home Has Similar Rash",
            "Diabetes / PCOS",
            "None",
          ],
          placeholder: "e.g., family eczema or household rash",
          fullWidth: true,
        },
      ],
    };
  }

  return {
    headingEn: "Tell us what you're noticing",
    headingUr: "Apni skin ke baare mein batayein",
    boxes: [
      {
        id: "skin-box-duration",
        label: "How long has it been there?",
        chips: ["Few Days", "2–6 Weeks", "Months / Years", "Comes & Goes"],
        placeholder: areaPlaceholders.duration,
      },
      {
        id: "skin-box-sensation",
        label: "How does it feel?",
        chips: [
          "Itchy / Kharish",
          "Worse at Night",
          "Painful / Tender",
          "Burning / Stinging",
          "No Feeling / Flat",
        ],
        placeholder: areaPlaceholders.sensation,
      },
      {
        id: "skin-box-texture",
        label: "Texture & appearance",
        chips: [
          "Smooth & Flat",
          "Rough / Scaly",
          "Tiny Uniform Bumps",
          "Pus / Fluid Blisters",
          "Hard / Thick / Cracked",
        ],
        placeholder: areaPlaceholders.texture,
      },
      {
        id: "skin-box-spreading",
        label: "Where does it show up?",
        chips: [
          "Spreading in Rings",
          "Both Sides (Symmetric)",
          "Left After Pimples",
          "One Spot Only",
          "Finger Webs / Creases",
        ],
        placeholder: areaPlaceholders.spreadingPattern,
      },
      {
        id: "skin-box-triggers",
        label: "What makes it worse?",
        chips: [
          "Hot & Humid Sweat",
          "Sun / Dhoop",
          "Hard / Bore Water",
          "After Waxing / Shaving",
          "After Hair Oiling",
          "Before Periods",
        ],
        placeholder: areaPlaceholders.triggersAndClimate,
      },
      {
        id: "skin-box-routine",
        label: "Products you're using",
        chips: [
          "Used Whitening / Formula Cream",
          "Used Steroid Cream",
          "Using Active Serums",
          "Using Nothing Right Now",
        ],
        placeholder: ur
          ? "e.g., facewash, serum, ya formula cream"
          : "e.g., facewash, serum, sunscreen, or cream",
      },
      {
        id: "skin-box-family",
        label: "Anything else?",
        chips: [
          "Family Eczema / Psoriasis",
          "Someone at Home Itching Too",
          "Diabetes / Numbness",
          "PCOS / Hormonal",
          "None",
        ],
        placeholder: "e.g., family eczema, household itch, or PCOS",
        fullWidth: true,
      },
    ],
  };
}

function appendChipValue(prev: string, chip: string): string {
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

function ClinicalInputRow({
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
              onClick={() => onChange(appendChipValue(value, chip))}
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

interface SkinBodyTabProps {
  language: Language;
  healthProfile: HealthProfile;
}

export function SkinBodyTab({ language, healthProfile }: SkinBodyTabProps) {
  const [bodyArea, setBodyArea] = useState<BodyArea>("Face");
  const [imagesBySlot, setImagesBySlot] = useState<Record<string, UploadedImage>>(
    {}
  );
  const [skinType, setSkinType] = useState("Combination");
  const [waterSupply, setWaterSupply] = useState("Normal Water");
  const [climate, setClimate] = useState("Hot & Humid");
  const [budget, setBudget] = useState("Budget Friendly");

  const [duration, setDuration] = useState("");
  const [sensation, setSensation] = useState("");
  const [texture, setTexture] = useState("");
  const [spreadingPattern, setSpreadingPattern] = useState("");
  const [triggersAndClimate, setTriggersAndClimate] = useState("");
  const [pastCreamsAndRoutine, setPastCreamsAndRoutine] = useState("");
  const [familyAndHouseholdHistory, setFamilyAndHouseholdHistory] = useState("");

  const [isScanning, setIsScanning] = useState(false);
  const isSubmittingRef = useRef(false);
  const [result, setResult] = useState<BentoPrescriptionResponse | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [rateLimitNotice, setRateLimitNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const slots = useMemo(() => getSlotsForBodyArea(bodyArea), [bodyArea]);
  const areaPlaceholders = AREA_DYNAMIC_PLACEHOLDERS[bodyArea];
  const sevenBoxConfig = useMemo(
    () => getSevenBoxConfig(bodyArea, language, areaPlaceholders),
    [bodyArea, language, areaPlaceholders]
  );

  const boxValues = [
    duration,
    sensation,
    texture,
    spreadingPattern,
    triggersAndClimate,
    pastCreamsAndRoutine,
    familyAndHouseholdHistory,
  ] as const;

  const boxSetters = [
    setDuration,
    setSensation,
    setTexture,
    setSpreadingPattern,
    setTriggersAndClimate,
    setPastCreamsAndRoutine,
    setFamilyAndHouseholdHistory,
  ] as const;

  const uploadedList = useMemo(
    () =>
      slots
        .map((s) => imagesBySlot[s.slotId])
        .filter((img): img is UploadedImage => Boolean(img)),
    [slots, imagesBySlot]
  );

  const handleBodyAreaChange = (area: BodyArea) => {
    if (getAreaSchemaGroup(bodyArea) !== getAreaSchemaGroup(area)) {
      setDuration("");
      setSensation("");
      setTexture("");
      setSpreadingPattern("");
      setTriggersAndClimate("");
      setPastCreamsAndRoutine("");
      setFamilyAndHouseholdHistory("");
    }
    setBodyArea(area);
    setImagesBySlot({});
    setResult(null);
    setApiKeyError(null);
    setRateLimitNotice(null);
    setErrorMsg(null);
  };

  async function handleRunScan() {
    if (isSubmittingRef.current) return;

    setApiKeyError(null);
    setRateLimitNotice(null);
    setErrorMsg(null);

    if (uploadedList.length === 0) {
      setErrorMsg(
        language === "ur"
          ? "Check karne ke liye kam az kam 1 photo upload karein."
          : "Please add at least 1 photo before checking your skin."
      );
      return;
    }

    isSubmittingRef.current = true;
    setIsScanning(true);
    setResult(null);

    const structuredInputs = {
      duration: duration.trim(),
      sensation: sensation.trim(),
      texture: texture.trim(),
      spreadingPattern: spreadingPattern.trim(),
      triggersAndClimate: triggersAndClimate.trim(),
      pastCreamsAndRoutine: pastCreamsAndRoutine.trim(),
      familyAndHouseholdHistory: familyAndHouseholdHistory.trim(),
    };

    const symptomsSummary = [
      structuredInputs.duration && `Duration: ${structuredInputs.duration}`,
      structuredInputs.sensation && `Sensation: ${structuredInputs.sensation}`,
      structuredInputs.texture && `Texture: ${structuredInputs.texture}`,
      structuredInputs.spreadingPattern &&
        `Pattern: ${structuredInputs.spreadingPattern}`,
      structuredInputs.triggersAndClimate &&
        `Triggers: ${structuredInputs.triggersAndClimate}`,
      structuredInputs.familyAndHouseholdHistory &&
        `Family/Health: ${structuredInputs.familyAndHouseholdHistory}`,
    ]
      .filter(Boolean)
      .join(" | ");

    const routineClean = structuredInputs.pastCreamsAndRoutine;

    try {
      const data = await postApi<BentoPrescriptionResponse>("/api/analyze-skin", {
        bodyArea,
        userPersonalNote: [symptomsSummary, routineClean]
          .filter(Boolean)
          .join(" | "),
        healthProfile,
        structuredInputs,
        context: {
          skinType,
          waterSupply,
          climate,
          budget,
          specificSymptoms: symptomsSummary,
          currentRoutine: routineClean,
          note: symptomsSummary,
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
      <TabHeaderIllustration variant="skin" language={language} />

      <div className="min-w-0 space-y-6 overflow-x-hidden rounded-3xl border border-[#EAD6DB] bg-gradient-to-b from-[#FFF9FA] via-white to-white p-6 shadow-[0_12px_36px_-14px_rgba(181,101,118,0.16)] transition-colors duration-300 dark:border-[#34262B] dark:from-[#23181C] dark:via-[#1C1417] dark:to-[#1C1417] dark:shadow-[0_14px_38px_-14px_rgba(0,0,0,0.45)] sm:p-8">
        <div>
          <div className="mb-4 flex min-w-0 items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2.5">
              <span className="font-editorial text-xl font-semibold italic text-[#B56576] dark:text-[#D48395]">
                01
              </span>
              <h3 className="font-editorial text-2xl font-semibold text-[#1E181A] dark:text-[#F7EFEF]">
                {language === "ur" ? "Hissa Chunein" : "Select Area"}
              </h3>
            </div>
            <span className="shrink-0 text-xs font-medium text-[#B56576] dark:text-[#D48395]">
              {bodyArea}
            </span>
          </div>

          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
            {BODY_AREAS.map((area) => {
              const active = bodyArea === area;
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => handleBodyAreaChange(area)}
                  className={`inline-flex min-h-[36px] shrink-0 items-center justify-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors duration-200 active:scale-95 ${
                    active
                      ? "border-[#B56576] bg-[#B56576]/12 text-[#8F4556] dark:border-[#D48395] dark:bg-[#D48395]/20 dark:text-[#F0B2C0]"
                      : "border-transparent bg-[#FAF4F5] text-[#5E5055] hover:border-[#EAD6DB] hover:bg-[#F3E7EA]/70 hover:text-[#1E181A] dark:bg-[#171113] dark:text-[#C9B6BC] dark:hover:bg-[#2A1F23] dark:hover:text-[#F7EFEF]"
                  }`}
                >
                  {area === "Lips" && <LipIcon className="h-3.5 w-3.5 shrink-0" />}
                  <span>{area}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-[#F0E4E7] pt-6 dark:border-[#2D2125]">
          <div className="mb-4 flex items-baseline gap-2.5">
            <span className="font-editorial text-lg font-semibold italic text-[#B56576] dark:text-[#D48395]">
              02
            </span>
            <p className="font-editorial text-xl font-semibold text-[#1E181A] dark:text-[#F7EFEF]">
              {language === "ur"
                ? sevenBoxConfig.headingUr
                : sevenBoxConfig.headingEn}
            </p>
          </div>

          <div className="divide-y divide-[#F0E4E7] dark:divide-[#2D2125]">
            {sevenBoxConfig.boxes.map((box, index) => (
              <ClinicalInputRow
                key={`${bodyArea}-${box.id}`}
                id={box.id}
                label={box.label}
                chips={box.chips}
                value={boxValues[index]}
                onChange={boxSetters[index]}
                placeholder={box.placeholder}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="min-w-0 overflow-x-hidden rounded-3xl border border-[#EAD6DB] bg-gradient-to-b from-[#FFF9FA] via-white to-white p-6 shadow-[0_12px_36px_-14px_rgba(181,101,118,0.16)] transition-colors duration-300 dark:border-[#34262B] dark:from-[#23181C] dark:via-[#1C1417] dark:to-[#1C1417] dark:shadow-[0_14px_38px_-14px_rgba(0,0,0,0.45)] sm:p-8">
        <div className="mb-5 flex min-w-0 items-baseline justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <div className="flex items-baseline gap-2.5">
              <span className="font-editorial text-xl font-semibold italic text-[#B56576] dark:text-[#D48395]">
                03
              </span>
              <h3 className="font-editorial text-2xl font-semibold text-[#1E181A] dark:text-[#F7EFEF]">
                {language === "ur" ? "Photos Add Karein" : "Add Photos"}
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-[#7A686D] dark:text-[#C9B6BC]">
              {language === "ur"
                ? `1 se ${slots.length} saaf photos add karein.`
                : `Upload 1 to ${slots.length} clear photos.`}
            </p>
          </div>
          <span className="shrink-0 text-xs font-semibold tabular-nums text-[#B56576] dark:text-[#D48395]">
            {uploadedList.length} / {slots.length}
          </span>
        </div>

        <MultiAngleUploader
          slots={slots}
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

      <div className="min-w-0 space-y-6 overflow-x-hidden rounded-3xl border border-[#EAD6DB] bg-gradient-to-b from-[#FFF9FA] via-white to-white p-6 shadow-[0_12px_36px_-14px_rgba(181,101,118,0.16)] transition-colors duration-300 dark:border-[#34262B] dark:from-[#23181C] dark:via-[#1C1417] dark:to-[#1C1417] dark:shadow-[0_14px_38px_-14px_rgba(0,0,0,0.45)] sm:p-8">
        <h3 className="font-editorial text-2xl font-semibold text-[#1E181A] dark:text-[#F7EFEF]">
          {language === "ur" ? "Skin Aur Mausam" : "Skin & Weather"}
        </h3>

        <div className="divide-y divide-[#F0E4E7] dark:divide-[#2D2125]">
          <div className="grid grid-cols-1 gap-6 pb-5 sm:grid-cols-2">
            <SegmentedSelector
              label="Skin Type"
              options={["Oily", "Dry", "Combination", "Sensitive"]}
              value={skinType}
              onChange={setSkinType}
            />

            <SegmentedSelector
              label={language === "ur" ? "Ghar Ka Paani" : "Water Type"}
              options={["Normal Water", "Hard / Bore Water"]}
              value={waterSupply}
              onChange={setWaterSupply}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 pt-5 sm:grid-cols-2">
            <SegmentedSelector
              label={language === "ur" ? "Shehar Ka Mausam" : "Weather"}
              options={["Hot & Humid", "Dry / Cold"]}
              value={climate}
              onChange={setClimate}
            />

            <SegmentedSelector
              label="Budget"
              options={["Budget Friendly", "Standard"]}
              value={budget}
              onChange={setBudget}
            />
          </div>
        </div>

        <button
          type="button"
          disabled={isScanning}
          aria-busy={isScanning}
          onClick={handleRunScan}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#B56576] to-[#9E4E5F] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_28px_-6px_rgba(181,101,118,0.45)] transition-all duration-200 hover:brightness-105 active:scale-[0.99] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 dark:from-[#D48395] dark:to-[#B56576] dark:text-[#140F11]"
        >
          <ScanFace className="h-4 w-4 shrink-0" />
          <span>
            {isScanning
              ? language === "ur"
                ? "Photos Check Ho Rahi Hain..."
                : "Checking Your Skin Photos..."
              : language === "ur"
                ? "Meri Skin Check Karein"
                : `Check My Skin (${uploadedList.length} ${
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

      {isScanning && <ScanningLoader language={language} />}

      {result && !result.isValidPhoto && (
        <div className="min-w-0 overflow-x-hidden rounded-3xl border border-[#E8C5CA] bg-[#FDF4F5] p-6">
          <div className="flex min-w-0 items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#8C3B4A]" />
            <div className="min-w-0 space-y-2">
              <h3 className="font-editorial text-lg font-semibold text-[#8C3B4A]">
                {language === "ur"
                  ? "Behtar Roshni Mein Photo Dubara Lein"
                  : "Please Retake Photo in Better Light"}
              </h3>
              <p className="break-words text-xs leading-relaxed text-[#8C3B4A]">
                {result.retakeMessage[language]}
              </p>
              {result.retakeSlots.length > 0 && (
                <p className="break-words text-[11px] font-semibold text-[#8C3B4A]">
                  {result.retakeSlots.join(" · ")}
                </p>
              )}
              <button
                type="button"
                onClick={() => setResult(null)}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-[#E8C5CA] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#8C3B4A] active:scale-95"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {language === "ur"
                  ? "Theek Hai, Photos Badlein"
                  : "Got it, Change Photos"}
              </button>
            </div>
          </div>
        </div>
      )}

      {result && result.isValidPhoto && (
        <BentoPrescriptionResult
          data={result}
          language={language}
          scanTitle={`${bodyArea} Scan`}
        />
      )}
    </div>
  );
}
