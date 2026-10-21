"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Star, ExternalLink } from "lucide-react";

interface Props {
  initialUrl: string | null;
}

export default function GoogleReviewSettings({ initialUrl }: Props) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/organization/google-review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "No se pudo guardar el link");
      }
      toast.success(url.trim() ? "Link de reseñas guardado" : "Link de reseñas quitado");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar el link");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave}>
      <label className="block text-sm font-medium text-pizarra-700 mb-1">Link de reseñas de Google</label>
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://g.page/r/..."
          className="flex-1 px-3 py-2 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lila-500"
        />
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-lila-600 text-white text-sm font-medium rounded-lg hover:bg-lila-700 disabled:opacity-50 transition-colors shrink-0"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>

      <p className="text-xs text-pizarra-400 mt-3 leading-relaxed">
        <Star className="w-3.5 h-3.5 inline -mt-0.5 mr-0.5 text-lila-500" />
        Cuando marques un turno como <strong>Completado</strong>, si el cliente dejó su email, le va a llegar
        automáticamente un correo pidiéndole que deje su reseña aquí.
      </p>
      <p className="text-xs text-pizarra-400 mt-1.5">
        ¿Todavía no tienes este link? Necesitas un perfil de negocio en Google (gratis). Entra a{" "}
        <a
          href="https://business.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-lila-600 hover:underline inline-flex items-center gap-0.5"
        >
          business.google.com
          <ExternalLink className="w-3 h-3" />
        </a>{" "}
        , crea tu ficha (o reclama la que ya exista), y desde ahí busca la opción "Pedir reseñas" para copiar tu link.
      </p>
    </form>
  );
}
