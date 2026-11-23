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
      viewBox="0 0 92 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-4 w-14 shrink-0 text-[#B56576] transition-colors duration-300 dark:text-[#D48395] sm:h-5 sm:w-[84px]"
    >
      {/* Delicate horizontal stem */}
      <path
        d="M2 13.5C18 13.5 34 10.5 54 10.8C67 11 76 9.8 83 9.2"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      {/* Upper minimalist leaf */}
      <path
        d="M26 12C29 6.8 36 4.5 41.5 6.8C37.5 10.2 31.5 11.8 26 12Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Lower minimalist leaf */}
      <path
        d="M46 11C49.5 16.2 57 17.8 62.5 15C58 12.2 52 11 46 11Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Minimalist 3-petal blossom at tip */}
      <path
        d="M78 9.6C80.5 5.4 85 4.2 87.5 6.2C85.5 8.8 82 9.8 78 9.6Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M79 9.8C83.2 8.8 87.5 9.8 89.2 12.2C85.5 13.4 81.8 12.2 79 9.8Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="83.5" cy="9.5" r="1.1" fill="currentColor" opacity="0.75" />
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
    <header className="sticky top-0 z-40 border-b border-[#EAD8DC] bg-[#FDFBFC] transition-colors duration-300 dark:border-[#38282D] dark:bg-[#1B1316]">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        {/* Row 1 (Mobile) / Left Side (Desktop) */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <h1 className="font-['Alex_Brush',_'Great_Vibes',_cursive] whitespace-nowrap py-1 text-4xl leading-none tracking-normal text-[#1E181A] transition-colors duration-300 dark:text-[#F7EFEF] sm:text-5xl">
              DerméScan
            </h1>
            <HorizontalBotanicalAccent />
          </div>
          <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-[#7A686D] transition-colors duration-300 dark:text-[#C9B6BC] sm:whitespace-nowrap">
            SKIN &amp; HAIR ATELIER • PAKISTAN
          </p>
        </div>

        {/* Row 2 (Mobile) / Right Side (Desktop) */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 sm:flex-nowrap sm:justify-end">
          <button
            type="button"
            onClick={onOpenHealthProfile}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-[#EAD8DC] bg-white px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap text-[#1E181A] shadow-xs transition-colors duration-300 hover:border-[#B56576] hover:bg-[#F6ECEF] hover:text-[#B56576] active:scale-95 dark:border-[#3A292E] dark:bg-[#21181B] dark:text-[#F7EFEF] dark:hover:border-[#D48395] dark:hover:bg-[#2B1F24] dark:hover:text-[#D48395]"
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
