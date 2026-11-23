import { Type, type Schema } from "@google/genai";
import {
  APPROVED_PK_BRAND_LINEUPS,
  MASTER_TRUSTED_CATALOG,
  VERIFIED_EXACT_PRODUCT_LINEUPS,
  VERIFIED_PK_STORES,
  findCatalogMatch,
} from "../src/data/products.ts";
import { findJenpharmAffiliate } from "../src/data/jenpharmAffiliates.ts";
import type {
  HairStructuredInputs,
  HealthProfile,
  RecommendedProductPick,
  SkinStructuredInputs,
  StoreCheckResult,
} from "../src/types/dermascan.ts";

export const bilingualStringSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    en: { type: Type.STRING },
    ur: { type: Type.STRING },
  },
  required: ["en", "ur"],
};

export const bilingualListSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    en: { type: Type.ARRAY, items: { type: Type.STRING } },
    ur: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["en", "ur"],
};

export const routineStepSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    stepNumber: { type: Type.INTEGER },
    timingBadge: bilingualStringSchema,
    usageCaution: bilingualStringSchema,
    title: bilingualStringSchema,
    productId: { type: Type.STRING },
    brand: { type: Type.STRING },
    productName: { type: Type.STRING },
    dose: bilingualStringSchema,
    method: bilingualStringSchema,
    note: bilingualStringSchema,
  },
  required: [
    "stepNumber",
    "timingBadge",
    "usageCaution",
    "title",
    "dose",
    "method",
    "note",
  ],
};

export const triageDecisionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    status: {
      type: Type.STRING,
      enum: ["home_routine_safe", "see_dermatologist_directly"],
    },
    badge: bilingualStringSchema,
    reason: bilingualStringSchema,
  },
  required: ["status", "badge", "reason"],
};

export const recommendedProductSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    productId: { type: Type.STRING },
    brand: { type: Type.STRING },
    name: { type: Type.STRING },
    subCategory: { type: Type.STRING },
    approxPricePkr: { type: Type.STRING },
    whereToBuy: { type: Type.STRING },
    bullets: bilingualListSchema,
  },
  required: [
    "brand",
    "name",
    "subCategory",
    "approxPricePkr",
    "whereToBuy",
    "bullets",
  ],
};

export const skinResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isValidPhoto: { type: Type.BOOLEAN },
    retakeSlots: { type: Type.ARRAY, items: { type: Type.STRING } },
    retakeMessage: bilingualStringSchema,
    confidenceLabel: bilingualStringSchema,
    primaryConcernTag: bilingualStringSchema,
    triageDecision: triageDecisionSchema,
    assessment: {
      type: Type.OBJECT,
      properties: {
        summaryBullets: bilingualListSchema,
        angleObservations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              slotLabel: { type: Type.STRING },
              bullets: bilingualListSchema,
            },
            required: ["slotLabel", "bullets"],
          },
        },
        triggersIdentified: bilingualListSchema,
      },
      required: ["summaryBullets", "angleObservations", "triggersIdentified"],
    },
    routine: {
      type: Type.OBJECT,
      properties: {
        morning: { type: Type.ARRAY, items: routineStepSchema },
        evening: { type: Type.ARRAY, items: routineStepSchema },
      },
      required: ["morning", "evening"],
    },
    recommendedProducts: {
      type: Type.ARRAY,
      items: recommendedProductSchema,
    },
    lifestyleAndWater: {
      type: Type.OBJECT,
      properties: {
        waterAndClimateBullets: bilingualListSchema,
        habitChecklist: bilingualListSchema,
      },
      required: ["waterAndClimateBullets", "habitChecklist"],
    },
    redFlags: {
      type: Type.OBJECT,
      properties: {
        urgencyLevel: {
          type: Type.STRING,
          enum: ["routine", "consult_soon", "urgent"],
        },
        warningBullets: bilingualListSchema,
        whenToSeeDermatologist: bilingualListSchema,
      },
      required: ["urgencyLevel", "warningBullets", "whenToSeeDermatologist"],
    },
  },
  required: [
    "isValidPhoto",
    "retakeSlots",
    "retakeMessage",
    "confidenceLabel",
    "primaryConcernTag",
    "triageDecision",
    "assessment",
    "routine",
    "recommendedProducts",
    "lifestyleAndWater",
    "redFlags",
  ],
};

export const hairResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isValidPhoto: { type: Type.BOOLEAN },
    retakeSlots: { type: Type.ARRAY, items: { type: Type.STRING } },
    retakeMessage: bilingualStringSchema,
    confidenceLabel: bilingualStringSchema,
    primaryConcernTag: bilingualStringSchema,
    triageDecision: triageDecisionSchema,
    assessment: {
      type: Type.OBJECT,
      properties: {
        summaryBullets: bilingualListSchema,
        angleObservations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              slotLabel: { type: Type.STRING },
              bullets: bilingualListSchema,
            },
            required: ["slotLabel", "bullets"],
          },
        },
        triggersIdentified: bilingualListSchema,
        hairBreakdown: {
          type: Type.OBJECT,
          properties: {
            scalpAndHairline: bilingualListSchema,
            midLengths: bilingualListSchema,
            hairEnds: bilingualListSchema,
          },
          required: ["scalpAndHairline", "midLengths", "hairEnds"],
        },
      },
      required: [
        "summaryBullets",
        "angleObservations",
        "triggersIdentified",
        "hairBreakdown",
      ],
    },
    routine: {
      type: Type.OBJECT,
      properties: {
        morning: { type: Type.ARRAY, items: routineStepSchema },
        evening: { type: Type.ARRAY, items: routineStepSchema },
      },
      required: ["morning", "evening"],
    },
    recommendedProducts: {
      type: Type.ARRAY,
      items: recommendedProductSchema,
    },
    lifestyleAndWater: {
      type: Type.OBJECT,
      properties: {
        waterAndClimateBullets: bilingualListSchema,
        habitChecklist: bilingualListSchema,
      },
      required: ["waterAndClimateBullets", "habitChecklist"],
    },
    redFlags: {
      type: Type.OBJECT,
      properties: {
        urgencyLevel: {
          type: Type.STRING,
          enum: ["routine", "consult_soon", "urgent"],
        },
        warningBullets: bilingualListSchema,
        whenToSeeDermatologist: bilingualListSchema,
      },
      required: ["urgencyLevel", "warningBullets", "whenToSeeDermatologist"],
    },
  },
  required: [
    "isValidPhoto",
    "retakeSlots",
    "retakeMessage",
    "confidenceLabel",
    "primaryConcernTag",
    "triageDecision",
    "assessment",
    "routine",
    "recommendedProducts",
    "lifestyleAndWater",
    "redFlags",
  ],
};

export const steroidResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isReadableInput: { type: Type.BOOLEAN },
    readabilityMessage: bilingualStringSchema,
    productDetectedName: { type: Type.STRING },
    safetyVerdict: {
      type: Type.STRING,
      enum: ["safe", "caution", "high_risk"],
    },
    verdictBadge: bilingualStringSchema,
    summaryBullets: bilingualListSchema,
    detectedRiskyIngredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          ingredient: { type: Type.STRING },
          category: {
            type: Type.STRING,
            enum: [
              "Corticosteroid",
              "Mercury / Heavy Metal",
              "Hydroquinone / Bleaching",
              "Prescription Active",
              "Safe Cosmetic / Derm Active",
            ],
          },
          riskBullets: bilingualListSchema,
        },
        required: ["ingredient", "category", "riskBullets"],
      },
    },
    potentialSideEffects: bilingualListSchema,
    safeRecoveryPlan: {
      type: Type.OBJECT,
      properties: {
        taperingBullets: bilingualListSchema,
        steps: bilingualListSchema,
      },
      required: ["taperingBullets", "steps"],
    },
    safeReplacementProductIds: {
      type: Type.ARRAY,
      items: recommendedProductSchema,
    },
    doctorEscalationBullets: bilingualListSchema,
  },
  required: [
    "isReadableInput",
    "readabilityMessage",
    "productDetectedName",
    "safetyVerdict",
    "verdictBadge",
    "summaryBullets",
    "detectedRiskyIngredients",
    "potentialSideEffects",
    "safeRecoveryPlan",
    "safeReplacementProductIds",
    "doctorEscalationBullets",
  ],
};

export const verifyPackagingSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    identifiedProductName: { type: Type.STRING },
    identifiedBrand: { type: Type.STRING },
    packagingVerdict: {
      type: Type.STRING,
      enum: ["likely_authentic", "suspicious_red_flags", "inconclusive"],
    },
    verdictBadge: bilingualStringSchema,
    summaryBullets: bilingualListSchema,
    packagingChecks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          checkName: bilingualStringSchema,
          status: {
            type: Type.STRING,
            enum: ["pass", "warning", "fail", "not_visible"],
          },
          detail: bilingualStringSchema,
        },
        required: ["checkName", "status", "detail"],
      },
    },
    pakistanCounterfeitTips: bilingualListSchema,
    nextStepBullets: bilingualListSchema,
    bestForSummary: bilingualStringSchema,
    bestForTags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    profileMatchVerdict: {
      type: Type.OBJECT,
      properties: {
        status: {
          type: Type.STRING,
          enum: [
            "great_match",
            "use_with_caution",
            "not_recommended",
            "general_info",
          ],
        },
        badge: bilingualStringSchema,
        explanation: bilingualStringSchema,
      },
      required: ["status", "badge", "explanation"],
    },
    keyActives: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          ingredient: { type: Type.STRING },
          roleBadge: bilingualStringSchema,
          howItWorks: bilingualStringSchema,
        },
        required: ["ingredient", "roleBadge", "howItWorks"],
      },
    },
    whoShouldAvoid: bilingualListSchema,
    routineClashes: bilingualListSchema,
    howToUse: {
      type: Type.OBJECT,
      properties: {
        scheduleBadge: bilingualStringSchema,
        steps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              timing: {
                type: Type.STRING,
                enum: ["AM", "PM", "Weekly", "Anytime"],
              },
              timingBadge: bilingualStringSchema,
              instruction: bilingualStringSchema,
            },
            required: ["timing", "timingBadge", "instruction"],
          },
        },
      },
      required: ["scheduleBadge", "steps"],
    },
    saferAlternative: recommendedProductSchema,
  },
  required: [
    "identifiedProductName",
    "identifiedBrand",
    "packagingVerdict",
    "verdictBadge",
    "summaryBullets",
    "packagingChecks",
    "pakistanCounterfeitTips",
    "nextStepBullets",
    "bestForSummary",
    "bestForTags",
    "profileMatchVerdict",
    "keyActives",
    "whoShouldAvoid",
    "routineClashes",
    "howToUse",
  ],
};

function isSocialOrMessagingSeller(raw: string): boolean {
  const lower = raw.trim().toLowerCase();
  return (
    lower.startsWith("@") ||
    /(?:^|\b)(?:instagram\.com|instagr\.am|facebook\.com|fb\.com|fb\.me|wa\.me|whatsapp|tiktok\.com|t\.me)(?:\/|\b|$)/i.test(
      lower
    )
  );
}

function extractDomainIfUrl(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed || isSocialOrMessagingSeller(trimmed)) return null;

  const hasProtocol = /^https?:\/\//i.test(trimmed);
  const hasKnownTld =
    /(?:^|\.)[a-z0-9-]{2,}\.(?:com\.pk|co\.uk|com|pk|co|store|net|org|shop|online|io|uk|us|ca|ae|in|biz|info)(?:[\/?#:]|$)/i.test(
      trimmed
    );

  if (!hasProtocol && !hasKnownTld && !trimmed.startsWith("www.")) {
    return null;
  }

  try {
    const withProto = hasProtocol ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProto);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (!host || !host.includes(".")) return null;
    return host;
  } catch {
    const fallback = trimmed
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split(/[\/?#]/)[0];
    return fallback.includes(".") ? fallback : null;
  }
}

function normalizePlainText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function matchStoreByExactDomain(hostname: string) {
  for (const store of VERIFIED_PK_STORES) {
    if (store.domains.length === 0) continue;
    const hit = store.domains.some((d) =>
      store.exactHostOnly
        ? hostname === d
        : hostname === d || hostname.endsWith(`.${d}`)
    );
    if (hit) {
      return store;
    }
  }
  return undefined;
}

function detectCopycatDomain(hostname: string) {
  const withoutTld = hostname.replace(
    /\.(?:com\.pk|co\.uk|com|pk|co|store|net|org|shop|online|io|uk|us|ca|ae|in|biz|info)$/i,
    ""
  );
  const compactHost = withoutTld.replace(/[^a-z0-9]/g, "");
  if (!compactHost) return undefined;

  for (const store of VERIFIED_PK_STORES) {
    if (store.domains.length === 0) continue;
    const isLookalike = store.stemTokens.some((stem) => {
      const cleanStem = stem.replace(/[^a-z0-9]/g, "");
      return cleanStem.length >= 4 && compactHost.includes(cleanStem);
    });
    if (isLookalike) {
      return store;
    }
  }
  return undefined;
}

function matchVerifiedByName(nameText: string, officialBrandsOnly = false) {
  const normalized = normalizePlainText(nameText);
  if (!normalized) return undefined;

  for (const store of VERIFIED_PK_STORES) {
    if (officialBrandsOnly && store.category !== "official_brand") continue;
    const hit = store.aliases.some((alias) => {
      const cleanAlias = normalizePlainText(alias);
      if (!cleanAlias) return false;
      const paddedText = ` ${normalized} `;
      const paddedAlias = ` ${cleanAlias} `;
      return paddedText.includes(paddedAlias);
    });
    if (hit) {
      return store;
    }
  }
  return undefined;
}

export function checkStoreDeterministic(
  rawStoreInput: string,
  rawProductName = ""
): StoreCheckResult {
  const storeTrimmed = rawStoreInput.trim();
  const productTrimmed = rawProductName.trim();

  if (!storeTrimmed && !productTrimmed) {
    return {
      status: "not_provided",
      badgeText: {
        en: "No Store or Brand Entered",
        ur: "Store Ya Brand Ka Naam Nahi Likha",
      },
      explanation: {
        en: "Enter a store URL (like dvago.pk, naheed.pk, or theordinary.com) or brand name to check authenticity.",
        ur: "Store ki website (maslan dvago.pk, naheed.pk, ya theordinary.com) ya brand ka naam likhein taake authenticity check ho sake.",
      },
    };
  }

  if (storeTrimmed) {
    if (isSocialOrMessagingSeller(storeTrimmed)) {
      return {
        status: "unverified",
        badgeText: {
          en: "Potentially Fake / Unverified Seller: Upload Bottle Photos",
          ur: "Naqli Ka Khatra / Unverified Seller: Bottle Photos Upload Karein",
        },
        explanation: {
          en: `"${storeTrimmed}" appears to be a social media or WhatsApp seller, NOT an official verified store. Never trust social sellers without uploading clear Front Label, Back Barcode, and Batch-Code photos.`,
          ur: `"${storeTrimmed}" koi verified official store nahi balkay social media ya WhatsApp seller lagta hai. Baghair bottle ke front label, barcode aur batch code ki saaf photos check karwaye bharosa na karein.`,
        },
      };
    }

    const hostname = extractDomainIfUrl(storeTrimmed);
    if (hostname) {
      const exactMatch = matchStoreByExactDomain(hostname);
      if (exactMatch) {
        if (exactMatch.trustLevel === "caution_marketplace") {
          return {
            status: "caution_marketplace",
            matchedStoreName: exactMatch.name,
            matchedDomain: exactMatch.domains[0],
            badgeText: {
              en: "Daraz Marketplace · Verify DarazMall Official Flagship Badge",
              ur: "Daraz Marketplace · Sirf Official DarazMall Flagship Badge Check Karein",
            },
            explanation: {
              en: exactMatch.noteEn,
              ur: exactMatch.noteUr,
            },
          };
        }

        return {
          status: "verified",
          matchedStoreName: exactMatch.name,
          matchedDomain: exactMatch.domains[0],
          badgeText: {
            en: `Verified Official Brand / Trusted Retailer · ${exactMatch.name}`,
            ur: `Verified Official Brand / Trusted Store · ${exactMatch.name}`,
          },
          explanation: {
            en: `${exactMatch.noteEn} Upload bottle photos too if you want us to inspect printing, seal, and batch code.`,
            ur: `${exactMatch.noteUr} Agar bottle ki printing, seal aur batch code bhi check karwana hai toh photos zaroor upload karein.`,
          },
        };
      }

      const copycatTarget = detectCopycatDomain(hostname);
      if (copycatTarget) {
        const officialSite = copycatTarget.domains[0];
        return {
          status: "potential_copycat",
          matchedStoreName: copycatTarget.name,
          officialDomainSuggestion: officialSite,
          badgeText: {
            en: "Unverified / Potential Copycat Website",
            ur: "Unverified / Naqli Copycat Website Ka Khatra",
          },
          explanation: {
            en: `"${hostname}" is NOT the official website for ${copycatTarget.name}. Lookalike domains that add extra words (like -official, -skincare, -pk) or swap .com/.pk may sell fakes. Buy only from the exact official site (${officialSite}) or verified Pakistani retailers like Naheed (naheed.pk), Dvago (dvago.pk), SkinStore Pakistan (skinstorepakistan.com), or Reana (reana.pk).`,
            ur: `"${hostname}" ${copycatTarget.name} ki asli website nahi hai. Extra lafz lagane ya .com/.pk badalne wali lookalike websites naqli products bech sakti hain. Sirf asli website (${officialSite}) ya verified Pakistani retailers (naheed.pk, dvago.pk, skinstorepakistan.com, reana.pk) se khareedein.`,
          },
        };
      }

      return {
        status: "unverified",
        badgeText: {
          en: "Potentially Fake / Unverified Seller: Upload Bottle Photos to Verify",
          ur: "Naqli Ka Khatra / Unverified Seller: Bottle Photos Upload Karein",
        },
        explanation: {
          en: `"${hostname}" is NOT on our verified authentic list. Never assume an unknown website is real without uploading clear Front Label, Back Barcode, and Batch-Code photos.`,
          ur: `"${hostname}" hamari verified authentic list mein shamil nahi hai. Baghair bottle ke front label, barcode aur batch code ki saaf photos check kiye kisi unknown site ko asli na samjhein.`,
        },
      };
    }

    const nameMatch = matchVerifiedByName(storeTrimmed, false);
    if (nameMatch) {
      if (nameMatch.trustLevel === "caution_marketplace") {
        return {
          status: "caution_marketplace",
          matchedStoreName: nameMatch.name,
          matchedDomain: nameMatch.domains[0],
          badgeText: {
            en: "Daraz Marketplace · Verify DarazMall Official Badge",
            ur: "Daraz Marketplace · Official DarazMall Badge Check Karein",
          },
          explanation: {
            en: nameMatch.noteEn,
            ur: nameMatch.noteUr,
          },
        };
      }

      const siteHint =
        nameMatch.domains.length > 0
          ? ` Make sure the exact website address you use is ${nameMatch.domains[0]}.`
          : "";
      const siteHintUr =
        nameMatch.domains.length > 0
          ? ` Yaqeen karein ke website ka exact address ${nameMatch.domains[0]} hi ho.`
          : "";

      return {
        status: "verified",
        matchedStoreName: nameMatch.name,
        matchedDomain: nameMatch.domains[0],
        badgeText: {
          en: `Verified Authentic Brand / Trusted Store · ${nameMatch.name}`,
          ur: `Verified Authentic Brand / Trusted Store · ${nameMatch.name}`,
        },
        explanation: {
          en: `${nameMatch.noteEn}${siteHint}`,
          ur: `${nameMatch.noteUr}${siteHintUr}`,
        },
      };
    }

    return {
      status: "unverified",
      badgeText: {
        en: "Potentially Fake / Unverified Seller: Upload Bottle Photos to Verify",
        ur: "Naqli Ka Khatra / Unverified Seller: Bottle Photos Upload Karein",
      },
      explanation: {
        en: `"${storeTrimmed}" is NOT on our verified Pakistani brand or retailer list. Upload clear Front Label, Back Barcode, and Batch-Code photos so we can inspect the product itself.`,
        ur: `"${storeTrimmed}" hamari verified Pakistani brands ya retailers list mein shamil nahi hai. Asliyat check karne ke liye bottle ke front, back barcode aur batch code ki saaf photos upload karein.`,
      },
    };
  }

  const urlInsideProduct = extractDomainIfUrl(productTrimmed);
  if (urlInsideProduct) {
    return checkStoreDeterministic(urlInsideProduct, "");
  }

  const brandMatch = matchVerifiedByName(productTrimmed, true);
  if (brandMatch) {
    const officialSite =
      brandMatch.domains.length > 0
        ? ` (official site: ${brandMatch.domains[0]})`
        : "";
    return {
      status: "verified",
      matchedStoreName: brandMatch.name,
      matchedDomain: brandMatch.domains[0],
      badgeText: {
        en: `Verified Authentic Brand · ${brandMatch.name}`,
        ur: `Verified Authentic Brand · ${brandMatch.name}`,
      },
      explanation: {
        en: `${brandMatch.name}${officialSite} is a verified authentic brand. To make sure your specific seller is genuine too, paste the store website above or upload bottle photos.`,
        ur: `${brandMatch.name}${officialSite} ek verified authentic brand hai. Seller ki tasdeeq ke liye upar store ki website daalein ya bottle ki photos upload karein.`,
      },
    };
  }

  return {
    status: "unverified",
    badgeText: {
      en: "Potentially Fake / Unverified Brand: Upload Bottle Photos to Verify",
      ur: "Naqli Ka Khatra / Unverified Brand: Bottle Photos Upload Karein",
    },
    explanation: {
      en: `"${productTrimmed}" is not on our verified brand directory and no trusted store URL was provided. Upload clear Front Label, Back Barcode, and Batch-Code photos before trusting it.`,
      ur: `"${productTrimmed}" hamari verified brand list mein shamil nahi hai aur koi trusted store URL bhi nahi likha gaya. Bharosa karne se pehle bottle ki saaf photos upload karein.`,
    },
  };
}

const HAIR_ONLY_ITEM_PATTERN =
  /\b(Anagrow|Sebornil|Salicylic Acid Shampoo|Clarify & Rebalance Shampoo|Hair Growth|Intense Repair Shampoo|Sweet Almond Oil|Nodé Shampoo|Multi-Peptide Serum for Hair Density|Cold-Pressed Argan Oil|Follihair|Nizoral)\b/i;

const SKIN_ONLY_ITEM_PATTERN =
  /\b(Dermive|MandelAC|Spectra|Niaronic|Maxdif|Eventone|Invisible Shield|Blemish Cream|Crème B3-B5-E|Barrier Repair Moisturizer|Powerhouse Niacinamide|Salicylic Acid Body|AHA\/BHA Body|Salicylic Acid Cleanser|Hydrating Gentle Cleanser|Aloe Vera Face Wash|Saffron Face Wash|Metafil|Skinoren|Adapco|Skin-A|Benzacide|Acnesol|Dermoteen|Hydrophil|Canesten|Candid|Lamisil|Daktarin|Loceryl|Fucidin|Photoderm|Sensibio|Sébium|Atoderm|Niacinamide 10%|Salicylic Acid 2%|Glycolic Acid 7%|Alpha Arbutin|Hyaluronic Acid 2%|Azelaic Acid Suspension|Caffeine Solution|Multi-Peptide Eye)\b/i;

function formatCatalogBrandsSummary(items: string[]): string {
  return items
    .map((entry) => {
      const idx = entry.indexOf(" (");
      if (idx === -1) return entry;
      const head = entry.slice(0, idx).trim();
      if (/Hair Porosity|diluted|short-contact|High Porosity/i.test(entry)) {
        return entry;
      }
      return head;
    })
    .join(" | ");
}

const VERIFIED_LINEUP_BLOCK = Object.entries(VERIFIED_EXACT_PRODUCT_LINEUPS)
  .map(([brand, products]) => `  * ${brand}: ${products.join(" | ")}`)
  .join("\n");

const SKIN_LINEUP_BLOCK = Object.entries(VERIFIED_EXACT_PRODUCT_LINEUPS)
  .filter(
    ([brand]) =>
      brand !== "Haircare Classics & Oils (Pakistan + International)" &&
      brand !== "Sunplay / Sunscreens"
  )
  .map(([brand, products]) => {
    const filtered = products.filter((p) => !HAIR_ONLY_ITEM_PATTERN.test(p));
    return filtered.length > 0 ? `  * ${brand}: ${filtered.join(" | ")}` : "";
  })
  .filter(Boolean)
  .join("\n");

const HAIR_LINEUP_KEYS = new Set([
  "Jenpharm",
  "AccuFix Cosmetics",
  "Neophar / B&B / Safrin / Conatural / Metafil",
  "Pakistani Pharmacy Staples",
  "Bioderma",
  "The Ordinary",
  "Haircare Classics & Oils (Pakistan + International)",
]);

const HAIR_LINEUP_BLOCK = Object.entries(VERIFIED_EXACT_PRODUCT_LINEUPS)
  .filter(([brand]) => HAIR_LINEUP_KEYS.has(brand))
  .map(([brand, products]) => {
    const filtered =
      brand === "Haircare Classics & Oils (Pakistan + International)"
        ? products
        : products.filter((p) => !SKIN_ONLY_ITEM_PATTERN.test(p));
    return filtered.length > 0 ? `  * ${brand}: ${filtered.join(" | ")}` : "";
  })
  .filter(Boolean)
  .join("\n");

export const MODERN_SUNSCREENS_PROMPT = `
MODERN NON-COMEDOGENIC SUNSCREENS SOLD IN PAKISTAN (STRICT — NEVER RECOMMEND U-VEIL):
- **NEVER recommend U-Veil** anywhere (never mention or output U-Veil under any circumstance).
- Match sunscreen ONLY from these modern, non-comedogenic, dermatologist-trusted sunscreens in Pakistan:
  * **Oily / Acne-Prone Skin:** *Jenpharm Spectra Matt SC SPF 50*, *Jenpharm Spectra Block Aqua Fluid SPF 60*, *AccuFix Invisible Shield With Centella SPF 50+*, *Sunplay Skin Aqua UV Super Moisture Gel*, or *La Roche-Posay Anthelios UVMune 400 Fluid*.
  * **Dry / Sensitive Skin:** *Primary Skin Barrier Sunscreen*, *Neue Derma Hydrating Sunscreen*, *CeraVe Hydrating Mineral Sunscreen / AM Facial Moisturizing Lotion SPF 30*, or *Bioderma Photoderm Aquafluide*.
  * **Melasma / Pigmentation:** *Jenpharm Spectra Block Max 100 (Tinted)* or *Bioderma Photoderm M Tinted SPF 50+*.`;

export const VERIFIED_PK_LIP_CATALOG_PROMPT = `VERIFIED PAKISTANI CLINICAL LIP CARE CATALOG (ONLY RECOMMEND FROM THIS LIP-SAFE LIST FOR LIPS):
- **Daytime UV Protection (Essential for Dark / Pigmented Lips):**
  * *Sebamed* — "Sebamed Lip Defense SPF 30" (PKR 1,050 – 1,450)
  * *Nivea* — "Nivea Sun Protect Lip Balm SPF 30" (PKR 850 – 1,250)
  * *Neutrogena* — "Neutrogena Revitalizing Lip Balm SPF 20" (PKR 1,400 – 1,950)
- **Deep Overnight Barrier Repair & Chapping:**
  * *Vaseline* — "Vaseline Pure Petroleum Jelly (Original)" (PKR 250 – 450)
  * *Aquaphor* — "Aquaphor Healing Ointment" (PKR 1,800 – 2,600)
  * *CeraVe* — "CeraVe Healing Ointment" (PKR 2,800 – 4,200)
  * *Bioderma* — "Bioderma Atoderm Lèvres Moisturizing Stick" (PKR 1,450 – 1,950)
- **Gentle Lip Pigmentation Care (Non-Irritating):**
  * *AccuFix Cosmetics* — "AccuFix Lip Brightening Balm" (PKR 1,100 – 1,450)
  * *Conatural* — "Conatural Organic Lip Balm" (PKR 650 – 950) — ALWAYS pair daytime use with a dedicated SPF 30 lip balm!
- **Where to Buy Lip Care in Pakistan:** Pharmacies • Naheed • Al-Fatah • Vegas.pk • Daraz Mall.
- **STRICT SAFETY BAN FOR LIPS:** NEVER recommend facial acids (*MandelAC*, *Salicylic Acid*, *Glycolic Acid*, *Retinol*, *Adapalene*, *Tretinoin*) or standard foaming face washes for lips — lip mucosa lacks oil glands and burns easily.`;

export function buildApprovedBrandsPrompt(
  scope: "skin" | "hair" | "lips" | "all" = "all"
): string {
  if (scope === "lips") {
    return `\n${VERIFIED_PK_LIP_CATALOG_PROMPT}
- For each item in "recommendedProducts", fill: exact "brand", exact "name" from the lip list above, 2–3 word "subCategory", realistic "approxPricePkr", "whereToBuy": "Pharmacies • Naheed • Al-Fatah • Vegas.pk • Daraz Mall", and 2 short "bullets".
- On each product routine step, include matching "brand" and "productName" alongside "title".`;
  }

  const sections: string[] = [
    `THE 95% STRICT MASTER CATALOG PRIORITY RULE (ZERO INVENTED NAMES — FOLLOW STRICTLY):
- **95% Primary Rule:** At least 95% of ALL recommendations MUST come strictly from our Master Trusted Catalog below using exact, real product names.
- **5% Trusted Clinical Overflow Only:** Only if a clinical need is NOT covered below, you may pick an outside registered pharmacy brand (NEVER influencer/Instagram brands, NEVER U-Veil, NEVER whitening/formula/steroid creams like Dermovate/Clobevate/Betnovate/Golden Pearl/Faiza/Goree, NEVER invented/combined names).`,
  ];

  if (scope === "skin" || scope === "all") {
    sections.push(`MASTER VERIFIED FACE, BODY & FOOT BRANDS (32 FACE + 17 BODY/FOOT TRUSTED BRANDS):
- Pakistani Face Clinical: ${formatCatalogBrandsSummary(MASTER_TRUSTED_CATALOG.faceCare.pakistaniClinical)}
- Pakistani Pharmacy Staples: ${formatCatalogBrandsSummary(MASTER_TRUSTED_CATALOG.faceCare.pakistaniPharmacyStaples)}
- International Clinical: ${formatCatalogBrandsSummary(MASTER_TRUSTED_CATALOG.faceCare.internationalClinical)}
- Foot Care Brands: ${formatCatalogBrandsSummary(MASTER_TRUSTED_CATALOG.bodyAndFootCare.footCare)}
- Body Care Brands: ${formatCatalogBrandsSummary(MASTER_TRUSTED_CATALOG.bodyAndFootCare.bodyCare)}
${MODERN_SUNSCREENS_PROMPT}`);
  }

  if (scope === "hair" || scope === "all") {
    sections.push(`MASTER VERIFIED HAIR CARE BRANDS (26 TRUSTED BRANDS — POROSITY & HARD-WATER MATCHED):
- Pakistani Clinical & Pure Oils: ${formatCatalogBrandsSummary(MASTER_TRUSTED_CATALOG.hairCare.pakistaniClinicalAndPureOils)}
- Pharmacy Scalp Care: ${formatCatalogBrandsSummary(MASTER_TRUSTED_CATALOG.hairCare.pharmacyScalpCare)}
- International Clinical & Salon: ${formatCatalogBrandsSummary(MASTER_TRUSTED_CATALOG.hairCare.internationalClinicalAndSalon)}
- Additional Oils & Scalp Care: ${formatCatalogBrandsSummary(MASTER_TRUSTED_CATALOG.hairCare.additionalPureOilsAndClinicalScalpCare)}`);
  }

  const lineupBlock =
    scope === "hair"
      ? HAIR_LINEUP_BLOCK
      : scope === "skin"
        ? SKIN_LINEUP_BLOCK
        : VERIFIED_LINEUP_BLOCK;

  sections.push(`OPTIONAL SECONDARY LOCAL BRANDS (Rare <5% backup only): ${APPROVED_PK_BRAND_LINEUPS.secondaryOptionalLocalBrands.join(", ")}.

EXACT VERIFIED PRODUCT LINEUPS (CROSS-VERIFY BRAND + PRODUCT NAME — ZERO GUESSING):
${lineupBlock}
- **ZERO-GUESSING RULE:** Cross-verify that "brand" matches its real product name; omit anything uncertain.
- For each item in "recommendedProducts", fill: "brand", exact "name", 2–3 word "subCategory", realistic "approxPricePkr", "whereToBuy": "Official Brand Store • Dvago • Naheed • Daraz Mall", and 2 short "bullets".
- On each product routine step, include matching "brand" and "productName" alongside "title".`);

  return `\n${sections.join("\n\n")}`;
}

export const APPROVED_BRANDS_PROMPT = buildApprovedBrandsPrompt("all");

export const BULLET_DISCIPLINE_PROMPT = `
SIMPLE EVERYDAY LANGUAGE & FORMATTING RULES (VERY IMPORTANT):
- Write every single line in SIMPLE, FRIENDLY EVERYDAY ENGLISH that anyone can understand easily.
- AVOID complicated medical jargon or academic words (say "blackheads and whiteheads" instead of "comedonal acne", "dark spots left after pimples" instead of "post-inflammatory hyperpigmentation", "oil and flakes on scalp" instead of "seborrheic dermatitis", "skin moisture layer" instead of "epidermal barrier").
- Keep ALL helpful details clear (like rinsing with cool clean water, waiting 2–4 weeks, or using a pea-sized drop).
- Format EVERY summary, observation, cause, warning, and habit item as 2–3 SHORT, CLEAR BULLETS (max 10–12 words per bullet).
- Keep morning and evening routines to 3–4 clear steps each.
- NEVER write long paragraphs anywhere.
- NEVER use em-dashes ("—") anywhere in any generated text, heading, badge, or bullet; use commas, colons, or short sentences instead.
- For every routine step:
  * "timingBadge": short tag like "MORNING · DAILY" or "NIGHT · 3X A WEEK" (max 3–4 words)
  * "usageCaution": mandatory short caution badge (max 5–6 words), e.g., "Patch test 48h · No shaving right before", "Bleaches fabric · Wash hands", "Gentle daily use · Sun-safe", or "Short-contact 5 min wash only"
  * "title": plain product/step name (e.g., "Jenpharm MandelAC Face Wash")
  * "brand": exact verified brand name if a product is used
  * "productName": exact verified product name if a product is used
  * "dose": simple amount (max 8 words, e.g., "Coin-sized drop on wet fingertips")
  * "method": simple step-by-step instructions (max 10–12 words, e.g., "Wash gently for 20–30 seconds, rinse with cool clean water")
  * "note": simple helpful tip or timing (max 10–12 words, e.g., "Do not scrub red bumps; skin calms in 3–4 weeks")
- Provide BOTH simple English ("en") AND simple, natural Pakistani Roman Urdu in Latin letters ONLY ("ur": NEVER Arabic/Urdu script) in every bilingual field.`;

export function hydrateProductPicks(
  picks: RecommendedProductPick[] | undefined
): RecommendedProductPick[] {
  return (picks || [])
    .filter((p) => {
      if (!p || (!p.name && !p.productId)) return false;
      const combined = `${p.brand || ""} ${p.name || ""} ${p.productId || ""}`.toLowerCase();
      // Hard guard: never let U-Veil pass through into UI output
      if (/u[-\s]?veil/.test(combined)) return false;
      return true;
    })
    .map((pick) => {
      const affiliateHit = findJenpharmAffiliate({
        brand: pick.brand,
        name: pick.name,
        productId: pick.productId,
      });
      const match = findCatalogMatch(pick.productId, pick.brand, pick.name);

      if (affiliateHit) {
        const matchAffiliate = match
          ? findJenpharmAffiliate({
              brand: match.brand,
              name: match.name,
              productId: match.id,
            })
          : null;
        const isSameCatalogProduct =
          Boolean(match) && matchAffiliate?.id === affiliateHit.id;

        return {
          ...pick,
          brand: "Jenpharm",
          productId: isSameCatalogProduct
            ? match!.id
            : pick.productId || affiliateHit.id,
          name: pick.name?.trim() || affiliateHit.productName,
          subCategory:
            pick.subCategory ||
            (isSameCatalogProduct ? match!.subCategory : "Dermatologist Formulation"),
          approxPricePkr:
            pick.approxPricePkr ||
            (isSameCatalogProduct ? match!.approxPricePkr : "Check Pharmacy"),
          whereToBuy: "Official Brand Store • Dvago • Naheed • Daraz Mall",
        };
      }

      if (!match) {
        return {
          ...pick,
          whereToBuy:
            pick.whereToBuy?.trim() ||
            "Official Brand Store • Dvago • Naheed • Daraz Mall",
        };
      }
      return {
        ...pick,
        productId: match.id,
        brand: match.brand,
        name: match.name,
        subCategory: pick.subCategory || match.subCategory,
        approxPricePkr: pick.approxPricePkr || match.approxPricePkr,
        whereToBuy: "Official Brand Store • Dvago • Naheed • Daraz Mall",
      };
    });
}

export function safeParseGeminiJson<T>(rawText: string): T {
  const trimmed = rawText.trim();

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // Fall through to code-block and brace extraction (e.g. for Google Search grounded outputs)
  }

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim()) as T;
    } catch {
      // Fall through to brace extraction
    }
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1)) as T;
  }

  const cleaned = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

export function buildHealthProfilePromptBlock(
  healthProfile?: HealthProfile
): string {
  if (!healthProfile) {
    return "USER HEALTH PROFILE: Not provided.";
  }

  const history = Array.isArray(healthProfile.hormonalMedicalHistory)
    ? healthProfile.hormonalMedicalHistory.filter(Boolean)
    : [];
  const pregnancy = (healthProfile.pregnancyBreastfeedingStatus || "No").trim();
  const meds = (healthProfile.currentMedicationsOrActives || "").trim();
  const ageGroup = (healthProfile.ageGroup || "").trim();

  const hasCustomData =
    history.length > 0 ||
    (pregnancy !== "" && pregnancy !== "No") ||
    meds !== "" ||
    ageGroup !== "";

  if (!hasCustomData) {
    return "USER HEALTH PROFILE: Not provided (user skipped optional background profile).";
  }

  const rules: string[] = [];

  if (
    pregnancy === "Pregnant / Trying to Conceive" ||
    pregnancy === "Breastfeeding"
  ) {
    rules.push(
      `- PREGNANCY / BREASTFEEDING SAFETY (${pregnancy}) [CRITICAL OVERRIDE]:` +
        `\n  * STRICTLY FORBID all retinoids (Adapco, Adapalene, Skin-A, Tretinoin, Retinol, Retinal — including Beauty of Joseon Revive Eye Serum Ginseng + Retinal — and Isotretinoin) and high-dose Salicylic Acid (including AccuFix Salicylic Acid Shampoo or leave-on BHA toners/serums).` +
        `\n  * ONLY recommend pregnancy-safe alternatives (e.g., Azelaic Acid like Skinoren Cream, Niacinamide, Ceramides, Hyaluronic Acid, Centella, CeraVe Eye Repair Cream / The Ordinary Caffeine Solution 5% + EGCG / Primary Skin Cica Peptide Serum for under-eyes, CeraVe Hydrating Mineral Sunscreen / Primary Skin Barrier Sunscreen, and gentle hydrating shampoos like L'Oreal Paris Elvive Hyaluron Moisture 72H or Conatural Sulfate-Free).` +
        `\n  * Include a clear doctor-confirmation note in summaryBullets / redFlags.`
    );
  }

  if (history.includes("PCOS / Hormonal Imbalance")) {
    rules.push(
      `- PCOS / HORMONAL IMBALANCE:` +
        `\n  * Factor in androgen-driven chin/jawline acne, oily T-zone, or crown hair thinning in assessment.summaryBullets and triggersIdentified.` +
        `\n  * Recommend gentle non-comedogenic topical support alongside doctor-aligned hormonal management (gynecologist/dermatologist review).`
    );
  }

  if (
    history.includes("Thyroid Issues") ||
    history.includes("Iron Deficiency / Anemia")
  ) {
    rules.push(
      `- THYROID / IRON DEFICIENCY / ANEMIA:` +
        `\n  * Explicitly highlight internal nutrient & hormone links (e.g., ferritin/iron, thyroid levels) inside Card 1 ("assessment.summaryBullets") AND Card 5 ("redFlags.whenToSeeDermatologist" / "doctorEscalationBullets") alongside gentle topical care.`
    );
  }

  if (history.includes("Eczema / Psoriasis / Rosacea")) {
    rules.push(
      `- ECZEMA / PSORIASIS / ROSACEA SENSITIVITY:` +
        `\n  * Avoid harsh physical scrubs, strong fragrance, bleaching creams, or high-percentage exfoliating acids. Prioritize soothing barrier repair (Ceramides, Physiogel Daily Moisture Therapy Cream, CeraVe Moisturizing Cream, Jenpharm Dermive Sensitive Moisturizer) and calm scalp washes.`
    );
  }

  if (meds && meds.toLowerCase() !== "none") {
    rules.push(
      `- CURRENT MEDICATIONS / ACTIVES ("${meds}"):` +
        `\n  * NEVER clash with their active prescription! If taking oral Isotretinoin/Accutane or topical Tretinoin, prescribe ultra-gentle cleanser + rich barrier moisturizer + broad-spectrum modern sunscreen ONLY (no extra exfoliants or retinoids). If using Minoxidil or multivitamins, align hair care gently around it.`
    );
  }

  if (ageGroup) {
    rules.push(
      `- AGE GROUP (${ageGroup}): Tailor active strength and advice safely for this life stage${ageGroup === "Under 18" ? " (keep actives very gentle and age-appropriate, avoiding harsh anti-aging treatments)" : ""}.`
    );
  }

  return `USER PERSONAL HEALTH PROFILE (MUST FACTOR INTO EVERY CARD & PRODUCT PICK):
- Hormonal & Medical History: ${history.length > 0 ? history.join(", ") : "None specified"}
- Pregnancy / Breastfeeding Status: ${pregnancy}
- Current Medications or Actives: ${meds || "None specified"}
- Age Group: ${ageGroup || "Not specified"}

MANDATORY HEALTH-PROFILE CLINICAL RULES:
${rules.join("\n")}`;
}

function buildAreaSpecificProtocolPrompt(bodyArea: string): string {
  switch (bodyArea) {
    case "Under-Eyes":
      return `AREA-SPECIFIC PROTOCOL — UNDER-EYES & PERIORBITAL (STRICT):
- CLINICAL DIFFERENTIAL (MUST DISTINGUISH CLEARLY IN RANKED POSSIBILITIES):
  1. **Pigmented Dark Circles (Brown):** Excess melanin, sun exposure, genetics, or chronic eye rubbing -> gentle brightening & daily sunglasses/mineral SPF around orbital bone.
  2. **Vascular Dark Circles (Bluish / Purple):** Thin translucent skin showing underlying blood vessels, aggravated by poor sleep, screen fatigue, nasal/sinus congestion, or anemia -> *The Ordinary Caffeine Solution 5% + EGCG* + cold compresses + allergy/iron check.
  3. **Structural Hollowness (Tear Trough):** Deep anatomic groove casting a shadow -> explain honestly that creams cannot fill a structural hollow, though *The Ordinary Multi-Peptide Eye Serum* / *La Roche-Posay Hyalu B5 Eyes* can plump surface hydration.
  4. **Fluid Puffiness (Puffy Bags):** Morning salt/fluid retention or allergy swelling -> *The Ordinary Caffeine Solution 5% + EGCG* or *Vichy Minéral 89 Eyes*.
  5. **Periorbital Eczema:** Dry, crepey, itchy, stinging eyelids -> ultra-bland soothing barrier only (*Bioderma Sensibio Eye*, *Avene Soothing Eye Contour Cream*, *CeraVe Eye Repair Cream*), STOP all face acids/fragrances/rubbing.
  6. **Milia (Tiny White Bumps):** Trapped keratin bumps caused by heavy creams or oils -> EXPLICITLY WARN AGAINST applying heavy oils, Vaseline, or rich occlusive face creams near the eyes! Keep texture ultra-light gel/serum only and NEVER squeeze milia at home.
- APPROVED EYE-SAFE PRODUCTS ONLY (APPLY LIGHTLY ALONG ORBITAL BONE ONLY — NEVER DIRECTLY ON EYELIDS OR LASH LINE):
  * International Clinical: *The Ordinary Caffeine Solution 5% + EGCG*, *The Ordinary Multi-Peptide Eye Serum*, *CeraVe Eye Repair Cream*, *Beauty of Joseon Revive Eye Serum (Ginseng + Retinal)* [STRICTLY NON-PREGNANT & NON-BREASTFEEDING ONLY], *La Roche-Posay Hyalu B5 Eyes / Pigmentclar Eyes*, *Eucerin Anti-Pigment / Hyaluron-Filler Eye*, *Neutrogena Hydro Boost Eye Gel-Cream*, *Bioderma Sensibio Eye*, *Vichy Minéral 89 Eyes*, *Avene Soothing Eye Contour Cream*.
  * Pakistani Clinical: *Primary Skin Cica Peptide Serum* (orbital bone only), *AccuFix Peptide / Caffeine Eye care*, *Neue Derma Eye Gel*.
- Strictly forbid strong facial acids, harsh scrubs, heavy oils (if milia), or steroid/whitening formula creams around thin eye skin.
- URGENT DOCTOR / EYE SPECIALIST ALERT: Trigger "triageDecision.status": "see_dermatologist_directly" and "redFlags.urgencyLevel": "urgent" immediately if **painful eyelid swelling**, **one-sided sudden swelling (One Eye Only)**, or **vision discomfort / eye redness** is reported — warn user to see a PMDC Dermatologist or Eye Specialist (Ophthalmologist) directly before applying eye products.`;

    case "Lips":
      return `AREA-SPECIFIC PROTOCOL — CLINICAL LIP CARE (STRICT — PAKISTANI PHARMACY LIP SAFETY):
- **ZERO FACIAL ACIDS OR FACE WASHES ON LIPS:** Because lip mucosa lacks oil glands and has a thin barrier that burns easily, you MUST NEVER recommend facial acids (*Jenpharm MandelAC*, *Salicylic Acid*, *Glycolic Acid*, *Retinol*, *Adapalene*, *Tretinoin*) or standard face washes for lips!
- **STRICTLY RECOMMEND ONLY DERMATOLOGIST-TRUSTED LIP PRODUCTS AVAILABLE IN PAKISTAN (Pharmacies, Daraz Mall, Naheed, Al-Fatah, Vegas.pk):**
  * **Daytime UV Protection (Essential for Dark/Pigmented Lips):** *Sebamed Lip Defense SPF 30*, *Nivea Sun Protect Lip Balm SPF 30*, or *Neutrogena Revitalizing Lip Balm SPF 20*.
  * **Deep Overnight Barrier Repair & Chapping:** *Vaseline Pure Petroleum Jelly (Original)*, *Aquaphor Healing Ointment*, *CeraVe Healing Ointment*, or *Bioderma Atoderm Lèvres Moisturizing Stick*.
  * **Gentle Lip Pigmentation Care (Non-Irritating):** *AccuFix Lip Brightening Balm* or *Conatural Organic Lip Balm* (MUST pair strictly with a daytime SPF 30 lip balm so UV rays do not darken pigment further).
- **STRICT DIY & HABIT WARNINGS ("lifestyleAndWater.habitChecklist" & "redFlags.warningBullets"):**
  * Strongly warn against DIY **lemon juice**, **baking soda**, **toothpaste**, or **harsh sugar scrubs** — these strip thin lip skin and trigger rebound hyperpigmentation and contact dermatitis!
  * Warn against lip licking, peeling dead skin with teeth/fingers, heavily fragranced matte lipsticks during flare-ups, and steroid/whitening formula creams on lips.
- **CLINICAL RED-FLAG TRIAGE FOR LIPS:**
  * If photos or boxes show **painful cracks at the corners of the mouth (angular cheilitis)**, **blisters / fever blisters / cold sores**, or **lip swelling / allergy burning**:
    - Clearly advise consulting a **PMDC Dermatologist or Pharmacist** for targeted antifungal (for angular cheilitis) or antiviral (for cold sores) treatment rather than relying on cosmetic balms alone.
    - If painful blisters/cold sores or noticeable lip swelling is present, trigger "triageDecision.status": "see_dermatologist_directly" and "redFlags.urgencyLevel": "urgent" (keep routine steps bland barrier-only hold + plain cool rinse, and warn not to share balms/utensils or pick blisters).
    - For angular cheilitis without severe swelling, set urgencyLevel to "consult_soon" (or "urgent" if cracking/bleeding is severe) and highlight checking iron/Vitamin B12 deficiency in Card 5.`;

    case "Neck & Underarms":
      return `AREA-SPECIFIC PROTOCOL — NECK & UNDERARMS (STRICT):
- Recommend ONLY verified targeted care:
  * Exfoliating & Tone Care: *The Ordinary Glycolic Acid 7% Toning Solution* (2–3x/week swipe for odor & mild darkening — EXPLICITLY WARN NEVER to apply right after shaving or waxing!), *AccuFix AHA/BHA Body Lotion*, *BioOne Glycolic Acid Cream*, *CeraVe SA Smoothing Cream*, *Paula's Choice 2% BHA*.
  * Pigmentation Brightening: *Skinoren (Azelaic Acid 20%)*, *Jenpharm Maxdif*, or *Eventone-C*.
  * Soothing Shaving / Friction Barrier: *Physiogel*, *Cetaphil*, or *Bioderma Atoderm*, plus fragrance-free *Dove Sensitive / Vichy* deodorants.
  * Humid Sweat / Yeast Rashes: *Canesten (Clotrimazole Powder/Cream)* or *Candid / Clotrimazole Antifungal Dusting Powder*.
- MEDICAL RED FLAG: If velvety dark neck creases (*acanthosis nigricans*) are visible or described, advise checking blood sugar (HbA1c / fasting glucose) and PCOS with a doctor in Card 1 and Card 5.`;

    case "Back & Chest":
      return `AREA-SPECIFIC PROTOCOL — BACK & CHEST (STRICT):
- Recommend ONLY verified body-acne & fungal-patch staples:
  * Exfoliating Washes & Lotions: *AccuFix Salicylic Acid Body Wash & AHA/BHA Body Lotion*, *Jenpharm MandelAC Wash*, *BioOne Acno Wash*, *CeraVe SA Smoothing Cleanser*, *Paula's Choice Clear Acne Body Spray 2% BHA*, *La Roche-Posay Effaclar Micro-Peeling Gel*, *Bioderma Sébium Gel Moussant*, *Neutrogena Body Clear Wash*.
  * Antibacterial Acne: *Benzacide (Benzoyl Peroxide)* [EXPLICITLY WARN it bleaches colored clothes & towels!], *Acnesol (Clindamycin lotion/gel)*.
  * Fungal / *Tinea Versicolor* / Fungal Folliculitis: *Conaz 2% / Selsun Blue / Nizoral / Phototar* (short-contact 5-min wash in the shower, paired with ultra-light oil-free gel moisture if needed).
  * Post-Acne Dark Marks: *Skinoren (Azelaic Acid 20%)* or *The Ordinary Alpha Arbutin 2% + HA*.`;

    case "Hands & Nails":
      return `AREA-SPECIFIC PROTOCOL — HANDS & NAILS (STRICT):
- CLINICAL DIFFERENTIAL: Distinguish irritant hand eczema (dish soap/detergent/bore water), dyshidrotic eczema (tiny itchy side-finger blisters), finger-web scabies (intense night itch + someone at home itching -> URGENT DOCTOR TRIAGE), paronychia (throbbing red nail fold swelling -> URGENT DOCTOR TRIAGE), and fungal nails (thick, yellow, crumbly nails).
- Recommend ONLY verified hand & nail care:
  * Pakistani Clinical & Pharmacy Moisturizers: *Jenpharm Dermive Urea & Dermive Sensitive*, *Hydrophil 10% Urea Cream*, *Metafil Moisturizing Lotion*, *Bioderma Atoderm / Physiogel* (for hand eczema / dish-soap & detergent irritation).
  * International Hand Repair & Cuticles: *CeraVe Therapeutic Hand Cream*, *Neutrogena Norwegian Formula Hand Cream*, *Eucerin UreaRepair 5% Hand Cream*, *La Roche-Posay Cicaplast Mains*, *Avene Cicalfate+ Hand Cream*, *Aveeno Skin Relief Hand Cream*, *O'Keeffe's Working Hands*, *Vaseline Pure Petroleum Jelly* + *Saeed Ghani / Conatural Sweet Almond Oil* or *The Ordinary 100% Cold-Pressed Argan Oil* for brittle nails & cuticles.
  * Fungal Nails / Cuticle Yeast: *Canesten*, *Lamisil*, *Daktarin (Miconazole)*, or *Loceryl (Amorolfine)* — ALWAYS include a dermatologist consultation note in Card 5 if nails look thickened, yellow, lifted, or crumbly.`;

    case "Feet & Heels":
      return `AREA-SPECIFIC PROTOCOL — FEET & HEELS (STRICT):
- CRITICAL URGENT MEDICAL SAFETY RULE (MANDATORY OVERRIDE):
  * If Box 2, Box 7, or Health Profile mentions **Diabetes / High Sugar**, **Foot Numbness / Tingling**, **Poor Circulation**, **Painful / Bleeding Cracks** with diabetes risk, or **Hot / Swollen / Red** foot skin:
    1. IMMEDIATELY trigger "triageDecision.status": "see_dermatologist_directly", "badge.en": "🚨 Go Directly to a PMDC Dermatologist / Doctor", "badge.ur": "🚨 Seedha Doctor Ko Dikhayein", and "redFlags.urgencyLevel": "urgent".
    2. STRICTLY FORBID home blade/razor callus cutting, pumice stone scrubbing, or salicylic acid / glycolic acid foot peels — warn that diabetics/numb feet risk serious foot ulcers and infection without in-person doctor/podiatrist care!
- Recommend ONLY verified Foot Care Master Catalog items (for safe non-diabetic/non-infected cases):
  * Cracked Heels & Hardened Soles: *Hydrophil 10% Urea Cream* (or 20% Heel Cream), *Jenpharm Dermive Urea Moisturizer*, *Eucerin UreaRepair Foot Cream*, *CeraVe SA Renewing Foot Cream*, and *Vaseline Pure Petroleum Jelly* (overnight occlusion with clean cotton socks).
  * Athlete's Foot / Soggy Toe Webs / Moccasin Peeling: *Canesten (Clotrimazole)* or *Lamisil (Terbinafine)* + thoroughly drying between toes after Wudu & avoiding tight sweaty socks.`;

    case "Arms & Legs":
      return `AREA-SPECIFIC PROTOCOL — ARMS & LEGS (STRICT):
- Recommend ONLY verified Body Care Master Catalog items:
  * Strawberry Skin / KP & Rough Texture: *AccuFix Salicylic Acid Body Wash & AHA/BHA Body Lotion*, *CeraVe SA Smoothing Cleanser & Cream*, *The Ordinary Glycolic Acid 7% Toning Solution*.
  * Body Eczema & Dryness: *Physiogel Daily Moisture / Calming Relief Body Lotion*, *Bioderma Atoderm Intensive Baume*, *Cetaphil Moisturizing Lotion/Cream*, *Aveeno Daily Moisturizing / Dermexa Lotion*, *Sebamed Liquid Face & Body Wash pH 5.5*, *Dove Sensitive Bar/Wash*.
  * Exposed Arms / Tanning Protection: *Jenpharm Spectra Block* or *Sunplay Skin Aqua UV Super Moisture Gel*.`;

    case "Other Body Area":
      return `AREA-SPECIFIC PROTOCOL — CUSTOM / OTHER BODY AREA (STRICT):
- Read Box 1 carefully to identify the exact body part described by the user (e.g., behind ears, abdomen, back of neck, shoulder, waistline).
- Match care strictly to that exact anatomical spot using verified gentle Master Catalog washes, barrier repair lotions (*Physiogel*, *Bioderma Atoderm*, *Cetaphil*, *Aveeno*, *Metafil*, *Jenpharm Dermive Sensitive*), or targeted antifungals (*Canesten*, *Lamisil*, *Conaz 2%*) if fungal ring/sweat rash is likely.
- Trigger "triageDecision.status": "see_dermatologist_directly" immediately if **Hot / Swollen**, **Blisters / Pus**, or household itching (scabies) is reported.`;

    default:
      return `AREA-SPECIFIC PROTOCOL — FACE CARE (STRICT):
- Recommend primarily from our 32 Master Verified Face Care Brands!
- If fungal acne (uniform itchy forehead/hairline/jawline bumps) is likely: prescribe short-contact *Conaz 2% / Selsun Blue* wash 2x/week and EXPLICITLY pair it with an ultra-light oil-free gel moisturizer (*Jenpharm Dermive Oil-Free*, *Neutrogena Hydro Boost Water Gel*, or *Neue Derma Oil-Free / Moisturizing Gel*) instead of heavy oils or rich creams.`;
  }
}

export interface AnalyzeSkinRequestBody {
  bodyArea: string;
  userPersonalNote?: string;
  healthProfile?: HealthProfile;
  structuredInputs?: Partial<SkinStructuredInputs>;
  context: {
    skinType: string;
    waterSupply: string;
    climate: string;
    budget: string;
    specificSymptoms?: string;
    currentRoutine?: string;
    note?: string;
  };
  images: { slotLabel: string; base64: string; mimeType: string }[];
}

export function buildSkinAnalysisPrompt(body: AnalyzeSkinRequestBody): string {
  const ctx = body.context || ({} as AnalyzeSkinRequestBody["context"]);
  const s = body.structuredInputs || {};
  const specificSymptoms = (
    ctx.specificSymptoms ??
    ctx.note ??
    body.userPersonalNote ??
    ""
  ).trim();
  const currentRoutine = (
    s.pastCreamsAndRoutine ??
    ctx.currentRoutine ??
    ""
  ).trim();
  const userPersonalNote = (
    body.userPersonalNote ??
    ctx.note ??
    ""
  ).trim();

  return `You are DerméScan, a friendly Pakistani skin and body care specialist helper. You cross-reference uploaded photos with all 7 clinical symptom boxes and the user's Health Profile to give honest triage and safe care — NOT a final doctor diagnosis.

STEP 1 — PHOTO CHECK (DO THIS FIRST):
- Look at each uploaded photo (${body.images.length} angle(s) for area: "${body.bodyArea}").
- If ANY photo is too blurry, way too dark, blocked, or NOT human skin, lips, or nails, set "isValidPhoto" to false, list those exact slot labels in "retakeSlots", and write a short polite "retakeMessage" explaining what to retake in natural light.
- Otherwise, set "isValidPhoto" to true and "retakeSlots" to [].

STEP 2 — IF PHOTOS ARE CLEAR, CROSS-REFERENCE PHOTOS + ALL 7 BOXES + HEALTH PROFILE:
User Baseline:
- Body Area: ${body.bodyArea}
- Skin Type: ${ctx.skinType}
- Water Supply: ${ctx.waterSupply}
- Weather / Climate: ${ctx.climate}
- Budget Preference: ${ctx.budget}

${buildHealthProfilePromptBlock(body.healthProfile)}

7-BOX STRUCTURED CLINICAL ANSWERS FOR "${body.bodyArea}":
${
  body.bodyArea === "Under-Eyes"
    ? `- Box 1 — Duration: ${(s.duration || "").trim() || "(Not specified)"}
- Box 2 — Eye-Area Sensation: ${(s.sensation || "").trim() || "(Not specified)"}
- Box 3 — Under-Eye Look & Texture: ${(s.texture || "").trim() || "(Not specified)"}
- Box 4 — Symmetry & Area: ${(s.spreadingPattern || "").trim() || "(Not specified)"}
- Box 5 — Sleep, Screen & Eye Triggers: ${(s.triggersAndClimate || "").trim() || "(Not specified)"}
- Box 6 — Past & Current Eye / Face Products: ${currentRoutine || "(Not specified)"}
- Box 7 — Family & Health Context: ${(s.familyAndHouseholdHistory || "").trim() || "(Not specified)"}`
    : body.bodyArea === "Lips"
      ? `- Box 1 — Duration: ${(s.duration || "").trim() || "(Not specified)"}
- Box 2 — Main Lip Concern & Sensation: ${(s.sensation || "").trim() || "(Not specified)"}
- Box 3 — Lip Look & Texture: ${(s.texture || "").trim() || "(Not specified)"}
- Box 4 — Exact Lip Zone & Corners: ${(s.spreadingPattern || "").trim() || "(Not specified)"}
- Box 5 — Daily Lip Triggers: ${(s.triggersAndClimate || "").trim() || "(Not specified)"}
- Box 6 — Past Lip Products & DIY Remedies: ${currentRoutine || "(Not specified)"}
- Box 7 — Dehydration, Vitamins & Meds History: ${(s.familyAndHouseholdHistory || "").trim() || "(Not specified)"}`
      : body.bodyArea === "Hands & Nails"
      ? `- Box 1 — Duration: ${(s.duration || "").trim() || "(Not specified)"}
- Box 2 — Hand & Nail Sensation: ${(s.sensation || "").trim() || "(Not specified)"}
- Box 3 — Skin & Nail Texture: ${(s.texture || "").trim() || "(Not specified)"}
- Box 4 — Area & Spread: ${(s.spreadingPattern || "").trim() || "(Not specified)"}
- Box 5 — Daily Hand & Water Triggers: ${(s.triggersAndClimate || "").trim() || "(Not specified)"}
- Box 6 — Past & Current Hand / Nail Care: ${currentRoutine || "(Not specified)"}
- Box 7 — Family & Health Context: ${(s.familyAndHouseholdHistory || "").trim() || "(Not specified)"}`
      : body.bodyArea === "Feet & Heels"
        ? `- Box 1 — Duration: ${(s.duration || "").trim() || "(Not specified)"}
- Box 2 — Foot & Heel Sensation: ${(s.sensation || "").trim() || "(Not specified)"}
- Box 3 — Foot & Sole Texture: ${(s.texture || "").trim() || "(Not specified)"}
- Box 4 — Foot Location & Spread: ${(s.spreadingPattern || "").trim() || "(Not specified)"}
- Box 5 — Footwear & Climate Triggers: ${(s.triggersAndClimate || "").trim() || "(Not specified)"}
- Box 6 — Past & Current Foot Care: ${currentRoutine || "(Not specified)"}
- Box 7 — Diabetes & Health Red Flags: ${(s.familyAndHouseholdHistory || "").trim() || "(Not specified)"}`
        : body.bodyArea === "Other Body Area"
          ? `- Box 1 — Which Body Part & Duration: ${(s.duration || "").trim() || "(Not specified)"}
- Box 2 — Sensation / Feeling: ${(s.sensation || "").trim() || "(Not specified)"}
- Box 3 — Skin Texture: ${(s.texture || "").trim() || "(Not specified)"}
- Box 4 — Spread & Shape: ${(s.spreadingPattern || "").trim() || "(Not specified)"}
- Box 5 — Possible Triggers & Climate: ${(s.triggersAndClimate || "").trim() || "(Not specified)"}
- Box 6 — Past Creams & Current Products: ${currentRoutine || "(Not specified)"}
- Box 7 — Family & Health History: ${(s.familyAndHouseholdHistory || "").trim() || "(Not specified)"}`
          : `- Box 1 — Duration: ${(s.duration || "").trim() || "(Not specified)"}
- Box 2 — Sensation / Feeling: ${(s.sensation || "").trim() || "(Not specified)"}
- Box 3 — Texture: ${(s.texture || "").trim() || "(Not specified)"}
- Box 4 — Spreading Pattern: ${(s.spreadingPattern || "").trim() || "(Not specified)"}
- Box 5 — Triggers & Climate: ${(s.triggersAndClimate || "").trim() || "(Not specified)"}
- Box 6 — Past Creams & Current Routine / Treatment History: ${currentRoutine || "(Not specified)"}
- Box 7 — Family & Household History: ${(s.familyAndHouseholdHistory || "").trim() || "(Not specified)"}`
}
${!s.duration && specificSymptoms ? `- Combined Symptoms Note: "${specificSymptoms}"` : ""}
${userPersonalNote && !s.duration && userPersonalNote !== specificSymptoms ? `- Extra User Note: "${userPersonalNote}"` : ""}

${buildAreaSpecificProtocolPrompt(body.bodyArea)}

MANDATORY CLINICAL TRIAGE & OUTPUT RULES:
1. **RANKED POSSIBILITIES (2–3 CONCISE BULLETS IN "assessment.summaryBullets"):**
   - Cross-reference visual cues from the photos with ALL 7 box answers (especially duration, night itch vs pain, texture, ring/symmetric/crease pattern, and household history).
   - Format the first 2–3 bullets in "assessment.summaryBullets" cleanly as ranked possibilities from most likely to alternative possibilities, e.g.:
     * "1st Most Likely: Fungal or sweat bumps, matches humid itching and tiny uniform bumps."
     * "2nd Possibility: Friction rash, possible if tight clothes or heat worsen it."
     * Plus 1 crisp audit bullet telling the user what to **STOP** right away from Box 6 if anything clashes (e.g., whitening/steroid formula creams, walnut scrubs, lemon/toothpaste/sugar scrubs on lips, home blade cutting on feet, heavy oils causing milia, or clashing acids).

2. **CLEAR TRIAGE DECISION BADGE ("triageDecision" — CRITICAL):**
   - Carefully check BOTH the uploaded photos and Boxes 1–7 + Health Profile for URGENT MEDICAL RED FLAGS:
     * Painful eyelid swelling, sudden one-sided eye swelling, or vision discomfort (needs direct PMDC dermatologist / eye specialist check!)
     * Lip blisters / cold sores, sudden lip swelling, or painful raw cracked lip corners (angular cheilitis needs PMDC dermatologist or pharmacist check for targeted antiviral/antifungal treatment!)
     * Spreading hot redness, warmth, throbbing swelling, nail-fold throbbing infection (paronychia), or streaks (possible cellulitis)
     * Honey-colored crusted sores or oozing blisters (possible impetigo)
     * Suspected scabies (worse itching at night + finger webs/wrist/body creases + someone else at home itching too)
     * Deep, painful cystic nodules or severe nodulocystic acne
     * Cracked/bleeding heels, foot sores, or ulcers when Box 2, Box 7, or Health Profile mentions **Diabetes / High Sugar**, **Foot Numbness / Tingling**, **Poor Circulation**, or **Hot / Swollen / Red** foot skin (STRICTLY FORBID home callus cutting or acid peels!)
     * Severe steroid-damaged skin (paper-thin skin, visible broken veins/capillaries, severe burning rebound after stopping fairness/formula creams)
   - **IF ANY URGENT RED FLAG IS PRESENT:**
     * Set "triageDecision.status": "see_dermatologist_directly"
     * Set "triageDecision.badge.en": "🚨 Go Directly to a PMDC Dermatologist / Doctor"
     * Set "triageDecision.badge.ur": "🚨 Seedha PMDC Skin Doctor Ko Dikhayein"
     * Set "redFlags.urgencyLevel": "urgent"
     * Write a crystal-clear "triageDecision.reason" explaining WHY an in-person PMDC dermatologist/doctor (or eye specialist if eyelid/vision symptoms) visit is needed BEFORE applying over-the-counter actives.
     * Pause harsh actives: keep "routine.morning" and "routine.evening" either empty ([]) OR strictly gentle wash + plain barrier hold only (never prescribe acids, retinoids, benzoyl peroxide, or peels on urgent red-flag skin!).
   - **IF SAFE FOR TARGETED HOME & PHARMACY CARE:**
     * Set "triageDecision.status": "home_routine_safe"
     * Set "triageDecision.badge.en": "✓ Safe for Targeted Home & Pharmacy Routine"
     * Set "triageDecision.badge.ur": "✓ Ghar Aur Pharmacy Routine Ke Liye Safe"
     * Set "triageDecision.reason" explaining calmly why it is safe for targeted home & pharmacy care and what warning signs should still prompt a doctor check.
     * Build a complete, non-clashing AM & PM plan (3–4 steps per column) strictly 95% from our Master Trusted Catalog with mandatory "usageCaution" badges on every step!

3. **PAKISTANI WATER & SMART 95% CATALOG BUDGET MATCHING (Current selection: "${ctx.budget}"):**
   - If Water Type is "Hard / Bore Water", explain mineral buildup & barrier dryness in triggers and Card 4 water/habit bullets.
   - **95% STRICT MASTER CATALOG RULE:** At least 95% of all picks MUST come strictly from our Master Catalog below using exact real names (NEVER U-Veil).
   ${
     ctx.budget === "Budget Friendly"
       ? `* "Budget Friendly": Prioritize affordable Pakistani clinical & pharmacy staples from our Master Catalog below (plus modern budget sunscreens for their skin type/melasma).`
       : `* "Standard": Balance Pakistani clinical stars with international clinical staples in our Master Catalog below (including modern international/local sunscreens for their skin type/melasma).`
   }
- Select 3 to 4 best-matched verified products in "recommendedProducts".

${buildApprovedBrandsPrompt(body.bodyArea === "Lips" ? "lips" : "skin")}

${BULLET_DISCIPLINE_PROMPT}

Uploaded image order and slot labels:
${body.images.map((img, idx) => `Image ${idx + 1}: "${img.slotLabel}"`).join("\n")}`;
}

export interface AnalyzeHairRequestBody {
  userPersonalNote?: string;
  healthProfile?: HealthProfile;
  structuredInputs?: Partial<HairStructuredInputs>;
  context: {
    hairPorosity?: string;
    hairStrandType?: string;
    waterSupply?: string;
    budget?: string;
    specificSymptoms?: string;
    currentRoutine?: string;
    scalpType?: string;
    hairTexture?: string;
    oilingHabit?: string;
    note?: string;
  };
  images: { slotLabel: string; base64: string; mimeType: string }[];
}

export function buildHairAnalysisPrompt(body: AnalyzeHairRequestBody): string {
  const ctx = body.context || {};
  const s = body.structuredInputs || {};
  const hairPorosity = (ctx.hairPorosity || "Not Sure").trim();
  const hairStrandType = (ctx.hairStrandType || ctx.hairTexture || "Wavy").trim();
  const waterSupply = (ctx.waterSupply || "Normal / Filtered Water").trim();
  const budget = (ctx.budget || "Budget Friendly").trim();
  const specificSymptoms = (
    ctx.specificSymptoms ||
    ctx.scalpType ||
    ""
  ).trim();
  const currentRoutine = (
    s.currentRoutineAndHistory ||
    ctx.currentRoutine ||
    ctx.oilingHabit ||
    ""
  ).trim();
  const extraNote = (body.userPersonalNote ?? ctx.note ?? "").trim();

  return `You are DerméScan's comprehensive Hair & Scalp Specialist Helper for Pakistan. You cross-reference every structured answer alongside the photos to solve scalp, hairline, and strand problems cleanly — NOT a final doctor diagnosis.

STEP 1 — PHOTO CHECK:
- Look closely at all uploaded hair/scalp photos (${body.images.length} angle(s)).
- If any photo is too blurry, dark, or NOT hair/scalp, set "isValidPhoto" to false, list those exact slot labels in "retakeSlots", and write a simple "retakeMessage".
- Otherwise set "isValidPhoto" to true and "retakeSlots" to [].

STEP 2 — IF PHOTOS ARE CLEAR, CROSS-REFERENCE ALL 5 BOXES + PHOTOS + HEALTH PROFILE:
User Hair Science Profile:
- Hair Porosity: ${hairPorosity}
- Hair Strand Type: ${hairStrandType}
- Water Supply: ${waterSupply}
- Budget Preference: ${budget}

${buildHealthProfilePromptBlock(body.healthProfile)}

5-BOX HAIR & SCALP CLINICAL ANSWERS:
- 1. Hair & Scalp Symptoms + Duration: ${(s.symptomsAndDuration || "").trim() || specificSymptoms || "(Not specified)"}
- 2. Scalp Feel & Flake Texture: ${(s.scalpFeelAndFlakes || "").trim() || "(Not specified)"}
- 3. Water Type & Climate Notes: ${(s.waterAndClimate || "").trim() || "(Not specified)"}
- 4. Current Shampoo, Oil & Treatment History: ${currentRoutine || "(Not specified)"}
- 5. Family History (Pattern Thinning / Thyroid / PCOS): ${(s.familyHistory || "").trim() || "(Not specified)"}
${extraNote && !s.symptomsAndDuration && extraNote !== specificSymptoms ? `- Extra Note: "${extraNote}"` : ""}

TRIAGE DECISION BADGE RULE ("triageDecision"):
- Set "triageDecision.status": "see_dermatologist_directly", "badge.en": "🚨 Go Directly to a PMDC Dermatologist / Doctor", "badge.ur": "🚨 Seedha PMDC Skin Doctor Ko Dikhayein", and "redFlags.urgencyLevel": "urgent" IF circular bald patches (alopecia areata), painful oozing scalp sores/boils, scarring redness, or sudden handful clump shedding are present — explain why blood tests (CBC, Serum Ferritin, Vitamin D, Vitamin B12, Thyroid TSH) and an in-person doctor check are needed first.
- Otherwise set "triageDecision.status": "home_routine_safe", "badge.en": "✓ Safe for Targeted Home & Pharmacy Routine", "badge.ur": "✓ Ghar Aur Pharmacy Routine Ke Liye Safe", and explain why the 6-step porosity & scalp-matched routine is safe to start.

MANDATORY 2-STEP CLINICAL REASONING BEFORE WRITING THE ROUTINE:
Never prescribe a harsh, one-dimensional routine that strips or dries out the hair shaft! Think in two strict steps first:
- **Step A — Hair Type & Porosity Baseline FIRST:**
  First check their Hair Porosity (${hairPorosity}) and Strand Type (${hairStrandType}) to lock in what the hair shaft needs to stay soft, hydrated, and breakage-free:
  * Low Porosity: Lightweight water-based hydration and gentle cuticle care without heavy butters/oils (*L'Oréal Paris Elvive Hyaluron Moisture 72H*, *Conatural Sulfate-Free*, light clarifying 1x/week).
  * Medium Porosity (or Not Sure): Balanced moisture + light protein maintenance without weighing down strands.
  * High Porosity / Chemically Treated: Rich moisture + bond/protein repair (*L'Oréal Paris Elvive Extraordinary Oil / Dream Lengths / Total Repair 5*, *Garnier Fructis Hair Food*, *Olaplex / Redken / Kérastase*, *SheaMoisture* High Porosity ONLY).
  State this Step A porosity baseline alongside 2–3 ranked possibilities inside "assessment.summaryBullets".
- **Step B — Scalp & Hair Concern Treatment SECOND:**
  Next, match the targeted active treatment for their 5 box answers or visible scalp issues (oily/sticky vs dry powdery flakes, scalp pimples, hair fall, hard water) WITHOUT stripping the hair shaft defined in Step A.

DUAL-SHAMPOO ROTATION RULE (CRITICAL — NEVER USE MEDICATED OR CLARIFYING SHAMPOO EVERY WASH):
- Whenever a medicated, anti-dandruff, or clarifying shampoo is needed (*AccuFix Salicylic Acid Scalp Shampoo*, *AccuFix Clarify & Rebalance Shampoo*, *Conaz 2%*, *Selsun Blue*, *Nizoral / Polytar / Phototar*, *Ducray Kelual DS*, *Jenpharm Sebornil Shampoo*, *Sebamed Anti-Dandruff*, or *Pantene Lively Clean*):
  1. Prescribe it **ONLY 1x or 2x a week** on the scalp roots ONLY (massage gently, leave on 3–5 minutes, rinse thoroughly).
  2. ALWAYS pair and rotate it with a **Hydrating / Gentle Everyday Shampoo** for all other washes (*L'Oréal Paris Elvive Hyaluron Moisture 72H*, *L'Oréal Paris Elvive Extraordinary Oil / Dream Lengths / Total Repair 5*, *Conatural Sulfate-Free Shampoo*, *Bioderma Nodé*, *Sebamed Everyday*, or *Dove Intense Repair / Dermacare*) PLUS a conditioner or mask on mid-lengths and ends so hair never turns dry, straw-like, or brittle.
  3. When using dual-shampoo rotation, list BOTH shampoos cleanly inside Step 1 ("Shampoo (Scalp Wash) — Dual Rotation: ...") AND include both shampoos inside "recommendedProducts"!

COMPREHENSIVE HAIR & SCALP PROBLEM-SOLVING ENGINE (FOLLOW EVERY MATCHING CASE):
1. DIRECTLY ADDRESS TYPED INPUTS FIRST:
   - Read every detail across Boxes 1–5 alongside the photos. Directly answer their exact symptoms and evaluate/fix mistakes in their current routine inside "assessment.summaryBullets" and "routine".
2. DANDRUFF, ITCHY SCALP, FLAKES, SEBORRHEIC SCALP, OR SCALP PIMPLES / FOLLICULITIS:
   - Recommend targeted scalp care 1–2x/week (*Conaz 2% Shampoo*, *Selsun Blue*, *Nizoral / Polytar / Phototar*, *Ducray Kelual DS*, *AccuFix Salicylic Acid Scalp Shampoo*, *Sebamed Anti-Dandruff*, or *Jenpharm Sebornil Shampoo*) ROTATED with a gentle hydrating shampoo on other washes.
   - EXPLICITLY tell the user to STOP applying raw heavy hair oils directly onto the scalp if they have oily/sticky flakes or scalp pimples, because oil feeds dandruff yeast and clogs follicles.
3. HAIR FALL, WIDENING PART, RECEDING HAIRLINE, OR POSTPARTUM SHEDDING:
   - Recommend gentle follicle-supporting care (*Jenpharm Anagrow Shampoo / Serum*, *The Ordinary Multi-Peptide Serum for Hair Density*, *Follihair / Tricogen Peptide Serums*, *Ducray Anaphase+*, *Conatural Hair Growth Water*, *BioOne / Neophar Clinical Hair Lines*, or *Organic Traveller / Nirvana Botanics* pure Rosemary Essential Oil STRICTLY DILUTED 3–5 drops in a *Saeed Ghani* carrier oil).
   - Advise loose hairstyles (avoid tight ponytails, tight braids, or tight hijab tension).
   - In Card 5 ("redFlags.whenToSeeDermatologist"), list these exact doctor blood tests to ask for: "CBC, Serum Ferritin, Vitamin D, Vitamin B12, Thyroid TSH".
4. PATCHY BALD SPOTS (CIRCULAR SMOOTH PATCHES / ALOPECIA AREATA) OR SUDDEN CLUMP LOSS:
   - Trigger "see_dermatologist_directly" and "redFlags.urgencyLevel": "urgent".
   - NEVER claim hair oils or shampoos regrow autoimmune bald patches.
5. POROSITY, STRAND TYPE & HARD-WATER COATING:
   - If "Low Porosity": Strictly forbid heavy butter/oil shampoos (NEVER recommend *SheaMoisture* for Low Porosity)! Prescribe lightweight water-based care (*L'Oréal Paris Elvive Hyaluron Moisture 72H*, *Conatural Sulfate-Free*) + 1x/week *AccuFix Salicylic Scalp Shampoo*, *Pantene Lively Clean*, or diluted *Bragg Apple Cider Vinegar* chelating rinse.
   - If "Medium Porosity" or "Not Sure": Balanced hydration + light masks (*Dove Intense Repair / Dermacare*, *TRESemmé Keratin Smooth / Detox*, *OGX*, *Head & Shoulders* if mild flakes, *Hair Energy / Vince* masks).
   - If "High Porosity" or "Chemically Treated" / Heat / Dye damage: Rich bond & moisture care (*L'Oréal Paris Elvive Extraordinary Oil / Dream Lengths / Total Repair 5*, *Garnier Hair Food Masks*, *Olaplex / Redken / Kérastase*, *SheaMoisture* allowed for High Porosity only, *Hair Energy / Vince* keratin/biotin masks).
   - If "Hard / Bore Water": Explain mineral film coating clearly in Card 4 & prescribe *AccuFix Salicylic Scalp Shampoo* / *Pantene Pro-V Lively Clean* or diluted *Bragg Apple Cider Vinegar* chelating rinse 1x/week.
6. PREMATURE GREYING OR NUTRITIONAL SHEDDING:
   - State honestly that topical shampoos and oils CANNOT reverse genetic premature greying. Suggest gentle sulfate-free hydrating care to prevent dryness, and recommend checking Vitamin B12, Copper/Zinc, and Ferritin with a doctor.

MANDATORY 6-STEP HAIR CARE BREAKDOWN IN "routine" (ALL 6 STEPS REQUIRED EVERY TIME):
Organize "routine.morning" (Steps 1–3) and "routine.evening" (Steps 4–6) into these EXACT 6 tailored steps (each with a crisp "usageCaution" badge!):
- Inside "routine.morning" (3 items):
  1. stepNumber: 1 | timingBadge: "STEP 1 · DUAL WASH ROTATION" | usageCaution: short caution (e.g. "Scalp roots only · Rinse cool") | title: "Shampoo (Scalp Wash): <1–2x/Wk Active + Everyday Hydrating Shampoo>" | brand & productName: exact verified primary shampoo match | dose: specify exact split | method: massage scalp gently and rinse with clean cool/lukewarm water — never strip lengths | note: why rotating keeps scalp clean and strands soft.
  2. stepNumber: 2 | timingBadge: "STEP 2 · MASK / CONDITIONER" | usageCaution: short caution (e.g. "Mid-lengths & ends only") | title: "Mask / Leave-In / Night Cream: <Exact Verified Product>" | brand & productName: exact verified match | dose: exact frequency | method: smooth on mid-lengths & ends away from roots, leave 3–10 mins | note: moisture & breakage-prevention tip for Step A porosity.
  3. stepNumber: 3 | timingBadge: "STEP 3 · ENDS / SCALP SERUM" | usageCaution: short caution (e.g. "Avoid irritated/broken skin") | title: "Serum (Ends Protection / Scalp Density): <Exact Verified Serum>" | brand & productName: exact verified match | dose: exact drops | method: apply scalp peptide serum to parting OR smooth 1–2 drops serum down damp ends | note: follicle or split-end protection tip.
- Inside "routine.evening" (3 items):
  4. stepNumber: 4 | timingBadge: "STEP 4 · HAIR OIL VERDICT" | usageCaution: short caution (e.g. "Never sleep with raw scalp oil") | title: "Hair Oil Verdict: Use Light Pre-Wash Carrier Oil" OR "Hair Oil Verdict: Strictly Skip Scalp Oiling" | brand & productName: "" (or pure *Saeed Ghani* / diluted rosemary blend only if safe for ends/scalp) | dose: clearly state "Pre-wash only (ends / 1 hour before wash, dilute 3–5 drops Rosemary Oil in carrier oil)" OR "Strictly avoid scalp oiling" | method: explain clearly based on dandruff/fungal flakes vs dry brittle lengths | note: why heavy overnight scalp oiling worsens flakes and clogged follicles.
  5. stepNumber: 5 | timingBadge: "STEP 5 · SLEEP BONNET" | usageCaution: short caution (e.g. "Keep scalp dry before covering") | title: "Satin / Silk Bonnet Advice" | brand: "" | productName: "" | dose: MUST start with "Use a Satin/Silk Bonnet at Night: Yes" OR "Use a Satin/Silk Bonnet at Night: No" | method: 1 crisp reason | note: loose braid or satin pillowcase backup tip.
  6. stepNumber: 6 | timingBadge: "STEP 6 · TOWEL & DRYING" | usageCaution: short caution (e.g. "No harsh rubbing · Low/cool heat") | title: "Towel & Drying Technique" | brand: "" | productName: "" | dose: "Soft microfiber hair towel or cotton t-shirt" | method: Gently squeeze water out — never rub with a rough bath towel; air-dry 80% or use cool air setting | note: detangle gently with wide-tooth comb when damp.

95% MASTER VERIFIED HAIR CATALOG & BUDGET MATCHING (Current selection: "${budget}"):
- At least 95% of ALL hair picks MUST come strictly from the 26-brand Master Hair Catalog below (exact real product names).
  ${
    budget === "Budget Friendly"
      ? `* "Budget Friendly": Prioritize affordable Pakistani clinical & pharmacy hair staples from the catalog below.`
      : `* "Standard": Balance Pakistani clinical picks with imported clinical & salon hair classics from the catalog below (SheaMoisture for High Porosity only).`
  }
- Always fill "assessment.hairBreakdown" cleanly ("scalpAndHairline", "midLengths", "hairEnds").
- Select 3 to 4 best-matched exact real hair products in "recommendedProducts" (including both shampoos when dual-rotation is used) with "whereToBuy": "Official Brand Store • Dvago • Naheed • Daraz Mall".

${buildApprovedBrandsPrompt("hair")}

${BULLET_DISCIPLINE_PROMPT}

Uploaded angles:
${body.images.map((img, idx) => `Image ${idx + 1}: "${img.slotLabel}"`).join("\n")}`;
}

export interface CheckCreamRequestBody {
  productNameOrIngredients: string;
  durationAndReason?: string;
  sideEffectsNoticed?: string;
  healthProfile?: HealthProfile;
  images: { slotLabel: string; base64: string; mimeType: string }[];
}

export function buildCheckCreamPrompt(body: CheckCreamRequestBody): string {
  const textInput = (body?.productNameOrIngredients || "").trim();
  const durationAndReason = (body?.durationAndReason || "").trim();
  const sideEffectsNoticed = (body?.sideEffectsNoticed || "").trim();
  const images = Array.isArray(body?.images) ? body.images : [];

  return `You are DerméScan's friendly Cream Safety Checker, helping people in Pakistan spot hidden steroids, mercury, or harsh bleaching ingredients in creams and ointments.

USER INPUT (3 STRUCTURED BOXES):
- 1. Cream / Product Name or Ingredients: "${textInput || "(Not typed — inspect uploaded photo(s) carefully)"}"
- 1b. Uploaded Photo Count: ${images.length}
- 2. How Long Used & Why: "${durationAndReason || "(Not specified)"}"
- 3. Side Effects Noticed: "${sideEffectsNoticed || "(Not specified)"}"

${buildHealthProfilePromptBlock(body.healthProfile)}

INSTRUCTIONS:
1. READABILITY CHECK ("isReadableInput"):
   - If typed text is gibberish AND uploaded photos have unreadable/blurry labels or are not a skincare product/cream, set "isReadableInput" to false and explain politely in "readabilityMessage" what clearer label photo or text is needed.
   - If the cream is recognizable (either a known Pakistani/pharmacy cream name, readable ingredient list, or clear box/tube photo), set "isReadableInput" to true.
2. INGREDIENT & STEROID AUDIT:
   - Check carefully for:
     * Corticosteroids (e.g., Clobetasol Propionate, Betamethasone, Mometasone, Fluocinonide, Triamcinolone, Hydrocortisone, Dermovate, Clobevate, Betnovate).
     * Mercury / Heavy Metals (common in local unapproved whitening/formula mixes like Golden Pearl, Faiza, Goree, Chandni, or unlabeled jars).
     * Hydroquinone / Harsh Bleaching Agents (Hydroquinone, Monobenzone).
     * Prescription Actives (Tretinoin, Adapalene, Azelaic Acid — safe when used properly, mark "caution" if potent).
   - Set "safetyVerdict":
     * "high_risk" for hidden steroids, mercury, strong bleaching mixes, or known unsafe whitening formula creams (or if user already reports Thin Skin, Visible Veins, Rebound Darkening, or Excess Facial Hair from steroid/formula use!).
     * "caution" for prescription actives or unclear mixed formulas needing doctor guidance.
     * "safe" for plain steroid-free moisturizers, sunscreens, or gentle everyday creams.
3. WARNINGS & RECOVERY PLAN TAILORED TO USAGE DURATION & SIDE EFFECTS:
   - In "potentialSideEffects", address both the formula risks and the exact side effects the user noticed ("${sideEffectsNoticed || "skin thinning, rebound redness, extra facial hair, broken veins"}").
   - In "safeRecoveryPlan.taperingBullets" & "steps", tailor tapering advice to how long they used it ("${durationAndReason || "duration unspecified"}") — explain safely how NOT to quit strong long-term steroids overnight (gradual spacing + gentle barrier moisturizer + modern non-comedogenic sunscreen) and warn against restarting formula creams.
   - Fill "doctorEscalationBullets" with clear signs to visit a PMDC dermatologist directly if veins, paper-thin skin, severe rebound burning, or excess hair are present.
4. Suggest 2–3 safe, steroid-free replacement products in "safeReplacementProductIds" using ONLY exact verified product names from our approved catalog below (e.g., Skinoren Cream (Azelaic Acid 20%), Eventone-C Cream, Physiogel Daily Moisture Therapy Cream, Jenpharm Dermive Oil-Free Moisturizer, AccuFix Cosmetics Crème B3-B5-E Barrier Repair Moisturizer, Primary Skin Ceramide Moisturizer, or CeraVe Moisturizing Cream — NEVER recommend U-Veil and NEVER invent product names).

${buildApprovedBrandsPrompt("skin")}

${BULLET_DISCIPLINE_PROMPT}`;
}

export interface VerifyProductRequestBody {
  storeInput?: string;
  websiteOrSeller?: string;
  brandName?: string;
  productName?: string;
  userProfileType?: string;
  suspiciousSigns?: string;
  images?: { slotLabel: string; base64: string; mimeType: string }[];
}

export function buildVerifyProductPrompt(
  body: VerifyProductRequestBody,
  storeCheck: StoreCheckResult,
  isSearchGrounded = true
): string {
  const storeInput = (body?.websiteOrSeller ?? body?.storeInput ?? "").trim();
  const brandName = (body?.brandName || "").trim();
  const rawProductName = (body?.productName || "").trim();
  const productName =
    brandName &&
    rawProductName &&
    !rawProductName.toLowerCase().includes(brandName.toLowerCase())
      ? `${brandName} ${rawProductName}`
      : rawProductName || brandName;
  const userProfileType = (body?.userProfileType || "").trim();
  const suspiciousSigns = (body?.suspiciousSigns || "").trim();
  const images = Array.isArray(body?.images) ? body.images : [];
  const jenpharmCatalogList = (VERIFIED_EXACT_PRODUCT_LINEUPS["Jenpharm"] || []).join(" | ");

  const jsonBlockInstruction = isSearchGrounded
    ? `
LIVE GOOGLE SEARCH GROUNDING & OUTPUT FORMAT (CRITICAL):
- Use Google Search right now to look up the EXACT official product page, INCI ingredient list, authentic packaging/batch-code markers, and Pakistani dermatologist suitability for "${productName || "the product shown in the uploaded photos"}".
- Wrap your ENTIRE structured JSON response cleanly inside ONE \`\`\`json ... \`\`\` code block matching the exact schema below (do NOT add extra text inside the JSON block; ensure valid double-quoted JSON):
\`\`\`json
{
  "identifiedProductName": "Exact official product name",
  "identifiedBrand": "Official brand name",
  "packagingVerdict": "likely_authentic | suspicious_red_flags | inconclusive",
  "verdictBadge": { "en": "Short verdict badge", "ur": "Short Roman Urdu badge" },
  "summaryBullets": { "en": ["2-3 concise bullets"], "ur": ["2-3 concise Roman Urdu bullets"] },
  "packagingChecks": [
    {
      "checkName": { "en": "Typography & Logo", "ur": "Printing Aur Logo" },
      "status": "pass | warning | fail | not_visible",
      "detail": { "en": "Specific visual observation", "ur": "Roman Urdu detail" }
    }
  ],
  "pakistanCounterfeitTips": { "en": ["2-3 specific fake-spotting markers in Pakistan"], "ur": ["Roman Urdu tips"] },
  "nextStepBullets": { "en": ["1-2 clear next steps"], "ur": ["Roman Urdu steps"] },
  "bestForSummary": { "en": "1-2 short sentences on what this formula genuinely treats", "ur": "Roman Urdu summary" },
  "bestForTags": ["Tag 1", "Tag 2", "Tag 3"],
  "profileMatchVerdict": {
    "status": "great_match | use_with_caution | not_recommended | general_info",
    "badge": { "en": "Profile match badge", "ur": "Roman Urdu badge" },
    "explanation": { "en": "Clear explanation tailored to user's selected skin/hair type", "ur": "Roman Urdu explanation" }
  },
  "keyActives": [
    {
      "ingredient": "Exact active ingredient name (with % if verified)",
      "roleBadge": { "en": "2-3 word role e.g. Sebum & Pore Regulator", "ur": "Roman Urdu role" },
      "howItWorks": { "en": "Plain-English explanation of how it works", "ur": "Roman Urdu explanation" }
    }
  ],
  "whoShouldAvoid": { "en": ["Pregnancy, fungal acne, dandruff, or sensitivity warnings"], "ur": ["Roman Urdu warnings"] },
  "routineClashes": { "en": ["Actives NOT to layer in the same routine e.g. Retinol, AHAs"], "ur": ["Roman Urdu clash warnings"] },
  "howToUse": {
    "scheduleBadge": { "en": "e.g. PM Only · 3x/Week or AM & PM Daily", "ur": "Roman Urdu schedule" },
    "steps": [
      {
        "timing": "AM | PM | Weekly | Anytime",
        "timingBadge": { "en": "PM · NIGHT", "ur": "RAAT KO" },
        "instruction": { "en": "Simple step instruction", "ur": "Roman Urdu instruction" }
      }
    ]
  },
  "saferAlternative": null
}
\`\`\`
- Only populate "saferAlternative" (an object with { "brand": "Jenpharm", "name": "<exact SKU from 22 Jenpharm list below>", "subCategory": "...", "approxPricePkr": "PKR ...", "whereToBuy": "Official Brand Store • Dvago • Naheed • Daraz Mall", "bullets": { "en": ["..."], "ur": ["..."] } }) if the scanned product is unsafe, suspicious/fake, or unsuitable/clashing for "${userProfileType || "sensitive Pakistani skin"}". Otherwise set "saferAlternative": null.`
    : `
SAFER ALTERNATIVE RULE:
- Only populate "saferAlternative" using an exact Jenpharm SKU from the list below if the scanned product is unsafe, suspicious/fake, or unsuitable for "${userProfileType || "sensitive Pakistani skin"}"; otherwise omit it.`;

  return `You are DerméScan's strict Product Check, Authenticity Inspector & Formula Decoder for Pakistan.
In Pakistan, fake copies of The Ordinary, CeraVe, La Roche-Posay, Garnier, L'Oreal, Sunplay, and popular local serums circulate on lookalike sites and social pages, and users also need plain-English clarity on what a bottle actually treats, its verified INCI actives, who should avoid it, routine clashes, and how to use it.

INPUT PROVIDED:
- 1. Product Name / Brand: "${productName || "Identify from uploaded packaging photos"}"
- 2. User's Selected Skin / Hair Type: "${userProfileType || "Not specified (give balanced general suitability)"}"
- 3. Store / Seller Input: "${storeInput || "(Not typed)"}"
- 4. Suspicious Signs Reported by User: "${suspiciousSigns || "(None reported)"}"
- Verified Store Whitelist Result: ${storeCheck.status} (${storeCheck.matchedStoreName || storeInput || "Unverified"})
${storeCheck.officialDomainSuggestion ? `- IMPORTANT LOOKALIKE WARNING: The user pasted a potential copycat URL instead of the real site "${storeCheck.officialDomainSuggestion}".` : ""}
- 5. Packaging Photos Uploaded: ${images.length}

ZERO-MISTAKE AUTHENTICITY & DECODER RULES (FOLLOW STRICTLY):
1. AUTHENTICITY RULES:
   - Even if Store Check is "verified", ALWAYS inspect uploaded bottle/box photos AND reported Suspicious Signs ("${suspiciousSigns}") carefully for fake markers.
   - If Store Check is "unverified" or "potential_copycat" AND ${images.length === 0 ? "NO photos are uploaded" : "photos are unclear"}: NEVER assume an unknown seller or lookalike URL is real! Set "packagingVerdict": "inconclusive" (or "suspicious_red_flags" if multiple fake signs are reported) and tell the user to upload clear Front Label, Back Barcode/Ingredients, and Batch-Code photos (or buy from ${storeCheck.officialDomainSuggestion || "naheed.pk, dvago.pk, skinstorepakistan.com, or reana.pk"}).
   - Whenever ${images.length} > 0, inspect actual photo pixels for spelling typos, smudged inkjet fonts, missing/stickered batch codes & expiry dates, broken tamper seals, or unapproved steroid/whitening claims, reporting them in "packagingChecks".
2. PRODUCT DECODER RULES:
   - Identify the exact product ("identifiedProductName" & "identifiedBrand") from photos + text + verified ingredient lookup.
   - Decode 2–5 key active ingredients in "keyActives" with plain-English benefits (avoid complex academic jargon).
   - Explain clearly what skin types, hair porosities, or concerns it actually treats in "bestForSummary" & "bestForTags".
   - Specifically evaluate compatibility with "${userProfileType || "Not specified"}" inside "profileMatchVerdict" (if not specified, set status: "general_info" and explain generally who benefits most).
   - Clearly list who should avoid it ("whoShouldAvoid" — e.g., pregnancy/breastfeeding retinoid/BHA bans, fungal acne/dandruff oil triggers, low-porosity heavy-butter buildup) AND routine clashes ("routineClashes" — e.g., do not layer Vitamin C / AHAs / Benzoyl Peroxide with Retinol in the same routine).
   - Provide 2–4 crisp **AM / PM / Weekly** steps in "howToUse.steps".
3. VERIFIED 22 JENPHARM CATALOG (ONLY FOR "saferAlternative" IF NEEDED):
   ${jenpharmCatalogList}
4. LANGUAGE & CONCISENESS:
   - Keep every bullet crisp and easy to read (max 10–14 words per bullet).
   - NEVER use em-dashes ("—") anywhere in any generated JSON string, badge, title, or bullet; use commas or colons instead.
   - Provide BOTH simple English ("en") AND natural Pakistani Roman Urdu in Latin letters ONLY ("ur": NEVER Arabic/Urdu script) for ALL bilingual fields.
${jsonBlockInstruction}`;
}

