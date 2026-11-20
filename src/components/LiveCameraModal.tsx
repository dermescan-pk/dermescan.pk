import { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, X, AlertTriangle, Upload } from "lucide-react";
import { compressVideoFrame } from "../utils/imageCompressor.ts";
import type { Language, UploadedImage } from "../types/dermascan.ts";

interface LiveCameraModalProps {
  isOpen: boolean;
  slotId: string;
  slotLabel: string;
  language: Language;
  onCapture: (img: UploadedImage) => void;
  onFallbackToFilePicker: () => void;
  onClose: () => void;
}

type CameraFacingMode = "environment" | "user";

function getFriendlyCameraError(err: unknown, language: Language): string {
  const name = err instanceof DOMException ? err.name : "";
  const isUr = language === "ur";

  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return isUr
      ? "Camera ki ijazat (permission) block hai. Browser settings mein Camera allow karein ya neeche se device file picker use karein."
      : "Camera permission was denied. Please allow camera access in your browser address bar, or choose a photo using your device picker below.";
  }

  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return isUr
      ? "Is device par koi camera nahi mila. Neeche se photo upload karein."
      : "No camera was found on this device. You can choose a photo using your device picker below.";
  }

  if (name === "NotReadableError" || name === "TrackStartError") {
    return isUr
      ? "Camera kisi doosri app mein use ho raha hai. Doosri apps band karein ya file picker se photo chunein."
      : "Your camera is busy in another app. Close the other app and try again, or choose a photo below.";
  }

  return isUr
    ? "Live camera start nahi ho saka. Aap dobara koshish karein ya device se photo chunein."
    : "Could not start the live camera preview. Please try again or pick a photo from your device.";
}

export function LiveCameraModal({
  isOpen,
  slotId,
  slotLabel,
  language,
  onCapture,
  onFallbackToFilePicker,
  onClose,
}: LiveCameraModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<CameraFacingMode>("environment");
  const [isStarting, setIsStarting] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [retryCounter, setRetryCounter] = useState(0);

  function stopActiveStream() {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  useEffect(() => {
    if (!isOpen) {
      stopActiveStream();
      return;
    }

    let cancelled = false;

    async function startCamera() {
      setIsStarting(true);
      setIsReady(false);
      setCameraError(null);
      stopActiveStream();

      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        setIsStarting(false);
        setCameraError(
          language === "ur"
            ? "Yeh browser live camera support nahi karta. Neeche se photo chunein."
            : "Live camera access is unavailable in this browser. Use the photo picker below instead."
        );
        return;
      }

      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode,
              width: { ideal: 1280 },
              height: { ideal: 960 },
            },
            audio: false,
          });
        } catch (constraintErr) {
          // Single-webcam laptops sometimes reject facingMode constraints; fall back to default camera unless permission was denied.
          if (
            constraintErr instanceof DOMException &&
            (constraintErr.name === "NotAllowedError" ||
              constraintErr.name === "PermissionDeniedError")
          ) {
            throw constraintErr;
          }
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        if (cancelled) {
          for (const track of stream.getTracks()) {
            track.stop();
          }
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setIsReady(true);
      } catch (err) {
        if (!cancelled) {
          setCameraError(getFriendlyCameraError(err, language));
        }
      } finally {
        if (!cancelled) {
          setIsStarting(false);
        }
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      stopActiveStream();
    };
  }, [isOpen, facingMode, retryCounter, language]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        stopActiveStream();
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleCaptureClick() {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    try {
      const captured = compressVideoFrame(video, slotId, slotLabel);
      stopActiveStream();
      onCapture(captured);
      onClose();
    } catch (err) {
      setCameraError(
        err instanceof Error
          ? err.message
          : "Could not capture photo from camera."
      );
    }
  }

  function handleFlipCamera() {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }

  function handleClose() {
    stopActiveStream();
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="live-camera-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E181A]/60 p-4 backdrop-blur-xs"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-[#E6DCE0] bg-[#FAF6F7] shadow-[0_24px_60px_rgba(35,24,28,0.28)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#E6DCE0] bg-white px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#B56576]">
              {language === "ur" ? "Live Camera" : "Live Camera Capture"}
            </p>
            <h3
              id="live-camera-modal-title"
              className="truncate font-editorial text-lg font-semibold text-[#1E181A]"
            >
              {slotLabel}
            </h3>
          </div>
          <button
            type="button"
            aria-label="Close camera"
            onClick={handleClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E6DCE0] bg-[#FAF6F7] text-[#5E5055] transition-colors hover:bg-[#F6ECEF] hover:text-[#1E181A]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Viewport */}
        <div className="space-y-4 p-5">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#E6DCE0] bg-[#1E181A]">
            {!cameraError && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
            )}

            {isStarting && !cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#1E181A]/85 px-4 text-center text-white">
                <Camera className="h-6 w-6 animate-pulse text-[#E8C5CA]" />
                <p className="text-xs font-medium">
                  {language === "ur"
                    ? "Camera shuru ho raha hai..."
                    : "Starting camera preview..."}
                </p>
              </div>
            )}

            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#FDF4F5] px-6 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E8C5CA] bg-white text-[#8C3B4A]">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <p className="max-w-sm text-xs font-medium leading-relaxed text-[#8C3B4A]">
                  {cameraError}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setRetryCounter((n) => n + 1)}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-[#E8C5CA] bg-white px-4 py-1.5 text-xs font-semibold text-[#8C3B4A] transition-colors hover:bg-[#F6ECEF]"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>{language === "ur" ? "Dubara Koshish" : "Try Again"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopActiveStream();
                      onClose();
                      onFallbackToFilePicker();
                    }}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full bg-[#B56576] px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#9E5263]"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>
                      {language === "ur"
                        ? "Device Se Photo Chunein"
                        : "Use Photo Picker"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={handleFlipCamera}
              disabled={isStarting || Boolean(cameraError)}
              className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-full border border-[#E6DCE0] bg-white px-4 py-2 text-xs font-semibold text-[#1E181A] transition-all hover:bg-[#F6ECEF] active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#B56576]" />
              <span>
                {facingMode === "environment" ? "Flip Camera" : "Rear Camera"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleCaptureClick}
              disabled={!isReady || isStarting || Boolean(cameraError)}
              className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-full bg-[#B56576] px-5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#9E5263] active:scale-95 disabled:opacity-50"
            >
              <Camera className="h-4 w-4 shrink-0" />
              <span>
                {language === "ur" ? "Photo Kheinchein" : "Capture Photo"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
