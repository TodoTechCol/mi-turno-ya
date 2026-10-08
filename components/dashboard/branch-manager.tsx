"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Power, MapPin, BarChart3 } from "lucide-react";
import type { Branch } from "@/types/app.types";
import BranchForm from "./branch-form";

interface Props {
  branches: Branch[];
}

export default function BranchManager({ branches }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const router = useRouter();

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(branch: Branch) {
    setEditing(branch);
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

  async function toggleActive(branch: Branch) {
    try {
      const res = await fetch(`/api/branches/${branch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !branch.is_active }),
      });
      if (!res.ok) throw new Error();
      toast.success(branch.is_active ? "Sede desactivada" : "Sede activada");
      router.refresh();
    } catch {
      toast.error("No se pudo actualizar la sede");
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-lila-600 text-white text-sm font-medium rounded-lg hover:bg-lila-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva sede
        </button>
      </div>

      {showForm && (
        <div className="mb-4">
          <BranchForm branch={editing} onSaved={handleSaved} onCancel={closeForm} />
        </div>
      )}

      {branches.length === 0 ? (
        <p className="text-center text-pizarra-400 text-sm py-12">
          Todavía no cargaste sedes. Si tu negocio tiene una sola ubicación, no hace falta — podés
          seguir usando profesionales y servicios exactamente igual que hasta ahora.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className={`bg-white rounded-xl border border-pizarra-100 p-4 shadow-sm ${
                branch.is_active ? "" : "opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-lila-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-lila-500" />
                  </div>
                  <div>
                    <p className="font-medium text-pizarra-900 text-sm">{branch.name}</p>
                    {branch.sector && <p className="text-xs text-pizarra-400 mt-0.5">{branch.sector}</p>}
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                    branch.is_active ? "bg-status-success/10 text-status-success" : "bg-pizarra-100 text-pizarra-500"
                  }`}
                >
                  {branch.is_active ? "Activa" : "Inactiva"}
                </span>
              </div>
              {(branch.address || branch.opening_hours) && (
                <div className="mt-2 text-xs text-pizarra-500 space-y-0.5">
                  {branch.address && <p>{branch.address}</p>}
                  {branch.opening_hours && <p>{branch.opening_hours}</p>}
                </div>
              )}
              <div className="flex gap-1.5 mt-3">
                <button
                  onClick={() => openEdit(branch)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-pizarra-50 text-pizarra-600 hover:bg-pizarra-100 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  Editar
                </button>
                <button
                  onClick={() => toggleActive(branch)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-pizarra-50 text-pizarra-600 hover:bg-pizarra-100 transition-colors"
                >
                  <Power className="w-3 h-3" />
                  {branch.is_active ? "Desactivar" : "Activar"}
                </button>
                <Link
                  href={`/dashboard/branches/${branch.id}`}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-lila-50 text-lila-700 hover:bg-lila-100 transition-colors"
                >
                  <BarChart3 className="w-3 h-3" />
                  Reporte
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
