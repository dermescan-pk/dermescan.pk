import { useState, type ComponentType } from "react";
import { ScanFace, Scissors, FlaskConical, ShieldCheck } from "lucide-react";
import { Header } from "./components/Header.tsx";
import { SkinBodyTab } from "./components/SkinBodyTab.tsx";
import { HairStudioTab } from "./components/HairStudioTab.tsx";
import { SteroidCheckTab } from "./components/SteroidCheckTab.tsx";
import { FakeVsRealTab } from "./components/FakeVsRealTab.tsx";
import { HealthProfileModal } from "./components/HealthProfileModal.tsx";
import {
  hasCustomHealthProfile,
  hasSeenWelcomeIntake,
  loadHealthProfile,
  markWelcomeIntakeSeen,
  saveHealthProfile,
} from "./utils/healthProfile.ts";
import type { HealthProfile, Language, TabId } from "./types/dermascan.ts";

const NAV_TABS: {
  id: TabId;
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { id: "skin", label: "Skin & Body", icon: ScanFace },
  { id: "hair", label: "Hair Studio", icon: Scissors },
  { id: "steroid", label: "Steroid Check", icon: FlaskConical },
  { id: "verify", label: "Fake vs. Real", icon: ShieldCheck },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("skin");
  const [language, setLanguage] = useState<Language>("en");
  const [healthProfile, setHealthProfile] = useState<HealthProfile>(() =>
    loadHealthProfile()
  );
  const [isHealthModalOpen, setIsHealthModalOpen] = useState<boolean>(
    () => !hasSeenWelcomeIntake()
  );

  function handleSaveHealthProfile(profile: HealthProfile) {
    saveHealthProfile(profile);
    setHealthProfile(profile);
    setIsHealthModalOpen(false);
  }

  function handleSkipHealthProfile() {
    markWelcomeIntakeSeen();
    setIsHealthModalOpen(false);
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        hasHealthProfile={hasCustomHealthProfile(healthProfile)}
        onOpenHealthProfile={() => setIsHealthModalOpen(true)}
      />

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6">
        <nav
          aria-label="DerméScan Sections"
          className="mb-6 grid grid-cols-2 gap-1.5 rounded-2xl border border-[#EAE0E2] bg-white p-1.5 shadow-[0_12px_40px_rgba(35,24,28,0.05)] sm:flex sm:justify-center"
        >
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all active:scale-95 sm:flex-1 sm:px-4 ${
                  isActive
                    ? "bg-[#B56576] text-white shadow-xs"
                    : "text-[#5E5055] hover:bg-[#F6ECEF] hover:text-[#1E181A]"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {activeTab === "skin" && (
          <SkinBodyTab language={language} healthProfile={healthProfile} />
        )}
        {activeTab === "hair" && (
          <HairStudioTab language={language} healthProfile={healthProfile} />
        )}
        {activeTab === "steroid" && (
          <SteroidCheckTab language={language} healthProfile={healthProfile} />
        )}
        {activeTab === "verify" && <FakeVsRealTab language={language} />}

        <section
          aria-labelledby="popular-pk-checks-heading"
          className="mt-10 rounded-3xl border border-[#E6DCE0]/80 bg-white/75 px-5 py-3.5 text-xs text-[#5E5055]"
        >
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-left font-medium text-[#5E5055] transition-colors hover:text-[#1E181A]">
              <h2
                id="popular-pk-checks-heading"
                className="font-editorial text-base font-semibold text-[#1E181A]"
              >
                {language === "ur"
                  ? "Pakistan Mein Mashhoor Skin Aur Hair Checks"
                  : "Popular Skin & Hair Checks in Pakistan"}
              </h2>
              <span className="text-[11px] font-semibold text-[#B56576] group-open:hidden">
                {language === "ur" ? "Mazeed dekhein +" : "Read more +"}
              </span>
              <span className="hidden text-[11px] font-semibold text-[#B56576] group-open:inline">
                {language === "ur" ? "Band karein −" : "Show less −"}
              </span>
            </summary>
            <div className="mt-3 space-y-2 border-t border-[#EAE0E2] pt-3 text-[11px] leading-relaxed text-[#5E5055]">
              <p>
                {language === "ur"
                  ? "DerméScan Pakistan ke mausam, dhoop aur bore (hard) paani ke mutabiq chehre, under-eyes, haathon, pairon aur baalon ke liye trusted pharmacy routines tayyar karta hai."
                  : "DerméScan helps people across Pakistan build practical skincare routines for acne, fungal bumps, under-eye dark circles, cracked heels, and hard-water or bore-water hair fall using verified local and international pharmacy brands including Jenpharm, AccuFix Cosmetics, Primary Skin, Neue Derma, Physiogel, Skinoren, CeraVe, Bioderma, and La Roche-Posay."}
              </p>
              <p>
                {language === "ur"
                  ? "Steroid Check tab se whitening aur formula creams mein chhupay steroids aur mercury pehchanein, aur Fake vs. Real tab se store websites, batch codes aur bottle printing check karein."
                  : "Run a free Steroid Check on local whitening or fairness creams to spot hidden corticosteroids and mercury, test your hair porosity for scalp-safe dual washing, and verify authentic Pakistani stores like Dvago, Naheed, and SkinStore Pakistan in Fake vs. Real."}
              </p>
            </div>
          </details>
        </section>

        <footer className="mt-4 rounded-3xl border border-[#E6DCE0] bg-white/85 px-6 py-4 text-center text-[11px] leading-relaxed text-[#5E5055]">
          {language === "ur"
            ? "DerméScan sirf aam skin, hair aur cream ki rehnumai deta hai, yeh doctor ka checkup nahi hai. Agar shadeed dard, khoon ya tez rash ho toh fauran skin doctor ko dikhayein."
            : "DerméScan shares simple everyday skin, hair, and product tips. It is not a medical checkup—please visit a skin doctor if you have severe pain, bleeding, or a spreading rash."}
        </footer>
      </main>

      <HealthProfileModal
        isOpen={isHealthModalOpen}
        language={language}
        initialProfile={healthProfile}
        onSave={handleSaveHealthProfile}
        onSkip={handleSkipHealthProfile}
      />
    </div>
  );
}
