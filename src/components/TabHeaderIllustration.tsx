import type { Language, TabId } from "../types/dermascan.ts";

interface TabHeaderIllustrationProps {
  variant: TabId;
  language: Language;
  isActive?: boolean;
}

const TAB_BANNER_COPY: Record<
  TabId,
  {
    title: { en: string; ur: string };
    subtitle: { en: string; ur: string };
    tips: { en: string; ur: string };
  }
> = {
  skin: {
    title: {
      en: "Skin & Body Check",
      ur: "Skin & Body Check",
    },
    subtitle: {
      en: "Personalized routines for Pakistani weather & water.",
      ur: "Pakistani mausam aur paani ke mutabiq routine.",
    },
    tips: {
      en: "Good lighting · No filters · Close-up",
      ur: "Saaf roshni · No filters · Nazdeek se photo",
    },
  },
  hair: {
    title: {
      en: "Hair & Scalp Check",
      ur: "Hair & Scalp Check",
    },
    subtitle: {
      en: "Balanced scalp and strand care for Pakistani water.",
      ur: "Khushki ke baghair baal aur sar ki hifazat.",
    },
    tips: {
      en: "Good lighting · No filters · Close-up",
      ur: "Saaf roshni · No filters · Nazdeek se photo",
    },
  },
  steroid: {
    title: {
      en: "Cream Safety Check",
      ur: "Steroids Aur Chemicals Check",
    },
    subtitle: {
      en: "Spot hidden steroids and switch to gentle daily care.",
      ur: "Chhupay steroids pehchanein aur safe badal paayein.",
    },
    tips: {
      en: "Good lighting · No filters · Close-up",
      ur: "Saaf roshni · No filters · Nazdeek se photo",
    },
  },
  verify: {
    title: {
      en: "Authenticity & Formula Check",
      ur: "Asli-Naqli Aur Ingredients Check",
    },
    subtitle: {
      en: "Verified packaging checks, decoded actives, and skin suitability.",
      ur: "Asli-naqli pehchan, active ingredients aur munasibat check.",
    },
    tips: {
      en: "Good lighting · No filters · Close-up",
      ur: "Saaf roshni · No filters · Nazdeek se photo",
    },
  },
};

export function TabHeaderIllustration({
  variant,
  language,
}: TabHeaderIllustrationProps) {
  const copy = TAB_BANNER_COPY[variant];

  return (
    <header className="space-y-2 px-1 pt-1">
      <h2 className="font-editorial text-3xl font-semibold leading-tight tracking-tight text-[#1E181A] transition-colors duration-300 dark:text-[#F7EFEF] sm:text-4xl">
        {copy.title[language]}
      </h2>
      <p className="text-sm leading-relaxed text-[#5E5055] transition-colors duration-300 dark:text-[#C9B6BC]">
        {copy.subtitle[language]}
      </p>
      <p className="pt-0.5 text-xs font-medium tracking-wide text-[#7A686D] transition-colors duration-300 dark:text-[#A9939B]">
        {copy.tips[language]}
      </p>
    </header>
  );
}
