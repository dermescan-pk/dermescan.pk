import { useRef, useState, type ChangeEvent } from "react";
import { Camera, Upload, X, CheckCircle2 } from "lucide-react";
import { compressImageFile } from "../utils/imageCompressor.ts";
import { LiveCameraModal } from "./LiveCameraModal.tsx";
import type { Language, UploadedImage } from "../types/dermascan.ts";

export interface AngleSlotConfig {
  slotId: string;
  slotLabel: string;
  hint?: string;
}

interface MultiAngleUploaderProps {
  slots: AngleSlotConfig[];
  imagesBySlot: Record<string, UploadedImage>;
  onImageAdded: (img: UploadedImage) => void;
  onImageRemoved: (slotId: string) => void;
  highlightSlots?: string[];
  language: Language;
}

function shouldUseLiveWebcamModal(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isInAppBrowser =
    /(Instagram|FBAN|FBAV|FB_IAB|TikTok|BytedanceWebview|musical_ly|Snapchat|Line\/|MicroMessenger)/i.test(
      ua
    );
  if (isInAppBrowser) return true;

  const isMobileDevice =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
      ua
    );
  const isIpadDesktopMode =
    /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;

  return !isMobileDevice && !isIpadDesktopMode;
}

export function MultiAngleUploader({
  slots,
  imagesBySlot,
  onImageAdded,
  onImageRemoved,
  highlightSlots = [],
  language,
}: MultiAngleUploaderProps) {
  const [compressingSlot, setCompressingSlot] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [webcamSlot, setWebcamSlot] = useState<AngleSlotConfig | null>(null);

  const cameraInputsRef = useRef<Record<string, HTMLInputElement | null>>({});
  const galleryInputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  async function handleFileSelect(
    slot: AngleSlotConfig,
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadError(null);
    setCompressingSlot(slot.slotId);
    try {
      const compressed = await compressImageFile(
        file,
        slot.slotId,
        slot.slotLabel
      );
      onImageAdded(compressed);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Could not process image."
      );
    } finally {
      setCompressingSlot(null);
    }
  }

  function handleCameraButtonClick(slot: AngleSlotConfig) {
    setUploadError(null);
    const hasGetUserMedia =
      typeof navigator !== "undefined" &&
      Boolean(navigator.mediaDevices?.getUserMedia);

    if (shouldUseLiveWebcamModal() && hasGetUserMedia) {
      setWebcamSlot(slot);
      return;
    }

    // Trigger synchronously inside the user tap event for mobile Safari/Chrome security
    cameraInputsRef.current[slot.slotId]?.click();
  }

  return (
    <div className="min-w-0 space-y-3">
      {uploadError && (
        <div className="rounded-2xl border border-[#E8C5CA] bg-[#FDF4F5] px-4 py-3 text-xs font-medium text-[#8C3B4A]">
          {uploadError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {slots.map((slot) => {
          const uploaded = imagesBySlot[slot.slotId];
          const isCompressing = compressingSlot === slot.slotId;
          const needsRetake = highlightSlots.some(
            (s) => s.toLowerCase() === slot.slotLabel.toLowerCase()
          );

          return (
            <div
              key={slot.slotId}
              className={`relative flex min-w-0 flex-col justify-between overflow-x-hidden rounded-2xl border bg-[#F8F5F4]/55 p-4 transition-all ${
                needsRetake
                  ? "border-[#C96B78] ring-2 ring-[#E8C5CA]"
                  : uploaded
                    ? "border-[#B56576]/50 bg-white shadow-xs"
                    : "border-[#E6DCE0]"
              }`}
            >
              {/* Dedicated Mobile Rear Camera Input */}
              <input
                ref={(el) => {
                  cameraInputsRef.current[slot.slotId] = el;
                }}
                type="file"
                accept="image/*"
                capture="environment"
                tabIndex={-1}
                aria-hidden="true"
                className="sr-only"
                onChange={(e) => handleFileSelect(slot, e)}
              />
              {/* Standard Gallery / File Upload Input */}
              <input
                ref={(el) => {
                  galleryInputsRef.current[slot.slotId] = el;
                }}
                type="file"
                accept="image/*"
                tabIndex={-1}
                aria-hidden="true"
                className="sr-only"
                onChange={(e) => handleFileSelect(slot, e)}
              />

              <div className="mb-3 flex min-w-0 items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="break-words text-xs font-bold text-[#1E181A]">
                    {slot.slotLabel}
                  </p>
                  {slot.hint && (
                    <p className="mt-0.5 break-words text-[11px] text-[#5E5055]">
                      {slot.hint}
                    </p>
                  )}
                </div>

                {uploaded && (
                  <button
                    type="button"
                    aria-label={`Remove ${slot.slotLabel}`}
                    onClick={() => onImageRemoved(slot.slotId)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F6ECEF] text-[#B56576] transition-transform hover:bg-[#E6DCE0] active:scale-90"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {uploaded ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-[#E6DCE0] bg-white">
                  <img
                    src={uploaded.previewUrl}
                    alt={`Uploaded ${slot.slotLabel} photo preview for DerméScan analysis`}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-[#EFF7F2]/95 px-2.5 py-0.5 text-[10px] font-semibold tabular-nums text-[#2D6A4F] shadow-xs">
                    <CheckCircle2 className="h-3 w-3" />
                    {uploaded.compressedSizeKb} KB
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#D7C7CD] bg-white px-3 py-5 text-center">
                  {isCompressing ? (
                    <span className="text-xs font-semibold text-[#B56576]">
                      {language === "ur"
                        ? "Photo tayyar ho rahi hai..."
                        : "Getting photo ready..."}
                    </span>
                  ) : (
                    <div className="flex w-full gap-2">
                      <button
                        type="button"
                        onClick={() => handleCameraButtonClick(slot)}
                        className="flex min-h-[42px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#B56576] px-3 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#9E5263] active:scale-95"
                      >
                        <Camera className="h-3.5 w-3.5 shrink-0" />
                        <span>Camera</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          galleryInputsRef.current[slot.slotId]?.click()
                        }
                        className="flex min-h-[42px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E6DCE0] bg-[#F8F5F4] px-3 py-2 text-xs font-semibold text-[#1E181A] transition-all hover:bg-[#F6ECEF] active:scale-95"
                      >
                        <Upload className="h-3.5 w-3.5 shrink-0 text-[#B56576]" />
                        <span>Gallery</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {needsRetake && (
                <p className="mt-2 rounded-xl bg-[#FDF4F5] px-2.5 py-1.5 text-[11px] font-semibold text-[#8C3B4A]">
                  {language === "ur"
                    ? "Is photo ko tez roshni mein dubara lein"
                    : "Please retake this photo in brighter, clearer light"}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {webcamSlot && (
        <LiveCameraModal
          isOpen={Boolean(webcamSlot)}
          slotId={webcamSlot.slotId}
          slotLabel={webcamSlot.slotLabel}
          language={language}
          onCapture={(img) => onImageAdded(img)}
          onFallbackToFilePicker={() => {
            const slotId = webcamSlot.slotId;
            galleryInputsRef.current[slotId]?.click();
          }}
          onClose={() => setWebcamSlot(null)}
        />
      )}
    </div>
  );
}
