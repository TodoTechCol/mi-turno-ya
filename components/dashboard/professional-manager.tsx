"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Power, User, CalendarClock } from "lucide-react";
import type { Professional } from "@/types/app.types";
import ProfessionalForm from "./professional-form";

interface Props {
  professionals: Professional[];
}

export default function ProfessionalManager({ professionals }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Professional | null>(null);
  const router = useRouter();

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(professional: Professional) {
    setEditing(professional);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  function handleSaved() {
    closeForm();
    router.refresh();
  }

  async function toggleActive(professional: Professional) {
    try {
      const res = await fetch(`/api/professionals/${professional.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !professional.is_active }),
      });
      if (!res.ok) throw new Error();
      toast.success(professional.is_active ? "Profesional desactivado" : "Profesional activado");
      router.refresh();
    } catch {
      toast.error("No se pudo actualizar el profesional");
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo profesional
        </button>
      </div>

      {showForm && (
        <div className="mb-4">
          <ProfessionalForm professional={editing} onSaved={handleSaved} onCancel={closeForm} />
        </div>
      )}

      {professionals.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-12">
          No hay profesionales cargados todavía.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {professionals.map((professional) => (
            <div
              key={professional.id}
              className={`bg-white rounded-xl border border-gray-100 p-4 shadow-sm ${
                professional.is_active ? "" : "opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{professional.name}</p>
                    {professional.bio && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{professional.bio}</p>
                    )}
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                    professional.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {professional.is_active ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="flex gap-1.5 mt-3">
                <button
                  onClick={() => openEdit(professional)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  Editar
                </button>
                <button
                  onClick={() => toggleActive(professional)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Power className="w-3 h-3" />
                  {professional.is_active ? "Desactivar" : "Activar"}
                </button>
                <Link
                  href={`/dashboard/professionals/${professional.id}`}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-colors"
                >
                  <CalendarClock className="w-3 h-3" />
                  Servicios y horario
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
