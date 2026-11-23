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
      "Oily T-zone, combination, and acne-prone facial skin dealing with daytime shine and humid pore congestion.",
    bestFor:
      "Active inflammatory pimples, blackheads, whiteheads, and humid-weather pore congestion.",
    keyPerks:
      "Oil-soluble 2% Salicylic Acid (BHA) penetrates deep into sebum-filled pores to dissolve oil plugs, reduce blackheads, and calm acne breakouts.",
    whoShouldAvoid:
      "Dry, flaking, rosacea-prone, or post-steroid damaged skin barriers, or skin currently peeling from prescription retinoids.",
    couldCause:
      "Mild dryness around the nose and mouth corners if used twice daily alongside strong leave-on exfoliating acids.",
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
      "Red, peeling, tight/dry, eczema-prone, rosacea-prone, and post-steroid recovering skin types.",
    bestFor:
      "Barrier recovery after whitening/formula creams, morning gentle cleansing, and soothing alongside prescription acne treatments.",
    keyPerks:
      "Soap-free, pH-balanced non-stripping wash that cleanses gently while protecting and rebuilding a damaged lipid barrier.",
    whoShouldAvoid:
      "Very oily skin wanting a heavy foaming wash or waterproof makeup removal without a first-step micellar cleanser.",
    couldCause:
      "Minimal risk of irritation; safe as the default morning and barrier-recovery cleanser for sensitive skin.",
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
      "Intact normal, oily, and sun-tanned facial or body skin ready for 2-3 nights per week AHA resurfacing.",
    bestFor:
      "Dull skin tone, stubborn sun tan, rough bumpy texture, dark underarms/elbows/knees, and body keratosis pilaris (strawberry skin).",
    keyPerks:
      "Water-soluble AHA surface exfoliation used strictly 2-3 nights per week to fade surface pigmentation and smooth rough texture.",
    whoShouldAvoid:
      "Active cystic acne, broken/eczema skin, post-steroid damaged barriers, freshly shaved underarms, or the same night as Retinol or Salicylic Acid.",
    couldCause:
      "Burning, redness, or rebound tanning if overused nightly, mixed with Retinol/BHA, or paired without mandatory daily SPF 50+ sunscreen.",
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
      "Oily, congested, and acne-prone skin types needing targeted leave-on BHA pore clearing.",
    bestFor:
      "Persistent blackheads, enlarged clogged pores, recurring oily-skin acne, and closed comedones (2-3 nights/week PM on clean dry skin).",
    keyPerks:
      "Leave-on BHA exfoliant applied 2-3 nights per week on clean dry skin to decongest deep pores and prevent recurring breakouts.",
    whoShouldAvoid:
      "Dry or eczema-prone skin, damaged barriers, pregnancy/breastfeeding if avoiding leave-on BHA, and the same night as Glycolic Acid Toner or Eternyx Retinol.",
    couldCause:
      "Flaking, irritation, or barrier dryness if applied every night or layered alongside AHA toners or retinoids.",
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
      "All skin types dealing with isolated surface whiteheads, pustules, or a habit of picking/squeezing pimples.",
    bestFor:
      "Surfaced whiteheads needing overnight fluid absorption and preventing dark post-acne picking marks.",
    keyPerks:
      "Hydrocolloid overnight spot patches absorb pus and fluid cleanly, flatten surfaced pimples faster, and physically prevent picking scars.",
    whoShouldAvoid:
      "Deep under-the-skin blind nodules without a surface head, or oily cream-coated skin (always apply onto clean, dry skin before creams).",
    couldCause:
      "Rare mild adhesive redness if pulled off roughly instead of lifting gently after washing.",
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
      "Pigmented, two-toned dark-bordered, sun/tea/smoking darkened, and chronically dry chapped lips.",
    bestFor:
      "Lip hyperpigmentation, two-toned dark borders, and restoring soft hydrated lip skin safely without facial acids.",
    keyPerks:
      "Targeted pigment-fading and barrier-sealing daily & overnight lip treatment formulated specifically for delicate lip skin.",
    whoShouldAvoid:
      "Active cold sores or bleeding cracked lip corners; never scrub lips with lemon or toothpaste, and always pair with daytime UV lip protection.",
    couldCause:
      "Minimal risk on intact lips; lip tone improvement stalls in direct sun without daytime SPF lip protection.",
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
      "Flaky, peeling, or rough lip skin needing gentle buildup removal before applying balm.",
    bestFor:
      "Lifting dead flaky lip skin safely 1-2 times per week before sealing with a healing lip balm.",
    keyPerks:
      "Gentle non-abrasive chemical and enzymatic lip smoothing used 1-2 times per week without causing micro-tears like harsh sugar scrubs.",
    whoShouldAvoid:
      "Bleeding, raw, cracked, or cold-sore flared lips.",
    couldCause:
      "Soreness or rebound lip darkening if rubbed forcefully daily instead of light 1-2x weekly smoothing.",
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
      "Back, chest, arm, and leg skin prone to bacne, clogged sweat pores, or keratosis pilaris bumps.",
    bestFor:
      "Back acne (bacne), chest pimples, bumpy strawberry skin (KP), and humid-climate body sweat congestion.",
    keyPerks:
      "Dual-acid exfoliating body wash left on skin for 2 minutes in the shower to clear body pores, smooth rough bumps, and fade body acne marks.",
    whoShouldAvoid:
      "Dry winter eczema patches, freshly shaved irritated skin, sensitive intimate areas, or delicate facial skin.",
    couldCause:
      "Stinging or dryness if applied onto freshly shaved skin or raw eczema patches.",
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
      "Dry, itchy, flaky, eczema-prone, and winter-ashy body skin on arms, legs, hands, or torso.",
    bestFor:
      "Calming hard-water body itchiness, dry winter skin tightness, and gentle soap-free daily body cleansing.",
    keyPerks:
      "Colloidal oat and lipid-rich body cleanser that calms itching and restores moisture without harsh soap dryness.",
    whoShouldAvoid:
      "Active oily back and chest acne needing acid exfoliation (pair AHA BHA Body Wash on acne areas instead).",
    couldCause:
      "Minimal irritation; rinse shower floor cleanly as lipid washes can feel slightly smooth underfoot.",
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
      "Scalps dealing with flaky white or yellow dandruff, itchy seborrheic buildup, or oily scalp flakes.",
    bestFor:
      "Lifting stubborn dandruff scales and soothing clogged oily scalp follicles (1-2 times/week rotated with gentle wash).",
    keyPerks:
      "Medicated BHA scalp shampoo massaged onto the scalp for 2-3 minutes to lift stubborn dandruff scales without heavy buildup.",
    whoShouldAvoid:
      "Raw scratched scalp sores or everyday single-wash use without conditioning dry mid-lengths and ends.",
    couldCause:
      "Strand dryness if applied every day down to hair ends instead of scalp-only 1-2x weekly washes.",
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
      "Hair washed in Pakistani hard water (Sindh/Punjab), greasy roots, or hair coated in heavy oil and product buildup.",
    bestFor:
      "Stripping hard-water mineral residue, heavy oil buildup, and excess root sebum 1-2 times per week.",
    keyPerks:
      "Deep-cleansing chelating and clarifying reset wash used 1-2 times per week to clear mineral hard-water residue and excess sebum from follicles.",
    whoShouldAvoid:
      "Daily washes on dry, bleached, or high-porosity strands without conditioning afterward; always follow with conditioner on mid-lengths and ends.",
    couldCause:
      "Slight strand stiffness if used daily or without a conditioner on mid-lengths and ends.",
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
      "Medium and high porosity hair strands dealing with tangles, rough hard-water dryness, or heat and sun exposure.",
    bestFor:
      "Lightweight post-wash detangling, softening rough strands after hard-water washes, and protecting mid-lengths to ends.",
    keyPerks:
      "Lightweight leave-in hydration and cuticle protection applied strictly from mid-lengths to ends on damp hair.",
    whoShouldAvoid:
      "Oily or dandruff-prone scalp roots (keep away from roots); use only a tiny pea-sized amount on low-porosity hair.",
    couldCause:
      "Limp or heavy roots if over-applied near the scalp or used generously on fine low-porosity strands.",
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
      "High-porosity, dry, brittle, heat-styled, or color-damaged hair needing weekly deep repair.",
    bestFor:
      "Restoring elasticity, split-end softness, and deep moisture to brittle high-porosity lengths once a week.",
    keyPerks:
      "Weekly intensive nourishing mask applied to lengths and ends for 10-15 minutes to restore elasticity and softness.",
    whoShouldAvoid:
      "Oily or dandruff-prone scalps (apply strictly to mid-lengths and ends, never on scalp skin).",
    couldCause:
      "Heavy buildup or flat roots if applied on the scalp or overused on fine low-porosity hair.",
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
      "High-porosity hair lengths facing Pakistani monsoon humidity frizz, flyaways, and dull dry ends.",
    bestFor:
      "Taming humidity frizz, smoothing flyaways, and protecting dry ends from split-end breakage.",
    keyPerks:
      "Cuticle-sealing smoothing serum applied (1-2 drops) strictly onto hair ends to lock out humidity and prevent split-end breakage.",
    whoShouldAvoid:
      "Never apply near the scalp or roots, especially with oily scalp, dandruff, or fine low-porosity hair.",
    couldCause:
      "Greasy or clumped strands if more than 1-2 drops are used or applied near the scalp.",
  },
];
