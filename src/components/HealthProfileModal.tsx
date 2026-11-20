import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { HealthProfile, Language } from "../types/dermascan.ts";

interface HealthProfileModalProps {
  isOpen: boolean;
  language: Language;
  initialProfile: HealthProfile;
  onSave: (profile: HealthProfile) => void;
  onSkip: () => void;
}

const HORMONAL_OPTIONS = [
  "PCOS / Hormonal Imbalance",
  "Thyroid Issues",
  "Iron Deficiency / Anemia",
  "Eczema / Psoriasis / Rosacea",
  "None / Not Sure",
] as const;

const PREGNANCY_OPTIONS = [
  "No",
  "Pregnant / Trying to Conceive",
  "Breastfeeding",
] as const;

const AGE_OPTIONS = ["Under 18", "18–25", "26–35", "36+"] as const;

export function HealthProfileModal({
  isOpen,
  language,
  initialProfile,
  onSave,
  onSkip,
}: HealthProfileModalProps) {
  const [draft, setDraft] = useState<HealthProfile>(initialProfile);

  useEffect(() => {
    if (isOpen) {
      setDraft(initialProfile);
    }
  }, [isOpen, initialProfile]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSkip();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onSkip]);

  if (!isOpen) return null;

  function toggleHormonalOption(option: string) {
    setDraft((prev) => {
      const current = prev.hormonalMedicalHistory;
      if (option === "None / Not Sure") {
        return {
          ...prev,
          hormonalMedicalHistory: current.includes("None / Not Sure")
            ? []
            : ["None / Not Sure"],
        };
      }
      const withoutNone = current.filter((item) => item !== "None / Not Sure");
      const exists = withoutNone.includes(option);
      return {
        ...prev,
        hormonalMedicalHistory: exists
          ? withoutNone.filter((item) => item !== option)
          : [...withoutNone, option],
      };
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="health-profile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E181A]/40 p-4 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-[#EAE0E2] bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onSkip}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[#6E6266] transition-colors hover:bg-[#FAF8F8] hover:text-[#1E181A]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 pr-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B56576]">
            DERMÉSCAN · CLINICAL PROFILE
          </p>
          <h2
            id="health-profile-modal-title"
            className="mt-1 font-sans text-xl font-semibold tracking-tight text-[#1E181A]"
          >
            Personalize Your Care
          </h2>
          <p className="mt-0.5 text-xs text-[#6E6266]">
            {language === "ur"
              ? "Apni sehat ke mutabiq DerméScan reports banayein."
              : "Tailor DerméScan scans to your health history."}
          </p>
        </div>

        <div className="space-y-4">
          {/* 1. Hormonal & Medical History */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#1E181A]">
              {language === "ur"
                ? "Hormonal & Medical History"
                : "Hormonal & Medical History"}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {HORMONAL_OPTIONS.map((opt) => {
                const active = draft.hormonalMedicalHistory.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleHormonalOption(opt)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors active:scale-95 ${
                      active
                        ? "border-[#B56576] bg-[#B56576] text-white"
                        : "border-[#E5DADF] bg-[#FAF8F8] text-[#4E4246] hover:border-[#D2BFC6] hover:bg-[#F6ECEF]/60"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2 & 3. Compact 2-column row: Pregnancy/Breastfeeding + Age Group */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#1E181A]">
                Pregnancy / Breastfeeding
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PREGNANCY_OPTIONS.map((opt) => {
                  const active = draft.pregnancyBreastfeedingStatus === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          pregnancyBreastfeedingStatus: opt,
                        }))
                      }
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors active:scale-95 ${
                        active
                          ? "border-[#B56576] bg-[#B56576] text-white"
                          : "border-[#E5DADF] bg-[#FAF8F8] text-[#4E4246] hover:border-[#D2BFC6] hover:bg-[#F6ECEF]/60"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#1E181A]">
                Age Group
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AGE_OPTIONS.map((opt) => {
                  const active = draft.ageGroup === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          ageGroup: prev.ageGroup === opt ? "" : opt,
                        }))
                      }
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors active:scale-95 ${
                        active
                          ? "border-[#B56576] bg-[#B56576] text-white"
                          : "border-[#E5DADF] bg-[#FAF8F8] text-[#4E4246] hover:border-[#D2BFC6] hover:bg-[#F6ECEF]/60"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Current Medications or Actives */}
          <div className="space-y-1.5">
            <label
              htmlFor="health-profile-medications"
              className="block text-xs font-medium text-[#1E181A]"
            >
              Current Medications or Actives
            </label>
            <input
              id="health-profile-medications"
              type="text"
              value={draft.currentMedicationsOrActives}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  currentMedicationsOrActives: e.target.value,
                }))
              }
              placeholder="e.g., Isotretinoin, Tretinoin, Minoxidil, or None"
              className="w-full rounded-lg border border-[#E5DADF] bg-[#FAF8F8] px-3 py-2 text-xs text-[#1E181A] placeholder:text-[#8E8084] focus:border-[#B56576] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[#F0E8EA] pt-4">
          <button
            type="button"
            onClick={onSkip}
            className="px-2 py-1.5 text-xs font-medium text-[#6E6266] transition-colors hover:text-[#1E181A]"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="rounded-xl bg-[#B56576] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9E5263] active:scale-95"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
