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
} from "lucide-react";
import { Header } from "./components/Header.tsx";
import { SkinBodyTab } from "./components/SkinBodyTab.tsx";
import { HairStudioTab } from "./components/HairStudioTab.tsx";
import { SteroidCheckTab } from "./components/SteroidCheckTab.tsx";
import { FakeVsRealTab } from "./components/FakeVsRealTab.tsx";
import {
  SkincareGuidesDrawer,
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
  { id: "verify", label: "Fake & Store Check", icon: ShieldCheck },
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
    <div className="min-h-screen overflow-x-hidden bg-[#F7EEF0] transition-colors duration-300 dark:bg-[#140E10]">
      {/* Top Curated Luxury Pharmacy & Jenpharm Bar */}
      <button
        type="button"
        onClick={() => {
          setGuideCategory("sunblocks");
          setIsGuidesOpen(true);
        }}
        className="group relative flex min-h-9 w-full cursor-pointer items-center justify-center overflow-hidden bg-[#B56576] px-4 py-1.5 text-center text-[#FAF6F7] transition-colors duration-300 hover:bg-[#A65768] dark:border-b dark:border-[#34262B] dark:bg-[#24191D] dark:text-[#F7EFEF] dark:hover:bg-[#2E2025] dark:hover:text-[#F7EFEF] sm:h-9 sm:py-0"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[420%]"
        />
        <span className="relative text-[11px] font-medium uppercase tracking-[0.14em] decoration-[#FAF6F7]/65 underline-offset-4 transition-all duration-300 group-hover:underline sm:text-xs dark:decoration-[#D48395]/75">
          Explore Pakistani skincare &amp; product guides →
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

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 pb-24 sm:px-6">
        <nav
          aria-label="DerméScan Sections"
          onTouchStart={handleNavTouchStart}
          onTouchEnd={handleNavTouchEnd}
          onTouchCancel={handleNavTouchCancel}
          className="grid grid-cols-2 gap-1.5 rounded-2xl border border-[#EAD8DC] bg-[#F3E7EA]/85 p-1.5 transition-colors duration-300 dark:border-[#34262B] dark:bg-[#1E1619] sm:flex sm:items-center sm:rounded-full"
        >
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors duration-200 active:scale-95 sm:flex-1 sm:rounded-full sm:text-sm ${
                  isActive
                    ? "bg-[#B56576] text-white shadow-xs dark:bg-[#D48395] dark:text-[#140F11] dark:hover:bg-[#B56576] dark:hover:text-[#F7EFEF]"
                    : "text-[#5E5055] hover:bg-white/75 hover:text-[#1E181A] dark:text-[#C9B6BC] dark:hover:bg-[#2A1F23] dark:hover:text-[#F7EFEF]"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
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

        <footer className="px-2 pt-2 text-center text-xs leading-relaxed text-[#7A686D] transition-colors duration-300 dark:text-[#C9B6BC]">
          <p>
            {language === "ur"
              ? "DerméScan sirf aam skin, hair aur cream ki rehnumai deta hai, yeh doctor ka checkup nahi hai. Agar shadeed dard, khoon ya tez rash ho toh fauran skin doctor ko dikhayein."
              : "DerméScan shares simple everyday skin, hair, and product tips. It is not a medical checkup. Please visit a skin doctor if you have severe pain, bleeding, or a spreading rash."}
          </p>
          <div className="mt-3">
            <button
              type="button"
              onClick={handleReplayIntro}
              className="text-[11px] font-medium tracking-widest uppercase text-[#B56576]/80 underline decoration-[#B56576]/35 underline-offset-4 transition-colors duration-300 hover:text-[#B56576] dark:text-[#D48395] dark:decoration-[#D48395]/40 dark:hover:text-[#B56576]"
            >
              Replay Intro
            </button>
          </div>
          <p className="mt-3 text-[11px] tracking-wide text-[#8E7A80] dark:text-[#A9959C]">
            © 2026 DerméScan · Derme Scan Pakistan
          </p>
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
