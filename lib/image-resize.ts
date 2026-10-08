"use client";

/**
 * Recorta al cuadrado central y reescala una imagen a lo sumo a
 * `maxSize` px de lado, devolviendo un File liviano listo para subir.
 * Mantiene el formato original (PNG conserva transparencia, JPG se
 * recomprime) — se usa tanto en el registro como en "Mi negocio".
 */
export async function squareCropAndResize(file: File, maxSize = 512): Promise<File> {
  const img = await loadImage(file);
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - side) / 2;
  const sy = (img.naturalHeight - side) / 2;
  const outSize = Math.min(maxSize, side);

  const canvas = document.createElement("canvas");
  canvas.width = outSize;
  canvas.height = outSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(img, sx, sy, side, side, 0, 0, outSize, outSize);
  URL.revokeObjectURL(img.src);

  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  const quality = type === "image/jpeg" ? 0.85 : undefined;

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, quality)
  );
  if (!blob) return file;

  return new File([blob], file.name, { type });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo leer la imagen"));
    img.src = URL.createObjectURL(file);
  });
}
