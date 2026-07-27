import heic2any from "heic2any";

const MAX_DIMENSION = 1568;
const THUMBNAIL_DIMENSION = 400;
const JPEG_QUALITY = 0.85;

export const MAX_FILE_SIZE = 20 * 1024 * 1024;
export const MAX_PHOTOS = 5;

export interface ProcessedImage {
  base64: string;
  mediaType: "image/jpeg";
  fullBlob: Blob;
  thumbnailBlob: Blob;
}

export function isAcceptedFile(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
  const acceptedExts = ["jpg", "jpeg", "png", "webp", "heic", "heif"];
  return acceptedTypes.includes(file.type) || acceptedExts.includes(ext);
}

async function normalizeFile(file: File): Promise<File> {
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.(heic|heif)$/i.test(file.name);
  if (!isHeic) return file;

  const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: JPEG_QUALITY });
  const blob = Array.isArray(converted) ? converted[0] : converted;
  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
}

function drawToCanvas(bitmap: ImageBitmap, maxDim: number): HTMLCanvasElement {
  let { width, height } = bitmap;
  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(bitmap, 0, 0, width, height);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Не удалось обработать изображение"))),
      "image/jpeg",
      quality
    );
  });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function processImage(file: File): Promise<ProcessedImage> {
  const normalized = await normalizeFile(file);
  const bitmap = await createImageBitmap(normalized);

  const fullCanvas = drawToCanvas(bitmap, MAX_DIMENSION);
  const fullBlob = await canvasToBlob(fullCanvas, JPEG_QUALITY);
  const base64 = await blobToBase64(fullBlob);

  const thumbCanvas = drawToCanvas(bitmap, THUMBNAIL_DIMENSION);
  const thumbnailBlob = await canvasToBlob(thumbCanvas, JPEG_QUALITY);

  bitmap.close();

  return { base64, mediaType: "image/jpeg", fullBlob, thumbnailBlob };
}
