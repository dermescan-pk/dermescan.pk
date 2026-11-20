import type { UploadedImage } from "../types/dermascan.ts";

const MAX_DIMENSION_PX = 1200;
const JPEG_QUALITY = 0.85;

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

function encodeCanvasToUploadedImage(
  canvas: HTMLCanvasElement,
  slotId: string,
  slotLabel: string,
  originalSizeKb: number
): UploadedImage {
  const compressedDataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  const base64 = compressedDataUrl.replace(/^data:image\/jpeg;base64,/, "");
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

/**
 * Resizes and compresses an uploaded or camera-captured image client-side via
 * HTML5 Canvas to max 1200px (longest edge) and 0.85 JPEG quality so scans
 * stay crisp while uploading fast even on 4G mobile data.
 */
export async function compressImageFile(
  file: File,
  slotId: string,
  slotLabel: string
): Promise<UploadedImage> {
  const originalSizeKb = Math.max(1, Math.round(file.size / 1024));

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read image file."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read selected image."));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("Unsupported or corrupted image format."));
    image.src = dataUrl;
  });

  const { targetWidth, targetHeight } = scaleDimensions(
    img.naturalWidth || img.width,
    img.naturalHeight || img.height,
    MAX_DIMENSION_PX
  );

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context unavailable.");
  }

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return encodeCanvasToUploadedImage(canvas, slotId, slotLabel, originalSizeKb);
}

/**
 * Captures the current live video frame, resizing to max 1200px (longest edge)
 * and compressing to 0.85 JPEG quality.
 */
export function compressVideoFrame(
  video: HTMLVideoElement,
  slotId: string,
  slotLabel: string
): UploadedImage {
  const rawWidth = video.videoWidth || 1280;
  const rawHeight = video.videoHeight || 720;

  const { targetWidth, targetHeight } = scaleDimensions(
    rawWidth,
    rawHeight,
    MAX_DIMENSION_PX
  );

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context unavailable.");
  }

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

  const approxRawKb = Math.max(1, Math.round((rawWidth * rawHeight * 3) / 1024));
  return encodeCanvasToUploadedImage(canvas, slotId, slotLabel, approxRawKb);
}
