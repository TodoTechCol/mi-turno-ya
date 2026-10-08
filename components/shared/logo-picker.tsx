"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Loader2, X } from "lucide-react";
import { validateLogoFile } from "@/lib/logo-validation";
import { squareCropAndResize } from "@/lib/image-resize";

interface Props {
  previewUrl: string | null;
  fallbackText: string;
  onSelect: (file: File) => void;
  onClear?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * Selector de logo reutilizado en el registro y en "Mi negocio". Valida
 * formato/tamaño y recorta a cuadrado del lado del cliente antes de
 * entregarle el archivo final al que lo use (no hace la subida en sí,
 * eso depende de cada contexto: en el registro se manda junto al resto
 * del formulario, en "Mi negocio" se sube apenas se elige).
 */
export default function LogoPicker({
  previewUrl,
  fallbackText,
  onSelect,
  onClear,
  loading,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const busy = processing || !!loading;

  async function handleFile(file: File) {
    const error = validateLogoFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    setProcessing(true);
    try {
      const resized = await squareCropAndResize(file);
      onSelect(resized);
    } catch {
      toast.error("No se pudo procesar la imagen");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20 shrink-0">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || busy}
          className="w-20 h-20 rounded-2xl overflow-hidden bg-lila-50 border border-pizarra-100 flex items-center justify-center hover:border-lila-300 transition-colors disabled:opacity-60"
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <span className="text-lila-600 font-semibold text-lg">{fallbackText}</span>
          )}
          {busy && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-lila-600 animate-spin" />
            </div>
          )}
        </button>
        {previewUrl && onClear && !busy && (
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-pizarra-900 text-white flex items-center justify-center hover:bg-pizarra-700"
            aria-label="Quitar logo"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || busy}
          className="flex items-center gap-1.5 text-sm font-medium text-lila-600 hover:text-lila-700 disabled:opacity-60"
        >
          <Camera className="w-4 h-4" />
          {previewUrl ? "Cambiar logo" : "Subir logo"}
        </button>
        <p className="text-xs text-pizarra-400 mt-0.5">PNG o JPG, máx. 2 MB. Opcional.</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
