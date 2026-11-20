import type { UploadedImage } from "../types/dermascan.ts";

const MAX_WIDTH = 768;
const JPEG_QUALITY = 0.72;

/**
 * Compresses an uploaded image client-side via HTML5 Canvas to max 768px width
 * and 0.72 JPEG quality so multi-angle uploads send almost instantly on mobile data.
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

  let targetWidth = img.naturalWidth || img.width;
  let targetHeight = img.naturalHeight || img.height;

  if (targetWidth > MAX_WIDTH) {
    const ratio = MAX_WIDTH / targetWidth;
    targetWidth = MAX_WIDTH;
    targetHeight = Math.round(targetHeight * ratio);
  }

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
    originalSizeKb,
    compressedSizeKb,
  };
}
