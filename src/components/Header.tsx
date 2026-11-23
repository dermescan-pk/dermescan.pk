import { HeartHandshake, Moon, Sun } from "lucide-react";
import type { Language } from "../types/dermascan.ts";
import type { ThemeMode } from "../utils/theme.ts";

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  hasHealthProfile: boolean;
  onOpenHealthProfile: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

function HorizontalBotanicalAccent() {
  return (
    <svg
      viewBox="0 0 84 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-auto w-[92px] shrink-0 text-[#B56576]/85 transition-colors duration-300 dark:text-[#D48395]/85"
    >
      {/* Delicate horizontal curving stem */}
      <path
        d="M2 16.5C18 19.5 34 11.5 52 14.5C60 15.8 66.5 14.8 71 12.6"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
      />
      {/* Upper fine-line leaf */}
      <path
        d="M26 15.2C28.5 9.2 35.5 7.4 40 9.6C36.8 13.8 31.2 15.6 26 15.2Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M27.2 14.8C31.2 13 34.8 11.5 37.8 10.2"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeOpacity="0.65"
      />
      {/* Lower fine-line leaf */}
      <path
        d="M45 14.1C47.8 19.8 54.5 21.8 59 19.4C55.6 15.4 50.2 13.6 45 14.1Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M46.2 14.6C50.2 16.2 53.6 17.6 56.6 18.8"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeOpacity="0.65"
      />
      {/* Calyx sepals */}
      <path
        d="M68.5 13.5C69.8 10.6 72 9.4 74.2 9.8"
        stroke="currentColor"
        strokeWidth="0.95"
        strokeLinecap="round"
      />
      <path
        d="M69 14C71.5 15.8 74.2 15.8 76.2 14.2"
        stroke="currentColor"
        strokeWidth="0.95"
        strokeLinecap="round"
      />
      {/* Fine-line rosebud bloom */}
      <path
        d="M70.8 12.6C71.6 8.2 75.5 5.4 79.8 6.8C81.8 7.5 82.4 10.2 80.5 12.6C78.4 15.2 74.2 15.4 70.8 12.6Z"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner rosebud petal swirl */}
      <path
        d="M73.5 11.8C74.2 9.2 76.8 8 78.8 9C79.8 9.6 79.4 11.4 77.4 12.1"
        stroke="currentColor"
        strokeWidth="0.95"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Header({
  language,
  onLanguageChange,
  hasHealthProfile,
  onOpenHealthProfile,
  theme,
  onToggleTheme,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#ECE0E3] bg-white/95 backdrop-blur-sm transition-colors duration-300 dark:border-[#34262B] dark:bg-[#191215]/95">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-6">
        {/* Row 1 (Mobile/Tablet) / Left Side (Desktop) */}
        <div className="min-w-0 md:pr-2">
          <div className="flex items-center gap-2">
            <h1 className="font-['Alex_Brush',_'Great_Vibes',_cursive] whitespace-nowrap py-0.5 text-4xl leading-none tracking-normal text-[#1E181A] transition-colors duration-300 dark:text-[#F7EFEF] sm:text-5xl">
              DerméScan
            </h1>
            <HorizontalBotanicalAccent />
          </div>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.22em] text-[#7A686D] transition-colors duration-300 dark:text-[#C9B6BC] sm:whitespace-nowrap">
            SKIN &amp; HAIR ATELIER · PAKISTAN
          </p>
        </div>

        {/* Row 2 (Mobile) / Right Side (Desktop) */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2.5 sm:flex-nowrap sm:justify-end sm:gap-2.5">
          <button
            type="button"
            onClick={onOpenHealthProfile}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-[#E8D5D9]/80 bg-[#FAF6F7]/70 px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap text-[#1E181A] shadow-xs transition-colors duration-300 hover:border-[#B56576] hover:bg-[#F6ECEF] hover:text-[#B56576] active:scale-95 dark:border-[#3A292E] dark:bg-[#21181B] dark:text-[#F7EFEF] dark:hover:border-[#D48395] dark:hover:bg-[#2B1F24] dark:hover:text-[#D48395]"
          >
            <HeartHandshake className="h-3.5 w-3.5 shrink-0 text-[#B56576] dark:text-[#D48395]" />
            <span>My Health Profile</span>
            {hasHealthProfile && (
              <span
                aria-label="Health profile saved"
                className="h-2 w-2 shrink-0 rounded-full bg-[#2D6A4F] dark:bg-[#7BD4AC]"
              />
            )}
          </button>

          <div
            role="group"
            aria-label="Language toggle"
            className="flex shrink-0 items-center rounded-full border border-[#EAD8DC] bg-white p-1 shadow-xs transition-colors duration-300 dark:border-[#3A292E] dark:bg-[#21181B]"
          >
            <button
              type="button"
              onClick={() => onLanguageChange("en")}
              className={`min-h-[30px] rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors duration-300 active:scale-95 ${
                language === "en"
                  ? "bg-[#B56576] text-white shadow-xs dark:bg-[#D48395] dark:text-[#161012] dark:hover:bg-[#B56576] dark:hover:text-[#F7EFEF]"
                  : "text-[#5E5055] hover:text-[#1E181A] dark:text-[#C9B6BC] dark:hover:text-[#F7EFEF]"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange("ur")}
              className={`min-h-[30px] rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors duration-300 active:scale-95 ${
                language === "ur"
                  ? "bg-[#B56576] text-white shadow-xs dark:bg-[#D48395] dark:text-[#161012] dark:hover:bg-[#B56576] dark:hover:text-[#F7EFEF]"
                  : "text-[#5E5055] hover:text-[#1E181A] dark:text-[#C9B6BC] dark:hover:text-[#F7EFEF]"
              }`}
            >
              Roman Urdu
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={
              theme === "dark"
                ? "Switch to Warm Silk Light mode"
                : "Switch to Evening Velvet Dark mode"
            }
            aria-pressed={theme === "dark"}
            title={
              theme === "dark"
                ? "Switch to Warm Silk Light"
                : "Switch to Evening Velvet Dark"
            }
            className="inline-flex min-h-[36px] shrink-0 items-center gap-0.5 rounded-full border border-[#EAD8DC] bg-white p-1 shadow-xs transition-colors duration-300 hover:border-[#B56576] active:scale-95 dark:border-[#3A292E] dark:bg-[#21181B] dark:hover:border-[#D48395]"
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-300 ${
                theme === "light"
                  ? "bg-[#B56576] text-white shadow-xs"
                  : "text-[#C9B6BC]"
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
            </span>
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-300 ${
                theme === "dark"
                  ? "bg-[#D48395] text-[#161012] shadow-xs"
                  : "text-[#5E5055]"
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
