"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Power, MapPin } from "lucide-react";
import type { Service, Branch } from "@/types/app.types";
import { formatCurrency, formatDuration } from "@/lib/utils";
import ServiceForm from "./service-form";

interface Props {
  services: Service[];
  branches: Branch[];
}

export default function ServiceManager({ services, branches }: Props) {
  function branchNameFor(branchId: string | null) {
    return branches.find((b) => b.id === branchId)?.name ?? null;
  }
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const router = useRouter();

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
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

  async function toggleActive(service: Service) {
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !service.is_active }),
      });
      if (!res.ok) throw new Error();
      toast.success(service.is_active ? "Servicio desactivado" : "Servicio activado");
      router.refresh();
    } catch {
      toast.error("No se pudo actualizar el servicio");
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
          Nuevo servicio
        </button>
      </div>

      {showForm && (
        <div className="mb-4">
          <ServiceForm service={editing} branches={branches} onSaved={handleSaved} onCancel={closeForm} />
        </div>
      )}

      {services.length === 0 ? (
        <p className="text-center text-pizarra-400 text-sm py-12">No hay servicios cargados todavía.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.id}
              className={`bg-white rounded-xl border border-pizarra-100 p-4 shadow-sm ${
                service.is_active ? "" : "opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-pizarra-900 text-sm">{service.name}</p>
                  {service.description && (
                    <p className="text-xs text-pizarra-400 mt-0.5">{service.description}</p>
                  )}
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                    service.is_active ? "bg-status-success/10 text-status-success" : "bg-pizarra-100 text-pizarra-500"
                  }`}
                >
                  {service.is_active ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="flex gap-3 mt-2 text-xs text-pizarra-500">
                <span>{formatDuration(service.duration_minutes)}</span>
                <span className="font-medium text-lila-600">{formatCurrency(service.price)}</span>
              </div>
              {branches.length > 0 && (
                <p className="flex items-center gap-1 text-xs text-pizarra-400 mt-1">
                  <MapPin className="w-3 h-3" />
                  {branchNameFor(service.branch_id) ?? "Todas las sedes"}
                </p>
              )}
              <div className="flex gap-1.5 mt-3">
                <button
                  onClick={() => openEdit(service)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-pizarra-50 text-pizarra-600 hover:bg-pizarra-100 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  Editar
                </button>
                <button
                  onClick={() => toggleActive(service)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-pizarra-50 text-pizarra-600 hover:bg-pizarra-100 transition-colors"
                >
                  <Power className="w-3 h-3" />
                  {service.is_active ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
