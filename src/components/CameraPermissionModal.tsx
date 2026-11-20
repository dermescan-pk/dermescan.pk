import { useState } from "react";
import { Camera, ShieldCheck, AlertTriangle, X } from "lucide-react";
import { requestCameraMediaStream } from "./LiveCameraModal.tsx";
import type { Language } from "../types/dermascan.ts";

interface CameraPermissionModalProps {
  isOpen: boolean;
  isDeniedState: boolean;
  language: Language;
  onGranted: () => void;
  onDenied: () => void;
  onDismiss: () => void;
}

export function CameraPermissionModal({
  isOpen,
  isDeniedState,
  language,
  onGranted,
  onDenied,
  onDismiss,
}: CameraPermissionModalProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  if (!isOpen) return null;

  const isUr = language === "ur";
  const showDenied = isDeniedState || Boolean(errorDetail);

  function handleAllowCameraClick() {
    if (isRequesting) return;
    setErrorDetail(null);

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setErrorDetail(
        isUr
          ? "Is browser mein live camera API available nahi hai. Aap Gallery ya device picker se photo upload kar sakte hain."
          : "Live camera permission is unavailable in this browser view. You can still upload photos from Gallery or your phone camera."
      );
      return;
    }

    setIsRequesting(true);

    // Must be called synchronously inside the click/tap gesture for mobile Safari & Chrome
    requestCameraMediaStream("environment")
      .then((stream) => {
        for (const track of stream.getTracks()) {
          track.stop();
        }
        setIsRequesting(false);
        onGranted();
      })
      .catch((err) => {
        setIsRequesting(false);
        const name = err instanceof DOMException ? err.name : "";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setErrorDetail(
            isUr
              ? "Browser ne camera permission block ki hui hai. Address bar ke lock/settings icon mein Camera ko 'Allow' karein aur dobara try karein."
              : "Camera access was blocked in your browser. Tap the lock or settings icon in your browser bar, allow Camera, and tap Try Again."
          );
          onDenied();
          return;
        }
        setErrorDetail(
          isUr
            ? "Camera access start nahi ho saki. Aap 'Try Again' karein ya Gallery se photo upload karein."
            : "Could not access the camera right now. Tap Try Again or continue using Gallery photo upload."
        );
      });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-permission-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#1E181A]/55 p-4 backdrop-blur-xs sm:items-center"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-[#E6DCE0] bg-[#FAF6F7] shadow-[0_24px_60px_rgba(35,24,28,0.28)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#E6DCE0] bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F6ECEF] text-[#B56576]">
              {showDenied ? (
                <AlertTriangle className="h-5 w-5 text-[#8C3B4A]" />
              ) : (
                <Camera className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#B56576]">
                {isUr ? "Camera Ki Ijazat" : "Camera Permission"}
              </p>
              <h2
                id="camera-permission-modal-title"
                className="font-editorial text-xl font-semibold text-[#1E181A]"
              >
                {showDenied
                  ? isUr
                    ? "Camera Permission Allow Karein"
                    : "Enable Camera Access"
                  : isUr
                    ? "Photo Lene Ke Liye Camera Allow Karein"
                    : "Allow Camera to Take Photos"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close camera permission prompt"
            onClick={onDismiss}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E6DCE0] bg-[#FAF6F7] text-[#5E5055] transition-colors hover:bg-[#F6ECEF] hover:text-[#1E181A]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <p className="text-xs leading-relaxed text-[#5E5055]">
            {showDenied
              ? errorDetail ||
                (isUr
                  ? "Phone ya browser settings mein Camera permission 'Allow' karein taake aap skin, baal aur creams ki seedhi photo le sakein."
                  : "Camera permission is currently blocked. Enable Camera access in your browser site settings so you can capture clear skin, hair, and product photos.")
              : isUr
                ? "Skin, baal, cream ya product packaging ki saaf photos kheinchnay ke liye DerméScan ko aapke camera ki ijazat chahiye. Aapki photos kahin save ya share nahi hotin."
                : "DerméScan needs camera access so you can take clear photos of your skin, hair, creams, or packaging directly on your phone or laptop."}
          </p>

          <div className="flex items-start gap-2.5 rounded-2xl border border-[#E6DCE0] bg-white px-4 py-3 text-[11px] text-[#5E5055]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#2D6A4F]" />
            <span>
              {isUr
                ? "Privacy Mehfooz: Camera sirf tab on hota hai jab aap khud photo letay hain."
                : "Private by design: Your camera stays off until you tap Camera on a photo slot."}
            </span>
          </div>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row-reverse">
            <button
              type="button"
              disabled={isRequesting}
              onClick={handleAllowCameraClick}
              className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-full bg-[#B56576] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#9E5263] active:scale-95 disabled:opacity-60"
            >
              <Camera className="h-4 w-4 shrink-0" />
              <span>
                {isRequesting
                  ? isUr
                    ? "Permission Maangi Ja Rahi Hai..."
                    : "Requesting Permission..."
                  : showDenied
                    ? isUr
                      ? "Dobara Try Karein"
                      : "Try Again"
                    : isUr
                      ? "Camera Allow Karein"
                      : "Allow Camera"}
              </span>
            </button>

            <button
              type="button"
              onClick={onDismiss}
              className="flex min-h-[44px] items-center justify-center rounded-full border border-[#E6DCE0] bg-white px-5 py-2 text-xs font-semibold text-[#5E5055] transition-colors hover:bg-[#F6ECEF] hover:text-[#1E181A]"
            >
              {isUr ? "Baad Mein / Gallery Use Karein" : "Not Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
