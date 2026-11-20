import type { HealthProfile } from "../types/dermascan.ts";

const HEALTH_PROFILE_KEY = "dermascan_health_profile_v1";
const INTAKE_SEEN_KEY = "dermascan_intake_seen_v1";

export const DEFAULT_HEALTH_PROFILE: HealthProfile = {
  hormonalMedicalHistory: [],
  pregnancyBreastfeedingStatus: "No",
  currentMedicationsOrActives: "",
  ageGroup: "",
};

export function loadHealthProfile(): HealthProfile {
  try {
    const raw = window.localStorage.getItem(HEALTH_PROFILE_KEY);
    if (!raw) return DEFAULT_HEALTH_PROFILE;
    const parsed = JSON.parse(raw) as Partial<HealthProfile>;
    return {
      hormonalMedicalHistory: Array.isArray(parsed.hormonalMedicalHistory)
        ? parsed.hormonalMedicalHistory.filter(
            (x): x is string => typeof x === "string"
          )
        : [],
      pregnancyBreastfeedingStatus:
        typeof parsed.pregnancyBreastfeedingStatus === "string" &&
        parsed.pregnancyBreastfeedingStatus
          ? parsed.pregnancyBreastfeedingStatus
          : "No",
      currentMedicationsOrActives:
        typeof parsed.currentMedicationsOrActives === "string"
          ? parsed.currentMedicationsOrActives
          : "",
      ageGroup: typeof parsed.ageGroup === "string" ? parsed.ageGroup : "",
    };
  } catch {
    return DEFAULT_HEALTH_PROFILE;
  }
}

export function saveHealthProfile(profile: HealthProfile): void {
  try {
    window.localStorage.setItem(HEALTH_PROFILE_KEY, JSON.stringify(profile));
    window.localStorage.setItem(INTAKE_SEEN_KEY, "1");
  } catch {
    // Ignore storage quota or private browsing errors cleanly.
  }
}

export function hasSeenWelcomeIntake(): boolean {
  try {
    return window.localStorage.getItem(INTAKE_SEEN_KEY) === "1";
  } catch {
    return true;
  }
}

export function markWelcomeIntakeSeen(): void {
  try {
    window.localStorage.setItem(INTAKE_SEEN_KEY, "1");
  } catch {
    // Ignore storage errors.
  }
}

export function hasCustomHealthProfile(profile: HealthProfile): boolean {
  return (
    profile.hormonalMedicalHistory.length > 0 ||
    (profile.pregnancyBreastfeedingStatus !== "" &&
      profile.pregnancyBreastfeedingStatus !== "No") ||
    profile.currentMedicationsOrActives.trim().length > 0 ||
    profile.ageGroup.trim().length > 0
  );
}
