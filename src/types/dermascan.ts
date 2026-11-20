export type Language = "en" | "ur";

export type TabId = "skin" | "hair" | "steroid" | "verify";

export type BodyArea =
  | "Face"
  | "Under-Eyes"
  | "Lips"
  | "Neck & Underarms"
  | "Back & Chest"
  | "Arms & Legs"
  | "Hands & Nails"
  | "Feet & Heels"
  | "Other Body Area";

export interface UploadedImage {
  slotId: string;
  slotLabel: string;
  base64: string;
  mimeType: string;
  previewUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
}

export interface BilingualText {
  en: string;
  ur: string;
}

export interface BilingualList {
  en: string[];
  ur: string[];
}

export interface RoutineStep {
  stepNumber: number;
  timingBadge: BilingualText;
  usageCaution?: BilingualText;
  title: BilingualText;
  productId?: string;
  brand?: string;
  productName?: string;
  dose: BilingualText;
  method: BilingualText;
  note: BilingualText;
}

export interface RecommendedProductPick {
  productId?: string;
  brand: string;
  name: string;
  subCategory: string;
  approxPricePkr: string;
  whereToBuy: string;
  bullets: BilingualList;
}

export interface HairSectionBreakdown {
  scalpAndHairline: BilingualList;
  midLengths: BilingualList;
  hairEnds: BilingualList;
}

export interface TriageDecision {
  status: "home_routine_safe" | "see_dermatologist_directly";
  badge: BilingualText;
  reason: BilingualText;
}

export interface SkinStructuredInputs {
  duration: string;
  sensation: string;
  texture: string;
  spreadingPattern: string;
  triggersAndClimate: string;
  pastCreamsAndRoutine: string;
  familyAndHouseholdHistory: string;
}

export interface HairStructuredInputs {
  symptomsAndDuration: string;
  scalpFeelAndFlakes: string;
  waterAndClimate: string;
  currentRoutineAndHistory: string;
  familyHistory: string;
}

export interface BentoPrescriptionResponse {
  isValidPhoto: boolean;
  retakeSlots: string[];
  retakeMessage: BilingualText;
  confidenceLabel: BilingualText;
  primaryConcernTag: BilingualText;
  triageDecision?: TriageDecision;
  assessment: {
    summaryBullets: BilingualList;
    angleObservations: {
      slotLabel: string;
      bullets: BilingualList;
    }[];
    triggersIdentified: BilingualList;
    hairBreakdown?: HairSectionBreakdown;
  };
  routine: {
    morning: RoutineStep[];
    evening: RoutineStep[];
  };
  recommendedProducts: RecommendedProductPick[];
  lifestyleAndWater: {
    waterAndClimateBullets: BilingualList;
    habitChecklist: BilingualList;
  };
  redFlags: {
    urgencyLevel: "routine" | "consult_soon" | "urgent";
    warningBullets: BilingualList;
    whenToSeeDermatologist: BilingualList;
  };
}

export interface SteroidCheckResponse {
  isReadableInput: boolean;
  readabilityMessage: BilingualText;
  productDetectedName: string;
  safetyVerdict: "safe" | "caution" | "high_risk";
  verdictBadge: BilingualText;
  summaryBullets: BilingualList;
  detectedRiskyIngredients: {
    ingredient: string;
    category:
      | "Corticosteroid"
      | "Mercury / Heavy Metal"
      | "Hydroquinone / Bleaching"
      | "Prescription Active"
      | "Safe Cosmetic / Derm Active";
    riskBullets: BilingualList;
  }[];
  potentialSideEffects: BilingualList;
  safeRecoveryPlan: {
    taperingBullets: BilingualList;
    steps: BilingualList;
  };
  safeReplacementProductIds: RecommendedProductPick[];
  doctorEscalationBullets: BilingualList;
}

export interface StoreCheckResult {
  status:
    | "verified"
    | "caution_marketplace"
    | "potential_copycat"
    | "unverified"
    | "not_provided";
  matchedStoreName?: string;
  matchedDomain?: string;
  officialDomainSuggestion?: string;
  badgeText: BilingualText;
  explanation: BilingualText;
}

export interface VerifyProductResponse {
  storeCheck: StoreCheckResult;
  packagingVerdict: "likely_authentic" | "suspicious_red_flags" | "inconclusive";
  verdictBadge: BilingualText;
  summaryBullets: BilingualList;
  packagingChecks: {
    checkName: BilingualText;
    status: "pass" | "warning" | "fail" | "not_visible";
    detail: BilingualText;
  }[];
  pakistanCounterfeitTips: BilingualList;
  nextStepBullets: BilingualList;
}

export interface ApiErrorPayload {
  errorCode?: string;
  message: string;
}

export interface HealthProfile {
  hormonalMedicalHistory: string[];
  pregnancyBreastfeedingStatus: string;
  currentMedicationsOrActives: string;
  ageGroup: string;
}

