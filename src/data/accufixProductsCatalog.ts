import { ACCUFIX_AFFILIATES } from "./affiliates.ts";

export type CatalogBrandName = "Jenpharm" | "AccuFix Cosmetics";

export type UnifiedGuideCategoryId =
  | "sunblocks"
  | "cleansers"
  | "moisturizers-toners"
  | "serums-creams-patches"
  | "lip-care"
  | "body-washes"
  | "hair-scalp";

export type UnifiedMonographSectionLabel =
  | "Cleansers & Face Washes"
  | "Moisturizers & Toners"
  | "Sunscreens"
  | "Targeted Serums, Creams & Patches"
  | "Lip Care"
  | "Body Washes"
  | "Hair & Scalp Treatments";

export type ExtendedBottleKind =
  | "tube"
  | "serum"
  | "jar"
  | "wash"
  | "shampoo"
  | "drops"
  | "toner"
  | "patch"
  | "lip"
  | "mask";

export interface UnifiedProductMonograph {
  order: number;
  brand: CatalogBrandName;
  affiliateId: string;
  slug: string;
  name: string;
  guideCategory: UnifiedGuideCategoryId;
  monographSection: UnifiedMonographSectionLabel;
  imagePath: string;
  affiliateUrl: string;
  bottleKind: ExtendedBottleKind;
  suitsWhomLabel:
    | "Suits Whom & Skin Type"
    | "Suits Whom & Lip Type"
    | "Suits Whom & Body Skin Type"
    | "Suits Whom & Scalp/Hair Type";
  suitsWhom: string;
  bestFor: string;
  keyPerks: string;
  whoShouldAvoid: string;
  couldCause: string;
}

const ACCUFIX_URL_BY_ID = new Map<string, string>(
  ACCUFIX_AFFILIATES.map((item) => [item.id, item.affiliateUrl])
);

function accufixUrl(affiliateId: string, fallbackUrl: string): string {
  return ACCUFIX_URL_BY_ID.get(affiliateId) || fallbackUrl;
}

export const ACCUFIX_PRODUCTS_CATALOG: readonly UnifiedProductMonograph[] = [
  {
    order: 23,
    brand: "AccuFix Cosmetics",
    affiliateId: "accufix-salicylic-acid-cleanser",
    slug: "accufix-salicylic-acid-cleanser",
    name: "AccuFix Salicylic Acid Cleanser",
    guideCategory: "cleansers",
    monographSection: "Cleansers & Face Washes",
    imagePath: "/products/accufix-salicylic-acid-cleanser.jpg",
    affiliateUrl: accufixUrl(
      "accufix-salicylic-acid-cleanser",
      "https://s.daraz.pk/s.2hztP"
    ),
    bottleKind: "wash",
    suitsWhomLabel: "Suits Whom & Skin Type",
    suitsWhom:
      "Oily, combination, and acne-prone facial skin types dealing with midday shine and congested pores.",
    bestFor:
      "Blackheads, whiteheads, T-zone congestion, and recurring inflammatory pimples in humid weather.",
    keyPerks:
      "Formulated with oil-soluble Salicylic Acid (BHA) in a gentle sulfate-free wash base to dissolve trapped sebum inside pores without leaving skin feeling tight.",
    whoShouldAvoid:
      "Dry, flaking, eczema-prone, or post-steroid thinned skin barriers, or anyone currently peeling from prescription retinoids.",
    couldCause:
      "Mild dryness around the nose and mouth corners or initial purging if used twice daily alongside strong leave-on exfoliating acids.",
  },
  {
    order: 24,
    brand: "AccuFix Cosmetics",
    affiliateId: "accufix-hydrating-gentle-cleanser",
    slug: "accufix-hydrating-gentle-cleanser",
    name: "AccuFix Hydrating Gentle Cleanser",
    guideCategory: "cleansers",
    monographSection: "Cleansers & Face Washes",
    imagePath: "/products/accufix-hydrating-gentle-cleanser.jpg",
    affiliateUrl: accufixUrl(
      "accufix-hydrating-gentle-cleanser",
      "https://s.daraz.pk/s.2hzEl"
    ),
    bottleKind: "wash",
    suitsWhomLabel: "Suits Whom & Skin Type",
    suitsWhom:
      "Dry, dehydrated, sensitive, rosacea-prone, and combination skin needing a calm everyday cleanser.",
    bestFor:
      "Post-steroid barrier recovery, winter tightness, retinoid/isotretinoin dryness, and morning cleansing for all skin types.",
    keyPerks:
      "Fragrance-free, non-foaming soothing gel-lotion wash that removes sweat and daily dirt while protecting natural skin lipids.",
    whoShouldAvoid:
      "Very oily skin expecting a deep squeaky-clean lather or heavy waterproof makeup removal without a first-step micellar cleanser.",
    couldCause:
      "Minimal risk of irritation; may leave a lightly cushioned feel that ultra-oily skin users prefer to reserve for morning washes.",
  },
  {
    order: 25,
    brand: "AccuFix Cosmetics",
    affiliateId: "accufix-glycolic-acid-toner",
    slug: "accufix-glycolic-acid-toner",
    name: "AccuFix Glycolic Acid Toner",
    guideCategory: "moisturizers-toners",
    monographSection: "Moisturizers & Toners",
    imagePath: "/products/accufix-glycolic-acid-toner.jpg",
    affiliateUrl: accufixUrl(
      "accufix-glycolic-acid-toner",
      "https://s.daraz.pk/s.2hzAc"
    ),
    bottleKind: "toner",
    suitsWhomLabel: "Suits Whom & Skin Type",
    suitsWhom:
      "Normal, oily, combination, and sun-tanned skin ready for a night resurfacing AHA toner.",
    bestFor:
      "Dullness, rough bumpy texture, lingering post-acne marks, and non-sensitive neck or underarm darkening (2-3 nights a week).",
    keyPerks:
      "Glycolic Acid loosens dead surface skin buildup smoothly to brighten tone and refine texture without abrasive physical scrubs.",
    whoShouldAvoid:
      "Sensitive, rosacea-prone, actively peeling, or barrier-damaged skin, and never apply immediately after shaving or waxing underarms.",
    couldCause:
      "Redness, stinging, or sun sensitivity if overused nightly, layered with Retinol, or paired with skipped daytime sunscreen.",
  },
  {
    order: 26,
    brand: "AccuFix Cosmetics",
    affiliateId: "accufix-salicylic-acid-serum",
    slug: "accufix-salicylic-acid-serum",
    name: "AccuFix Salicylic Acid Serum",
    guideCategory: "serums-creams-patches",
    monographSection: "Targeted Serums, Creams & Patches",
    imagePath: "/products/accufix-salicylic-acid-serum.jpg",
    affiliateUrl: accufixUrl(
      "accufix-salicylic-acid-serum",
      "https://s.daraz.pk/s.2hzvw"
    ),
    bottleKind: "serum",
    suitsWhomLabel: "Suits Whom & Skin Type",
    suitsWhom:
      "Oily, congested, and acne-prone skin types that need targeted leave-on pore decongestion.",
    bestFor:
      "Stubborn nose blackheads, closed comedones along the forehead and chin, and swollen clogged pores.",
    keyPerks:
      "Penetrates oil-filled pores deeply to clear hardened plugs and calm redness faster than rinse-off washes alone.",
    whoShouldAvoid:
      "Dry or eczema-prone skin, compromised barriers, pregnancy/breastfeeding if avoiding leave-on BHA, and nights when Retinol or AHA is applied.",
    couldCause:
      "Flaking, barrier irritation, or temporary purging if applied every night or combined with multiple acne acids.",
  },
  {
    order: 27,
    brand: "AccuFix Cosmetics",
    affiliateId: "accufix-pimple-patches",
    slug: "accufix-pimple-patches",
    name: "AccuFix Pimple Patches",
    guideCategory: "serums-creams-patches",
    monographSection: "Targeted Serums, Creams & Patches",
    imagePath: "/products/accufix-pimple-patches.jpg",
    affiliateUrl: accufixUrl(
      "accufix-pimple-patches",
      "https://s.daraz.pk/s.2hzC3"
    ),
    bottleKind: "patch",
    suitsWhomLabel: "Suits Whom & Skin Type",
    suitsWhom:
      "All skin types (safe for sensitive and acne-prone skin alike) needing spot protection on surfaced pimples.",
    bestFor:
      "Whitehead pimples with visible fluid and stopping fingers from picking or squeezing spots (which prevents dark marks).",
    keyPerks:
      "Medical-grade hydrocolloid seals the blemish, gently absorbs excess fluid overnight, and shields bacteria and dust from the healing pore.",
    whoShouldAvoid:
      "Deep under-the-skin blind cysts with no head, or open bleeding skin coated in thick creams (apply strictly on clean dry skin).",
    couldCause:
      "Very rare mild adhesive redness if peeled off aggressively instead of lifting gently after showering.",
  },
  {
    order: 28,
    brand: "AccuFix Cosmetics",
    affiliateId: "accufix-dark-lip-treatment-balm",
    slug: "accufix-dark-lip-treatment-balm",
    name: "AccuFix Dark Lip Treatment Balm",
    guideCategory: "lip-care",
    monographSection: "Lip Care",
    imagePath: "/products/accufix-dark-lip-treatment-balm.jpg",
    affiliateUrl: accufixUrl(
      "accufix-dark-lip-treatment-balm",
      "https://s.daraz.pk/s.2hzwT"
    ),
    bottleKind: "lip",
    suitsWhomLabel: "Suits Whom & Lip Type",
    suitsWhom:
      "Pigmented, dry, dull, or sun-exposed lips looking for lip-safe tone brightening without harsh facial acids.",
    bestFor:
      "Uneven lip darkening from sun exposure, tea/coffee/smoking staining, or post-chapping lip hyperpigmentation.",
    keyPerks:
      "Combines soothing barrier emollients with lip-safe gentle brighteners to soften dry lines while gradually evening lip tone.",
    whoShouldAvoid:
      "Cracked bleeding lip corners (angular cheilitis), active cold sores/blisters, or known sensitivity to balm actives; always layer SPF lip balm outdoors.",
    couldCause:
      "Minimal irritation on intact lips; brightening stalls if worn outdoors in Pakistani sunlight without daytime UV protection.",
  },
  {
    order: 29,
    brand: "AccuFix Cosmetics",
    affiliateId: "accufix-unscrub-lip-scrub",
    slug: "accufix-unscrub-lip-scrub",
    name: "AccuFix Unscrub Lip Scrub",
    guideCategory: "lip-care",
    monographSection: "Lip Care",
    imagePath: "/products/accufix-unscrub-lip-scrub.jpg",
    affiliateUrl: accufixUrl(
      "accufix-unscrub-lip-scrub",
      "https://s.daraz.pk/s.2hzB4"
    ),
    bottleKind: "lip",
    suitsWhomLabel: "Suits Whom & Lip Type",
    suitsWhom:
      "Flaky, textured, or lipstick-drying lips that need gentle surface smoothing without jagged sugar tears.",
    bestFor:
      "Peeling winter lip skin and stubborn dry flakes before applying overnight healing balm or lip treatment.",
    keyPerks:
      "Designed as a gentle, non-abrasive " +
      '"unscrub" polish that lifts loose dead flakes smoothly while cushioning thin lip mucosa in nourishing oils.',
    whoShouldAvoid:
      "Raw, cracked, bleeding lips, angular cheilitis, or cold sores; limit gently to 1-2 times a week so lip pigment does not rebound.",
    couldCause:
      "Soreness or rebound lip darkening if rubbed forcefully every day instead of light weekly smoothing.",
  },
  {
    order: 30,
    brand: "AccuFix Cosmetics",
    affiliateId: "accufix-aha-bha-body-wash",
    slug: "accufix-aha-bha-body-wash",
    name: "AccuFix AHA BHA Body Wash",
    guideCategory: "body-washes",
    monographSection: "Body Washes",
    imagePath: "/products/accufix-aha-bha-body-wash.jpg",
    affiliateUrl: accufixUrl(
      "accufix-aha-bha-body-wash",
      "https://s.daraz.pk/s.2hzGL"
    ),
    bottleKind: "wash",
    suitsWhomLabel: "Suits Whom & Body Skin Type",
    suitsWhom:
      "Acne-prone, sweaty, rough, or bumpy body skin on the back, chest, shoulders, upper arms, and legs.",
    bestFor:
      "Back and chest acne (bacne), keratosis pilaris (strawberry skin), ingrown hair bumps, and rough body texture.",
    keyPerks:
      "Pairs surface-smoothing AHAs with pore-clearing BHA (Salicylic Acid) to unclog body hair follicles when left on skin for 1-2 minutes before rinsing.",
    whoShouldAvoid:
      "Eczema flares, very dry/cracked winter body skin, broken skin right after shaving/waxing, or delicate facial skin.",
    couldCause:
      "Dryness or mild stinging if used on freshly shaved skin or sensitive creases; follow with a light non-comedogenic lotion on dry areas.",
  },
  {
    order: 31,
    brand: "AccuFix Cosmetics",
    affiliateId: "accufix-oats-lipid-body-wash",
    slug: "accufix-oats-lipid-body-wash",
    name: "AccuFix Oats and Lipid Hydrating Body Wash",
    guideCategory: "body-washes",
    monographSection: "Body Washes",
    imagePath: "/products/accufix-oats-lipid-body-wash.jpg",
    affiliateUrl: accufixUrl(
      "accufix-oats-lipid-body-wash",
      "https://s.daraz.pk/s.2hzyS"
    ),
    bottleKind: "wash",
    suitsWhomLabel: "Suits Whom & Body Skin Type",
    suitsWhom:
      "Dry, itchy, eczema-prone, and sensitive body skin exposed to harsh borehole/hard water or winter dryness.",
    bestFor:
      "Hard-water body tightness, soothing rough dry arms and legs, and post-shower itchiness from fragranced soaps.",
    keyPerks:
      "Colloidal oat extracts and skin-identical lipids cleanse sweat and dust gently while leaving a calm, cushioned moisture barrier.",
    whoShouldAvoid:
      "Active cystic back acne needing targeted BHA exfoliation (use AHA BHA Body Wash on breakouts instead).",
    couldCause:
      "Very low irritation profile; rinse cleanly off bath floors as hydrating lipid washes can feel slightly slick.",
  },
  {
    order: 32,
    brand: "AccuFix Cosmetics",
    affiliateId: "accufix-salicylic-acid-shampoo",
    slug: "accufix-salicylic-acid-shampoo",
    name: "AccuFix Salicylic Acid Shampoo",
    guideCategory: "hair-scalp",
    monographSection: "Hair & Scalp Treatments",
    imagePath: "/products/accufix-salicylic-acid-shampoo.jpg",
    affiliateUrl: accufixUrl(
      "accufix-salicylic-acid-shampoo",
      "https://s.daraz.pk/s.2hzFS"
    ),
    bottleKind: "shampoo",
    suitsWhomLabel: "Suits Whom & Scalp/Hair Type",
    suitsWhom:
      "Flaky, dandruff-prone, congested, or low-porosity scalps needing 1-2x weekly buildup removal.",
    bestFor:
      "Stuck scalp flakes, mild seborrheic buildup, itchy clogged roots, and scalp bumps/folliculitis.",
    keyPerks:
      "Salicylic Acid gently exfoliates packed dead skin and oil plugs off the scalp surface in 3-5 minutes without harsh coal-tar odor.",
    whoShouldAvoid:
      "Raw scratched scalp sores, pregnancy/breastfeeding if avoiding high-dose BHA scalp products, or daily use (rotate with a gentle hydrating shampoo).",
    couldCause:
      "Dry, rough hair lengths if applied every wash without rotating a hydrating shampoo and conditioning mid-lengths and ends.",
  },
  {
    order: 33,
    brand: "AccuFix Cosmetics",
    affiliateId: "accufix-clarify-rebalance-shampoo",
    slug: "accufix-clarify-rebalance-shampoo",
    name: "AccuFix Clarify and Rebalance Shampoo",
    guideCategory: "hair-scalp",
    monographSection: "Hair & Scalp Treatments",
    imagePath: "/products/accufix-clarify-rebalance-shampoo.jpg",
    affiliateUrl: accufixUrl(
      "accufix-clarify-rebalance-shampoo",
      "https://s.daraz.pk/s.2hzwz"
    ),
    bottleKind: "shampoo",
    suitsWhomLabel: "Suits Whom & Scalp/Hair Type",
    suitsWhom:
      "Oily scalps, limp low-porosity roots, and hair exposed to Pakistani hard or bore water.",
    bestFor:
      "Removing mineral calcium film from hard water, heavy hair oil residue, and greasy second-day roots (1-2x/week).",
    keyPerks:
      "Resets scalp oil balance and lifts dulling hard-water residue cleanly so hydrating conditioners and serums absorb properly.",
    whoShouldAvoid:
      "Very dry, bleached, or brittle high-porosity strands washed daily without conditioner/mask rotation.",
    couldCause:
      "Slight strand dryness if overused every day instead of 1-2 clarifying washes rotated with a moisturizing shampoo.",
  },
  {
    order: 34,
    brand: "AccuFix Cosmetics",
    affiliateId: "accufix-strength-shine-leave-in",
    slug: "accufix-strength-shine-leave-in",
    name: "AccuFix Strength & Shine Leave-In Conditioner",
    guideCategory: "hair-scalp",
    monographSection: "Hair & Scalp Treatments",
    imagePath: "/products/accufix-strength-shine-leave-in.jpg",
    affiliateUrl: accufixUrl(
      "accufix-strength-shine-leave-in",
      "https://s.daraz.pk/s.2hzx8"
    ),
    bottleKind: "tube",
    suitsWhomLabel: "Suits Whom & Scalp/Hair Type",
    suitsWhom:
      "Medium and high porosity, wavy, curly, and tangle-prone hair lengths (use sparingly on fine low-porosity hair).",
    bestFor:
      "Post-wash detangling, reducing comb breakage, and keeping damp lengths soft between washes.",
    keyPerks:
      "Lightweight slip-rich conditioning blend coats hair cuticles cleanly to prevent split ends and hard-water stiffness without sticky waxiness.",
    whoShouldAvoid:
      "Do NOT apply directly onto oily or dandruff-prone scalp roots; keep strictly from ears down to ends.",
    couldCause:
      "Weighed-down roots or flatness on fine low-porosity hair if too much product is applied near the crown.",
  },
  {
    order: 35,
    brand: "AccuFix Cosmetics",
    affiliateId: "accufix-hair-mask",
    slug: "accufix-hair-mask",
    name: "AccuFix Hair Mask",
    guideCategory: "hair-scalp",
    monographSection: "Hair & Scalp Treatments",
    imagePath: "/products/accufix-hair-mask.jpg",
    affiliateUrl: accufixUrl("accufix-hair-mask", "https://s.daraz.pk/s.2hzCA"),
    bottleKind: "mask",
    suitsWhomLabel: "Suits Whom & Scalp/Hair Type",
    suitsWhom:
      "High-porosity, dry, heat-styled, bleached, or coarse hair mid-lengths and ends.",
    bestFor:
      "Straw-like dryness, split-end roughness, dye damage, and weekly deep moisture replenishment.",
    keyPerks:
      "Rich conditioning lipids and strand-softening actives restore elasticity and slip in 5-10 minutes during wash day.",
    whoShouldAvoid:
      "Low-porosity hair roots or dandruff scalps (apply strictly to mid-lengths and ends, never on scalp skin).",
    couldCause:
      "Heavy buildup or limp hair if left un-rinsed or applied generously on fine low-porosity hair.",
  },
  {
    order: 36,
    brand: "AccuFix Cosmetics",
    affiliateId: "accufix-frizz-control-serum",
    slug: "accufix-frizz-control-serum",
    name: "AccuFix Frizz Control Serum",
    guideCategory: "hair-scalp",
    monographSection: "Hair & Scalp Treatments",
    imagePath: "/products/accufix-frizz-control-serum.jpg",
    affiliateUrl: accufixUrl(
      "accufix-frizz-control-serum",
      "https://s.daraz.pk/s.2hzDI"
    ),
    bottleKind: "serum",
    suitsWhomLabel: "Suits Whom & Scalp/Hair Type",
    suitsWhom:
      "High and medium porosity, frizzy, heat-styled, and humidity-prone hair lengths and ends.",
    bestFor:
      "Monsoon humidity frizz, flyaways, heat-tool dryness, and sealing split-prone hair ends.",
    keyPerks:
      "Smooths raised cuticles with 1-2 drops on damp or dry ends to lock moisture inside the shaft and boost glossy shine.",
    whoShouldAvoid:
      "Strictly avoid applying onto the scalp/roots, especially with dandruff, oily scalp, or fine low-porosity hair.",
    couldCause:
      "Greasy strings or clumped curls if more than 1-3 drops are used on thin hair.",
  },
];
