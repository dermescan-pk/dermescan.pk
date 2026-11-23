import { JENPHARM_AFFILIATES } from "./jenpharmAffiliates.ts";

export type GuideCategoryId =
  | "sunblocks"
  | "creams-serums"
  | "cleansers"
  | "shampoos-scalp";

export type MonographSectionLabel =
  | "Cleansers & Face Washes"
  | "Moisturizers & Barrier Repair"
  | "Sunscreens"
  | "Targeted Serums & Creams"
  | "Hair & Scalp Treatments";

export type BottleKind =
  | "tube"
  | "serum"
  | "jar"
  | "wash"
  | "shampoo"
  | "drops";

export interface JenpharmProductMonograph {
  order: number;
  affiliateId: string;
  slug: string;
  name: string;
  guideCategory: GuideCategoryId;
  monographSection: MonographSectionLabel;
  imagePath: string;
  affiliateUrl: string;
  bottleKind: BottleKind;
  suitsWhomLabel: "Suits Whom & Skin Type" | "Suits Whom & Scalp/Hair Type";
  suitsWhom: string;
  bestFor: string;
  keyPerks: string;
  whoShouldAvoid: string;
  couldCause: string;
}

const AFFILIATE_URL_BY_ID = new Map<string, string>(
  JENPHARM_AFFILIATES.map((item) => [item.id, item.affiliateUrl])
);

function verifiedDarazUrl(affiliateId: string, fallbackUrl: string): string {
  return AFFILIATE_URL_BY_ID.get(affiliateId) || fallbackUrl;
}

export const JENPHARM_PRODUCTS_CATALOG: readonly JenpharmProductMonograph[] = [
  // 1. Cleansers & Face Washes
  {
    order: 1,
    affiliateId: "mandelac-face-wash",
    slug: "mandelac-wash",
    name: "Jenpharm MandelAC Face Wash",
    guideCategory: "cleansers",
    monographSection: "Cleansers & Face Washes",
    imagePath: "/products/mandelac-wash.jpg",
    affiliateUrl: verifiedDarazUrl(
      "mandelac-face-wash",
      "https://s.daraz.pk/s.2TIkW"
    ),
    bottleKind: "wash",
    suitsWhomLabel: "Suits Whom & Skin Type",
    suitsWhom:
      "Combination, mildly oily, dull, and textured skin, including sensitive South Asian skin that cannot tolerate harsh scrubs or strong glycolic acid.",
    bestFor:
      "Closed comedones (tiny whiteheads), rough uneven skin texture, post-acne dullness, and mild sun tan.",
    keyPerks:
      "Powered by Mandelic Acid (a large-molecule gentle AHA derived from bitter almonds) that dissolves dead surface skin cells slowly without penetrating too aggressively, leaving skin smoother and brighter.",
    whoShouldAvoid:
      "Anyone with actively peeling, sunburned, eczema-flared, or severely compromised skin barriers, or anyone using prescription retinoids/tretinoin.",
    couldCause:
      "Mild dryness, tightness, or increased sun sensitivity if used more than once daily without daytime sunscreen.",
  },
  {
    order: 2,
    affiliateId: "clarevo-salicylic-acid-facewash",
    slug: "clarevo-wash",
    name: "Jenpharm Clarevo Salicylic Acid Facewash",
    guideCategory: "cleansers",
    monographSection: "Cleansers & Face Washes",
    imagePath: "/products/clarevo-wash.jpg",
    affiliateUrl: verifiedDarazUrl(
      "clarevo-salicylic-acid-facewash",
      "https://s.daraz.pk/s.2TIqH"
    ),
    bottleKind: "wash",
    suitsWhomLabel: "Suits Whom & Skin Type",
    suitsWhom: "Very oily, acne-prone, and congested skin types.",
    bestFor:
      "Active inflammatory pimples, stubborn blackheads, enlarged clogged pores, and excess midday sebum in humid Pakistani weather.",
    keyPerks:
      "Uses oil-soluble Salicylic Acid (BHA) to dive deep inside sebum-filled pores, breaking down hardened oil plugs and calming acne-causing inflammation.",
    whoShouldAvoid:
      "Dry, flaky, rosacea-prone, or post-steroid damaged skin barriers.",
    couldCause:
      "Over-drying, flaking around the nose/mouth, or mild initial purging if overused or layered with leave-on exfoliating acids.",
  },
  {
    order: 3,
    affiliateId: "dermive-moisturizing-face-wash",
    slug: "dermive-wash",
    name: "Jenpharm Dermive Moisturizing Face Wash",
    guideCategory: "cleansers",
    monographSection: "Cleansers & Face Washes",
    imagePath: "/products/dermive-wash.jpg",
    affiliateUrl: verifiedDarazUrl(
      "dermive-moisturizing-face-wash",
      "https://s.daraz.pk/s.2TIMM"
    ),
    bottleKind: "wash",
    suitsWhomLabel: "Suits Whom & Skin Type",
    suitsWhom:
      "Dry, dehydrated, sensitive, rosacea-prone, and combination skin needing a gentle daily wash.",
    bestFor:
      "Post-steroid damaged skin barriers, winter tightness, eczema-prone facial dryness, and irritation from harsh foaming cleansers.",
    keyPerks:
      "A soap-free, pH-balanced hydrating cleanser that lifts dirt and light sunscreen without stripping your skin's natural protective lipids.",
    whoShouldAvoid:
      "Extremely oily skin types looking for a deep pore-degreasing wash (though it works well as a gentle morning cleanser even for oily skin on acne medications).",
    couldCause:
      "Minimal risk of irritation; may feel too mild to remove heavy waterproof makeup on its own (pair with micellar water first).",
  },

  // 2. Moisturizers & Barrier Repair
  {
    order: 4,
    affiliateId: "dermive-oil-free",
    slug: "dermive-oil-free",
    name: "Jenpharm Dermive Oil-Free Moisturizer",
    guideCategory: "creams-serums",
    monographSection: "Moisturizers & Barrier Repair",
    imagePath: "/products/dermive-oil-free.jpg",
    affiliateUrl: verifiedDarazUrl(
      "dermive-oil-free",
      "https://s.daraz.pk/s.2TIlW"
    ),
    bottleKind: "jar",
    suitsWhomLabel: "Suits Whom & Skin Type",
    suitsWhom: "Oily, combination, and acne-prone skin types.",
    bestFor:
      "Dehydrated oily skin (skin that feels greasy on top yet tight underneath), acne-treatment dryness, and humid summer hydration in Karachi/Lahore/Sindh.",
    keyPerks:
      "Delivers lightweight humectant and barrier-supporting hydration in a fast-absorbing, non-comedogenic base that won't trigger breakouts or midday shine.",
    whoShouldAvoid:
      "Severely dry, cracked, or winter-flaking skin that requires thick lipid/oil occlusion.",
    couldCause:
      "Rare mild stinging only if applied onto raw, broken, or freshly over-exfoliated skin.",
  },
  {
    order: 5,
    affiliateId: "dermive-oil-free-spf20",
    slug: "dermive-spf20",
    name: "Jenpharm Dermive Oil-Free Moisturizer SPF 20",
    guideCategory: "creams-serums",
    monographSection: "Moisturizers & Barrier Repair",
    imagePath: "/products/dermive-spf20.jpg",
    affiliateUrl: verifiedDarazUrl(
      "dermive-oil-free-spf20",
      "https://s.daraz.pk/s.2TIJp"
    ),
    bottleKind: "jar",
    suitsWhomLabel: "Suits Whom & Skin Type",
    suitsWhom:
      "Oily, combination, and normal skin types looking for an easy 2-in-1 daytime moisturizer.",
    bestFor:
      "Indoor daytime hydration, light incidental UV exposure through windows, and minimal 2-step morning routines.",
    keyPerks:
      "Combines non-greasy daily moisture with broad-spectrum SPF 20 filters so skin stays balanced without layering heavy creams indoors.",
    whoShouldAvoid:
      "Anyone spending prolonged time outdoors in peak Pakistani sunlight without layering a dedicated SPF 50+ sunscreen on top.",
    couldCause:
      "Mild eye watering if applied too close to the eyelids; SPF 20 alone is insufficient against melasma or strong outdoor sun.",
  },
  {
    order: 6,
    affiliateId: "dermive-oily",
    slug: "dermive-oily",
    name: "Jenpharm Dermive Oily Moisturizer",
    guideCategory: "creams-serums",
    monographSection: "Moisturizers & Barrier Repair",
    imagePath: "/products/dermive-oily.jpg",
    affiliateUrl: verifiedDarazUrl(
      "dermive-oily",
      "https://s.daraz.pk/s.2TIok"
    ),
    bottleKind: "jar",
    suitsWhomLabel: "Suits Whom & Skin Type",
    suitsWhom:
      'Very dry, rough, flaky, and lipid-depleted skin types (Note: Despite the word "Oily" in its name, it is an oil-rich moisturizer formulated for dry skin, not for oily skin).',
    bestFor:
      "Severe winter dryness, rough dry patches, dry hands/elbows, and non-acne-prone dry skin barriers.",
    keyPerks:
      "Replenishes missing surface oils and locks moisture deep inside parched skin to stop flaking and tightness.",
    whoShouldAvoid:
      "Oily, acne-prone, clogged-pore, or fungal acne (Malassezia folliculitis)-prone skin types.",
    couldCause:
      "Clogged pores, whiteheads, or heavy greasiness if applied onto oily or breakout-prone facial skin.",
  },
  {
    order: 7,
    affiliateId: "dermive-sensitive",
    slug: "dermive-sensitive",
    name: "Jenpharm Dermive Sensitive Moisturizer",
    guideCategory: "creams-serums",
    monographSection: "Moisturizers & Barrier Repair",
    imagePath: "/products/dermive-sensitive.jpg",
    affiliateUrl: verifiedDarazUrl(
      "dermive-sensitive",
      "https://s.daraz.pk/s.2TIN4"
    ),
    bottleKind: "jar",
    suitsWhomLabel: "Suits Whom & Skin Type",
    suitsWhom:
      "Hyper-sensitive, reactive, redness-prone, and damaged skin types.",
    bestFor:
      "Skin barrier recovery after steroid/formula creams, redness, mild dermatitis/eczema flare-ups, and post-procedure soothing.",
    keyPerks:
      "Fragrance-free, soothing barrier-repair formulation designed to calm stinging, reduce visible redness, and rebuild compromised skin tolerance.",
    whoShouldAvoid:
      "Individuals with known sensitivity to specific emollient esters in the base (always patch-test on the jawline first).",
    couldCause:
      "Very low irritation profile; may feel slightly rich in peak humid summer heat for very oily skin.",
  },

  // 3. Sunscreens
  {
    order: 8,
    affiliateId: "spectra-block-aqua-spf60",
    slug: "spectra-block-spf60",
    name: "Jenpharm Spectra Block Aqua Fluid Sunscreen SPF 60",
    guideCategory: "sunblocks",
    monographSection: "Sunscreens",
    imagePath: "/products/spectra-block-spf60.jpg",
    affiliateUrl: verifiedDarazUrl(
      "spectra-block-aqua-spf60",
      "https://s.daraz.pk/s.2TIQk"
    ),
    bottleKind: "tube",
    suitsWhomLabel: "Suits Whom & Skin Type",
    suitsWhom:
      "Normal, combination, and slightly dry skin types across all South Asian skin tones.",
    bestFor:
      "Daily outdoor UVA/UVB protection, preventing sun tan, premature fine lines, and everyday hyperpigmentation.",
    keyPerks:
      "A fluid, fast-blending high-SPF formula that spreads effortlessly without leaving a chalky white or grey cast on medium-to-deep skin tones.",
    whoShouldAvoid:
      "Extremely oily skin types that prefer an ultra-dry matte gel finish in high humidity.",
    couldCause:
      "Slight dewy shine in peak summer sweat or mild eye sting if rubbed directly into the eyes; requires cleansing off at night.",
  },
  {
    order: 9,
    affiliateId: "spectramatt-spf50",
    slug: "spectramatt-spf50",
    name: "Jenpharm Spectramatt SPF 50 Sebum Control Gel Sunscreen",
    guideCategory: "sunblocks",
    monographSection: "Sunscreens",
    imagePath: "/products/spectramatt-spf50.jpg",
    affiliateUrl: verifiedDarazUrl(
      "spectramatt-spf50",
      "https://s.daraz.pk/s.2TILa"
    ),
    bottleKind: "tube",
    suitsWhomLabel: "Suits Whom & Skin Type",
    suitsWhom: "Oily, combination, and acne-prone skin types.",
    bestFor:
      "Outdoor sun protection in hot, humid Pakistani cities without triggering grease, sweat-melt, or clogged pores.",
    keyPerks:
      "Formulated as a lightweight sebum-controlling gel that blurs excess oil and leaves a smooth, shine-free matte finish under makeup or on bare skin.",
    whoShouldAvoid:
      "Very dry or flaky skin types, as mattifying gels can cling to dry patches.",
    couldCause:
      "Mild pilling (rolling into tiny flakes) if layered over thick silicone primers or heavy creams without letting them absorb first.",
  },
  {
    order: 10,
    affiliateId: "spectra-block-tinted-spf100",
    slug: "spectra-tinted-spf100",
    name: "Jenpharm Spectra Block Tinted Sunscreen SPF 100",
    guideCategory: "sunblocks",
    monographSection: "Sunscreens",
    imagePath: "/products/spectra-tinted-spf100.jpg",
    affiliateUrl: verifiedDarazUrl(
      "spectra-block-tinted-spf100",
      "https://s.daraz.pk/s.2TIPT"
    ),
    bottleKind: "tube",
    suitsWhomLabel: "Suits Whom & Skin Type",
    suitsWhom:
      "Normal, combination, and pigmentation-prone skin types seeking light natural coverage alongside maximum sun defense.",
    bestFor:
      "Stubborn melasma, post-acne dark marks (PIH), and sun-induced hyperpigmentation.",
    keyPerks:
      "Combines ultra-high UV filters with iron oxides (mineral tint) that block high-energy visible light, the hidden trigger that darkens melasma even when wearing untinted sunscreen.",
    whoShouldAvoid:
      "Very fair or very deep skin tones if the single universal tint does not match their undertone, or very oily skin in extreme humidity.",
    couldCause:
      "Slight transfer onto white collars/masks and potential pore congestion if not thoroughly double-cleansed off at night.",
  },

  // 4. Targeted Serums & Creams
  {
    order: 11,
    affiliateId: "maxdif-skin-brightening-cream",
    slug: "maxdif-cream",
    name: "Jenpharm Maxdif Skin Brightening Cream",
    guideCategory: "creams-serums",
    monographSection: "Targeted Serums & Creams",
    imagePath: "/products/maxdif-cream.jpg",
    affiliateUrl: verifiedDarazUrl(
      "maxdif-skin-brightening-cream",
      "https://s.daraz.pk/s.2TIlw"
    ),
    bottleKind: "jar",
    suitsWhomLabel: "Suits Whom & Skin Type",
    suitsWhom:
      "Normal, combination, and dry skin types looking for safe, gradual tone evening.",
    bestFor:
      "Stubborn sun tan, uneven complexion, mild melasma maintenance, and post-steroid rebound dullness.",
    keyPerks:
      "Uses dermatologist-trusted, steroid-free tyrosinase-inhibiting brighteners (such as Kojic/Arbutin/Vitamin C derivatives) to slow excess melanin production safely without thinning the skin.",
    whoShouldAvoid:
      'Actively irritated, broken, or allergic skin barriers, and anyone expecting overnight "3-day bleaching" results.',
    couldCause:
      "Mild tingling or dryness if applied onto damp skin or combined with strong exfoliating acids/retinoids; requires strict daily SPF 50+.",
  },
  {
    order: 12,
    affiliateId: "maxdif-brightening-moisturizer",
    slug: "maxdif-moisturizer",
    name: "Jenpharm Maxdif Brightening Moisturizer",
    guideCategory: "creams-serums",
    monographSection: "Targeted Serums & Creams",
    imagePath: "/products/maxdif-moisturizer.jpg",
    affiliateUrl: verifiedDarazUrl(
      "maxdif-brightening-moisturizer",
      "https://s.daraz.pk/s.2TIKD"
    ),
    bottleKind: "jar",
    suitsWhomLabel: "Suits Whom & Skin Type",
    suitsWhom:
      "Dry, normal, and combination skin types wanting daily hydration paired with gentle brightening.",
    bestFor:
      "Overall dullness, dehydrated uneven skin tone, and daily maintenance after fading dark spots.",
    keyPerks:
      "Blends barrier-softening moisturizers with gentle antioxidant brighteners so skin stays plump while gradually looking clearer and more luminous.",
    whoShouldAvoid:
      "Very oily, active cystic-acne skin types that need a strictly oil-free gel moisturizer.",
    couldCause:
      "Mild breakouts if over-applied on congested oily skin, or reduced effectiveness if used without daily sunscreen.",
  },
  {
    order: 13,
    affiliateId: "maxdif-serum",
    slug: "maxdif-serum",
    name: "Jenpharm Maxdif Serum",
    guideCategory: "creams-serums",
    monographSection: "Targeted Serums & Creams",
    imagePath: "/products/maxdif-serum.jpg",
    affiliateUrl: verifiedDarazUrl(
      "maxdif-serum",
      "https://s.daraz.pk/s.2TILJ"
    ),
    bottleKind: "serum",
    suitsWhomLabel: "Suits Whom & Skin Type",
    suitsWhom:
      "All skin types (especially oily, combination, and acne-prone skin that prefers lightweight serums over creams).",
    bestFor:
      "Stubborn post-acne dark marks (PIH), spot hyperpigmentation, and blotchy uneven tone.",
    keyPerks:
      "Delivers concentrated, fast-absorbing brightening actives directly into targeted dark spots without adding heavy creaminess underneath your moisturizer.",
    whoShouldAvoid:
      "Severely sensitized or actively flaring eczema skin until the barrier is healed first.",
    couldCause:
      "Mild temporary stinging on fresh blemishes; spots will re-darken if exposed to sunlight without daily sunscreen.",
  },
  {
    order: 14,
    affiliateId: "cerulic-glow-boosting-serum",
    slug: "cerulic-serum",
    name: "Jenpharm Cerulic Glow Boosting Serum",
    guideCategory: "creams-serums",
    monographSection: "Targeted Serums & Creams",
    imagePath: "/products/cerulic-serum.jpg",
    affiliateUrl: verifiedDarazUrl(
      "cerulic-glow-boosting-serum",
      "https://s.daraz.pk/s.2TImG"
    ),
    bottleKind: "serum",
    suitsWhomLabel: "Suits Whom & Skin Type",
    suitsWhom: "Normal, dull, combination, and early-aging skin types.",
    bestFor:
      "Oxidative sun/pollution stress, tired-looking complexion, early fine lines, and boosting daytime sunscreen protection.",
    keyPerks:
      "An antioxidant-rich Vitamin C/Ferulic-style brightening serum that neutralizes free radicals from UV rays and city pollution while supporting collagen radiance.",
    whoShouldAvoid:
      "Hypersensitive or active cystic-acne skin that stings easily with acidic Vitamin C formulations.",
    couldCause:
      "Mild tingling upon application, slight yellowing/oxidation if the bottle is left open in heat/sunlight, or irritation if layered directly with Retinol or AHAs.",
  },
  {
    order: 15,
    affiliateId: "mandelac-serum",
    slug: "mandelac-serum",
    name: "Jenpharm MandelAC Serum",
    guideCategory: "creams-serums",
    monographSection: "Targeted Serums & Creams",
    imagePath: "/products/mandelac-serum.jpg",
    affiliateUrl: verifiedDarazUrl(
      "mandelac-serum",
      "https://s.daraz.pk/s.2TIOE"
    ),
    bottleKind: "serum",
    suitsWhomLabel: "Suits Whom & Skin Type",
    suitsWhom:
      "Oily, combination, and textured skin types ready for a leave-on chemical exfoliant.",
    bestFor:
      "Bumpy skin texture, clogged pores, blackheads, and lingering post-acne marks.",
    keyPerks:
      'Leave-on Mandelic Acid gently dissolves intercellular "glue" holding dead, pigmented cells on the surface, revealing smoother, clearer skin over 4–6 weeks.',
    whoShouldAvoid:
      "Dry, sensitive, rosacea-prone, or barrier-damaged skin, and anyone using Retinol on the same night.",
    couldCause:
      "Over-exfoliation, redness, peeling, or sunburn sensitivity if used every night instead of 2–3 nights per week.",
  },
  {
    order: 16,
    affiliateId: "mandelac-cream",
    slug: "mandelac-cream",
    name: "Jenpharm MandelAC Cream",
    guideCategory: "creams-serums",
    monographSection: "Targeted Serums & Creams",
    imagePath: "/products/mandelac-cream.jpg",
    affiliateUrl: verifiedDarazUrl(
      "mandelac-cream",
      "https://s.daraz.pk/s.2TIMv"
    ),
    bottleKind: "jar",
    suitsWhomLabel: "Suits Whom & Skin Type",
    suitsWhom:
      "Normal-to-combination or slightly dry textured skin needing gentle resurfacing with added moisture.",
    bestFor:
      "Rough patches, mild uneven tone, and keratosis-style surface bumpiness.",
    keyPerks:
      "Buffers Mandelic Acid inside a cream base so you get gradual exfoliation with less dryness than a liquid acid serum.",
    whoShouldAvoid:
      "Very oily/congested skin (which prefers MandelAC Serum) or compromised/peeling skin barriers.",
    couldCause:
      "Mild stinging, flaking, or UV sensitivity if overused or paired with scrubs/retinoids.",
  },
  {
    order: 17,
    affiliateId: "eternyx-retinol-serum",
    slug: "eternyx-retinol",
    name: "Jenpharm Eternyx Advanced Retinol Serum 1%",
    guideCategory: "creams-serums",
    monographSection: "Targeted Serums & Creams",
    imagePath:
      "/assets/aistudio/Eternyx-Retinol-white-bg_1_63227eaa-c1b8-4da9-8397-658073e2ff42__1__820ed015.webp",
    affiliateUrl: verifiedDarazUrl(
      "eternyx-retinol-serum",
      "https://s.daraz.pk/s.2TIIg"
    ),
    bottleKind: "serum",
    suitsWhomLabel: "Suits Whom & Skin Type",
    suitsWhom:
      "Experienced skincare users (ages 25+) with normal, combination, or oily skin seeking proven anti-aging and texture renewal.",
    bestFor:
      "Fine lines, early wrinkles, loss of firmness, stubborn adult acne texture, and deep photo-aging.",
    keyPerks:
      "Accelerates cellular turnover and stimulates collagen production overnight for smoother, firmer, more refined skin over 8–12 weeks.",
    whoShouldAvoid:
      "Strictly avoid during pregnancy, trying to conceive, or breastfeeding, and avoid on eczema, rosacea, or damaged skin barriers.",
    couldCause:
      'Significant dryness, redness, flaking ("retinol uglies"), and purging if started too fast (start 1–2 nights/week with the moisturizer sandwich method and wear SPF 50+ daily).',
  },

  // 5. Hair & Scalp Treatments
  {
    order: 18,
    affiliateId: "anagrow-anti-hair-loss-shampoo",
    slug: "anagrow-shampoo",
    name: "Jenpharm Anagrow Anti Hair Loss Shampoo",
    guideCategory: "shampoos-scalp",
    monographSection: "Hair & Scalp Treatments",
    imagePath: "/products/anagrow-shampoo.jpg",
    affiliateUrl: verifiedDarazUrl(
      "anagrow-anti-hair-loss-shampoo",
      "https://s.daraz.pk/s.2TIkq"
    ),
    bottleKind: "shampoo",
    suitsWhomLabel: "Suits Whom & Scalp/Hair Type",
    suitsWhom:
      "All hair porosities (low, medium, and high) experiencing diffuse shedding or weak roots.",
    bestFor:
      "Seasonal hair fall, hard-water hair weakening, and fragile thinning strands needing a supportive daily/alternate-day cleanser.",
    keyPerks:
      "Gently cleanses scalp buildup while delivering root-fortifying peptides/botanical actives without stripping hair shafts dry.",
    whoShouldAvoid:
      "Anyone expecting a shampoo alone to cure medical alopecia, severe iron/vitamin D deficiency, or thyroid hair loss without internal treatment.",
    couldCause:
      "Mild dryness on high-porosity ends if not followed by a conditioner on the mid-lengths and ends.",
  },
  {
    order: 19,
    affiliateId: "anagrow-foamy-hair-growth-serum",
    slug: "anagrow-serum",
    name: "Jenpharm Anagrow Foamy Hair Growth Serum",
    guideCategory: "shampoos-scalp",
    monographSection: "Hair & Scalp Treatments",
    imagePath: "/products/anagrow-serum.jpg",
    affiliateUrl: verifiedDarazUrl(
      "anagrow-foamy-hair-growth-serum",
      "https://s.daraz.pk/s.2TIPa"
    ),
    bottleKind: "serum",
    suitsWhomLabel: "Suits Whom & Scalp/Hair Type",
    suitsWhom:
      "All scalp types, especially low-porosity hair and oily scalps that get weighed down by traditional hair oils.",
    bestFor:
      "Early hair thinning, widening part lines, and diffuse shedding where greasy oils cause buildup.",
    keyPerks:
      "A weightless, fast-absorbing leave-on scalp foam that nourishes hair follicles directly at the root with zero oiliness or residue.",
    whoShouldAvoid:
      "Open scalp sores, active scalp infections, or anyone allergic to topical fragrance/botanical extracts.",
    couldCause:
      "Mild temporary scalp tingling or slight root stiffness if applied in excessive amounts.",
  },
  {
    order: 20,
    affiliateId: "jenpharm-rosemary-oil",
    slug: "rosemary-oil",
    name: "Jenpharm Rosemary Oil",
    guideCategory: "shampoos-scalp",
    monographSection: "Hair & Scalp Treatments",
    imagePath: "/products/rosemary-oil.jpg",
    affiliateUrl: verifiedDarazUrl(
      "jenpharm-rosemary-oil",
      "https://s.daraz.pk/s.2TIJZ"
    ),
    bottleKind: "drops",
    suitsWhomLabel: "Suits Whom & Scalp/Hair Type",
    suitsWhom:
      "Dry, tight, non-flaky scalps and medium-to-high porosity hair strands.",
    bestFor:
      "Pre-wash scalp circulation massage, dry scalp tightness, and dull hair shafts needing nourishment.",
    keyPerks:
      "Botanical rosemary extract stimulates local scalp micro-circulation when massaged gently 30–60 minutes before washing.",
    whoShouldAvoid:
      "Strictly avoid if you have oily dandruff, seborrheic dermatitis, itchy scalp flakes, or scalp folliculitis (oils feed Malassezia yeast and worsen dandruff!), and avoid leaving heavy oil on low-porosity roots overnight.",
    couldCause:
      "Worsened dandruff flares, clogged scalp follicles, or greasy buildup if not washed out thoroughly with shampoo.",
  },
  {
    order: 21,
    affiliateId: "jenpharm-anti-dandruff-drops-serum",
    slug: "anti-dandruff-drops",
    name: "Jenpharm Anti-Dandruff Drops Serum",
    guideCategory: "shampoos-scalp",
    monographSection: "Hair & Scalp Treatments",
    imagePath: "/products/anti-dandruff-drops.jpg",
    affiliateUrl: verifiedDarazUrl(
      "jenpharm-anti-dandruff-drops-serum",
      "https://s.daraz.pk/s.2TIrX"
    ),
    bottleKind: "drops",
    suitsWhomLabel: "Suits Whom & Scalp/Hair Type",
    suitsWhom:
      "Oily, flaky, itchy, and dandruff-prone scalps across all hair types.",
    bestFor:
      "White/yellow scalp flakes, seborrheic buildup, and itchy scalp irritation worsened by Pakistani humidity or hard water.",
    keyPerks:
      "Delivers targeted anti-flaking and scalp-soothing actives directly onto the scalp skin in a non-greasy drop format that calms itching without heavy oiliness.",
    whoShouldAvoid: "Broken, bleeding, or raw scratched scalp skin.",
    couldCause:
      "Mild dryness or slight cooling/tingling sensation at the roots if over-applied.",
  },
  {
    order: 22,
    affiliateId: "anagrow-anti-frizz-serum",
    slug: "anagrow-frizz",
    name: "Jenpharm Anagrow Anti-Frizz Serum",
    guideCategory: "shampoos-scalp",
    monographSection: "Hair & Scalp Treatments",
    imagePath: "/products/anagrow-frizz.jpg",
    affiliateUrl: verifiedDarazUrl(
      "anagrow-anti-frizz-serum",
      "https://s.daraz.pk/s.2TIJh"
    ),
    bottleKind: "serum",
    suitsWhomLabel: "Suits Whom & Scalp/Hair Type",
    suitsWhom:
      "High-porosity, dry, heat-styled, chemically treated, or frizzy hair shafts.",
    bestFor:
      "Humidity frizz, flyaways, split-end roughness, and dullness caused by blow-drying or hard water.",
    keyPerks:
      "Coats and smooths raised hair cuticles along the mid-lengths and ends, locking out humidity and adding silky shine without heaviness.",
    whoShouldAvoid:
      "Do NOT apply directly to the scalp/roots, and use sparingly on fine low-porosity hair.",
    couldCause:
      "Greasy, weighed-down roots if applied near the scalp instead of strictly from mid-lengths to ends.",
  },
];
