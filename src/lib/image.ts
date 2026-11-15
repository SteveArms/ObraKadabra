import { isBlurry, toGray } from "./sharpness";

export function canvasOf(width: number, height: number): { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is not available");
  return { canvas, context };
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality = 0.9): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Unable to encode the image"))), type, quality);
  });
}

// Shrinks the long side to maxSide; images already small enough are returned untouched
export async function downscaleImage(file: Blob, maxSide: number, type?: string, quality?: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const ratio = maxSide / Math.max(bitmap.width, bitmap.height);
  if (ratio >= 1 && !type) {
    bitmap.close();
    return file;
  }
  const scale = Math.min(ratio, 1);
  const { canvas, context } = canvasOf(bitmap.width * scale, bitmap.height * scale);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvasToBlob(canvas, type ?? (file.type === "image/png" ? "image/png" : "image/jpeg"), quality);
}

// Measured on a 640 px copy: enough detail for line edges and quick on a phone
const SHARPNESS_SIDE = 640;

export async function looksBlurry(image: Blob): Promise<boolean> {
  const bitmap = await createImageBitmap(image);
  const scale = Math.min(1, SHARPNESS_SIDE / Math.max(bitmap.width, bitmap.height));
  const { canvas, context } = canvasOf(bitmap.width * scale, bitmap.height * scale);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return isBlurry(toGray(context.getImageData(0, 0, canvas.width, canvas.height).data), canvas.width, canvas.height);
}
