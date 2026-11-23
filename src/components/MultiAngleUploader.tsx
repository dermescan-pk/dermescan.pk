import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Camera, X, CheckCircle2 } from "lucide-react";
import { compressImageFile } from "../utils/imageCompressor.ts";
import {
  LiveCameraModal,
  requestCameraMediaStream,
} from "./LiveCameraModal.tsx";
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

export function MultiAngleUploader({
  slots,
  imagesBySlot,
  onImageAdded,
  onImageRemoved,
  highlightSlots = [],
  language,
}: MultiAngleUploaderProps) {
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    slots[0]?.slotId || ""
  );
  const [compressingSlot, setCompressingSlot] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeCameraSession, setActiveCameraSession] = useState<{
    slot: AngleSlotConfig;
    streamPromise: Promise<MediaStream>;
  } | null>(null);

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const firstEmpty = slots.find((s) => !imagesBySlot[s.slotId]);
    if (!slots.some((s) => s.slotId === selectedSlotId)) {
      setSelectedSlotId(firstEmpty?.slotId || slots[0]?.slotId || "");
    } else if (imagesBySlot[selectedSlotId] && firstEmpty) {
      setSelectedSlotId(firstEmpty.slotId);
    }
  }, [slots, imagesBySlot, selectedSlotId]);

  const activeSlot =
    slots.find((s) => s.slotId === selectedSlotId) ||
    slots.find((s) => !imagesBySlot[s.slotId]) ||
    slots[0];

  const uploadedEntries = slots
    .map((slot) => ({
      slot,
      uploaded: imagesBySlot[slot.slotId],
      needsRetake: highlightSlots.some(
        (s) => s.toLowerCase() === slot.slotLabel.toLowerCase()
      ),
    }))
    .filter(
      (
        entry
      ): entry is {
        slot: AngleSlotConfig;
        uploaded: UploadedImage;
        needsRetake: boolean;
      } => Boolean(entry.uploaded)
    );

  async function processFileForSlot(slot: AngleSlotConfig, file: File) {
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
        err instanceof Error
          ? err.message
          : "Could not prepare this photo. Please try retaking or selecting another image."
      );
    } finally {
      setCompressingSlot(null);
    }
  }

  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !activeSlot) return;
    await processFileForSlot(activeSlot, file);
  }

  async function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/") || !activeSlot) return;
    await processFileForSlot(activeSlot, file);
  }

  function handleCameraButtonClick() {
    if (!activeSlot) return;
    setUploadError(null);

    if (
      typeof navigator !== "undefined" &&
      Boolean(navigator.mediaDevices?.getUserMedia)
    ) {
      const streamPromise = requestCameraMediaStream("environment");
      setActiveCameraSession({ slot: activeSlot, streamPromise });
      return;
    }

    cameraInputRef.current?.click();
  }

  const isUr = language === "ur";

  return (
    <div className="min-w-0 space-y-5">
      {uploadError && (
        <div className="rounded-2xl border border-[#E8C5CA] bg-[#FDF4F5] px-4 py-3 text-xs font-medium text-[#8C3B4A]">
          {uploadError}
        </div>
      )}

      {/* Hidden inputs for camera fallback & gallery upload */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={handleFileSelect}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={handleFileSelect}
      />

      {/* Quiet Angle / Slot Selector */}
      {slots.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          {slots.map((slot) => {
            const isSelected = activeSlot?.slotId === slot.slotId;
            const hasPhoto = Boolean(imagesBySlot[slot.slotId]);
            const needsRetake = highlightSlots.some(
              (s) => s.toLowerCase() === slot.slotLabel.toLowerCase()
            );

            return (
              <button
                key={slot.slotId}
                type="button"
                onClick={() => setSelectedSlotId(slot.slotId)}
                className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                  needsRetake
                    ? "bg-[#FDF4F5] text-[#8C3B4A] ring-1 ring-[#C96B78]"
                    : isSelected
                      ? "bg-[#B56576]/12 font-semibold text-[#B56576] dark:bg-[#D48395]/20 dark:text-[#D48395]"
                      : hasPhoto
                        ? "bg-[#EFF7F2] text-[#2D6A4F] dark:bg-[#172B23] dark:text-[#7BD4AC]"
                        : "bg-[#FAF6F7] text-[#5E5055] hover:bg-[#F3E7EA] dark:bg-[#171113] dark:text-[#C9B6BC]"
                }`}
              >
                {hasPhoto && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                <span>{slot.slotLabel}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Calm Architectural Photo Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-2xl border bg-[#FAF6F7] p-8 text-center transition-colors duration-200 dark:bg-[#171113] ${
          isDragging
            ? "border-[#B56576] bg-[#F6ECEF] dark:border-[#D48395]"
            : "border-[#E8D8DC] dark:border-[#34262B]"
        }`}
      >
        {compressingSlot ? (
          <p className="py-4 text-sm font-medium text-[#B56576] dark:text-[#D48395]">
            {isUr ? "Photo tayyar ho rahi hai..." : "Preparing your photo..."}
          </p>
        ) : (
          <div className="flex max-w-sm flex-col items-center space-y-4">
            {activeSlot && (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#1E181A] dark:text-[#F7EFEF]">
                  {activeSlot.slotLabel}
                </p>
                {activeSlot.hint && (
                  <p className="text-xs leading-relaxed text-[#7A686D] dark:text-[#C9B6BC]">
                    {activeSlot.hint}
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleCameraButtonClick}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#B56576] px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#9E5263] active:scale-95 dark:bg-[#D48395] dark:text-[#140F11] dark:hover:bg-[#B56576] dark:hover:text-[#F7EFEF]"
            >
              <Camera className="h-4 w-4 shrink-0" />
              <span>
                {isUr ? "Camera Se Photo Lein" : "Take or Upload Photo"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="text-xs font-medium text-[#5E5055] underline decoration-[#D2BFC6] underline-offset-4 transition-colors hover:text-[#B56576] dark:text-[#C9B6BC] dark:hover:text-[#D48395]"
            >
              {isUr ? "Ya gallery se choose karein" : "or choose from gallery"}
            </button>
          </div>
        )}
      </div>

      {/* Uploaded Previews Strip */}
      {uploadedEntries.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {uploadedEntries.map(({ slot, uploaded, needsRetake }) => (
            <div
              key={slot.slotId}
              className={`relative overflow-hidden rounded-2xl border bg-[#FAF6F7] p-3 dark:bg-[#171113] ${
                needsRetake
                  ? "border-[#C96B78] ring-1 ring-[#C96B78]"
                  : "border-[#E8D8DC] dark:border-[#34262B]"
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="truncate text-xs font-semibold text-[#1E181A] dark:text-[#F7EFEF]">
                  {slot.slotLabel}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${slot.slotLabel}`}
                  onClick={() => onImageRemoved(slot.slotId)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#5E5055] transition-colors hover:text-[#8C3B4A] dark:bg-[#1E1619] dark:text-[#C9B6BC]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="relative flex max-h-56 w-full items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-[#1E1619]">
                <img
                  src={uploaded.previewUrl}
                  alt={`Uploaded ${slot.slotLabel} photo preview for DerméScan analysis`}
                  referrerPolicy="no-referrer"
                  className="max-h-56 w-full object-contain"
                />
                <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-[#2D6A4F] dark:bg-[#1E1619]/95 dark:text-[#7BD4AC]">
                  {uploaded.compressedSizeKb} KB
                </span>
              </div>

              {needsRetake && (
                <p className="mt-2 text-xs font-medium text-[#8C3B4A]">
                  {isUr
                    ? "Is photo ko tez roshni mein dubara lein"
                    : "Please retake this photo in brighter, clearer light"}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {activeCameraSession && (
        <LiveCameraModal
          isOpen={Boolean(activeCameraSession)}
          slotId={activeCameraSession.slot.slotId}
          slotLabel={activeCameraSession.slot.slotLabel}
          language={language}
          initialStreamPromise={activeCameraSession.streamPromise}
          onCapture={(img) => onImageAdded(img)}
          onFallbackToDeviceCamera={() => {
            cameraInputRef.current?.click();
          }}
          onClose={() => setActiveCameraSession(null)}
        />
      )}
    </div>
  );
}
