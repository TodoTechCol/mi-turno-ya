"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Power, Trash2 } from "lucide-react";

interface Props {
  organizationId: string;
  isActive: boolean;
  organizationName: string;
}

export default function OrganizationActions({ organizationId, isActive, organizationName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  async function toggleActive() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/organizations/${organizationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      });
      if (!res.ok) throw new Error();
      toast.success(isActive ? "Organización desactivada" : "Organización activada");
      router.refresh();
    } catch {
      toast.error("No se pudo actualizar la organización");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (confirmText !== organizationName) {
      toast.error("El nombre no coincide");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/organizations/${organizationId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Organización eliminada");
      router.push("/super-admin");
      router.refresh();
    } catch {
      toast.error("No se pudo eliminar la organización");
      setLoading(false);
    }
  }

  if (confirmingDelete) {
    return (
      <div className="bg-status-danger/5 border border-status-danger/20 rounded-xl p-4 w-80">
        <p className="text-sm text-pizarra-700 mb-2">
          Esto borra <strong>todo</strong> lo de "{organizationName}" (turnos, profesionales, servicios) sin
          vuelta atrás. Escribí el nombre exacto para confirmar:
        </p>
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={organizationName}
          className="w-full px-3 py-2 border border-pizarra-200 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-status-danger/30"
        />
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={loading || confirmText !== organizationName}
            className="flex-1 py-2 bg-status-danger text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {loading ? "Eliminando..." : "Eliminar definitivamente"}
          </button>
          <button
            onClick={() => {
              setConfirmingDelete(false);
              setConfirmText("");
            }}
            className="px-3 py-2 text-sm text-pizarra-500 hover:text-pizarra-900"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 shrink-0">
      <button
        onClick={toggleActive}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-pizarra-50 text-pizarra-600 hover:bg-pizarra-100 transition-colors disabled:opacity-50"
      >
        <Power className="w-4 h-4" />
        {isActive ? "Desactivar" : "Activar"}
      </button>
      <button
        onClick={() => setConfirmingDelete(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-status-danger/10 text-status-danger hover:bg-status-danger/20 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Eliminar
      </button>
    </div>
  );
}
