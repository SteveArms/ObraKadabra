import { canvasOf, canvasToBlob, downscaleImage } from "@/lib/image";
import type { Edits, Raster } from "./types";

// Long side of the image sent to the AI: sharp enough for wall lines, small enough for a fast upload
const MAX_SIDE = 2400;
const CONTRAST_FILTER = "grayscale(1) contrast(1.8)";

async function rasterOf(blob: Blob): Promise<Raster> {
  const bitmap = await createImageBitmap(blob);
  const raster = { blob, url: URL.createObjectURL(blob), width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return raster;
}

async function pdfFirstPage(file: Blob): Promise<Blob> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  const document = await task.promise;
  const page = await document.getPage(1);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: MAX_SIDE / Math.max(base.width, base.height) });
  const { canvas, context } = canvasOf(viewport.width, viewport.height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, canvasContext: context, viewport }).promise;
  await task.destroy();
  return canvasToBlob(canvas, "image/png");
}

// PDFs become their first page and large photos are reduced, so every later step works on one raster
export async function fileToRaster(file: File): Promise<Raster> {
  return rasterOf(file.type === "application/pdf" ? await pdfFirstPage(file) : await downscaleImage(file, MAX_SIDE));
}

// Applies rotation, then the crop (given in rotated pixels), then the contrast boost
export async function renderEdits(source: Raster, edits: Edits): Promise<Raster> {
  const bitmap = await createImageBitmap(source.blob);
  const turned = edits.rotation % 180 !== 0;
  const [fullWidth, fullHeight] = turned ? [bitmap.height, bitmap.width] : [bitmap.width, bitmap.height];
  const crop = edits.crop ?? { x: 0, y: 0, width: fullWidth, height: fullHeight };
  const { canvas, context } = canvasOf(crop.width, crop.height);
  context.filter = edits.contrast ? CONTRAST_FILTER : "none";
  context.translate(fullWidth / 2 - crop.x, fullHeight / 2 - crop.y);
  context.rotate((edits.rotation * Math.PI) / 180);
  context.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
  bitmap.close();
  return rasterOf(await canvasToBlob(canvas, source.blob.type || "image/png"));
}

export function rasterFileName(fileName: string, raster: Raster): string {
  const base = fileName.replace(/\.[^.]+$/, "");
  return `${base}.${raster.blob.type === "image/jpeg" ? "jpg" : "png"}`;
}
