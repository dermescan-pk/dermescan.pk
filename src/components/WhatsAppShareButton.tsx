import { useState } from "react";
import { MessageCircle, Copy, Check } from "lucide-react";
import type { Language } from "../types/dermascan.ts";

interface WhatsAppShareButtonProps {
  summaryText: string;
  language: Language;
}

export function WhatsAppShareButton({
  summaryText,
  language,
}: WhatsAppShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(summaryText)}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable in restricted contexts.
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl border border-[#C3DFCE] bg-[#EFF7F2] px-5 py-3 text-sm font-semibold text-[#2D6A4F] transition-all hover:bg-[#E1F0E7] active:scale-95"
      >
        <MessageCircle className="h-4 w-4 shrink-0" />
        <span>
          {language === "ur"
            ? "WhatsApp Par Share Karein"
            : "Share Summary on WhatsApp"}
        </span>
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-[#E6DCE0] bg-white px-5 py-3 text-sm font-semibold text-[#1E181A] transition-all hover:bg-[#F6ECEF] active:scale-95"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 shrink-0 text-[#2D6A4F]" />
            <span>{language === "ur" ? "Copy Ho Gaya" : "Copied"}</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 shrink-0 text-[#B56576]" />
            <span>{language === "ur" ? "Copy Text" : "Copy Text"}</span>
          </>
        )}
      </button>
    </div>
  );
}
