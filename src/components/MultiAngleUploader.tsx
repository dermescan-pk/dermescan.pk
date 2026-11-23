import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { Camera, CheckCircle2, Upload, X } from "lucide-react";
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
  const [compressingSlot, setCompressingSlot] = useState<string | null>(null);
  const [draggingSlotId, setDraggingSlotId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeCameraSession, setActiveCameraSession] = useState<{
    slot: AngleSlotConfig;
    streamPromise: Promise<MediaStream>;
  } | null>(null);

  const pendingFileSlotRef = useRef<AngleSlotConfig | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

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
    const targetSlot = pendingFileSlotRef.current || slots[0];
    pendingFileSlotRef.current = null;
    if (!file || !targetSlot) return;
    await processFileForSlot(targetSlot, file);
  }

  async function handleDropOnSlot(
    e: DragEvent<HTMLDivElement>,
    slot: AngleSlotConfig
  ) {
    e.preventDefault();
    setDraggingSlotId(null);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    await processFileForSlot(slot, file);
  }

  function handleCameraButtonClick(slot: AngleSlotConfig) {
    setUploadError(null);

    if (
      typeof navigator !== "undefined" &&
      Boolean(navigator.mediaDevices?.getUserMedia)
    ) {
      const streamPromise = requestCameraMediaStream("environment");
      setActiveCameraSession({ slot, streamPromise });
      return;
    }

    pendingFileSlotRef.current = slot;
    cameraInputRef.current?.click();
  }

  function handleUploadButtonClick(slot: AngleSlotConfig) {
    setUploadError(null);
    pendingFileSlotRef.current = slot;
    galleryInputRef.current?.click();
  }

  const isUr = language === "ur";

  return (
    <div className="min-w-0 space-y-4">
      {uploadError && (
        <div className="rounded-2xl border border-[#E8C5CA] bg-[#FDF4F5] px-4 py-3 text-xs font-medium text-[#8C3B4A]">
          {uploadError}
        </div>
      )}

      {/* Hidden inputs for device camera fallback & gallery upload */}
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

      {/* Side-by-Side Responsive Multi-Photo Upload Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {slots.map((slot) => {
          const uploaded = imagesBySlot[slot.slotId];
          const isCompressing = compressingSlot === slot.slotId;
          const isDragging = draggingSlotId === slot.slotId;
          const needsRetake = highlightSlots.some(
            (s) => s.toLowerCase() === slot.slotLabel.toLowerCase()
          );

          return (
            <div
              key={slot.slotId}
              onDragOver={(e) => {
                e.preventDefault();
                setDraggingSlotId(slot.slotId);
              }}
              onDragLeave={() => {
                setDraggingSlotId((prev) =>
                  prev === slot.slotId ? null : prev
                );
              }}
              onDrop={(e) => handleDropOnSlot(e, slot)}
              className={`flex flex-col justify-between rounded-2xl border p-4 transition-colors duration-200 ${
                needsRetake
                  ? "border-[#C96B78] bg-[#FDF4F5] ring-1 ring-[#C96B78] dark:bg-[#26181D]"
                  : isDragging
                    ? "border-[#B56576] bg-[#F6ECEF] dark:border-[#D48395] dark:bg-[#24191D]"
                    : "border-[#E8D8DC] bg-[#FAF6F7] dark:border-[#34262B] dark:bg-[#171113]"
              }`}
            >
              {/* Card Header */}
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    {uploaded && (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#2D6A4F] dark:text-[#7BD4AC]" />
                    )}
                    <p className="truncate text-xs font-semibold text-[#1E181A] dark:text-[#F7EFEF]">
                      {slot.slotLabel}
                    </p>
                  </div>
                  {slot.hint && !uploaded && (
                    <p className="text-[11px] leading-snug text-[#7A686D] dark:text-[#C9B6BC]">
                      {slot.hint}
                    </p>
                  )}
                </div>

                {uploaded && (
                  <button
                    type="button"
                    aria-label={`Remove ${slot.slotLabel}`}
                    onClick={() => onImageRemoved(slot.slotId)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E8D8DC] bg-white text-[#5E5055] transition-colors hover:border-[#C96B78] hover:text-[#8C3B4A] active:scale-95 dark:border-[#34262B] dark:bg-[#1E1619] dark:text-[#C9B6BC] dark:hover:text-[#F0A8B8]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Card Body: Uploaded Preview or Direct Dropzone Actions */}
              {uploaded ? (
                <div className="space-y-2">
                  <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-[#1E1619]">
                    <img
                      src={uploaded.previewUrl}
                      alt={`Uploaded ${slot.slotLabel} photo preview for DerméScan analysis`}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-contain"
                    />
                    <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-[#2D6A4F] dark:bg-[#1E1619]/95 dark:text-[#7BD4AC]">
                      {uploaded.compressedSizeKb} KB
                    </span>
                  </div>

                  {needsRetake && (
                    <p className="text-[11px] font-medium text-[#8C3B4A] dark:text-[#F0A8B8]">
                      {isUr
                        ? "Is photo ko tez roshni mein dubara lein"
                        : "Please retake this photo in brighter, clearer light"}
                    </p>
                  )}
                </div>
              ) : isCompressing ? (
                <div className="flex min-h-[124px] items-center justify-center rounded-xl border border-dashed border-[#E8D8DC] bg-white/70 px-3 text-center dark:border-[#34262B] dark:bg-[#1E1619]/60">
                  <p className="text-xs font-medium text-[#B56576] dark:text-[#D48395]">
                    {isUr
                      ? "Photo tayyar ho rahi hai..."
                      : "Preparing your photo..."}
                  </p>
                </div>
              ) : (
                <div className="flex min-h-[124px] flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-[#E2CED3] bg-white/80 p-3.5 text-center transition-colors dark:border-[#3A2B30] dark:bg-[#1E1619]/75">
                  <div className="flex w-full flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCameraButtonClick(slot)}
                      className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-full bg-[#B56576] px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-white transition-colors duration-200 hover:bg-[#9E5263] active:scale-95 dark:bg-[#D48395] dark:text-[#140F11] dark:hover:bg-[#B56576] dark:hover:text-[#F7EFEF]"
                    >
                      <Camera className="h-3.5 w-3.5 shrink-0" />
                      <span>{isUr ? "Camera" : "Take Photo"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUploadButtonClick(slot)}
                      className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-full border border-[#E8D8DC] bg-[#FAF6F7] px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-[#5E5055] transition-colors duration-200 hover:border-[#B56576] hover:text-[#B56576] active:scale-95 dark:border-[#34262B] dark:bg-[#171113] dark:text-[#C9B6BC] dark:hover:border-[#D48395] dark:hover:text-[#D48395]"
                    >
                      <Upload className="h-3.5 w-3.5 shrink-0" />
                      <span>{isUr ? "Upload" : "Upload"}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-[#7A686D] dark:text-[#C9B6BC]">
                    {isUr
                      ? "Ya photo yahan drop karein"
                      : "or drag & drop image"}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activeCameraSession && (
        <LiveCameraModal
          isOpen={Boolean(activeCameraSession)}
          slotId={activeCameraSession.slot.slotId}
          slotLabel={activeCameraSession.slot.slotLabel}
          language={language}
          initialStreamPromise={activeCameraSession.streamPromise}
          onCapture={(img) => onImageAdded(img)}
          onFallbackToDeviceCamera={() => {
            pendingFileSlotRef.current = activeCameraSession.slot;
            cameraInputRef.current?.click();
          }}
          onClose={() => setActiveCameraSession(null)}
        />
      )}
    </div>
  );
}
