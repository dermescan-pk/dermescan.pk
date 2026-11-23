import {
  JENPHARM_AFFILIATES,
  findJenpharmAffiliate,
  getJenpharmAffiliateUrl,
  type JenpharmAffiliateItem,
} from "./jenpharmAffiliates.ts";

export {
  JENPHARM_AFFILIATES,
  findJenpharmAffiliate,
  getJenpharmAffiliateUrl,
  type JenpharmAffiliateItem,
};

export type VerifiedAffiliateBrand = "Jenpharm" | "AccuFix Cosmetics";

export interface VerifiedAffiliateItem {
  id: string;
  brand: VerifiedAffiliateBrand;
  productName: string;
  scope: "skin" | "hair" | "lips" | "body";
  subCategory: string;
  approxPricePkr: string;
  clinicalIndication: string;
  keywords: readonly string[];
  affiliateUrl: string;
}

export const ACCUFIX_AFFILIATES: readonly VerifiedAffiliateItem[] = [
  {
    id: "accufix-salicylic-acid-cleanser",
    brand: "AccuFix Cosmetics",
    productName: "AccuFix Salicylic Acid Cleanser",
    scope: "skin",
    subCategory: "BHA Acne Cleanser",
    approxPricePkr: "PKR 1,150 – 1,450",
    clinicalIndication:
      "Oily skin, blackheads, whiteheads, and active acne needing gentle daily BHA pore clearing",
    keywords: ["accufix salicylic acid cleanser", "salicylic acid cleanser"],
    affiliateUrl: "https://s.daraz.pk/s.2hztP",
  },
  {
    id: "accufix-hydrating-gentle-cleanser",
    brand: "AccuFix Cosmetics",
    productName: "AccuFix Hydrating Gentle Cleanser",
    scope: "skin",
    subCategory: "Barrier-Safe Face Wash",
    approxPricePkr: "PKR 1,100 – 1,350",
    clinicalIndication:
      "Dry, sensitive, rosacea-prone, or post-steroid damaged skin barrier needing non-stripping cleansing",
    keywords: ["accufix hydrating gentle cleanser", "hydrating gentle cleanser"],
    affiliateUrl: "https://s.daraz.pk/s.2hzEl",
  },
  {
    id: "accufix-glycolic-acid-toner",
    brand: "AccuFix Cosmetics",
    productName: "AccuFix Glycolic Acid Toner",
    scope: "skin",
    subCategory: "AHA Resurfacing Toner",
    approxPricePkr: "PKR 1,250 – 1,550",
    clinicalIndication:
      "Rough texture, dullness, post-acne dark marks, and mild neck/underarm darkening (2-3x/week PM only)",
    keywords: ["accufix glycolic acid toner", "glycolic acid toner"],
    affiliateUrl: "https://s.daraz.pk/s.2hzAc",
  },
  {
    id: "accufix-salicylic-acid-serum",
    brand: "AccuFix Cosmetics",
    productName: "AccuFix Salicylic Acid Serum",
    scope: "skin",
    subCategory: "Leave-On BHA Serum",
    approxPricePkr: "PKR 1,450 – 1,750",
    clinicalIndication:
      "Stubborn blackheads, enlarged clogged pores, and recurring oily-zone breakouts (2-3x/week PM only)",
    keywords: ["accufix salicylic acid serum", "salicylic acid serum"],
    affiliateUrl: "https://s.daraz.pk/s.2hzvw",
  },
  {
    id: "accufix-pimple-patches",
    brand: "AccuFix Cosmetics",
    productName: "AccuFix Pimple Patches",
    scope: "skin",
    subCategory: "Hydrocolloid Spot Patches",
    approxPricePkr: "PKR 650 – 900",
    clinicalIndication:
      "Active whitehead pimples needing sterile overnight pus absorption without picking or scarring",
    keywords: ["accufix pimple patches", "pimple patches", "pimple patch"],
    affiliateUrl: "https://s.daraz.pk/s.2hzC3",
  },
  {
    id: "accufix-dark-lip-treatment-balm",
    brand: "AccuFix Cosmetics",
    productName: "AccuFix Dark Lip Treatment Balm",
    scope: "lips",
    subCategory: "Lip Brightening Balm",
    approxPricePkr: "PKR 1,100 – 1,450",
    clinicalIndication:
      "Dark, pigmented, or sun-tanned lips needing gentle lip-safe brightening (pair with daytime SPF 30 lip balm)",
    keywords: [
      "accufix dark lip treatment balm",
      "dark lip treatment balm",
      "accufix lip brightening balm",
      "dark lip balm",
    ],
    affiliateUrl: "https://s.daraz.pk/s.2hzwT",
  },
  {
    id: "accufix-unscrub-lip-scrub",
    brand: "AccuFix Cosmetics",
    productName: "AccuFix Unscrub Lip Scrub",
    scope: "lips",
    subCategory: "Gentle Lip Polish",
    approxPricePkr: "PKR 950 – 1,250",
    clinicalIndication:
      "Flaky, chapped lip buildup needing non-tearing soothing exfoliation 1-2x/week followed by balm",
    keywords: ["accufix unscrub lip scrub", "unscrub lip scrub", "unscrub"],
    affiliateUrl: "https://s.daraz.pk/s.2hzB4",
  },
  {
    id: "accufix-aha-bha-body-wash",
    brand: "AccuFix Cosmetics",
    productName: "AccuFix AHA BHA Body Wash",
    scope: "body",
    subCategory: "Exfoliating Body Wash",
    approxPricePkr: "PKR 1,450 – 1,800",
    clinicalIndication:
      "Back and chest acne, clogged body pores, keratosis pilaris (strawberry skin), and ingrown bumps",
    keywords: [
      "accufix aha bha body wash",
      "aha bha body wash",
      "aha/bha body wash",
      "aha-bha body wash",
    ],
    affiliateUrl: "https://s.daraz.pk/s.2hzGL",
  },
  {
    id: "accufix-oats-lipid-body-wash",
    brand: "AccuFix Cosmetics",
    productName: "AccuFix Oats and Lipid Hydrating Body Wash",
    scope: "body",
    subCategory: "Soothing Body Wash",
    approxPricePkr: "PKR 1,350 – 1,650",
    clinicalIndication:
      "Dry, itchy, eczema-prone, or hard-water irritated body skin needing soap-free lipid cleansing",
    keywords: [
      "accufix oats and lipid hydrating body wash",
      "oats and lipid hydrating body wash",
      "oats & lipid hydrating body wash",
      "oats and lipid body wash",
    ],
    affiliateUrl: "https://s.daraz.pk/s.2hzyS",
  },
  {
    id: "accufix-salicylic-acid-shampoo",
    brand: "AccuFix Cosmetics",
    productName: "AccuFix Salicylic Acid Shampoo",
    scope: "hair",
    subCategory: "Scalp Exfoliating Shampoo",
    approxPricePkr: "PKR 1,250 – 1,550",
    clinicalIndication:
      "Dry flaky scalp buildup, clogged hair follicles, and mild dandruff (1-2x/week short contact)",
    keywords: [
      "accufix salicylic acid shampoo",
      "salicylic acid shampoo",
      "salicylic acid scalp shampoo",
    ],
    affiliateUrl: "https://s.daraz.pk/s.2hzFS",
  },
  {
    id: "accufix-clarify-rebalance-shampoo",
    brand: "AccuFix Cosmetics",
    productName: "AccuFix Clarify and Rebalance Shampoo",
    scope: "hair",
    subCategory: "Hard-Water Clarifying Shampoo",
    approxPricePkr: "PKR 1,250 – 1,550",
    clinicalIndication:
      "Oily scalp roots, product film, and Pakistani hard/bore-water mineral buildup (1-2x/week)",
    keywords: [
      "accufix clarify and rebalance shampoo",
      "clarify and rebalance shampoo",
      "clarify & rebalance shampoo",
    ],
    affiliateUrl: "https://s.daraz.pk/s.2hzwz",
  },
  {
    id: "accufix-strength-shine-leave-in",
    brand: "AccuFix Cosmetics",
    productName: "AccuFix Strength & Shine Leave-In Conditioner",
    scope: "hair",
    subCategory: "Porosity Leave-In Conditioner",
    approxPricePkr: "PKR 1,350 – 1,650",
    clinicalIndication:
      "Medium and high porosity hair strands needing lightweight detangling, softness, and breakage protection",
    keywords: [
      "accufix strength & shine leave-in conditioner",
      "strength & shine leave-in conditioner",
      "strength and shine leave-in conditioner",
      "strength & shine leave in",
    ],
    affiliateUrl: "https://s.daraz.pk/s.2hzx8",
  },
  {
    id: "accufix-hair-mask",
    brand: "AccuFix Cosmetics",
    productName: "AccuFix Hair Mask",
    scope: "hair",
    subCategory: "Deep Repair Hair Mask",
    approxPricePkr: "PKR 1,550 – 1,850",
    clinicalIndication:
      "Damaged, heat-styled, chemically treated, or high-porosity hair needing weekly deep moisture repair",
    keywords: ["accufix hair mask"],
    affiliateUrl: "https://s.daraz.pk/s.2hzCA",
  },
  {
    id: "accufix-frizz-control-serum",
    brand: "AccuFix Cosmetics",
    productName: "AccuFix Frizz Control Serum",
    scope: "hair",
    subCategory: "Smoothing Ends Serum",
    approxPricePkr: "PKR 1,450 – 1,750",
    clinicalIndication:
      "Frizzy hair ends, humidity flyaways, and dry high-porosity lengths (mid-lengths and ends only)",
    keywords: ["accufix frizz control serum", "frizz control serum"],
    affiliateUrl: "https://s.daraz.pk/s.2hzDI",
  },
];

export const ALL_VERIFIED_AFFILIATES: readonly VerifiedAffiliateItem[] = [
  ...JENPHARM_AFFILIATES.map((item) => ({
    id: item.id,
    brand: "Jenpharm" as const,
    productName: `Jenpharm ${item.productName}`.replace(
      /^Jenpharm Jenpharm /i,
      "Jenpharm "
    ),
    scope: item.scope,
    subCategory: "Dermatologist Formulation",
    approxPricePkr: "Check Pharmacy",
    clinicalIndication: item.clinicalIndication,
    keywords: item.keywords,
    affiliateUrl: item.affiliateUrl,
  })),
  ...ACCUFIX_AFFILIATES,
];

const ACCUFIX_PRIORITY_IDS: readonly string[] = [
  "accufix-dark-lip-treatment-balm",
  "accufix-unscrub-lip-scrub",
  "accufix-aha-bha-body-wash",
  "accufix-oats-lipid-body-wash",
  "accufix-salicylic-acid-shampoo",
  "accufix-clarify-rebalance-shampoo",
  "accufix-strength-shine-leave-in",
  "accufix-hair-mask",
  "accufix-frizz-control-serum",
  "accufix-salicylic-acid-cleanser",
  "accufix-hydrating-gentle-cleanser",
  "accufix-glycolic-acid-toner",
  "accufix-salicylic-acid-serum",
  "accufix-pimple-patches",
];

const ACCUFIX_BY_ID = new Map(
  ACCUFIX_AFFILIATES.map((item) => [item.id, item])
);

const NON_ACCUFIX_KNOWN_BRANDS = [
  "jenpharm",
  "the ordinary",
  "cerave",
  "cetaphil",
  "la roche",
  "bioderma",
  "conatural",
  "primary skin",
  "neue",
  "physiogel",
  "neutrogena",
  "sebamed",
  "garnier",
  "loreal",
  "l oreal",
  "tresemme",
  "dove",
  "pantene",
  "selsun",
  "conaz",
  "nizoral",
  "simple",
  "eucerin",
  "nivea",
  "vaseline",
  "aquaphor",
  "livon",
  "sunplay",
  "skinoren",
] as const;

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const UNIQUE_ACCUFIX_TITLE_PHRASES = [
  "accufix",
  "unscrub",
  "dark lip treatment balm",
  "oats and lipid hydrating body wash",
  "oats and lipid body wash",
  "aha bha body wash",
  "clarify and rebalance shampoo",
  "strength and shine leave in conditioner",
  "hydrating gentle cleanser",
] as const;

function isEligibleAccufixProduct(
  brand: string,
  normCombined: string
): boolean {
  const brandNorm = normalizeText(brand);
  if (brandNorm.includes("accufix")) {
    return true;
  }

  if (
    brandNorm &&
    brandNorm !== "trusted brand" &&
    brandNorm !== "pakistani pharmacy staple" &&
    brandNorm !== "safe pharmacy pick"
  ) {
    return NON_ACCUFIX_KNOWN_BRANDS.every((b) => !brandNorm.includes(b))
      ? normCombined.includes("accufix")
      : false;
  }

  // If brand omitted/generic, prevent hijacking another brand mentioned in name/title
  if (NON_ACCUFIX_KNOWN_BRANDS.some((b) => normCombined.includes(b))) {
    return false;
  }

  return UNIQUE_ACCUFIX_TITLE_PHRASES.some((phrase) =>
    normCombined.includes(phrase)
  );
}

function matchesAccufixItem(
  item: VerifiedAffiliateItem,
  rawCombined: string,
  normCombined: string
): boolean {
  if (normCombined === normalizeText(item.id)) {
    return true;
  }

  for (const kw of item.keywords) {
    const kwLower = kw.toLowerCase();
    const kwNorm = normalizeText(kw);
    if (rawCombined.includes(kwLower) || normCombined.includes(kwNorm)) {
      return true;
    }
  }

  switch (item.id) {
    case "accufix-dark-lip-treatment-balm":
      return (
        normCombined.includes("accufix") &&
        normCombined.includes("lip") &&
        (normCombined.includes("balm") ||
          normCombined.includes("treatment") ||
          normCombined.includes("brightening"))
      );
    case "accufix-unscrub-lip-scrub":
      return (
        normCombined.includes("unscrub") ||
        (normCombined.includes("accufix") && normCombined.includes("lip scrub"))
      );
    case "accufix-aha-bha-body-wash":
      return (
        normCombined.includes("aha") &&
        normCombined.includes("bha") &&
        normCombined.includes("body wash")
      );
    case "accufix-oats-lipid-body-wash":
      return (
        normCombined.includes("oats") &&
        normCombined.includes("lipid") &&
        normCombined.includes("body wash")
      );
    case "accufix-salicylic-acid-shampoo":
      return (
        normCombined.includes("salicylic") && normCombined.includes("shampoo")
      );
    case "accufix-clarify-rebalance-shampoo":
      return (
        normCombined.includes("clarify") &&
        normCombined.includes("rebalance") &&
        normCombined.includes("shampoo")
      );
    case "accufix-strength-shine-leave-in":
      return (
        (normCombined.includes("strength") && normCombined.includes("shine")) ||
        (normCombined.includes("accufix") &&
          normCombined.includes("leave in conditioner"))
      );
    case "accufix-hair-mask":
      return (
        normCombined.includes("accufix") && normCombined.includes("hair mask")
      );
    case "accufix-frizz-control-serum":
      return (
        normCombined.includes("accufix") &&
        normCombined.includes("frizz") &&
        normCombined.includes("serum")
      );
    case "accufix-salicylic-acid-cleanser":
      return (
        normCombined.includes("salicylic") &&
        (normCombined.includes("cleanser") ||
          normCombined.includes("face wash"))
      );
    case "accufix-hydrating-gentle-cleanser":
      return (
        normCombined.includes("hydrating") &&
        normCombined.includes("gentle") &&
        normCombined.includes("cleanser")
      );
    case "accufix-glycolic-acid-toner":
      return (
        normCombined.includes("glycolic") && normCombined.includes("toner")
      );
    case "accufix-salicylic-acid-serum":
      return (
        normCombined.includes("salicylic") &&
        normCombined.includes("serum") &&
        !normCombined.includes("shampoo")
      );
    case "accufix-pimple-patches":
      return (
        normCombined.includes("accufix") && normCombined.includes("pimple patch")
      );
    default:
      return false;
  }
}

export function findAccufixAffiliate(input: {
  brand?: string;
  name?: string;
  title?: string;
  productId?: string;
}): VerifiedAffiliateItem | null {
  const rawCombined = [
    input.brand,
    input.name,
    input.title,
    input.productId,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!rawCombined.trim()) return null;

  const normCombined = normalizeText(rawCombined);

  if (input.productId && ACCUFIX_BY_ID.has(input.productId)) {
    return ACCUFIX_BY_ID.get(input.productId)!;
  }

  if (!isEligibleAccufixProduct(input.brand || "", normCombined)) {
    return null;
  }

  for (const id of ACCUFIX_PRIORITY_IDS) {
    const item = ACCUFIX_BY_ID.get(id);
    if (item && matchesAccufixItem(item, rawCombined, normCombined)) {
      return item;
    }
  }

  return null;
}

export function findVerifiedAffiliate(input: {
  brand?: string;
  name?: string;
  title?: string;
  productId?: string;
}): VerifiedAffiliateItem | null {
  const jenpharmHit = findJenpharmAffiliate(input);
  if (jenpharmHit) {
    return {
      id: jenpharmHit.id,
      brand: "Jenpharm",
      productName: jenpharmHit.productName,
      scope: jenpharmHit.scope,
      subCategory: "Dermatologist Formulation",
      approxPricePkr: "Check Pharmacy",
      clinicalIndication: jenpharmHit.clinicalIndication,
      keywords: jenpharmHit.keywords,
      affiliateUrl: jenpharmHit.affiliateUrl,
    };
  }

  return findAccufixAffiliate(input);
}

export function getVerifiedAffiliateUrl(input: {
  brand?: string;
  name?: string;
  title?: string;
  productId?: string;
}): string {
  return findVerifiedAffiliate(input)?.affiliateUrl || "";
}
