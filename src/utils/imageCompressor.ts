import type { UploadedImage } from "../types/dermascan.ts";

export const MAX_IMAGE_DIMENSION_PX = 1024;
export const JPEG_COMPRESSION_QUALITY = 0.85;

function scaleDimensions(
  width: number,
  height: number,
  maxDimension: number
): { targetWidth: number; targetHeight: number } {
  let targetWidth = Math.max(1, width);
  let targetHeight = Math.max(1, height);

  if (targetWidth > maxDimension || targetHeight > maxDimension) {
    if (targetWidth >= targetHeight) {
      const ratio = maxDimension / targetWidth;
      targetWidth = maxDimension;
      targetHeight = Math.max(1, Math.round(targetHeight * ratio));
    } else {
      const ratio = maxDimension / targetHeight;
      targetHeight = maxDimension;
      targetWidth = Math.max(1, Math.round(targetWidth * ratio));
    }
  }

  return { targetWidth, targetHeight };
}

function drawAndCompressToJpegCanvas(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  slotId: string,
  slotLabel: string,
  originalSizeKb: number
): UploadedImage {
  const { targetWidth, targetHeight } = scaleDimensions(
    sourceWidth,
    sourceHeight,
    MAX_IMAGE_DIMENSION_PX
  );

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not prepare image processor on this browser.");
  }

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(source, 0, 0, targetWidth, targetHeight);

  const compressedDataUrl = canvas.toDataURL(
    "image/jpeg",
    JPEG_COMPRESSION_QUALITY
  );
  const base64 = compressedDataUrl.replace(/^data:image\/jpeg;base64,/, "");
  if (!base64) {
    throw new Error("Could not compress this photo. Please try another image.");
  }

  const compressedSizeKb = Math.max(
    1,
    Math.round((base64.length * 3) / 4 / 1024)
  );

  return {
    slotId,
    slotLabel,
    base64,
    mimeType: "image/jpeg",
    previewUrl: compressedDataUrl,
    originalSizeKb: Math.max(originalSizeKb, compressedSizeKb),
    compressedSizeKb,
  };
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const useObjectUrl = typeof URL !== "undefined" && typeof URL.createObjectURL === "function";

    if (useObjectUrl) {
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        // Fallback to FileReader if object URL decoding fails on this device
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result !== "string") {
            reject(
              new Error(
                "Could not read this photo. Please retake or pick a standard JPEG/PNG photo."
              )
            );
            return;
          }
          const fallbackImg = new Image();
          fallbackImg.onload = () => resolve(fallbackImg);
          fallbackImg.onerror = () =>
            reject(
              new Error(
                "Unsupported photo format. Please use a standard camera or gallery photo."
              )
            );
          fallbackImg.src = reader.result;
        };
        reader.onerror = () =>
          reject(new Error("Failed to read the selected photo."));
        reader.readAsDataURL(file);
      };
      image.src = objectUrl;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Could not read image file."));
        return;
      }
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () =>
        reject(
          new Error(
            "Unsupported photo format. Please use a standard camera or gallery photo."
          )
        );
      image.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Failed to read selected image."));
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses and resizes every image uploaded via Camera or Gallery via HTML5 Canvas
 * so the longest dimension is max 1024px (preserving aspect ratio) at 0.85 JPEG quality,
 * keeping fine visual details crisp while uploading rapidly on mobile connections.
 */
export async function compressImageFile(
  file: File,
  slotId: string,
  slotLabel: string
): Promise<UploadedImage> {
  const originalSizeKb = Math.max(1, Math.round(file.size / 1024));
  const img = await loadImageFromFile(file);

  const naturalWidth = img.naturalWidth || img.width;
  const naturalHeight = img.naturalHeight || img.height;

  return drawAndCompressToJpegCanvas(
    img,
    naturalWidth,
    naturalHeight,
    slotId,
    slotLabel,
    originalSizeKb
  );
}

/**
 * Compresses and resizes a live camera video frame via HTML5 Canvas to max 1024px
 * on the longest edge at 0.85 JPEG quality without horizontal/vertical flipping.
 */
export function compressVideoFrame(
  video: HTMLVideoElement,
  slotId: string,
  slotLabel: string
): UploadedImage {
  const rawWidth = Math.max(1, video.videoWidth || 1024);
  const rawHeight = Math.max(1, video.videoHeight || 768);
  const approxRawKb = Math.max(1, Math.round((rawWidth * rawHeight * 3) / 1024));

  return drawAndCompressToJpegCanvas(
    video,
    rawWidth,
    rawHeight,
    slotId,
    slotLabel,
    approxRawKb
  );
}
