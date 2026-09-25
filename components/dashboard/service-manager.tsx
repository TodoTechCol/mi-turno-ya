"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Power } from "lucide-react";
import type { Service } from "@/types/app.types";
import { formatCurrency, formatDuration } from "@/lib/utils";
import ServiceForm from "./service-form";

interface Props {
  services: Service[];
}

export default function ServiceManager({ services }: Props) {
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
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo servicio
        </button>
      </div>

      {showForm && (
        <div className="mb-4">
          <ServiceForm service={editing} onSaved={handleSaved} onCancel={closeForm} />
        </div>
      )}

      {services.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-12">No hay servicios cargados todavía.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.id}
              className={`bg-white rounded-xl border border-gray-100 p-4 shadow-sm ${
                service.is_active ? "" : "opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{service.name}</p>
                  {service.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{service.description}</p>
                  )}
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                    service.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {service.is_active ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="flex gap-3 mt-2 text-xs text-gray-500">
                <span>{formatDuration(service.duration_minutes)}</span>
                <span className="font-medium text-cyan-600">{formatCurrency(service.price)}</span>
              </div>
              <div className="flex gap-1.5 mt-3">
                <button
                  onClick={() => openEdit(service)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  Editar
                </button>
                <button
                  onClick={() => toggleActive(service)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
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
