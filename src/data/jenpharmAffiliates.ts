export interface JenpharmAffiliateItem {
  id: string;
  productName: string;
  scope: "skin" | "hair";
  clinicalIndication: string;
  keywords: readonly string[];
  affiliateUrl: string;
}

export const JENPHARM_AFFILIATES: readonly JenpharmAffiliateItem[] = [
  {
    id: "spectra-block-aqua-spf60",
    productName: "Spectra Block Aqua Fluid Sunscreen SPF 60",
    scope: "skin",
    clinicalIndication:
      "Melasma, post-acne dark marks, sun tan, or humid-weather daily UV protection for combination/oily skin",
    keywords: ["spectra block aqua", "aqua fluid"],
    affiliateUrl: "https://s.daraz.pk/s.2TIQk",
  },
  {
    id: "spectra-block-tinted-spf100",
    productName: "Spectra Block Tinted Sunscreen SPF 100",
    scope: "skin",
    clinicalIndication:
      "Melasma, stubborn pigmentation, and visible-light protection without white cast",
    keywords: ["tinted", "spf 100", "spf100"],
    affiliateUrl: "https://s.daraz.pk/s.2TIPT",
  },
  {
    id: "spectramatt-spf50",
    productName: "Spectramatt SPF 50 Sebum Control Gel Sunscreen",
    scope: "skin",
    clinicalIndication:
      "Oily skin, clogged pores, and active acne needing a matte non-comedogenic gel sunscreen",
    keywords: ["spectramatt", "sebum control"],
    affiliateUrl: "https://s.daraz.pk/s.2TILa",
  },
  {
    id: "mandelac-face-wash",
    productName: "MandelAC Face Wash",
    scope: "skin",
    clinicalIndication:
      "Mild texture, whiteheads, and gentle exfoliation (avoid combining with retinol)",
    keywords: ["mandelac face wash", "mandelac facewash"],
    affiliateUrl: "https://s.daraz.pk/s.2TIkW",
  },
  {
    id: "mandelac-serum",
    productName: "MandelAC Serum",
    scope: "skin",
    clinicalIndication:
      "Mild texture, whiteheads, and gentle mandelic exfoliation 2-3x/week PM (never with retinol)",
    keywords: ["mandelac serum"],
    affiliateUrl: "https://s.daraz.pk/s.2TIOE",
  },
  {
    id: "mandelac-cream",
    productName: "MandelAC Cream",
    scope: "skin",
    clinicalIndication:
      "Mild texture, whiteheads, and gentle exfoliating cream 2-3x/week PM (never with retinol)",
    keywords: ["mandelac cream"],
    affiliateUrl: "https://s.daraz.pk/s.2TIMv",
  },
  {
    id: "dermive-oil-free",
    productName: "Dermive Oil-Free Moisturizer (Standard)",
    scope: "skin",
    clinicalIndication:
      "Oily skin, clogged pores, active acne, or fungal acne needing lightweight oil-free hydration",
    keywords: ["dermive oil-free", "dermive oil free"],
    affiliateUrl: "https://s.daraz.pk/s.2TIlW",
  },
  {
    id: "dermive-oil-free-spf20",
    productName: "Dermive Oil-Free Moisturizer SPF 20",
    scope: "skin",
    clinicalIndication:
      "Oily or combination indoor skin needing lightweight oil-free daytime moisture with mild SPF",
    keywords: ["spf 20", "spf20"],
    affiliateUrl: "https://s.daraz.pk/s.2TIJp",
  },
  {
    id: "dermive-oily",
    productName: "Dermive Oily Moisturizer",
    scope: "skin",
    clinicalIndication:
      "Very dry, flaky skin without fungal acne or active clogged pores",
    keywords: ["dermive oily"],
    affiliateUrl: "https://s.daraz.pk/s.2TIok",
  },
  {
    id: "dermive-sensitive",
    productName: "Dermive Sensitive Moisturizer",
    scope: "skin",
    clinicalIndication:
      "Dry, sensitive, eczema-prone, or post-steroid damaged skin barrier",
    keywords: ["dermive sensitive"],
    affiliateUrl: "https://s.daraz.pk/s.2TIN4",
  },
  {
    id: "dermive-moisturizing-face-wash",
    productName: "Dermive Moisturizing Face Wash",
    scope: "skin",
    clinicalIndication:
      "Dry, sensitive, or post-steroid damaged skin barrier needing non-stripping gentle cleansing",
    keywords: ["dermive moisturizing face wash", "dermive face wash"],
    affiliateUrl: "https://s.daraz.pk/s.2TIMM",
  },
  {
    id: "maxdif-skin-brightening-cream",
    productName: "Maxdif Skin Brightening Cream",
    scope: "skin",
    clinicalIndication:
      "Melasma, post-acne dark marks, or sun tan (on intact non-damaged barrier only)",
    keywords: ["maxdif skin brightening cream", "maxdif cream"],
    affiliateUrl: "https://s.daraz.pk/s.2TIlw",
  },
  {
    id: "maxdif-brightening-moisturizer",
    productName: "Maxdif Brightening Moisturizer",
    scope: "skin",
    clinicalIndication:
      "Dullness, sun tan, or post-acne dark marks needing brightening hydration",
    keywords: ["maxdif brightening moisturizer", "maxdif moisturizer"],
    affiliateUrl: "https://s.daraz.pk/s.2TIKD",
  },
  {
    id: "maxdif-serum",
    productName: "Maxdif Serum",
    scope: "skin",
    clinicalIndication:
      "Melasma, stubborn dark spots, or post-acne hyperpigmentation",
    keywords: ["maxdif serum", "max dif serum"],
    affiliateUrl: "https://s.daraz.pk/s.2TILJ",
  },
  {
    id: "cerulic-glow-boosting-serum",
    productName: "Cerulic Glow Boosting Serum",
    scope: "skin",
    clinicalIndication:
      "Sun tan, uneven dull skin tone, or post-acne dark marks",
    keywords: ["cerulic"],
    affiliateUrl: "https://s.daraz.pk/s.2TImG",
  },
  {
    id: "clarevo-salicylic-acid-facewash",
    productName: "Clarevo Salicylic Acid Facewash",
    scope: "skin",
    clinicalIndication:
      "Oily skin, blackheads, clogged pores, and active acne (avoid in pregnancy or damaged barrier)",
    keywords: ["clarevo", "salicylic acid facewash"],
    affiliateUrl: "https://s.daraz.pk/s.2TIqH",
  },
  {
    id: "eternyx-retinol-serum",
    productName: "Eternyx Advanced Retinol Serum (1% Retinol)",
    scope: "skin",
    clinicalIndication:
      "Adult anti-aging and fine lines (PM only 1-2x/week; never with exfoliating acids or in pregnancy/breastfeeding)",
    keywords: ["eternyx", "retinol"],
    affiliateUrl: "https://s.daraz.pk/s.2TIIg",
  },
  {
    id: "anagrow-anti-hair-loss-shampoo",
    productName: "Anagrow Anti Hair Loss Shampoo",
    scope: "hair",
    clinicalIndication:
      "Hair shedding, thinning part, or receding hairline support",
    keywords: ["anagrow anti hair loss shampoo", "anagrow shampoo"],
    affiliateUrl: "https://s.daraz.pk/s.2TIkq",
  },
  {
    id: "anagrow-foamy-hair-growth-serum",
    productName: "Anagrow Foamy Hair Growth Serum",
    scope: "hair",
    clinicalIndication:
      "Hair shedding, widening part, or thinning scalp density support",
    keywords: ["foamy hair growth", "anagrow hair growth serum"],
    affiliateUrl: "https://s.daraz.pk/s.2TIPa",
  },
  {
    id: "anagrow-anti-frizz-serum",
    productName: "Anagrow Anti-Frizz Serum",
    scope: "hair",
    clinicalIndication:
      "High-porosity or frizzy hair mid-lengths and ends only (never on scalp roots)",
    keywords: ["anti-frizz", "antifrizz"],
    affiliateUrl: "https://s.daraz.pk/s.2TIJh",
  },
  {
    id: "jenpharm-rosemary-oil",
    productName: "Jenpharm Rosemary Oil",
    scope: "hair",
    clinicalIndication:
      "Dry scalp pre-wash care ONLY when there is NO dandruff, NO seborrheic flakes, and NO fungal/pimply scalp",
    keywords: ["rosemary oil"],
    affiliateUrl: "https://s.daraz.pk/s.2TIJZ",
  },
  {
    id: "jenpharm-anti-dandruff-drops-serum",
    productName: "Jenpharm Anti-Dandruff Drops Serum",
    scope: "hair",
    clinicalIndication:
      "Dandruff, itchy flakes, or flaky scalp (paired with avoiding raw hair oils on scalp)",
    keywords: ["anti dandruff drops", "anti-dandruff drops"],
    affiliateUrl: "https://s.daraz.pk/s.2TIrX",
  },
];

const JENPHARM_SUBBRAND_TOKENS = [
  "jenpharm",
  "spectra block",
  "spectramatt",
  "spectra matt",
  "mandelac",
  "dermive",
  "maxdif",
  "max dif",
  "cerulic",
  "clarevo",
  "eternyx",
  "anagrow",
] as const;

// Specific items must be evaluated before broader overlapping items (e.g. SPF 20 before standard Oil-Free, Anti-Frizz before general Anagrow serum).
const MATCH_PRIORITY_IDS: readonly string[] = [
  "dermive-oil-free-spf20",
  "dermive-oil-free",
  "dermive-oily",
  "dermive-sensitive",
  "dermive-moisturizing-face-wash",
  "spectra-block-aqua-spf60",
  "spectra-block-tinted-spf100",
  "spectramatt-spf50",
  "mandelac-face-wash",
  "mandelac-serum",
  "mandelac-cream",
  "maxdif-skin-brightening-cream",
  "maxdif-brightening-moisturizer",
  "maxdif-serum",
  "cerulic-glow-boosting-serum",
  "clarevo-salicylic-acid-facewash",
  "eternyx-retinol-serum",
  "anagrow-anti-hair-loss-shampoo",
  "anagrow-anti-frizz-serum",
  "anagrow-foamy-hair-growth-serum",
  "jenpharm-rosemary-oil",
  "jenpharm-anti-dandruff-drops-serum",
];

const AFFILIATE_BY_ID = new Map(
  JENPHARM_AFFILIATES.map((item) => [item.id, item])
);

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isEligibleJenpharmProduct(
  brand: string,
  combinedNormalized: string
): boolean {
  const brandNorm = normalizeText(brand);
  const mentionsJenpharmAnywhere =
    brandNorm.includes("jenpharm") || combinedNormalized.includes("jenpharm");

  if (mentionsJenpharmAnywhere) {
    return true;
  }

  // If an explicit non-Jenpharm brand is provided (and it isn't a generic placeholder),
  // never attach a Jenpharm link to another brand's product (e.g. Livon Anti-Frizz, Organic Traveller Rosemary Oil).
  if (
    brandNorm &&
    brandNorm !== "trusted brand" &&
    brandNorm !== "pakistani pharmacy staple"
  ) {
    return JENPHARM_SUBBRAND_TOKENS.some((tok) => brandNorm.includes(tok));
  }

  // When brand is omitted/generic, only match Jenpharm's trademarked line names.
  return JENPHARM_SUBBRAND_TOKENS.some((tok) =>
    combinedNormalized.includes(tok)
  );
}

function matchesItem(
  item: JenpharmAffiliateItem,
  rawCombined: string,
  normCombined: string
): boolean {
  const compactCombined = normCombined.replace(/\s+/g, "");

  for (const kw of item.keywords) {
    const kwLower = kw.toLowerCase();
    const kwNorm = normalizeText(kw);
    if (rawCombined.includes(kwLower) || normCombined.includes(kwNorm)) {
      return true;
    }
  }

  // Catalog-name & spacing-variant alignment for the exact 22 Jenpharm SKUs
  switch (item.id) {
    case "spectramatt-spf50":
      return (
        compactCombined.includes("spectramatt") ||
        normCombined.includes("spectra matt")
      );
    case "mandelac-face-wash":
      return (
        normCombined.includes("mandelac") && normCombined.includes("wash")
      );
    case "dermive-moisturizing-face-wash":
      return (
        normCombined.includes("dermive") &&
        (normCombined.includes("face wash") ||
          normCombined.includes("facewash"))
      );
    case "maxdif-skin-brightening-cream":
      return (
        (normCombined.includes("maxdif") || normCombined.includes("max dif")) &&
        normCombined.includes("cream")
      );
    case "maxdif-brightening-moisturizer":
      return (
        (normCombined.includes("maxdif") || normCombined.includes("max dif")) &&
        normCombined.includes("moisturizer")
      );
    case "maxdif-serum":
      return (
        (normCombined.includes("maxdif") || normCombined.includes("max dif")) &&
        normCombined.includes("serum")
      );
    case "clarevo-salicylic-acid-facewash":
      return (
        compactCombined.includes("salicylicacidfacewash") &&
        normCombined.includes("jenpharm")
      );
    case "anagrow-anti-hair-loss-shampoo":
      return (
        normCombined.includes("anagrow") && normCombined.includes("shampoo")
      );
    case "anagrow-foamy-hair-growth-serum":
      return (
        normCombined.includes("anagrow") &&
        normCombined.includes("serum") &&
        !normCombined.includes("frizz") &&
        !compactCombined.includes("antifrizz")
      );
    case "anagrow-anti-frizz-serum":
      return (
        normCombined.includes("anti frizz") ||
        compactCombined.includes("antifrizz")
      );
    default:
      return false;
  }
}

export function findJenpharmAffiliate(input: {
  brand?: string;
  name?: string;
  title?: string;
  productId?: string;
}): JenpharmAffiliateItem | null {
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

  if (!isEligibleJenpharmProduct(input.brand || "", normCombined)) {
    return null;
  }

  for (const id of MATCH_PRIORITY_IDS) {
    const item = AFFILIATE_BY_ID.get(id);
    if (item && matchesItem(item, rawCombined, normCombined)) {
      return item;
    }
  }

  return null;
}

export function getJenpharmAffiliateUrl(input: {
  brand?: string;
  name?: string;
  title?: string;
  productId?: string;
}): string {
  return findJenpharmAffiliate(input)?.affiliateUrl || "";
}
