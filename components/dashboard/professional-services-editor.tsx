"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Service } from "@/types/app.types";

interface Props {
  professionalId: string;
  allServices: Service[];
  linkedServiceIds: string[];
}

export default function ProfessionalServicesEditor({
  professionalId,
  allServices,
  linkedServiceIds,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(linkedServiceIds));
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/professionals/${professionalId}/services`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_ids: [...selected] }),
      });
      if (!res.ok) throw new Error();
      toast.success("Servicios actualizados");
      router.refresh();
    } catch {
      toast.error("No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <h2 className="font-medium text-gray-900 text-sm mb-3">Servicios que realiza</h2>
      {allServices.length === 0 ? (
        <p className="text-sm text-gray-400">No hay servicios cargados todavía.</p>
      ) : (
        <div className="space-y-2">
          {allServices.map((service) => (
            <label key={service.id} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={selected.has(service.id)}
                onChange={() => toggle(service.id)}
                className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              {service.name}
              {!service.is_active && (
                <span className="text-xs text-gray-400">(inactivo)</span>
              )}
            </label>
          ))}
        </div>
      )}
      <button
        onClick={save}
        disabled={saving}
        className="mt-4 px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
      >
        {saving ? "Guardando..." : "Guardar"}
      </button>
    </div>
  );
}
