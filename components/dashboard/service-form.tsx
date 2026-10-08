"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { serviceSchema, type ServiceFormValues } from "@/schemas/service.schema";
import type { Service, Branch } from "@/types/app.types";

interface Props {
  service: Service | null;
  branches: Branch[];
  onSaved: () => void;
  onCancel: () => void;
}

export default function ServiceForm({ service, branches, onSaved, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service
      ? {
          name: service.name,
          description: service.description ?? "",
          duration_minutes: service.duration_minutes,
          price: service.price,
          branch_id: service.branch_id,
        }
      : { name: "", description: "", duration_minutes: 30, price: 0, branch_id: null },
  });

  async function onSubmit(data: ServiceFormValues) {
    try {
      const payload = { ...data, branch_id: data.branch_id || null };
      const res = await fetch(service ? `/api/services/${service.id}` : "/api/services", {
        method: service ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success(service ? "Servicio actualizado" : "Servicio creado");
      onSaved();
    } catch {
      toast.error("No se pudo guardar el servicio");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-xl border border-pizarra-100 p-4 space-y-3"
    >
      <div>
        <label className="block text-sm font-medium text-pizarra-700 mb-1">Nombre</label>
        <input
          {...register("name")}
          className="w-full px-3 py-2 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lila-500 focus:border-transparent"
          placeholder="Corte de cabello"
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-pizarra-700 mb-1">
          Descripción <span className="text-pizarra-400 text-xs">(opcional)</span>
        </label>
        <textarea
          {...register("description")}
          rows={2}
          className="w-full px-3 py-2 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lila-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-pizarra-700 mb-1">Duración (min)</label>
          <input
            type="number"
            {...register("duration_minutes")}
            className="w-full px-3 py-2 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lila-500 focus:border-transparent"
          />
          {errors.duration_minutes && (
            <p className="text-xs text-red-500 mt-1">{errors.duration_minutes.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-pizarra-700 mb-1">Precio</label>
          <input
            type="number"
            step="0.01"
            {...register("price")}
            className="w-full px-3 py-2 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lila-500 focus:border-transparent"
          />
          {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
        </div>
      </div>

      {branches.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-pizarra-700 mb-1">Sede</label>
          <select
            {...register("branch_id")}
            className="w-full px-3 py-2 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lila-500 focus:border-transparent"
          >
            <option value="">Disponible en todas las sedes</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                Solo en {b.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-lila-600 text-white text-sm font-medium rounded-lg hover:bg-lila-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-pizarra-200 text-pizarra-600 text-sm font-medium rounded-lg hover:bg-pizarra-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
