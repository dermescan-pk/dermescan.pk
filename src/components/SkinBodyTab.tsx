import { useMemo, useRef, useState } from "react";
import { ScanFace, AlertTriangle, RefreshCw } from "lucide-react";
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

interface AreaDynamicPlaceholders {
  duration: string;
  sensation: string;
  texture: string;
  spreadingPattern: string;
  triggersAndClimate: string;
}

const AREA_DYNAMIC_PLACEHOLDERS: Record<BodyArea, AreaDynamicPlaceholders> = {
  Face: {
    duration: "e.g. 3 weeks se forehead aur gaalon par chhote dane / daag hain...",
    sensation: "e.g. Paseene mein kharish hoti hai, ya dard walay bade pimples / jalan...",
    texture: "e.g. Blackheads, tiny uniform bumps, ya shahad-rang khurand / pus spots...",
    spreadingPattern: "e.g. Dono cheeks par symmetric jhaiyan, ya forehead/jawline par phail rahe hain...",
    triggersAndClimate: "e.g. Hair oiling ke baad bumps, dhoop mein darkening, ya periods se pehle...",
  },
  "Under-Eyes": {
    duration: "e.g. 6 months se dark circles aur subah puffiness rehti hai...",
    sensation: "e.g. Subah soojan/thakan feel hoti hai, ya cream lagane par halka stinging...",
    texture: "e.g. Jild patli aur creased lagti hai, chhote white milia bumps, ya dryness...",
    spreadingPattern: "e.g. Dono aankhon ke neeche symmetric dark hollowness ya outer corner par...",
    triggersAndClimate: "e.g. Neend ki kami, screen fatigue, aankhein malna (rubbing), ya dhoop...",
  },
  Lips: {
    duration: "e.g. 3 months se hont phat rahe hain ya honton ka rang dark ho gaya hai...",
    sensation: "e.g. Honton par khushki aur jalan, ya corners par dard walay cracks...",
    texture: "e.g. Chilka utarna (peeling), dark border pigmentation, ya chhotay blisters...",
    spreadingPattern: "e.g. Sirf nichlay hont par, dono konon (corners) par, ya poori lip border par...",
    triggersAndClimate: "e.g. Baar baar zubaan pherna (lip licking), chai/coffee, dhoop, ya lipstick...",
  },
  "Neck & Underarms": {
    duration: "e.g. 1 year se gardan ya underarms ka rang dark aur rough hai...",
    sensation: "e.g. Paseene ke baad jalan aur kharish, ya kapron ki ragad se irritation...",
    texture: "e.g. Makhmal jaisi moti kaali jild (velvety thick), ya shaving bumps...",
    spreadingPattern: "e.g. Gardan aur baghal ki creases mein lines, ya gol ring jaisa daag...",
    triggersAndClimate: "e.g. Waxing/shaving ke baad, tez perfume deo, ya garmi ke paseene se...",
  },
  "Back & Chest": {
    duration: "e.g. 4 weeks se garmi ke baad peeth aur seene par dane / spots hain...",
    sensation: "e.g. Throbbing dard walay bade dane, ya paseene ke baad shadeed kharish...",
    texture: "e.g. Deep painful cysts, blackheads, ya chhote uniform fungal bumps...",
    spreadingPattern: "e.g. Kandhon aur upper back par symmetric, ya gol halke/dark patches...",
    triggersAndClimate: "e.g. Gym/garmi ka paseena, tight kapray, ya baalon ka tel peeth par lagne se...",
  },
  "Arms & Legs": {
    duration: "e.g. 2 months se baazu ya taangon par rough spots / kharish hai...",
    sensation: "e.g. Raat ko tez kharish (worse at night), ya bilkul flat with no feeling...",
    texture: "e.g. Rough strawberry skin bumps, khushk scaly patches, ya fluid blisters...",
    spreadingPattern: "e.g. Gol ring-shaped border phail raha hai, ya dono baazuon par barabar...",
    triggersAndClimate: "e.g. Waxing/shaving ke baad, hard/bore water se khushki, ya dhoop se tan...",
  },
  "Hands & Nails": {
    duration: "e.g. 3 weeks se haathon mein khushki/cracks ya nakhun peele hain...",
    sensation: "e.g. Raat ko ungliyon mein tez kharish, ya soap lagane par jalan aur dard...",
    texture: "e.g. Phati khushk skin, chhote pani walay daane, ya motay brittle nails...",
    spreadingPattern: "e.g. Ungliyon ke darmiyan (finger webs), palms par, ya 1–2 nakhun par...",
    triggersAndClimate: "e.g. Bartan dhone ka detergent, handwash, hard bore water, ya sardi...",
  },
  "Feet & Heels": {
    duration: "e.g. 6 months se heels phati aur hard hain, ya ungliyon mein kharish hai...",
    sensation: "e.g. Chalne par eriyon mein dard/jalan, ya pairon mein sunn-pan (numbness)...",
    texture: "e.g. Sakht moti skin aur gehri phati cracks (calluses), ya geeli white peeling...",
    spreadingPattern: "e.g. Paon ki ungliyon ke beech (toe webs), dono heels par, ya talway par...",
    triggersAndClimate: "e.g. Barefoot chalna, tight band jootay, paseena, ya sardi ki khushki...",
  },
  "Other Body Area": {
    duration: "e.g. 2 weeks se is jagah par daag, dane ya kharish shuru hui hai...",
    sensation: "e.g. Shadeed kharish, jalan, garam soojan (hot swelling), ya dard...",
    texture: "e.g. Rough scaly patch, pus/fluid blisters, ya smooth flat daag...",
    spreadingPattern: "e.g. Ek spot par ruka hai, rings mein phail raha hai, ya folds/creases mein...",
    triggersAndClimate: "e.g. Garmi ka paseena, bore water, kapron ki ragad, ya naya product...",
  },
};

interface BoxFieldSchema {
  id: string;
  label: string;
  instruction: string;
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
      headingEn: "7-Point Under-Eye & Periorbital Check (Tap Quick Chips or Type)",
      headingUr: "Under-Eyes Ke Liye 7 Khas Sawalat (Quick Chips Ya Likhein)",
      boxes: [
        {
          id: "skin-box-duration",
          label: "Box 1 — Duration (Kitne time se hai?)",
          instruction: ur
            ? "Aankhon ke neeche dark circles, soojan ya lines kab se hain?"
            : "How long have you noticed dark circles, puffiness, or lines?",
          chips: [
            "Since Childhood / Genetic",
            "Few Months",
            "Sudden (Few Days)",
            "Worse in Morning",
          ],
          placeholder:
            "e.g. Bachpan se dark circles hain, ya 2 months se screen time ke baad barh gaye hain...",
        },
        {
          id: "skin-box-sensation",
          label: "Box 2 — Eye-Area Sensation (Aankhon ke qareeb kya mehsoos hota hai?)",
          instruction: ur
            ? "Kya thakan, paani/kharish, khushki ya dard/soojan feel hoti hai?"
            : "Do your under-eyes feel tired, itchy/watery, dry, or painfully swollen?",
          chips: [
            "Tired / Heavy",
            "Itchy / Watery (Allergy)",
            "Dry / Tight / Stinging",
            "Painful / Swollen Lid",
            "No Sensation",
          ],
          placeholder:
            "e.g. Koi dard ya kharish nahi, bas dry aur tired feel hota hai...",
        },
        {
          id: "skin-box-texture",
          label: "Box 3 — Under-Eye Look & Texture (Dekhne aur chhoone mein kaisa lagta hai?)",
          instruction: ur
            ? "Rang (brown/blue), gaddha (hollow), puffy bags, lines ya white bumps batayein."
            : "Describe pigment shade, sunken hollows, puffiness, fine lines, or white milia bumps.",
          chips: [
            "Brown Pigment",
            "Bluish / Purple Tint",
            "Hollow / Sunken Tear Trough",
            "Puffy Bags",
            "Dry / Crepey Fine Lines",
            "Tiny White Bumps (Milia)",
          ],
          placeholder:
            "e.g. Brownish pigment aur dry fine lines hain, ya puffy bags hain...",
        },
        {
          id: "skin-box-spreading",
          label: "Box 4 — Symmetry & Area (Dono aankhon par hai ya ek taraf?)",
          instruction: ur
            ? "Kya yeh dono aankhon par barabar hai, ek aankh mein, ya oopar/neeche eyelids par?"
            : "Is it equal on both eyes, one eye only, or on upper/lower lids?",
          chips: [
            "Both Eyes Equally",
            "One Eye Only",
            "Upper + Lower Eyelids",
            "Inner Corner Only",
          ],
          placeholder: "e.g. Dono aankhon ke neeche equally dark aur hollow hai...",
        },
        {
          id: "skin-box-triggers",
          label: "Box 5 — Sleep, Screen & Eye Triggers (Neend, screen aur allergies)",
          instruction: ur
            ? "Der se sona, screen time, aankhein malna, sinus allergy ya dhoop?"
            : "Which sleep, screen, rubbing, sinus allergy, or sun habits affect your eyes?",
          chips: [
            "Poor Sleep / Late Nights",
            "Heavy Mobile / Laptop Screen",
            "Frequent Eye Rubbing",
            "Dust / Sinus Allergies",
            "Sun Without Sunglasses",
          ],
          placeholder:
            "e.g. Raat ko der se sona, zyada mobile use, aur aankhein malne ki aadat hai...",
        },
        {
          id: "skin-box-routine",
          label: "Box 6 — Past & Current Eye / Face Products (Abhi aur pehle kya lagaya?)",
          instruction: ur
            ? "Aankhon ke qareeb jo eye cream, face serum, tel ya whitening cream lagayi ho woh likhein."
            : "List any eye creams, face serums/acids, heavy oils, or formula creams used near eyes.",
          chips: [
            "Applied Face Actives Near Eyes",
            "Used Whitening / Formula Cream",
            "Heavy Oil / Cream (Milia Risk)",
            "Nothing Applied Yet",
          ],
          placeholder:
            "e.g. Koi eye cream use nahi kar raha/rahi, ya face serum aankhon ke qareeb lagaya tha...",
        },
        {
          id: "skin-box-family",
          label: "Box 7 — Family & Health Context (Family aur sehat ki maloomat)",
          instruction: ur
            ? "Kya family mein dark circles hain, ya sinus allergy, khoon ki kami (iron), ya thyroid/PCOS hai?"
            : "Any genetic dark circles in family, sinus allergies, anemia/low iron, or thyroid/PCOS?",
          chips: [
            "Genetic / Runs in Family",
            "Sinus / Allergies",
            "Anemia / Low Iron",
            "Thyroid / PCOS",
            "None",
          ],
          placeholder:
            "e.g. Family mein genetic dark circles hain, ya sinus allergy / iron deficiency hai...",
          fullWidth: true,
        },
      ],
    };
  }

  if (bodyArea === "Lips") {
    return {
      headingEn: "7-Point Clinical Lip Care Check (Tap Your Lip Concerns or Type)",
      headingUr: "Lips Ke Liye 7 Khas Sawalat (Apna Masla Chunein Ya Likhein)",
      boxes: [
        {
          id: "skin-box-duration",
          label: "Box 1 — Duration (Honton ka masla kab se hai?)",
          instruction: ur
            ? "Khushki, dark pigmentation, corner cracks ya blisters kitne time se hain?"
            : "How long have you noticed dryness, darkening, corner cracks, or blisters?",
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
          label: "Box 2 — Main Lip Concern (Honton ka asal masla aur feeling)",
          instruction: ur
            ? "Apne honton ka main masla chunein ya dard/jalan/swelling batayein."
            : "Select your main lip concern(s) or describe any stinging, burning, or soreness.",
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
          label: "Box 3 — Lip Look & Texture (Dekhne aur chhoone mein kaisa hai?)",
          instruction: ur
            ? "Chilka utarna, dark border, konon par cracks, ya pani walay daane/soojan?"
            : "Describe peeling flakes, two-tone darkening, painful corner splits, or fluid blisters.",
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
          label: "Box 4 — Exact Lip Zone (Honton ke kis hissay par hai?)",
          instruction: ur
            ? "Poore hont, sirf nichla hont, honton ke konay (corners) ya outer border?"
            : "Is it across both lips, lower lip mostly, lip corners only, or around the lip border?",
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
          label: "Box 5 — Daily Lip Triggers (Aadat, dhoop aur toothpaste/cosmetics)",
          instruction: ur
            ? "Lip licking, dhoop baghair SPF, matte lipstick, mint toothpaste ya chai/smoking?"
            : "Which daily habits like lip licking, sun without SPF, matte lipstick, or hot tea worsen it?",
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
          label: "Box 6 — Past Lip Products & DIY Remedies (Pehle aur abhi kya lagaya?)",
          instruction: ur
            ? "Lip balm, Vaseline, lipstick, ya lemon / sugar scrub / toothpaste waghera likhein."
            : "List every lip balm, gloss, lipstick, or DIY remedy (lemon, sugar scrub, baking soda, toothpaste) used.",
          chips: [
            "Used Lemon / Sugar Scrub / Toothpaste",
            "Using Plain Vaseline Only",
            "Tried Flavored / Tinted Lip Balms",
            "Used Whitening / Steroid Cream on Lips",
            "Nothing Applied Yet",
          ],
          placeholder:
            "e.g. Vaseline ya flavored lip balm use kiya, ya lemon/sugar scrub lagaya tha...",
        },
        {
          id: "skin-box-family",
          label: "Box 7 — Dehydration, Vitamins & Meds (Paani, khoon ki kami ya dawai)",
          instruction: ur
            ? "Kam paani peena, iron/B12 ki kami, mouth breathing, ya Isotretinoin (Accutane) chal rahi ho?"
            : "Mention low water intake, anemia/iron or Vitamin B12 deficiency, eczema, or oral Isotretinoin/Retinoids.",
          chips: [
            "Low Water Intake / Dehydration",
            "Iron / Vitamin B12 Deficiency",
            "On Isotretinoin / Acne Meds",
            "History of Cold Sores / Fever Blisters",
            "None",
          ],
          placeholder:
            "e.g. Paani kam peena, iron/B12 deficiency, ya acne capsule (Isotretinoin) chal rahi hai...",
          fullWidth: true,
        },
      ],
    };
  }

  if (bodyArea === "Hands & Nails") {
    return {
      headingEn: "7-Point Hands & Nails Check (Tap Quick Chips or Type)",
      headingUr: "Hands & Nails Ke Liye 7 Khas Sawalat (Quick Chips Ya Likhein)",
      boxes: [
        {
          id: "skin-box-duration",
          label: "Box 1 — Duration (Kitne time se hai?)",
          instruction: ur
            ? "Haathon ki khushki, cracks ya nakhun ka masla kitne time se hai?"
            : "How long have you had these hand skin or nail changes?",
          chips: ["Few Days", "2–6 Weeks", "Months / Years", "Worse in Winter"],
          placeholder:
            "e.g. 2 months se haathon ki skin dry aur phati hui hai, ya nails peele aur kamzor hain...",
        },
        {
          id: "skin-box-sensation",
          label: "Box 2 — Hand & Nail Sensation (Haath ya nakhun mein kaisa feel hota hai?)",
          instruction: ur
            ? "Kya kharish, cracks mein jalan, ya nakhun ke aas paas dard/soojan hai?"
            : "Do your hands itch, sting with soap, or throb around the nail fold?",
          chips: [
            "Itchy / Kharish",
            "Painful Cracks / Stinging",
            "Throbbing Around Nail Fold",
            "No Pain / Just Rough",
          ],
          placeholder:
            "e.g. Sabun lagane par jalan hoti hai, ya ungliyon ke beech raat ko kharish hoti hai...",
        },
        {
          id: "skin-box-texture",
          label: "Box 3 — Skin & Nail Texture (Jild aur nakhun kaise lagte hain?)",
          instruction: ur
            ? "Haathon ki khushki, pani wale daane, ya motay/peele/toot'tay nakhun batayein."
            : "Describe palm peeling, side-finger blisters, knuckle darkening, or thick/brittle nails.",
          chips: [
            "Dry / Rough / Peeling Palms",
            "Tiny Itchy Side-Finger Blisters",
            "Dark Knuckles",
            "Thick / Yellow / Crumbly Nails",
            "Brittle / Splitting Nails",
          ],
          placeholder:
            "e.g. Ungliyon ke sides par chotay pani wale daane hain, ya nails motay aur yellow ho rahe hain...",
        },
        {
          id: "skin-box-spreading",
          label: "Box 4 — Area & Spread (Kahan kahan aur kaise phail raha hai?)",
          instruction: ur
            ? "Ungliyon ke beech, hatheli, knuckles ya kitne nakhun par asar hai?"
            : "Where on your hands or nails is it located?",
          chips: [
            "Finger Webs / Sides",
            "Back of Hands & Knuckles",
            "Palms Only",
            "1–2 Nails Only",
            "All Nails",
          ],
          placeholder:
            "e.g. Ungliyon ke beech aur kalai par hai, ya sirf pairon/haathon ke 2 nails kharab hain...",
        },
        {
          id: "skin-box-triggers",
          label: "Box 5 — Daily Hand & Water Triggers (Bartan, detergent ya paani ke triggers)",
          instruction: ur
            ? "Bartan/kapray ka detergent, bore water, sanitizer ya dhoop ka asar?"
            : "Which soaps, bore water, sanitizers, nail acetone, or sun exposure worsen it?",
          chips: [
            "Frequent Dish Soap / Detergent",
            "Hard / Bore Water",
            "Frequent Hand Sanitizer",
            "Gel / Acrylic Nails / Acetone",
            "Sun Exposure (Driving/Bike)",
          ],
          placeholder:
            "e.g. Bartan dhone aur kapray dhone ke detergent se zyada kharab hota hai...",
        },
        {
          id: "skin-box-routine",
          label: "Box 6 — Past & Current Hand / Nail Care (Abhi aur pehle kya lagaya?)",
          instruction: ur
            ? "Pehle aur abhi jo hand cream, antifungal, cuticle oil ya steroid lagaya ho likhein."
            : "Share any hand lotions, cuticle oils, antifungals, or steroid creams applied.",
          chips: [
            "Used Steroid / Whitening Cream",
            "Using Regular Hand Lotion",
            "Applied Cuticle Oil",
            "Nothing Applied Yet",
          ],
          placeholder:
            "e.g. Koi bhi hand cream ya antifungal lagaya ho toh likhein...",
        },
        {
          id: "skin-box-family",
          label: "Box 7 — Family & Health Context (Ghar ya sehat ki maloomat)",
          instruction: ur
            ? "Kya ghar mein kisi aur ko kharish hai ya eczema, iron/biotin ki kami ya diabetes hai?"
            : "Anyone else at home itching, or any eczema, psoriasis, iron/biotin deficiency, or diabetes?",
          chips: [
            "Someone at Home Itching Too",
            "Family Eczema / Psoriasis",
            "Iron / Biotin Deficiency",
            "Diabetes",
            "None",
          ],
          placeholder:
            "e.g. Ghar mein kisi aur ko bhi haathon par kharish hai, ya eczema/iron deficiency hai...",
          fullWidth: true,
        },
      ],
    };
  }

  if (bodyArea === "Feet & Heels") {
    return {
      headingEn: "7-Point Feet & Heels Check (Tap Quick Chips or Type)",
      headingUr: "Feet & Heels Ke Liye 7 Khas Sawalat (Quick Chips Ya Likhein)",
      boxes: [
        {
          id: "skin-box-duration",
          label: "Box 1 — Duration (Kitne time se hai?)",
          instruction: ur
            ? "Eriyon ki sakhti/cracks ya ungliyon ke beech kharish kitne time se hai?"
            : "How long have you had cracked heels, calluses, or itching between toes?",
          chips: [
            "Few Weeks",
            "Months / Years",
            "Worse in Summer / Sweat",
            "Worse in Winter",
          ],
          placeholder:
            "e.g. 1 saal se heels sakht aur phati hui hain, ya 3 weeks se toes ke beech kharish hai...",
        },
        {
          id: "skin-box-sensation",
          label: "Box 2 — Foot & Heel Sensation (Paon aur eriyon mein kaisa mehsoos hota hai?)",
          instruction: ur
            ? "Chalne par dard/khoon, ungliyon mein kharish, garam soojan ya sunn-pan?"
            : "Are cracks painful/bleeding, toes itchy, spot tender, or skin hot/swollen/numb?",
          chips: [
            "Painful / Bleeding Cracks",
            "Intensely Itchy Between Toes",
            "Tender Pressure Spot (Corn)",
            "Hot / Swollen / Red",
            "Hard & Numb / Rough",
          ],
          placeholder:
            "e.g. Chalne par heel cracks mein dard hota hai, ya toes ke beech bohat kharish hai...",
        },
        {
          id: "skin-box-texture",
          label: "Box 3 — Foot & Sole Texture (Talway aur heel ki skin kaisi hai?)",
          instruction: ur
            ? "Sakht peeli callus, gehri cracks, chilka utarna ya geeli safed skin batayein."
            : "Describe hard yellow calluses, deep heel cracks, chalky peeling, or soggy toe-web skin.",
          chips: [
            "Hard / Thickened Yellow Callus",
            "Deep Cracked Heels",
            "Chalky Peeling Whole Sole",
            "Soggy White Skin Between Toes",
            "Hard Grainy Bump (Wart / Corn)",
          ],
          placeholder:
            "e.g. Edi (heel) ki skin bohat sakht aur moti ho gayi hai, ya poora talwa khushk aur chilka utar raha hai...",
        },
        {
          id: "skin-box-spreading",
          label: "Box 4 — Foot Location & Spread (Paon ke kis hissay par hai?)",
          instruction: ur
            ? "Heels, talway ke pressure points, ungliyon ke beech ya sandal strap lines par?"
            : "Where on your feet is the dryness, peeling, bump, or cracking located?",
          chips: [
            "Heels & Back Edge",
            "Ball of Foot / Pressure Points",
            "Between Toes (4th & 5th Toe)",
            "Entire Sole (Moccasin Pattern)",
            "Sandal Strap Marks",
          ],
          placeholder:
            "e.g. Dono heels par cracks hain, ya choti ungliyon ke darmiyan phata hua hai...",
        },
        {
          id: "skin-box-triggers",
          label: "Box 5 — Footwear & Climate Triggers (Jootay, nange paon aur wudu/paseena)",
          instruction: ur
            ? "Nange paon chalna, chappal, tight jootay, wudu ke baad geelay paon ya bore water?"
            : "What footwear, barefoot walking, wet Wudu feet, sweat, or water habits trigger it?",
          chips: [
            "Walking Barefoot at Home",
            "Open-Back Sandals / Slippers",
            "Tight Closed Shoes / Sweaty Socks",
            "Wudu / Frequent Wet Feet",
            "Hard / Bore Water",
          ],
          placeholder:
            "e.g. Ghar mein nange paon chalna, tight shoes pehnna, ya wudu ke baad paon geelay rehna...",
        },
        {
          id: "skin-box-routine",
          label: "Box 6 — Past & Current Foot Care (Abhi aur pehle kya lagaya/use kiya?)",
          instruction: ur
            ? "Pumice stone, blade, Vaseline, urea/foot cream ya steroid cream use ki ho toh batayein."
            : "Mention pumice stones, blades, Vaseline, creams, powders, or steroids already used.",
          chips: [
            "Used Pumice Stone / Blade",
            "Applied Vaseline / Cream",
            "Used Steroid Cream",
            "Nothing Applied Yet",
          ],
          placeholder:
            "e.g. Pehle koi foot cream, antifungal powder, ya blade/pumice stone use kiya ho toh likhein...",
        },
        {
          id: "skin-box-family",
          label: "Box 7 — Diabetes & Health Red Flags (CRITICAL)",
          instruction: ur
            ? "Agar diabetes, paon sunn rehna (numbness) ya kharab circulation hai toh laazmi select karein."
            : "CRITICAL SAFETY CHECK: Always disclose diabetes, foot numbness/tingling, poor circulation, or fungal nails.",
          chips: [
            "Diabetes / High Sugar",
            "Foot Numbness / Tingling",
            "Poor Circulation",
            "Fungal Nails Too",
            "None",
          ],
          placeholder:
            "e.g. Agar diabetes hai ya paon sunn (numb) rehte hain toh zaroor likhein...",
          fullWidth: true,
        },
      ],
    };
  }

  if (bodyArea === "Other Body Area") {
    return {
      headingEn: "7-Point General Body Check (Tap Quick Chips or Type)",
      headingUr: "Is Hissay Ke Liye 7 Aam Sawalat (Quick Chips Ya Likhein)",
      boxes: [
        {
          id: "skin-box-duration",
          label: "Box 1 — Which Body Part & Duration (Kaunsa hissa aur kitne time se hai?)",
          instruction: ur
            ? "Jism ke kis hissay par masla hai aur kitne din/mahine se hai?"
            : "Name the exact body part (ear, abdomen, shoulder, etc.) and how long it has been there.",
          chips: ["Few Days", "2–6 Weeks", "Months / Years", "Comes & Goes"],
          placeholder:
            "e.g. Kaan ke peeche / kamar / shoulder par 2 weeks se hai...",
        },
        {
          id: "skin-box-sensation",
          label: "Box 2 — Sensation / Feeling (Kya mehsoos hota hai?)",
          instruction: ur
            ? "Kya kharish, dard, jalan, garam soojan ya koi feeling nahi?"
            : "Does this spot feel itchy, tender/painful, burning, hot/swollen, or completely flat?",
          chips: [
            "Itchy / Kharish",
            "Painful / Tender",
            "Burning",
            "Hot / Swollen",
            "No Feeling",
          ],
          placeholder:
            "e.g. Shadeed kharish hai, ya dard / jalan / garam soojan mehsoos hoti hai...",
        },
        {
          id: "skin-box-texture",
          label: "Box 3 — Skin Texture (Chhoone mein kaisa lagta hai?)",
          instruction: ur
            ? "Chhoone par smooth, rough/scaly, ubhre daane, blisters ya moti sakht jild hai?"
            : "What does the surface look and feel like when touched?",
          chips: [
            "Smooth & Flat",
            "Rough / Scaly",
            "Raised Bumps",
            "Blisters / Pus",
            "Thick / Hard",
          ],
          placeholder:
            "e.g. Rough chilke jaisa patch, ubhre hue daane, ya bilkul flat daag hai...",
        },
        {
          id: "skin-box-spreading",
          label: "Box 4 — Spread & Shape (Kaisa nishaan aur phailao hai?)",
          instruction: ur
            ? "Ek chhota spot hai, baahar phail raha hai ya kai patches hain?"
            : "Describe whether it is one small spot, spreading outward, or multiple symmetric patches.",
          chips: [
            "One Small Spot",
            "Spreading Outward",
            "Multiple Patches",
            "Symmetric (Both Sides)",
          ],
          placeholder:
            "e.g. Ek chhota spot hai, baahar ki taraf phail raha hai, ya dono taraf barabar...",
        },
        {
          id: "skin-box-triggers",
          label: "Box 5 — Possible Triggers & Climate (Kin cheezon se barhta hai?)",
          instruction: ur
            ? "Garmi/paseena, tight kapray, naya soap/perfume ya dhoop se barhta hai?"
            : "What sweat, friction, soap/perfume, or sun triggers make it worse?",
          chips: [
            "Sweat / Heat",
            "Tight Clothing / Friction",
            "New Soap / Perfume",
            "Sun Exposure",
            "Not Sure",
          ],
          placeholder:
            "e.g. Paseena, tight kapron ki ragad, naya soap/perfume, ya dhoop se barhta hai...",
        },
        {
          id: "skin-box-routine",
          label: "Box 6 — Past Creams & Current Products (Pehle aur abhi kya lagaya?)",
          instruction: ur
            ? "Jo cream, ointment, soap ya totka is jagah par lagaya ho woh likhein."
            : "Share any cream, ointment, soap, or home remedy already applied to this spot.",
          chips: [
            "Used Steroid / Formula Cream",
            "Using Plain Moisturizer",
            "Used Home Remedy",
            "Nothing Applied Yet",
          ],
          placeholder:
            "List any cream, ointment, soap, or home remedy already applied to this area...",
        },
        {
          id: "skin-box-family",
          label: "Box 7 — Family & Health History (Family aur ghar ki maloomat)",
          instruction: ur
            ? "Family mein eczema/psoriasis, ghar mein kisi aur ko aisi rash, ya diabetes/PCOS?"
            : "Any family eczema/psoriasis, household member with a similar rash, or diabetes/PCOS?",
          chips: [
            "Family Eczema / Psoriasis",
            "Someone at Home Has Similar Rash",
            "Diabetes / PCOS",
            "None",
          ],
          placeholder:
            "e.g. Family mein eczema/psoriasis, ya ghar mein kisi aur ko bhi aisi rash hai...",
          fullWidth: true,
        },
      ],
    };
  }

  return {
    headingEn: `7-Point Clinical Details for ${bodyArea} (Tap Quick Chips or Type)`,
    headingUr: `${bodyArea} Ke Liye 7 Zaroori Sawalat (Quick Chips Ya Likhein)`,
    boxes: [
      {
        id: "skin-box-duration",
        label: "Box 1 — Duration (Kitne time se hai?)",
        instruction: ur
          ? "Yeh masla is jagah par kitne arsay se hai?"
          : "How long has this issue been present on this area?",
        chips: ["Few Days", "2–6 Weeks", "Months / Years", "Comes & Goes"],
        placeholder: areaPlaceholders.duration,
      },
      {
        id: "skin-box-sensation",
        label: "Box 2 — Sensation / Feeling on This Area (Kya mehsoos hota hai?)",
        instruction: ur
          ? "Din ya raat ko is hissay par kaisa mehsoos hota hai?"
          : "What does this spot feel like during the day or at night?",
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
        label: "Box 3 — Describe Texture (Chhoone mein kaisa lagta hai?)",
        instruction: ur
          ? "Chhoone par jild, dane ya bumps kaise lagte hain?"
          : "What does the skin surface or bump feel like to touch?",
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
        label: "Box 4 — Spreading Pattern (Kaise phail raha hai?)",
        instruction: ur
          ? "Yeh kis jagah par hai aur kis tarah phail raha hai?"
          : "Where is it located and how is the pattern spreading?",
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
        label: "Box 5 — Triggers & Current Climate (Kin cheezon se barhta hai?)",
        instruction: ur
          ? "Kis mausam, paani ya aadat ke baad yeh zyada barhta hai?"
          : "Which weather, water, or daily habits make it flare up?",
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
        label:
          "Box 6 — Past Creams & Current Routine / Treatment History (Abhi kya laga rahe ho & pehle kya lagaya?)",
        instruction: ur
          ? "Pehli formula/steroid creams aur abhi ke wash, serum, moisturizer ya sunscreen likhein."
          : "Share past formula/steroid creams AND every wash, serum, moisturizer, or sunscreen you use now.",
        chips: [
          "Used Whitening / Formula Cream",
          "Used Steroid Cream",
          "Using Active Serums",
          "Using Nothing Right Now",
        ],
        placeholder: ur
          ? "Pehle jo formula/steroid creams lagayein aur abhi jo face/body wash, serum, moisturizer, ya sunscreen use karte hain woh likhein..."
          : "List any formula/steroid creams used in the past AND the face/body wash, serum, moisturizer, or sunscreen you currently use...",
      },
      {
        id: "skin-box-family",
        label: "Box 7 — Family & Household History (Ghar ya family mein kisi ko hai?)",
        instruction: ur
          ? "Kya ghar mein kisi aur ko kharish hai ya family mein eczema, psoriasis, diabetes ya PCOS hai?"
          : "Does anyone else at home have itching, or is there family eczema, psoriasis, diabetes, or PCOS?",
        chips: [
          "Family Eczema / Psoriasis",
          "Someone at Home Itching Too",
          "Diabetes / Numbness",
          "PCOS / Hormonal",
          "None",
        ],
        placeholder:
          "e.g. Ghar mein kisi aur ko bhi kharish hai, ya family mein eczema, psoriasis, diabetes, ya PCOS hai...",
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

function ClinicalInputBox({
  id,
  label,
  instruction,
  chips,
  value,
  onChange,
  placeholder,
  rows = 2,
  fullWidth = false,
}: {
  id: string;
  label: string;
  instruction: string;
  chips: readonly string[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  rows?: number;
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
                onClick={() => onChange(appendChipValue(value, chip))}
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
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#E6D2D6] bg-white/95 px-3.5 py-2.5 text-xs leading-relaxed text-[#1E181A] placeholder:text-[#5E5055]/60 transition-all focus:border-[#B56576] focus:ring-2 focus:ring-[#B56576]/15 focus:outline-none"
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
    <div className="min-w-0 space-y-6">
      <TabHeaderIllustration variant="skin" language={language} />

      <PhotoGuideBanner language={language} />

      <div className="min-w-0 space-y-6 overflow-x-hidden rounded-3xl border border-[#EAD8DC] bg-white/85 p-6 shadow-[0_14px_40px_-15px_rgba(181,101,118,0.14)] backdrop-blur-md sm:p-8">
        <div>
          <div className="mb-4 flex min-w-0 items-center justify-between gap-2">
            <h2 className="font-editorial text-2xl font-semibold text-[#1E181A]">
              {language === "ur"
                ? "Step 1: Jism Ka Hissa Chunein"
                : "Step 1: Pick the Area to Check"}
            </h2>
            <span className="shrink-0 rounded-full border border-[#EAD8DC] bg-[#FAF6F7] px-3 py-1 text-xs font-semibold text-[#B56576]">
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
                  className={`inline-flex min-h-[38px] shrink-0 items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                    active
                      ? "bg-gradient-to-b from-[#BF6E7F] to-[#B56576] text-white shadow-[0_6px_16px_-4px_rgba(181,101,118,0.45)]"
                      : "border border-[#E6D2D6] bg-[#FAF6F7]/80 text-[#5E5055] hover:border-[#B56576]/40 hover:bg-[#F6ECEF]"
                  }`}
                >
                  {area === "Lips" && <LipIcon className="h-3.5 w-3.5 shrink-0" />}
                  <span>{area}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-[#EAD8DC] pt-5">
          <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold text-[#1E181A]">
              {language === "ur"
                ? sevenBoxConfig.headingUr
                : sevenBoxConfig.headingEn}
            </p>
            <span className="text-[11px] text-[#5E5055]">
              {language === "ur"
                ? "Hissa badalne par sawal aur misalein khud update hongi"
                : "Questions & examples update automatically for selected area"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sevenBoxConfig.boxes.map((box, index) => (
              <ClinicalInputBox
                key={`${bodyArea}-${box.id}`}
                id={box.id}
                label={box.label}
                instruction={box.instruction}
                chips={box.chips}
                value={boxValues[index]}
                onChange={boxSetters[index]}
                placeholder={box.placeholder}
                fullWidth={box.fullWidth}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="min-w-0 overflow-x-hidden rounded-3xl border border-[#EAD8DC] bg-white/85 p-6 shadow-[0_14px_40px_-15px_rgba(181,101,118,0.14)] backdrop-blur-md sm:p-8">
        <div className="mb-4 flex min-w-0 items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-editorial text-2xl font-semibold text-[#1E181A]">
              {language === "ur"
                ? `Step 2: 1 se ${slots.length} Photos Add Karein`
                : `Step 2: Add 1 to ${slots.length} Photos`}
            </h2>
            <p className="text-xs leading-relaxed text-[#5E5055]">
              {language === "ur"
                ? "Camera ya gallery se saaf close-up photos add karein."
                : `Take or upload 1–${slots.length} clear photos from different angles.`}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-[#EAD8DC] bg-[#FAF6F7] px-3 py-1 text-xs font-bold tabular-nums text-[#B56576]">
            {uploadedList.length}/{slots.length}
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

      <div className="min-w-0 space-y-6 overflow-x-hidden rounded-3xl border border-[#EAD8DC] bg-white/85 p-6 shadow-[0_14px_40px_-15px_rgba(181,101,118,0.14)] backdrop-blur-md sm:p-8">
        <h2 className="font-editorial text-2xl font-semibold text-[#1E181A]">
          {language === "ur"
            ? "Step 3: Apni Skin Aur Paani Ki Details"
            : "Step 3: About Your Skin & Water"}
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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

          <SegmentedSelector
            label={
              language === "ur" ? "Shehar Ka Mausam" : "Weather"
            }
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

        <button
          type="button"
          disabled={isScanning}
          aria-busy={isScanning}
          onClick={handleRunScan}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#BF6E7F] to-[#B56576] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(181,101,118,0.55)] transition-all hover:-translate-y-0.5 hover:from-[#B56576] hover:to-[#9E5263] active:scale-95 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60"
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
