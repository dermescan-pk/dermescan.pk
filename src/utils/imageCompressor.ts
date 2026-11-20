import type { UploadedImage } from "../types/dermascan.ts";

const DEFAULT_MAX_DIMENSION_PX = 1200;
const DEFAULT_JPEG_QUALITY = 0.85;
const CAMERA_RAW_PASS_THROUGH_MAX_BYTES = 5 * 1024 * 1024;
const CAMERA_JPEG_QUALITY = 1.0;

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
  originalSizeKb: number,
  quality: number
): UploadedImage {
  const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
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

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
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
}

export interface CompressImageOptions {
  preserveOriginalQuality?: boolean;
}

/**
 * Processes an uploaded or camera-captured image.
 * Camera captures preserve full resolution & original quality (never downscaled or flipped);
 * gallery uploads larger than 1200px are resized cleanly for fast mobile uploads.
 */
export async function compressImageFile(
  file: File,
  slotId: string,
  slotLabel: string,
  options: CompressImageOptions = {}
): Promise<UploadedImage> {
  const originalSizeKb = Math.max(1, Math.round(file.size / 1024));
  const dataUrl = await readFileAsDataUrl(file);

  const isWebNativeMime =
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/webp";

  if (
    options.preserveOriginalQuality &&
    isWebNativeMime &&
    file.size <= CAMERA_RAW_PASS_THROUGH_MAX_BYTES
  ) {
    const base64Match = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
    if (base64Match) {
      const mimeType = base64Match[1] || file.type || "image/jpeg";
      const base64 = base64Match[2] || "";
      return {
        slotId,
        slotLabel,
        base64,
        mimeType,
        previewUrl: dataUrl,
        originalSizeKb,
        compressedSizeKb: originalSizeKb,
      };
    }
  }

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("Unsupported or corrupted image format."));
    image.src = dataUrl;
  });

  const naturalWidth = img.naturalWidth || img.width;
  const naturalHeight = img.naturalHeight || img.height;

  const { targetWidth, targetHeight } = options.preserveOriginalQuality
    ? { targetWidth: naturalWidth, targetHeight: naturalHeight }
    : scaleDimensions(naturalWidth, naturalHeight, DEFAULT_MAX_DIMENSION_PX);

  const quality = options.preserveOriginalQuality
    ? CAMERA_JPEG_QUALITY
    : DEFAULT_JPEG_QUALITY;

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

  return encodeCanvasToUploadedImage(
    canvas,
    slotId,
    slotLabel,
    originalSizeKb,
    quality
  );
}

/**
 * Captures the live camera frame at its full native camera resolution and
 * maximum JPEG quality without downscaling, cropping, or horizontal flipping.
 */
export function compressVideoFrame(
  video: HTMLVideoElement,
  slotId: string,
  slotLabel: string
): UploadedImage {
  const rawWidth = Math.max(1, video.videoWidth || 1920);
  const rawHeight = Math.max(1, video.videoHeight || 1080);

  const canvas = document.createElement("canvas");
  canvas.width = rawWidth;
  canvas.height = rawHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context unavailable.");
  }

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, rawWidth, rawHeight);
  // Draw directly without any horizontal/vertical flip transform
  ctx.drawImage(video, 0, 0, rawWidth, rawHeight);

  const approxRawKb = Math.max(1, Math.round((rawWidth * rawHeight * 3) / 1024));
  return encodeCanvasToUploadedImage(
    canvas,
    slotId,
    slotLabel,
    approxRawKb,
    CAMERA_JPEG_QUALITY
  );
}
