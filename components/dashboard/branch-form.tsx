"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { branchSchema, type BranchFormValues } from "@/schemas/branch.schema";
import type { Branch } from "@/types/app.types";

interface Props {
  branch: Branch | null;
  onSaved: () => void;
  onCancel: () => void;
}

export default function BranchForm({ branch, onSaved, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: branch
      ? {
          name: branch.name,
          address: branch.address ?? "",
          phone: branch.phone ?? "",
          sector: branch.sector ?? "",
          opening_hours: branch.opening_hours ?? "",
        }
      : { name: "", address: "", phone: "", sector: "", opening_hours: "" },
  });

  async function onSubmit(data: BranchFormValues) {
    try {
      const res = await fetch(branch ? `/api/branches/${branch.id}` : "/api/branches", {
        method: branch ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success(branch ? "Sede actualizada" : "Sede creada");
      onSaved();
    } catch {
      toast.error("No se pudo guardar la sede");
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
          placeholder="Sede Centro"
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-pizarra-700 mb-1">
          Dirección <span className="text-pizarra-400 text-xs">(opcional)</span>
        </label>
        <input
          {...register("address")}
          className="w-full px-3 py-2 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lila-500 focus:border-transparent"
          placeholder="Av. Corrientes 1234"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-pizarra-700 mb-1">
            Teléfono <span className="text-pizarra-400 text-xs">(opcional)</span>
          </label>
          <input
            {...register("phone")}
            className="w-full px-3 py-2 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lila-500 focus:border-transparent"
            placeholder="+54 11 1234-5678"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-pizarra-700 mb-1">
            Sector / zona <span className="text-pizarra-400 text-xs">(opcional)</span>
          </label>
          <input
            {...register("sector")}
            className="w-full px-3 py-2 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lila-500 focus:border-transparent"
            placeholder="Centro, Norte..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-pizarra-700 mb-1">
          Horario de atención <span className="text-pizarra-400 text-xs">(opcional, informativo)</span>
        </label>
        <input
          {...register("opening_hours")}
          className="w-full px-3 py-2 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lila-500 focus:border-transparent"
          placeholder="Lun a Sáb 9 a 20hs"
        />
      </div>

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
