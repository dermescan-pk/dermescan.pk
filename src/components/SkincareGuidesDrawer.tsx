import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
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
import {
  JENPHARM_PRODUCTS_CATALOG,
  type BottleKind,
  type GuideCategoryId,
  type JenpharmProductMonograph,
  type MonographSectionLabel,
} from "../data/jenpharmProductsCatalog.ts";
import type { Language } from "../types/dermascan.ts";

export type { GuideCategoryId };

type DrawerTabId = GuideCategoryId | "all";

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
    title: "The Pakistani Sunscreen Guide — Choosing the Right Jenpharm SPF",
    intro:
      "In Pakistan's intense UV index—especially across Sindh and Punjab—skipping daily sunscreen is the #1 reason melasma, sun tan, and post-acne marks refuse to fade. Compare the full clinical profile of every Jenpharm SPF formula below:",
    takeawayTitle: "Key Takeaway: Two-Finger Rule & Reapplication",
    takeawayBody:
      "Apply two full finger-lengths across your face and neck every morning—even indoors near bright windows—and reapply every 2–3 hours when stepping outside in direct Pakistani sunlight.",
  },
  {
    id: "creams-serums",
    categoryLabel: "Creams & Serums",
    readTime: "6 min read",
    title:
      "Steroid-Free Brightening & Barrier Repair — Moisturizers, Creams & Serums",
    intro:
      'Local "3-day whitening" creams thin your epidermis with unprescribed steroids. True skin brightening happens safely by repairing your moisture barrier first and fading excess melanin gradually with targeted clinical actives:',
    takeawayTitle: "Key Takeaway: Calm Barrier First, Brighten Safely",
    takeawayBody:
      "Never rush fading pigmentation with unlabelled steroid creams. Pair daily barrier hydration with gentle brightening actives in the morning and keep Retinol or exfoliating acids strictly spaced out on separate nights.",
  },
  {
    id: "cleansers",
    categoryLabel: "Cleansers",
    readTime: "3 min read",
    title: "How to Pick a Face Wash Without Stripping Your Barrier",
    intro:
      "If your face feels tight and squeaky after washing, your cleanser is damaging your lipid barrier. Match your cleanser directly to your skin type, comedones, or post-steroid sensitivity:",
    takeawayTitle: "Key Takeaway: Lukewarm Water & 45–60 Seconds",
    takeawayBody:
      "Use lukewarm (not hot) water, massage gently for 45–60 seconds so active washes like Clarevo or MandelAC can lift sebum cleanly, and pat dry before applying moisturizer on slightly damp skin.",
  },
  {
    id: "shampoos-scalp",
    categoryLabel: "Shampoos & Scalp",
    readTime: "4 min read",
    title: "Solving Hard-Water Hair Fall, Dandruff & Frizz in Pakistan",
    intro:
      "Mineral-heavy borehole and tap water across Pakistan coats hair shafts in calcium buildup, leading to breakage, thinning, and scalp flakes. Separate your scalp treatment from your hair-shaft care:",
    takeawayTitle: "Key Takeaway: Keep Scalp & Hair-Length Care Separate",
    takeawayBody:
      "When dealing with dandruff or seborrheic flakes, skip scalp oiling completely and use lightweight targeted drops instead; reserve smoothing serums strictly for damp mid-lengths and ends.",
  },
];

const ALL_MONOGRAPH_SECTIONS: MonographSectionLabel[] = [
  "Cleansers & Face Washes",
  "Moisturizers & Barrier Repair",
  "Sunscreens",
  "Targeted Serums & Creams",
  "Hair & Scalp Treatments",
];

function MinimalBottleSvg({ kind }: { kind: BottleKind }) {
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
      {kind === "tube" && (
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
      {kind === "jar" && (
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
      {(kind === "wash" || kind === "shampoo") && (
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
  bottleKind: BottleKind;
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
  product: JenpharmProductMonograph;
}) {
  return (
    <article className="rounded-2xl border border-[#EAD8DC] bg-[#FAF6F7]/80 p-4 transition-colors duration-300 sm:p-5 dark:border-[#38282D] dark:bg-[#1B1316]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <ProductPhotoFrame
          imagePath={product.imagePath}
          productName={product.name}
          bottleKind={product.bottleKind}
        />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-full border border-[#EAD8DC] bg-white px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-[#B56576] transition-colors duration-300 dark:border-[#38282D] dark:bg-[#21181B] dark:text-[#D48395]">
                #{product.order} · {product.monographSection}
              </span>
            </div>
            <h4 className="font-editorial break-words text-xl font-semibold leading-snug text-[#1E181A] transition-colors duration-300 sm:text-2xl dark:text-[#F7EFEF]">
              {product.name}
            </h4>
          </div>

          <dl className="space-y-2.5 text-xs leading-relaxed">
            <div className="rounded-xl border border-[#EAD8DC]/70 bg-white/80 px-3 py-2.5 transition-colors duration-300 dark:border-[#38282D] dark:bg-[#21181B]/75">
              <dt className="mb-0.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8C3B4A] dark:text-[#F0B2C0]">
                <UserCheck className="h-3.5 w-3.5 shrink-0" />
                <span>{product.suitsWhomLabel}</span>
              </dt>
              <dd className="break-words text-[#42363A] dark:text-[#EADCE0]">
                {product.suitsWhom}
              </dd>
            </div>

            <div className="rounded-xl border border-[#EAD8DC]/70 bg-white/80 px-3 py-2.5 transition-colors duration-300 dark:border-[#38282D] dark:bg-[#21181B]/75">
              <dt className="mb-0.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8C3B4A] dark:text-[#F0B2C0]">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>Best For Which Condition</span>
              </dt>
              <dd className="break-words text-[#42363A] dark:text-[#EADCE0]">
                {product.bestFor}
              </dd>
            </div>

            <div className="rounded-xl border border-[#EAD8DC]/70 bg-white/80 px-3 py-2.5 transition-colors duration-300 dark:border-[#38282D] dark:bg-[#21181B]/75">
              <dt className="mb-0.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#B56576] dark:text-[#D48395]">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span>Key Perks &amp; How It Works</span>
              </dt>
              <dd className="break-words text-[#42363A] dark:text-[#EADCE0]">
                {product.keyPerks}
              </dd>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="rounded-xl border border-[#E5C9CE] bg-[#FDF4F6] px-3 py-2.5 transition-colors duration-300 dark:border-[#4D3038] dark:bg-[#26181D]">
                <dt className="mb-0.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#9E4558] dark:text-[#F0A8B8]">
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                  <span>Who Should Avoid</span>
                </dt>
                <dd className="break-words text-[#523B41] dark:text-[#DFC9CF]">
                  {product.whoShouldAvoid}
                </dd>
              </div>

              <div className="rounded-xl border border-[#E5D3C4] bg-[#FCF7F2] px-3 py-2.5 transition-colors duration-300 dark:border-[#4A3B30] dark:bg-[#241C17]">
                <dt className="mb-0.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8E5B32] dark:text-[#E5BD99]">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>Could Potentially Cause</span>
                </dt>
                <dd className="break-words text-[#524339] dark:text-[#DCCDC1]">
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
                className="inline-flex min-h-[38px] max-w-full items-center justify-center rounded-full bg-gradient-to-b from-[#BF6E7F] to-[#B56576] px-5 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_-6px_rgba(181,101,118,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#B56576] hover:to-[#9E5263] active:scale-95 dark:from-[#D48395] dark:to-[#D48395] dark:text-[#161012] dark:hover:from-[#B56576] dark:hover:to-[#B56576] dark:hover:text-[#F7EFEF]"
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
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialCategory);
      setSearchQuery("");
    }
  }, [isOpen, initialCategory]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!normalizedQuery) return [];
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    return JENPHARM_PRODUCTS_CATALOG.filter((product) => {
      const searchableText = [
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
  }, [normalizedQuery]);

  const activeArticle =
    SKINCARE_GUIDE_ARTICLES.find((a) => a.id === activeTab) ||
    SKINCARE_GUIDE_ARTICLES[0];

  const categoryProducts = useMemo(() => {
    if (activeTab === "all") return JENPHARM_PRODUCTS_CATALOG;
    return JENPHARM_PRODUCTS_CATALOG.filter(
      (product) => product.guideCategory === activeTab
    );
  }, [activeTab]);

  if (!isOpen) return null;

  const isSearching = normalizedQuery.length > 0;
  const creamsMoisturizers = categoryProducts.filter(
    (p) => p.monographSection === "Moisturizers & Barrier Repair"
  );
  const creamsTargetedSerums = categoryProducts.filter(
    (p) => p.monographSection === "Targeted Serums & Creams"
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="skincare-guides-hub-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#1E181A]/55 p-0 transition-colors duration-300 sm:items-center sm:p-4 dark:bg-black/70"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl border border-[#EAD8DC] bg-white shadow-2xl transition-colors duration-300 sm:rounded-3xl dark:border-[#38282D] dark:bg-[#21181B]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drawer Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#EAD8DC] bg-[#FDFBFC] px-5 py-4 transition-colors duration-300 sm:px-8 sm:py-5 dark:border-[#38282D] dark:bg-[#1B1316]">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 shrink-0 text-[#B56576] dark:text-[#D48395]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B56576] dark:text-[#D48395]">
                {language === "ur"
                  ? "DerméScan Editorial Hub · 22 Verified Monographs"
                  : "DerméScan Dermatology Journal · All 22 Jenpharm Monographs"}
              </p>
            </div>
            <h2
              id="skincare-guides-hub-title"
              className="font-editorial text-2xl font-semibold text-[#1E181A] transition-colors duration-300 sm:text-3xl dark:text-[#F7EFEF]"
            >
              {language === "ur"
                ? "Pakistani Skin & Hair Product Encyclopedia"
                : "Pakistani Skin & Haircare Guides"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Skincare Guides"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#EAD8DC] bg-white text-[#5E5055] transition-colors duration-300 hover:border-[#B56576] hover:text-[#B56576] active:scale-95 dark:border-[#38282D] dark:bg-[#21181B] dark:text-[#C9B6BC] dark:hover:border-[#D48395] dark:hover:text-[#D48395]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Bar + Category Tabs */}
        <div className="space-y-3 border-b border-[#EAD8DC] bg-[#FAF6F7] px-5 py-3.5 transition-colors duration-300 sm:px-8 dark:border-[#38282D] dark:bg-[#161012]">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#B56576] dark:text-[#D48395]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search all 22 Jenpharm products, conditions, ingredients, or skin types"
              placeholder={
                language === "ur"
                  ? "Search karein: melasma, oily skin, dandruff, SPF, retinol, MandelAC..."
                  : "Search all 22 products: melasma, oily skin, dandruff, SPF, retinol, post-steroid..."
              }
              className="w-full rounded-full border border-[#EAD8DC] bg-white py-2 pr-10 pl-10 text-xs text-[#1E181A] placeholder:text-[#7A686D] transition-colors duration-300 focus:border-[#B56576] focus:outline-none dark:border-[#38282D] dark:bg-[#21181B] dark:text-[#F7EFEF] dark:placeholder:text-[#9A848B] dark:focus:border-[#D48395]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-2.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[#7A686D] transition-colors hover:bg-[#F3E7EA] hover:text-[#1E181A] dark:text-[#C9B6BC] dark:hover:bg-[#2B1F24] dark:hover:text-[#F7EFEF]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
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
                  className={`min-h-[36px] shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors duration-300 active:scale-95 ${
                    isActive
                      ? "bg-[#B56576] text-white shadow-xs dark:bg-[#D48395] dark:text-[#161012] dark:hover:bg-[#B56576] dark:hover:text-[#F7EFEF]"
                      : "border border-[#EAD8DC] bg-white text-[#5E5055] hover:border-[#B56576] hover:text-[#B56576] dark:border-[#38282D] dark:bg-[#21181B] dark:text-[#C9B6BC] dark:hover:border-[#D48395] dark:hover:text-[#D48395]"
                  }`}
                >
                  {article.categoryLabel}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveTab("all");
              }}
              className={`min-h-[36px] shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors duration-300 active:scale-95 ${
                !isSearching && activeTab === "all"
                  ? "bg-[#B56576] text-white shadow-xs dark:bg-[#D48395] dark:text-[#161012] dark:hover:bg-[#B56576] dark:hover:text-[#F7EFEF]"
                  : "border border-[#EAD8DC] bg-white text-[#5E5055] hover:border-[#B56576] hover:text-[#B56576] dark:border-[#38282D] dark:bg-[#21181B] dark:text-[#C9B6BC] dark:hover:border-[#D48395] dark:hover:text-[#D48395]"
              }`}
            >
              All 22 Products
            </button>
          </div>
        </div>

        {/* Readable Magazine Article / Monograph Body */}
        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-2xl space-y-6">
            {isSearching ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAD8DC] pb-4 dark:border-[#38282D]">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#B56576] dark:text-[#D48395]">
                      Live Monograph Search
                    </p>
                    <h3 className="font-editorial text-2xl font-semibold text-[#1E181A] dark:text-[#F7EFEF]">
                      Showing {searchResults.length} of{" "}
                      {JENPHARM_PRODUCTS_CATALOG.length} products
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="rounded-full border border-[#EAD8DC] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#5E5055] transition-colors hover:border-[#B56576] hover:text-[#B56576] dark:border-[#38282D] dark:bg-[#21181B] dark:text-[#C9B6BC] dark:hover:border-[#D48395] dark:hover:text-[#D48395]"
                  >
                    Clear Search
                  </button>
                </div>

                {searchResults.length > 0 ? (
                  <div className="space-y-4">
                    {searchResults.map((product) => (
                      <ProductMonographCard
                        key={product.affiliateId}
                        product={product}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#EAD8DC] bg-[#FAF6F7] p-6 text-center dark:border-[#38282D] dark:bg-[#1B1316]">
                    <Info className="mx-auto mb-2 h-6 w-6 text-[#B56576] dark:text-[#D48395]" />
                    <p className="font-editorial text-xl font-semibold text-[#1E181A] dark:text-[#F7EFEF]">
                      No matching Jenpharm monograph found
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#5E5055] dark:text-[#C9B6BC]">
                      Try searching for a skin concern like &ldquo;melasma&rdquo;,
                      &ldquo;acne&rdquo;, &ldquo;dandruff&rdquo;, &ldquo;retinol&rdquo;,
                      or &ldquo;oil-free&rdquo;.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mt-4 inline-flex min-h-[36px] items-center justify-center rounded-full bg-[#B56576] px-5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#9E5263] dark:bg-[#D48395] dark:text-[#161012]"
                    >
                      View All Categories
                    </button>
                  </div>
                )}
              </div>
            ) : activeTab === "all" ? (
              <div className="space-y-7">
                <header className="space-y-2 border-b border-[#EAD8DC] pb-5 dark:border-[#38282D]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#EAD8DC] bg-[#F6ECEF] px-3 py-0.5 text-[11px] font-semibold text-[#8C3B4A] dark:border-[#59353F] dark:bg-[#2B1F24] dark:text-[#F0B2C0]">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>8 min full index</span>
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B56576] dark:text-[#D48395]">
                      Complete Clinical Encyclopedia (1–22)
                    </span>
                  </div>
                  <h3 className="font-editorial text-2xl font-semibold leading-snug text-[#1E181A] sm:text-3xl dark:text-[#F7EFEF]">
                    All 22 Verified Jenpharm Clinical Monographs
                  </h3>
                  <p className="text-sm leading-relaxed text-[#5E5055] dark:text-[#C9B6BC]">
                    Browse every cleanser, moisturizer, sunscreen, targeted serum,
                    and scalp treatment with skin-type suitability, active perks,
                    contraindications, and potential side effects.
                  </p>
                </header>

                {ALL_MONOGRAPH_SECTIONS.map((sectionLabel, idx) => {
                  const sectionItems = JENPHARM_PRODUCTS_CATALOG.filter(
                    (item) => item.monographSection === sectionLabel
                  );
                  return (
                    <section key={sectionLabel} className="space-y-4">
                      <h4 className="border-b border-[#EAD8DC] pb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#B56576] dark:border-[#38282D] dark:text-[#D48395]">
                        {idx + 1}. {sectionLabel} ({sectionItems.length})
                      </h4>
                      <div className="space-y-4">
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
              <>
                <header className="space-y-3 border-b border-[#EAD8DC] pb-5 transition-colors duration-300 dark:border-[#38282D]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#EAD8DC] bg-[#F6ECEF] px-3 py-0.5 text-[11px] font-semibold text-[#8C3B4A] transition-colors duration-300 dark:border-[#59353F] dark:bg-[#2B1F24] dark:text-[#F0B2C0]">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>{activeArticle.readTime}</span>
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B56576] dark:text-[#D48395]">
                      {activeArticle.categoryLabel} · {categoryProducts.length}{" "}
                      Monographs
                    </span>
                  </div>

                  <h3 className="font-editorial text-2xl font-semibold leading-snug text-[#1E181A] transition-colors duration-300 sm:text-3xl dark:text-[#F7EFEF]">
                    {activeArticle.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-[#5E5055] transition-colors duration-300 dark:text-[#C9B6BC]">
                    {activeArticle.intro}
                  </p>
                </header>

                {activeTab === "creams-serums" ? (
                  <div className="space-y-6">
                    <section className="space-y-4">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#B56576] dark:text-[#D48395]">
                        Moisturizers &amp; Barrier Repair ({creamsMoisturizers.length})
                      </p>
                      <div className="space-y-4">
                        {creamsMoisturizers.map((product) => (
                          <ProductMonographCard
                            key={product.affiliateId}
                            product={product}
                          />
                        ))}
                      </div>
                    </section>

                    <section className="space-y-4 pt-2">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#B56576] dark:text-[#D48395]">
                        Targeted Serums &amp; Creams ({creamsTargetedSerums.length})
                      </p>
                      <div className="space-y-4">
                        {creamsTargetedSerums.map((product) => (
                          <ProductMonographCard
                            key={product.affiliateId}
                            product={product}
                          />
                        ))}
                      </div>
                    </section>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {categoryProducts.map((product) => (
                      <ProductMonographCard
                        key={product.affiliateId}
                        product={product}
                      />
                    ))}
                  </div>
                )}

                {/* Editorial Takeaway Callout Box */}
                <aside className="rounded-2xl border border-[#EAD8DC] bg-[#FAF6F7] p-5 transition-colors duration-300 dark:border-[#38282D] dark:bg-[#1B1316]">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#B56576] dark:text-[#D48395]" />
                    <div className="space-y-1">
                      <p className="font-editorial text-lg font-semibold text-[#1E181A] dark:text-[#F7EFEF]">
                        {activeArticle.takeawayTitle}
                      </p>
                      <p className="text-xs leading-relaxed text-[#5E5055] dark:text-[#C9B6BC]">
                        {activeArticle.takeawayBody}
                      </p>
                    </div>
                  </div>
                </aside>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
