import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type TouchEvent,
} from "react";
import {
  ScanFace,
  Scissors,
  FlaskConical,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { Header } from "./components/Header.tsx";
import { SkinBodyTab } from "./components/SkinBodyTab.tsx";
import { HairStudioTab } from "./components/HairStudioTab.tsx";
import { SteroidCheckTab } from "./components/SteroidCheckTab.tsx";
import { FakeVsRealTab } from "./components/FakeVsRealTab.tsx";
import {
  SkincareGuidesDrawer,
  SKINCARE_GUIDE_ARTICLES,
  type GuideCategoryId,
} from "./components/SkincareGuidesDrawer.tsx";
import { HealthProfileModal } from "./components/HealthProfileModal.tsx";
import { CameraPermissionModal } from "./components/CameraPermissionModal.tsx";
import {
  InstagramBrowserRedirectModal,
  detectInstagramBrowser,
} from "./components/InstagramBrowserRedirectModal.tsx";
import {
  LuxuryIntro3D,
  hasSeenLuxuryIntro,
  markLuxuryIntroSeen,
  prefersReducedMotion,
} from "./components/LuxuryIntro3D.tsx";
import { requestCameraMediaStream } from "./components/LiveCameraModal.tsx";
import {
  hasCustomHealthProfile,
  hasSeenWelcomeIntake,
  loadHealthProfile,
  markWelcomeIntakeSeen,
  saveHealthProfile,
} from "./utils/healthProfile.ts";
import {
  applyThemeToDocument,
  loadSavedTheme,
  saveTheme,
  type ThemeMode,
} from "./utils/theme.ts";
import type { HealthProfile, Language, TabId } from "./types/dermascan.ts";

const NAV_TABS: {
  id: TabId;
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { id: "skin", label: "Skin & Body", icon: ScanFace },
  { id: "hair", label: "Hair Studio", icon: Scissors },
  { id: "steroid", label: "Steroid Check", icon: FlaskConical },
  { id: "verify", label: "Product Decoder", icon: ShieldCheck },
];

const SWIPE_MIN_DISTANCE_PX = 40;
const SWIPE_MAX_DURATION_MS = 600;
const CAMERA_PROMPT_DISMISSED_KEY = "dermescan_camera_prompt_dismissed";

function isLikelyMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const mobileUa =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
      ua
    );
  const ipadDesktopMode =
    /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
  return mobileUa || ipadDesktopMode;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("skin");
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<ThemeMode>(() => loadSavedTheme());
  const [healthProfile, setHealthProfile] = useState<HealthProfile>(() =>
    loadHealthProfile()
  );
  const [isHealthModalOpen, setIsHealthModalOpen] = useState<boolean>(
    () => !hasSeenWelcomeIntake()
  );
  const [isGuidesOpen, setIsGuidesOpen] = useState<boolean>(false);
  const [guideCategory, setGuideCategory] =
    useState<GuideCategoryId>("sunblocks");
  const [instagramEnv] = useState(() => detectInstagramBrowser());
  const [isInstagramModalOpen, setIsInstagramModalOpen] = useState<boolean>(
    () => detectInstagramBrowser().isInstagram
  );
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    if (detectInstagramBrowser().isInstagram) return false;
    if (hasSeenLuxuryIntro()) return false;
    if (prefersReducedMotion()) {
      markLuxuryIntroSeen();
      return false;
    }
    return true;
  });
  const [introPlayKey, setIntroPlayKey] = useState<number>(0);
  const [cameraPromptState, setCameraPromptState] = useState<
    "checking" | "needed" | "denied" | "dismissed" | "granted"
  >(() => {
    try {
      if (
        typeof sessionStorage !== "undefined" &&
        sessionStorage.getItem(CAMERA_PROMPT_DISMISSED_KEY) === "1"
      ) {
        return "dismissed";
      }
    } catch {
      // Ignore storage access errors
    }
    return "checking";
  });

  useEffect(() => {
    if (isInstagramModalOpen || showIntro) return;
    if (cameraPromptState !== "checking") return;

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setCameraPromptState("dismissed");
      return;
    }

    let cancelled = false;

    async function checkAndPromptDefaultCameraPermission() {
      try {
        if (navigator.permissions?.query) {
          const perm = await navigator.permissions.query({
            name: "camera" as PermissionName,
          });
          if (cancelled) return;
          if (perm.state === "granted") {
            setCameraPromptState("granted");
            return;
          }
          if (perm.state === "denied") {
            setCameraPromptState("denied");
            return;
          }
        }
      } catch {
        // Safari and some WebViews do not support permissions.query for camera
      }

      if (cancelled) return;

      // Mobile browsers (iOS Safari, Android Chrome, WebViews) require a real user tap
      // before displaying the native OS camera permission dialog, so show the sleek UI popup.
      if (isLikelyMobileDevice()) {
        setCameraPromptState("needed");
        return;
      }

      try {
        const stream = await requestCameraMediaStream("environment");
        for (const track of stream.getTracks()) {
          track.stop();
        }
        if (!cancelled) {
          setCameraPromptState("granted");
        }
      } catch {
        if (!cancelled) {
          setCameraPromptState("needed");
        }
      }
    }

    void checkAndPromptDefaultCameraPermission();

    return () => {
      cancelled = true;
    };
  }, [cameraPromptState, isInstagramModalOpen, showIntro]);

  function handleDismissCameraPrompt() {
    try {
      sessionStorage.setItem(CAMERA_PROMPT_DISMISSED_KEY, "1");
    } catch {
      // Ignore storage errors
    }
    setCameraPromptState("dismissed");
  }

  const navTouchStartRef = useRef<{
    x: number;
    y: number;
    time: number;
  } | null>(null);

  function handleNavTouchStart(e: TouchEvent<HTMLElement>) {
    if (e.touches.length !== 1) {
      navTouchStartRef.current = null;
      return;
    }
    const touch = e.touches[0];
    navTouchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }

  function handleNavTouchEnd(e: TouchEvent<HTMLElement>) {
    const start = navTouchStartRef.current;
    navTouchStartRef.current = null;
    if (!start || e.changedTouches.length !== 1) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    const elapsed = Date.now() - start.time;

    if (
      elapsed > SWIPE_MAX_DURATION_MS ||
      Math.abs(deltaX) < SWIPE_MIN_DISTANCE_PX ||
      Math.abs(deltaX) <= Math.abs(deltaY) * 1.3
    ) {
      return;
    }

    const currentIndex = NAV_TABS.findIndex((tab) => tab.id === activeTab);
    if (currentIndex === -1) return;

    const nextIndex =
      deltaX < 0
        ? Math.min(NAV_TABS.length - 1, currentIndex + 1)
        : Math.max(0, currentIndex - 1);

    if (nextIndex !== currentIndex) {
      setActiveTab(NAV_TABS[nextIndex].id);
    }
  }

  function handleNavTouchCancel() {
    navTouchStartRef.current = null;
  }

  function handleSaveHealthProfile(profile: HealthProfile) {
    saveHealthProfile(profile);
    setHealthProfile(profile);
    setIsHealthModalOpen(false);
  }

  function handleSkipHealthProfile() {
    markWelcomeIntakeSeen();
    setIsHealthModalOpen(false);
  }

  function handleReplayIntro() {
    setIntroPlayKey((prev) => prev + 1);
    setShowIntro(true);
  }

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  function handleToggleTheme() {
    setTheme((prev) => {
      const next: ThemeMode = prev === "dark" ? "light" : "dark";
      saveTheme(next);
      return next;
    });
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-[#FDFBFC] via-[#FAF6F7] to-[#F5ECEE] transition-colors duration-300 dark:bg-[#161012] dark:from-[#161012] dark:via-[#161012] dark:to-[#1E1518]">
      {/* Top Curated Luxury Pharmacy & Jenpharm Bar */}
      <button
        type="button"
        onClick={() => {
          setGuideCategory("sunblocks");
          setIsGuidesOpen(true);
        }}
        className="group relative flex min-h-9 w-full cursor-pointer items-center justify-center overflow-hidden bg-[#B56576] px-4 py-1.5 text-center text-[#FAF6F7] transition-colors duration-300 hover:bg-[#A65768] dark:border-b dark:border-[#3D2B31] dark:bg-[#2A1D21] dark:text-[#F7EFEF] dark:hover:bg-[#332328] dark:hover:text-[#F7EFEF] sm:h-9 sm:py-0"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[420%]"
        />
        <span className="relative text-[11px] font-medium uppercase tracking-[0.14em] decoration-[#FAF6F7]/65 underline-offset-4 transition-all duration-300 group-hover:underline sm:text-xs dark:decoration-[#D48395]/75">
          Read more about products · Explore ingredients, skin types &amp; best prices →
        </span>
      </button>

      <Header
        language={language}
        onLanguageChange={setLanguage}
        hasHealthProfile={hasCustomHealthProfile(healthProfile)}
        onOpenHealthProfile={() => setIsHealthModalOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-7 sm:px-6">
        <nav
          aria-label="DerméScan Sections"
          onTouchStart={handleNavTouchStart}
          onTouchEnd={handleNavTouchEnd}
          onTouchCancel={handleNavTouchCancel}
          className="mb-7 flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-[#EAD8DC] bg-[#F3E7EA] p-1.5 shadow-[0_8px_24px_-12px_rgba(181,101,118,0.12)] transition-colors duration-300 dark:border-[#38282D] dark:bg-[#21181B] sm:flex-nowrap"
        >
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-h-[42px] flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors duration-300 active:scale-95 sm:gap-2 sm:px-4 ${
                  isActive
                    ? "bg-[#B56576] text-white shadow-[0_6px_16px_-4px_rgba(181,101,118,0.45)] dark:bg-[#D48395] dark:text-[#161012] dark:hover:bg-[#B56576] dark:hover:text-[#F7EFEF]"
                    : "text-[#5E5055] hover:bg-white/75 hover:text-[#1E181A] dark:text-[#C9B6BC] dark:hover:bg-[#2B1F24] dark:hover:text-[#F7EFEF]"
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
          className="mt-10 space-y-4 rounded-3xl border border-[#EAD8DC] bg-white px-6 py-5 text-xs text-[#5E5055] shadow-[0_8px_24px_-12px_rgba(181,101,118,0.1)] transition-colors duration-300 dark:border-[#38282D] dark:bg-[#21181B] dark:text-[#C9B6BC]"
        >
          {/* Editorial Magazine Article Hub Quick-Launch */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B56576] dark:text-[#D48395]">
                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {language === "ur"
                    ? "DerméScan Editorial Hub"
                    : "Editorial Magazine Guides"}
                </span>
              </div>
              <p className="font-editorial text-lg font-semibold text-[#1E181A] transition-colors duration-300 dark:text-[#F7EFEF]">
                {language === "ur"
                  ? "Sunblocks, Serums, Face Washes Aur Hair Guides"
                  : "Dermatology Reading Hub — Sunblocks, Creams, Cleansers & Scalp"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setGuideCategory("sunblocks");
                setIsGuidesOpen(true);
              }}
              className="inline-flex min-h-[38px] shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#BF6E7F] to-[#B56576] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_6px_16px_-4px_rgba(181,101,118,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#B56576] hover:to-[#9E5263] active:scale-95 dark:from-[#D48395] dark:to-[#D48395] dark:text-[#161012] dark:hover:from-[#B56576] dark:hover:to-[#B56576] dark:hover:text-[#F7EFEF]"
            >
              Read Magazine Guides →
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {SKINCARE_GUIDE_ARTICLES.map((article) => (
              <button
                key={article.id}
                type="button"
                onClick={() => {
                  setGuideCategory(article.id);
                  setIsGuidesOpen(true);
                }}
                className="flex flex-col items-start justify-between gap-1.5 rounded-2xl border border-[#EAD8DC] bg-[#FAF6F7]/75 p-3.5 text-left transition-colors duration-300 hover:border-[#B56576] hover:bg-[#F6ECEF]/65 active:scale-[0.99] dark:border-[#38282D] dark:bg-[#1B1316] dark:hover:border-[#D48395] dark:hover:bg-[#2B1F24]"
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B56576] dark:text-[#D48395]">
                    {article.categoryLabel}
                  </span>
                  <span className="text-[10px] font-medium text-[#7A686D] dark:text-[#C9B6BC]">
                    {article.readTime}
                  </span>
                </div>
                <span className="line-clamp-2 font-editorial text-sm font-semibold leading-snug text-[#1E181A] dark:text-[#F7EFEF]">
                  {article.title}
                </span>
              </button>
            ))}
          </div>

          <details className="group border-t border-[#EAD8DC] pt-3.5 dark:border-[#38282D]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-left font-medium text-[#5E5055] transition-colors duration-300 hover:text-[#1E181A] dark:text-[#C9B6BC] dark:hover:text-[#F7EFEF]">
              <h2
                id="popular-pk-checks-heading"
                className="font-editorial text-lg font-semibold text-[#1E181A] transition-colors duration-300 dark:text-[#F7EFEF]"
              >
                {language === "ur"
                  ? "Pakistan Mein Mashhoor Skin Aur Hair Checks"
                  : "Popular Skin & Hair Checks in Pakistan"}
              </h2>
              <span className="text-[11px] font-semibold text-[#B56576] group-open:hidden dark:text-[#D48395]">
                {language === "ur" ? "Mazeed dekhein +" : "Read more +"}
              </span>
              <span className="hidden text-[11px] font-semibold text-[#B56576] group-open:inline dark:text-[#D48395]">
                {language === "ur" ? "Band karein −" : "Show less −"}
              </span>
            </summary>
            <div className="mt-3 space-y-2 border-t border-[#EAD8DC] pt-3 text-xs leading-relaxed text-[#5E5055] transition-colors duration-300 dark:border-[#38282D] dark:text-[#C9B6BC]">
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

        <footer className="mt-5 rounded-3xl border border-[#EAD8DC] bg-white px-6 py-4 text-center text-xs leading-relaxed text-[#5E5055] shadow-[0_8px_24px_-12px_rgba(181,101,118,0.08)] transition-colors duration-300 dark:border-[#38282D] dark:bg-[#21181B] dark:text-[#C9B6BC]">
          <p>
            {language === "ur"
              ? "DerméScan sirf aam skin, hair aur cream ki rehnumai deta hai, yeh doctor ka checkup nahi hai. Agar shadeed dard, khoon ya tez rash ho toh fauran skin doctor ko dikhayein."
              : "DerméScan shares simple everyday skin, hair, and product tips. It is not a medical checkup—please visit a skin doctor if you have severe pain, bleeding, or a spreading rash."}
          </p>
          <div className="mt-2">
            <button
              type="button"
              onClick={handleReplayIntro}
              className="text-[11px] font-medium tracking-widest uppercase text-[#B56576]/75 underline decoration-[#B56576]/35 underline-offset-4 transition-colors duration-300 hover:text-[#B56576] dark:text-[#D48395] dark:decoration-[#D48395]/40 dark:hover:text-[#B56576]"
            >
              Replay Intro
            </button>
          </div>
        </footer>
      </main>

      <LuxuryIntro3D
        key={introPlayKey}
        isOpen={!isInstagramModalOpen && showIntro}
        onFinish={() => setShowIntro(false)}
      />

      <HealthProfileModal
        isOpen={!isInstagramModalOpen && !showIntro && isHealthModalOpen}
        language={language}
        initialProfile={healthProfile}
        onSave={handleSaveHealthProfile}
        onSkip={handleSkipHealthProfile}
      />

      <CameraPermissionModal
        isOpen={
          !isInstagramModalOpen &&
          !showIntro &&
          !isHealthModalOpen &&
          (cameraPromptState === "needed" || cameraPromptState === "denied")
        }
        isDeniedState={cameraPromptState === "denied"}
        language={language}
        onGranted={() => setCameraPromptState("granted")}
        onDenied={() => setCameraPromptState("denied")}
        onDismiss={handleDismissCameraPrompt}
      />

      <InstagramBrowserRedirectModal
        env={instagramEnv}
        isOpen={isInstagramModalOpen}
        language={language}
        onContinueInsideInstagram={() => setIsInstagramModalOpen(false)}
      />

      <SkincareGuidesDrawer
        isOpen={isGuidesOpen}
        initialCategory={guideCategory}
        language={language}
        onClose={() => setIsGuidesOpen(false)}
      />
    </div>
  );
}
