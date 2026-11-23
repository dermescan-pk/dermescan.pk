import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Info,
  Search,
  ShieldAlert,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import { JENPHARM_PRODUCTS_CATALOG } from "../data/jenpharmProductsCatalog.ts";
import {
  ACCUFIX_PRODUCTS_CATALOG,
  type CatalogBrandName,
  type ExtendedBottleKind,
  type UnifiedGuideCategoryId,
  type UnifiedMonographSectionLabel,
  type UnifiedProductMonograph,
} from "../data/accufixProductsCatalog.ts";
import type { Language } from "../types/dermascan.ts";

export type GuideCategoryId = UnifiedGuideCategoryId;

type DrawerTabId = GuideCategoryId | "all";
type BrandFilterId = "all" | CatalogBrandName;

const UNIFIED_PRODUCTS_CATALOG: readonly UnifiedProductMonograph[] = [
  ...JENPHARM_PRODUCTS_CATALOG.map((item): UnifiedProductMonograph => {
    let guideCategory: UnifiedGuideCategoryId = "sunblocks";
    let monographSection: UnifiedMonographSectionLabel = "Sunscreens";

    if (item.guideCategory === "sunblocks") {
      guideCategory = "sunblocks";
      monographSection = "Sunscreens";
    } else if (item.guideCategory === "cleansers") {
      guideCategory = "cleansers";
      monographSection = "Cleansers & Face Washes";
    } else if (item.guideCategory === "shampoos-scalp") {
      guideCategory = "hair-scalp";
      monographSection = "Hair & Scalp Treatments";
    } else if (item.monographSection === "Moisturizers & Barrier Repair") {
      guideCategory = "moisturizers-toners";
      monographSection = "Moisturizers & Toners";
    } else {
      guideCategory = "serums-creams-patches";
      monographSection = "Targeted Serums, Creams & Patches";
    }

    return {
      order: item.order,
      brand: "Jenpharm",
      affiliateId: item.affiliateId,
      slug: item.slug,
      name: item.name,
      guideCategory,
      monographSection,
      imagePath: item.imagePath,
      affiliateUrl: item.affiliateUrl,
      bottleKind: item.bottleKind,
      suitsWhomLabel: item.suitsWhomLabel,
      suitsWhom: item.suitsWhom,
      bestFor: item.bestFor,
      keyPerks: item.keyPerks,
      whoShouldAvoid: item.whoShouldAvoid,
      couldCause: item.couldCause,
    };
  }),
  ...ACCUFIX_PRODUCTS_CATALOG,
];

interface GuideArticleMeta {
  id: GuideCategoryId;
  categoryLabel: string;
  readTime: string;
  title: string;
  intro: string;
  takeawayTitle: string;
  takeawayBody: string;
}

export const SKINCARE_GUIDE_ARTICLES: GuideArticleMeta[] = [
  {
    id: "sunblocks",
    categoryLabel: "Sunblocks",
    readTime: "3 min read",
    title: "The Pakistani Sunscreen Guide: Choosing the Right SPF",
    intro:
      "In Pakistan's intense UV index, especially across Sindh and Punjab, skipping daily sunscreen is the #1 reason melasma, sun tan, and post-acne marks refuse to fade. Compare every verified SPF formula below:",
    takeawayTitle: "Key Takeaway: Two-Finger Rule & Reapplication",
    takeawayBody:
      "Apply two full finger-lengths across your face and neck every morning, even indoors near bright windows, and reapply every 2-3 hours when stepping outside in direct Pakistani sunlight.",
  },
  {
    id: "cleansers",
    categoryLabel: "Cleansers",
    readTime: "4 min read",
    title: "How to Pick a Face Wash Without Stripping Your Barrier",
    intro:
      "If your face feels tight and squeaky after washing, your cleanser is damaging your lipid barrier. Compare Jenpharm and AccuFix cleansers matched to oily pores, gentle texture smoothing, or post-steroid sensitivity:",
    takeawayTitle: "Key Takeaway: Lukewarm Water & 45-60 Seconds",
    takeawayBody:
      "Use lukewarm water, massage gently for 45-60 seconds so BHA or AHA cleansers can lift oil cleanly, and pat dry before applying moisturizer on slightly damp skin.",
  },
  {
    id: "moisturizers-toners",
    categoryLabel: "Moisturizers & Toners",
    readTime: "4 min read",
    title: "Barrier Moisturizers & Resurfacing Toners for Pakistani Weather",
    intro:
      "Healthy skin stays balanced when hydration matches humidity and exfoliating toners stay spaced out. Explore Dermive barrier moisturizers alongside AccuFix Glycolic Acid Toner:",
    takeawayTitle: "Key Takeaway: Hydrate Daily, Exfoliate 2-3 Nights a Week",
    takeawayBody:
      "Layer lightweight oil-free moisturizers morning and night, and keep leave-on glycolic acid toners strictly to 2-3 evenings a week on intact skin.",
  },
  {
    id: "serums-creams-patches",
    categoryLabel: "Serums, Creams & Patches",
    readTime: "6 min read",
    title:
      "Steroid-Free Brightening, Pore Serums & Hydrocolloid Pimple Patches",
    intro:
      'Local "3-day whitening" creams thin skin with hidden steroids. Safe brightening and acne control come from targeted serums, gradual creams, and sterile pimple patches:',
    takeawayTitle: "Key Takeaway: Never Clash Retinol, AHAs & BHAs",
    takeawayBody:
      "Use brightening or pore serums on separate nights from Retinol, protect whitehead pimples with hydrocolloid patches instead of squeezing, and wear SPF 50+ every morning.",
  },
  {
    id: "lip-care",
    categoryLabel: "Lip Care",
    readTime: "2 min read",
    title: "Clinical Lip Care: Healing Chapping & Dark Lip Pigmentation Safely",
    intro:
      "Lip skin has zero oil glands and burns easily from harsh facial acids or lemon DIYs. Use dedicated soothing lip care designed gently for dark or flaky lips:",
    takeawayTitle: "Key Takeaway: Exfoliate Gently Once a Week & Protect from Sun",
    takeawayBody:
      "Keep lip polishing gentle at 1-2 times weekly, apply treatment balm at night, and never step outdoors without daytime SPF lip protection.",
  },
  {
    id: "body-washes",
    categoryLabel: "Body Washes",
    readTime: "3 min read",
    title: "Targeted Body Washes for Back Acne, Strawberry Skin & Eczema",
    intro:
      "Hot humid summers cause clogged follicles on the back and chest, while borehole hard water triggers dry itchy arms and legs. Choose active exfoliating or calming oat-lipid washes cleanly:",
    takeawayTitle: "Key Takeaway: Match Body Wash to Breakout vs Dryness Zones",
    takeawayBody:
      "Leave AHA/BHA body wash on acne-prone back or bumpy arms for 1-2 minutes before rinsing, and switch to soothing oat-lipid wash whenever skin feels dry or eczema-prone.",
  },
  {
    id: "hair-scalp",
    categoryLabel: "Hair & Scalp",
    readTime: "5 min read",
    title: "Solving Hard-Water Hair Fall, Dandruff & Frizz in Pakistan",
    intro:
      "Mineral-heavy borehole water coats hair shafts in buildup while humidity triggers scalp flakes and frizz. Rotate clarifying scalp shampoos with porosity-matched leave-ins, masks, and ends serums:",
    takeawayTitle: "Key Takeaway: Keep Scalp & Hair-Length Care Separate",
    takeawayBody:
      "Rotate medicated or clarifying shampoos 1-2x weekly with a gentle wash, skip raw oils on flaky scalps, and keep leave-in conditioners, masks, and serums strictly on mid-lengths and ends.",
  },
];

const ALL_MONOGRAPH_SECTIONS: UnifiedMonographSectionLabel[] = [
  "Cleansers & Face Washes",
  "Moisturizers & Toners",
  "Sunscreens",
  "Targeted Serums, Creams & Patches",
  "Lip Care",
  "Body Washes",
  "Hair & Scalp Treatments",
];

const BRAND_FILTER_OPTIONS: { id: BrandFilterId; label: string }[] = [
  { id: "all", label: "All Brands" },
  { id: "Jenpharm", label: "Jenpharm" },
  { id: "AccuFix Cosmetics", label: "AccuFix" },
];

function MinimalBottleSvg({ kind }: { kind: ExtendedBottleKind }) {
  return (
    <svg
      viewBox="0 0 88 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-20 w-20 text-[#B56576] dark:text-[#D48395]"
    >
      <circle
        cx="44"
        cy="44"
        r="34"
        className="fill-[#FAF6F7] stroke-[#EAD8DC] dark:fill-[#1B1316] dark:stroke-[#38282D]"
        strokeWidth="1.2"
      />
      {(kind === "tube" || kind === "lip") && (
        <g stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
          <path
            d="M31 18H57L53.5 60H34.5L31 18Z"
            fill="currentColor"
            fillOpacity="0.08"
          />
          <line
            x1="30.5"
            y1="22"
            x2="57.5"
            y2="22"
            strokeOpacity="0.55"
          />
          <rect
            x="37.5"
            y="30"
            width="13"
            height="16"
            rx="2.5"
            strokeOpacity="0.55"
          />
          <path
            d="M38 60H50V66C50 67.1 49.1 68 48 68H40C38.9 68 38 67.1 38 66V60Z"
            fill="currentColor"
            fillOpacity="0.16"
          />
        </g>
      )}
      {(kind === "jar" || kind === "mask") && (
        <g stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
          <rect
            x="25"
            y="29"
            width="38"
            height="9"
            rx="3"
            fill="currentColor"
            fillOpacity="0.16"
          />
          <path
            d="M24 38H64V56C64 60.4 60.4 64 56 64H32C27.6 64 24 60.4 24 56V38Z"
            fill="currentColor"
            fillOpacity="0.08"
          />
          <line
            x1="33"
            y1="49"
            x2="55"
            y2="49"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />
          <line
            x1="36"
            y1="54"
            x2="52"
            y2="54"
            strokeLinecap="round"
            strokeOpacity="0.45"
          />
        </g>
      )}
      {(kind === "serum" || kind === "drops") && (
        <g stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
          <path
            d="M39.5 19C39.5 16.5 41.5 14.5 44 14.5C46.5 14.5 48.5 16.5 48.5 19V25H39.5V19Z"
            fill="currentColor"
            fillOpacity="0.2"
          />
          <rect
            x="37"
            y="25"
            width="14"
            height="5.5"
            rx="1.5"
            fill="currentColor"
            fillOpacity="0.12"
          />
          <path
            d="M38 30.5H50L55 36.5V64C55 66.2 53.2 68 51 68H37C34.8 68 33 66.2 33 64V36.5L38 30.5Z"
            fill="currentColor"
            fillOpacity="0.08"
          />
          <rect
            x="37.5"
            y="42"
            width="13"
            height="17"
            rx="2"
            strokeOpacity="0.55"
          />
        </g>
      )}
      {(kind === "wash" || kind === "shampoo" || kind === "toner") && (
        <g stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
          <path d="M40 16H52" strokeLinecap="round" />
          <line
            x1="44"
            y1="16"
            x2="44"
            y2="23"
            strokeLinecap="round"
          />
          <rect
            x="38"
            y="23"
            width="12"
            height="5"
            rx="1.5"
            fill="currentColor"
            fillOpacity="0.16"
          />
          <path
            d="M35 28H53L56 34V65C56 66.7 54.7 68 53 68H35C33.3 68 32 66.7 32 65V34L35 28Z"
            fill="currentColor"
            fillOpacity="0.08"
          />
          <line
            x1="37"
            y1="43"
            x2="51"
            y2="43"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />
          <line
            x1="39"
            y1="48.5"
            x2="49"
            y2="48.5"
            strokeLinecap="round"
            strokeOpacity="0.45"
          />
        </g>
      )}
      {kind === "patch" && (
        <g stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
          <rect
            x="24"
            y="24"
            width="40"
            height="40"
            rx="6"
            fill="currentColor"
            fillOpacity="0.07"
          />
          <circle cx="36" cy="36" r="4.5" fill="currentColor" fillOpacity="0.16" />
          <circle cx="52" cy="36" r="4.5" fill="currentColor" fillOpacity="0.16" />
          <circle cx="36" cy="52" r="4.5" fill="currentColor" fillOpacity="0.16" />
          <circle cx="52" cy="52" r="4.5" fill="currentColor" fillOpacity="0.16" />
        </g>
      )}
    </svg>
  );
}

function ProductPhotoFrame({
  imagePath,
  productName,
  bottleKind,
}: {
  imagePath: string;
  productName: string;
  bottleKind: ExtendedBottleKind;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [imagePath]);

  return (
    <div
      className={`flex h-[120px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#EAD8DC] p-2 transition-colors duration-300 dark:border-[#38282D] ${
        imgFailed ? "bg-white dark:bg-[#21181B]" : "bg-white"
      }`}
    >
      {!imgFailed ? (
        <img
          src={imagePath}
          alt={productName}
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        <MinimalBottleSvg kind={bottleKind} />
      )}
    </div>
  );
}

function ProductMonographCard({
  product,
}: {
  product: UnifiedProductMonograph;
}) {
  return (
    <article className="rounded-2xl border border-[#ECE0E3] bg-white p-5 transition-colors duration-300 sm:p-6 dark:border-[#34262B] dark:bg-[#1E1619]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
        <ProductPhotoFrame
          imagePath={product.imagePath}
          productName={product.name}
          bottleKind={product.bottleKind}
        />

        <div className="min-w-0 flex-1 space-y-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-full border border-[#ECE0E3] bg-[#FAF6F7] px-3 py-0.5 text-xs font-semibold tracking-wide text-[#B56576] transition-colors duration-300 dark:border-[#34262B] dark:bg-[#171113] dark:text-[#D48395]">
                #{product.order} · {product.monographSection}
              </span>
              <span className="inline-block rounded-full border border-[#EAD8DC] bg-[#B56576]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#8F4556] dark:border-[#49323A] dark:bg-[#D48395]/15 dark:text-[#F0B2C0]">
                {product.brand}
              </span>
            </div>
            <h4 className="font-editorial break-words text-lg font-semibold leading-snug text-[#1E181A] transition-colors duration-300 sm:text-xl dark:text-[#F7EFEF]">
              {product.name}
            </h4>
          </div>

          <dl className="space-y-3 text-[15px] leading-relaxed sm:text-base">
            <div className="rounded-xl border border-[#F0E4E7] bg-[#FAF6F7]/85 px-4 py-3 transition-colors duration-300 dark:border-[#34262B] dark:bg-[#171113]">
              <dt className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#8C3B4A] dark:text-[#F0B2C0]">
                <UserCheck className="h-3.5 w-3.5 shrink-0" />
                <span>{product.suitsWhomLabel}</span>
              </dt>
              <dd className="break-words text-[#3D3135] dark:text-[#EADCE0]">
                {product.suitsWhom}
              </dd>
            </div>

            <div className="rounded-xl border border-[#F0E4E7] bg-[#FAF6F7]/85 px-4 py-3 transition-colors duration-300 dark:border-[#34262B] dark:bg-[#171113]">
              <dt className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#8C3B4A] dark:text-[#F0B2C0]">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>Best For Which Condition</span>
              </dt>
              <dd className="break-words text-[#3D3135] dark:text-[#EADCE0]">
                {product.bestFor}
              </dd>
            </div>

            <div className="rounded-xl border border-[#F0E4E7] bg-[#FAF6F7]/85 px-4 py-3 transition-colors duration-300 dark:border-[#34262B] dark:bg-[#171113]">
              <dt className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#B56576] dark:text-[#D48395]">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span>Key Perks &amp; How It Works</span>
              </dt>
              <dd className="break-words text-[#3D3135] dark:text-[#EADCE0]">
                {product.keyPerks}
              </dd>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-[#E5C9CE] bg-[#FDF4F6] px-4 py-3 transition-colors duration-300 dark:border-[#4D3038] dark:bg-[#26181D]">
                <dt className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#9E4558] dark:text-[#F0A8B8]">
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                  <span>Who Should Avoid</span>
                </dt>
                <dd className="break-words text-[#4D363C] dark:text-[#DFC9CF]">
                  {product.whoShouldAvoid}
                </dd>
              </div>

              <div className="rounded-xl border border-[#E5D3C4] bg-[#FCF7F2] px-4 py-3 transition-colors duration-300 dark:border-[#4A3B30] dark:bg-[#241C17]">
                <dt className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#8E5B32] dark:text-[#E5BD99]">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>Could Potentially Cause</span>
                </dt>
                <dd className="break-words text-[#4F4036] dark:text-[#DCCDC1]">
                  {product.couldCause}
                </dd>
              </div>
            </div>
          </dl>

          {product.affiliateUrl && (
            <div className="pt-1">
              <a
                href={product.affiliateUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className="inline-flex min-h-[42px] max-w-full items-center justify-center rounded-full bg-gradient-to-b from-[#BF6E7F] to-[#B56576] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_8px_20px_-6px_rgba(181,101,118,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#B56576] hover:to-[#9E5263] active:scale-95 sm:text-sm dark:from-[#D48395] dark:to-[#D48395] dark:text-[#161012] dark:hover:from-[#B56576] dark:hover:to-[#B56576] dark:hover:text-[#F7EFEF]"
              >
                Buy at the best price here →
              </a>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

interface SkincareGuidesDrawerProps {
  isOpen: boolean;
  initialCategory?: GuideCategoryId;
  language: Language;
  onClose: () => void;
}

export function SkincareGuidesDrawer({
  isOpen,
  initialCategory = "sunblocks",
  language,
  onClose,
}: SkincareGuidesDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTabId>(initialCategory);
  const [brandFilter, setBrandFilter] = useState<BrandFilterId>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialCategory);
      setBrandFilter("all");
      setSearchQuery("");
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [isOpen, initialCategory]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const brandScopedCatalog = useMemo(() => {
    if (brandFilter === "all") return UNIFIED_PRODUCTS_CATALOG;
    return UNIFIED_PRODUCTS_CATALOG.filter(
      (product) => product.brand === brandFilter
    );
  }, [brandFilter]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!normalizedQuery) return [];
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    return brandScopedCatalog.filter((product) => {
      const searchableText = [
        product.brand,
        product.name,
        product.monographSection,
        product.suitsWhom,
        product.bestFor,
        product.keyPerks,
        product.whoShouldAvoid,
        product.couldCause,
      ]
        .join(" ")
        .toLowerCase();
      return tokens.every((token) => searchableText.includes(token));
    });
  }, [brandScopedCatalog, normalizedQuery]);

  const activeArticle =
    SKINCARE_GUIDE_ARTICLES.find((a) => a.id === activeTab) ||
    SKINCARE_GUIDE_ARTICLES[0];

  const categoryProducts = useMemo(() => {
    if (activeTab === "all") return brandScopedCatalog;
    return brandScopedCatalog.filter(
      (product) => product.guideCategory === activeTab
    );
  }, [activeTab, brandScopedCatalog]);

  if (!isOpen) return null;

  const isSearching = normalizedQuery.length > 0;

  return (
    <div
      ref={scrollContainerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="skincare-guides-hub-title"
      className="fixed inset-0 z-50 h-dvh w-screen overflow-y-auto bg-[#FAF6F7] transition-colors duration-300 dark:bg-[#140F11]"
    >
      {/* Sticky Top Navigation Bar */}
      <header className="sticky top-0 z-10 border-b border-[#ECE0E3] bg-[#FAF6F7]/95 backdrop-blur-md transition-colors duration-300 dark:border-[#34262B] dark:bg-[#140F11]/95">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[38px] items-center gap-2 rounded-full border border-[#ECE0E3] bg-white px-4 py-1.5 text-xs font-semibold text-[#1E181A] transition-colors duration-200 hover:border-[#B56576] hover:text-[#B56576] active:scale-95 sm:text-sm dark:border-[#34262B] dark:bg-[#1E1619] dark:text-[#F7EFEF] dark:hover:border-[#D48395] dark:hover:text-[#D48395]"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span>Back to Scanner</span>
          </button>

          <span className="hidden items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#B56576] sm:inline-flex dark:text-[#D48395]">
            <BookOpen className="h-3.5 w-3.5 shrink-0" />
            <span>DerméScan Product Guides</span>
          </span>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Skincare Guides"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#ECE0E3] bg-white text-[#5E5055] transition-colors duration-200 hover:border-[#B56576] hover:text-[#B56576] active:scale-95 dark:border-[#34262B] dark:bg-[#1E1619] dark:text-[#C9B6BC] dark:hover:border-[#D48395] dark:hover:text-[#D48395]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Full-Screen Centered Editorial Column */}
      <main className="mx-auto max-w-4xl space-y-8 px-5 py-6 pb-24 sm:px-8">
        {/* Page Heading + Search + Brand & Category Filters */}
        <section className="space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 shrink-0 text-[#B56576] dark:text-[#D48395]" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B56576] dark:text-[#D48395]">
                {language === "ur"
                  ? `DerméScan Editorial Hub · ${UNIFIED_PRODUCTS_CATALOG.length} Verified Monographs`
                  : `DerméScan Dermatology Journal · ${UNIFIED_PRODUCTS_CATALOG.length} Jenpharm & AccuFix Monographs`}
              </p>
            </div>
            <h2
              id="skincare-guides-hub-title"
              className="font-editorial text-3xl font-semibold text-[#1E181A] transition-colors duration-300 sm:text-4xl dark:text-[#F7EFEF]"
            >
              {language === "ur"
                ? "Pakistani Skin & Hair Product Encyclopedia"
                : "Pakistani Skin & Haircare Guides"}
            </h2>
          </div>

          <div className="space-y-3.5">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#B56576] dark:text-[#D48395]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search all 36 Jenpharm and AccuFix products, conditions, ingredients, or skin types"
                placeholder={
                  language === "ur"
                    ? "Search karein: melasma, oily skin, pimple patches, lip balm, dandruff, AccuFix..."
                    : "Search all 36 products: melasma, oily skin, lip balm, dandruff, AccuFix, retinol..."
                }
                className="w-full rounded-full border border-[#ECE0E3] bg-white py-3 pr-11 pl-11 text-[15px] text-[#1E181A] placeholder:text-[#7A686D] transition-colors duration-300 focus:border-[#B56576] focus:outline-none sm:text-base dark:border-[#34262B] dark:bg-[#1E1619] dark:text-[#F7EFEF] dark:placeholder:text-[#9A848B] dark:focus:border-[#D48395]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#7A686D] transition-colors hover:bg-[#F3E7EA] hover:text-[#1E181A] dark:text-[#C9B6BC] dark:hover:bg-[#2B1F24] dark:hover:text-[#F7EFEF]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Brand Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A686D] dark:text-[#A9959B]">
                Brand:
              </span>
              {BRAND_FILTER_OPTIONS.map((option) => {
                const isSelected = brandFilter === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setBrandFilter(option.id)}
                    className={`min-h-[34px] rounded-full border px-3.5 py-1 text-xs font-semibold transition-colors duration-200 active:scale-95 ${
                      isSelected
                        ? "border-[#B56576] bg-[#B56576]/12 text-[#8F4556] dark:border-[#D48395] dark:bg-[#D48395]/20 dark:text-[#F5B8C6]"
                        : "border-[#ECE0E3] bg-white text-[#5E5055] hover:border-[#B56576] hover:text-[#B56576] dark:border-[#34262B] dark:bg-[#1E1619] dark:text-[#C9B6BC] dark:hover:border-[#D48395] dark:hover:text-[#D48395]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            {/* Category Tabs */}
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveTab("all");
                }}
                className={`min-h-[38px] shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors duration-200 active:scale-95 sm:text-sm ${
                  !isSearching && activeTab === "all"
                    ? "bg-[#B56576] text-white dark:bg-[#D48395] dark:text-[#140F11] dark:hover:bg-[#B56576] dark:hover:text-[#F7EFEF]"
                    : "border border-[#ECE0E3] bg-white text-[#5E5055] hover:border-[#B56576] hover:text-[#B56576] dark:border-[#34262B] dark:bg-[#1E1619] dark:text-[#C9B6BC] dark:hover:border-[#D48395] dark:hover:text-[#D48395]"
                }`}
              >
                All Products ({brandScopedCatalog.length})
              </button>
              {SKINCARE_GUIDE_ARTICLES.map((article) => {
                const isActive = !isSearching && activeTab === article.id;
                return (
                  <button
                    key={article.id}
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveTab(article.id);
                    }}
                    className={`min-h-[38px] shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors duration-200 active:scale-95 sm:text-sm ${
                      isActive
                        ? "bg-[#B56576] text-white dark:bg-[#D48395] dark:text-[#140F11] dark:hover:bg-[#B56576] dark:hover:text-[#F7EFEF]"
                        : "border border-[#ECE0E3] bg-white text-[#5E5055] hover:border-[#B56576] hover:text-[#B56576] dark:border-[#34262B] dark:bg-[#1E1619] dark:text-[#C9B6BC] dark:hover:border-[#D48395] dark:hover:text-[#D48395]"
                    }`}
                  >
                    {article.categoryLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Readable Magazine Article / Monograph Body */}
        {isSearching ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ECE0E3] pb-4 dark:border-[#34262B]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#B56576] dark:text-[#D48395]">
                  Live Monograph Search
                </p>
                <h3 className="font-editorial text-2xl font-semibold text-[#1E181A] sm:text-3xl dark:text-[#F7EFEF]">
                  Showing {searchResults.length} of{" "}
                  {brandScopedCatalog.length} products
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="rounded-full border border-[#ECE0E3] bg-white px-4 py-2 text-xs font-semibold text-[#5E5055] transition-colors hover:border-[#B56576] hover:text-[#B56576] sm:text-sm dark:border-[#34262B] dark:bg-[#1E1619] dark:text-[#C9B6BC] dark:hover:border-[#D48395] dark:hover:text-[#D48395]"
              >
                Clear Search
              </button>
            </div>

            {searchResults.length > 0 ? (
              <div className="space-y-5">
                {searchResults.map((product) => (
                  <ProductMonographCard
                    key={product.affiliateId}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#ECE0E3] bg-white p-8 text-center dark:border-[#34262B] dark:bg-[#1E1619]">
                <Info className="mx-auto mb-3 h-7 w-7 text-[#B56576] dark:text-[#D48395]" />
                <p className="font-editorial text-2xl font-semibold text-[#1E181A] dark:text-[#F7EFEF]">
                  No matching monograph found
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-[#5E5055] sm:text-base dark:text-[#C9B6BC]">
                  Try searching for a skin concern like &ldquo;melasma&rdquo;,
                  &ldquo;acne&rdquo;, &ldquo;dandruff&rdquo;, &ldquo;lip balm&rdquo;,
                  or switch Brand back to All Brands.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setBrandFilter("all");
                  }}
                  className="mt-5 inline-flex min-h-[40px] items-center justify-center rounded-full bg-[#B56576] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#9E5263] dark:bg-[#D48395] dark:text-[#140F11]"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        ) : activeTab === "all" ? (
          <div className="space-y-8">
            <header className="space-y-3 border-b border-[#ECE0E3] pb-6 dark:border-[#34262B]">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ECE0E3] bg-white px-3 py-1 text-xs font-semibold text-[#8C3B4A] dark:border-[#34262B] dark:bg-[#1E1619] dark:text-[#F0B2C0]">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>Full Clinical Index</span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B56576] dark:text-[#D48395]">
                  Complete Encyclopedia ({brandScopedCatalog.length} Products)
                </span>
              </div>
              <h3 className="font-editorial text-2xl font-semibold leading-snug text-[#1E181A] sm:text-3xl dark:text-[#F7EFEF]">
                {brandFilter === "all"
                  ? "All 36 Verified Clinical Monographs"
                  : `All ${brandScopedCatalog.length} Verified ${brandFilter} Monographs`}
              </h3>
              <p className="text-[15px] leading-relaxed text-[#5E5055] sm:text-base dark:text-[#C9B6BC]">
                Browse cleansers, moisturizers, toners, sunscreens, targeted serums,
                pimple patches, lip care, body washes, and hair treatments with
                suitability, perks, warnings, and side effects.
              </p>
            </header>

            {ALL_MONOGRAPH_SECTIONS.map((sectionLabel) => {
              const sectionItems = brandScopedCatalog.filter(
                (item) => item.monographSection === sectionLabel
              );
              if (sectionItems.length === 0) return null;
              return (
                <section key={sectionLabel} className="space-y-4">
                  <h4 className="border-b border-[#ECE0E3] pb-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#B56576] sm:text-sm dark:border-[#34262B] dark:text-[#D48395]">
                    {sectionLabel} ({sectionItems.length})
                  </h4>
                  <div className="space-y-5">
                    {sectionItems.map((product) => (
                      <ProductMonographCard
                        key={product.affiliateId}
                        product={product}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="space-y-7">
            <header className="space-y-3 border-b border-[#ECE0E3] pb-6 transition-colors duration-300 dark:border-[#34262B]">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ECE0E3] bg-white px-3 py-1 text-xs font-semibold text-[#8C3B4A] transition-colors duration-300 dark:border-[#34262B] dark:bg-[#1E1619] dark:text-[#F0B2C0]">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>{activeArticle.readTime}</span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B56576] dark:text-[#D48395]">
                  {activeArticle.categoryLabel} · {categoryProducts.length}{" "}
                  Monographs
                </span>
              </div>

              <h3 className="font-editorial text-2xl font-semibold leading-snug text-[#1E181A] transition-colors duration-300 sm:text-3xl dark:text-[#F7EFEF]">
                {activeArticle.title}
              </h3>

              <p className="text-[15px] leading-relaxed text-[#5E5055] transition-colors duration-300 sm:text-base dark:text-[#C9B6BC]">
                {activeArticle.intro}
              </p>
            </header>

            {categoryProducts.length > 0 ? (
              <div className="space-y-5">
                {categoryProducts.map((product) => (
                  <ProductMonographCard
                    key={product.affiliateId}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#ECE0E3] bg-white p-7 text-center dark:border-[#34262B] dark:bg-[#1E1619]">
                <Info className="mx-auto mb-2.5 h-6 w-6 text-[#B56576] dark:text-[#D48395]" />
                <p className="font-editorial text-xl font-semibold text-[#1E181A] dark:text-[#F7EFEF]">
                  No {brandFilter} products in {activeArticle.categoryLabel}
                </p>
                <p className="mt-1.5 text-sm text-[#5E5055] dark:text-[#C9B6BC]">
                  Switch back to All Brands to view verified products in this category.
                </p>
                <button
                  type="button"
                  onClick={() => setBrandFilter("all")}
                  className="mt-4 inline-flex min-h-[38px] items-center justify-center rounded-full bg-[#B56576] px-5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#9E5263] dark:bg-[#D48395] dark:text-[#140F11]"
                >
                  Show All Brands
                </button>
              </div>
            )}

            {/* Editorial Takeaway Callout Box */}
            <aside className="rounded-2xl border border-[#ECE0E3] bg-white p-6 transition-colors duration-300 dark:border-[#34262B] dark:bg-[#1E1619]">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-1 h-4 w-4 shrink-0 text-[#B56576] dark:text-[#D48395]" />
                <div className="space-y-1.5">
                  <p className="font-editorial text-xl font-semibold text-[#1E181A] dark:text-[#F7EFEF]">
                    {activeArticle.takeawayTitle}
                  </p>
                  <p className="text-[15px] leading-relaxed text-[#5E5055] sm:text-base dark:text-[#C9B6BC]">
                    {activeArticle.takeawayBody}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
