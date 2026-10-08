"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { professionalSchema, type ProfessionalFormValues } from "@/schemas/professional.schema";
import type { Professional, Branch } from "@/types/app.types";

interface Props {
  professional: Professional | null;
  branches: Branch[];
  onSaved: () => void;
  onCancel: () => void;
}

export default function ProfessionalForm({ professional, branches, onSaved, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfessionalFormValues>({
    resolver: zodResolver(professionalSchema),
    defaultValues: professional
      ? { name: professional.name, bio: professional.bio ?? "", branch_id: professional.branch_id }
      : { name: "", bio: "", branch_id: null },
  });

  async function onSubmit(data: ProfessionalFormValues) {
    try {
      const payload = { ...data, branch_id: data.branch_id || null };
      const res = await fetch(
        professional ? `/api/professionals/${professional.id}` : "/api/professionals",
        {
          method: professional ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error();
      toast.success(professional ? "Profesional actualizado" : "Profesional creado");
      onSaved();
    } catch {
      toast.error("No se pudo guardar el profesional");
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
          placeholder="Nombre y apellido"
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-pizarra-700 mb-1">
          Bio <span className="text-pizarra-400 text-xs">(opcional)</span>
        </label>
        <textarea
          {...register("bio")}
          rows={2}
          className="w-full px-3 py-2 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lila-500 focus:border-transparent resize-none"
          placeholder="Especialidad, experiencia..."
        />
      </div>

      {branches.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-pizarra-700 mb-1">
            Sede <span className="text-pizarra-400 text-xs">(opcional)</span>
          </label>
          <select
            {...register("branch_id")}
            className="w-full px-3 py-2 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lila-500 focus:border-transparent"
          >
            <option value="">Sin asignar</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
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
