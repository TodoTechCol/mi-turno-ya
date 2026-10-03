"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientFormSchema, type ClientFormValues } from "@/schemas/booking.schema";
import type { Service, Professional } from "@/types/app.types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency, formatDuration } from "@/lib/utils";

interface Props {
  service: Service | null;
  professional: Professional | null;
  date: Date | null;
  time: string | null;
  onSubmit: (data: ClientFormValues) => Promise<void>;
  submitting: boolean;
}

export default function ClientForm({
  service,
  professional,
  date,
  time,
  onSubmit,
  submitting,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
  });

  return (
    <div>
      {/* Resumen del turno */}
      {service && date && time && (
        <div className="bg-lila-50 rounded-xl p-4 mb-5 text-sm">
          <p className="font-semibold text-pizarra-900">{service.name}</p>
          <p className="text-pizarra-500 text-xs mt-0.5">
            {formatDuration(service.duration_minutes)} · {formatCurrency(service.price)}
          </p>
          {professional && (
            <p className="text-pizarra-500 text-xs">Con: {professional.name}</p>
          )}
          <p className="text-lila-700 font-medium mt-1 text-xs">
            {format(date, "EEEE d 'de' MMMM", { locale: es })} a las {time}
          </p>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-pizarra-700 mb-1">
            Nombre completo <span className="text-red-500">*</span>
          </label>
          <input
            {...register("client_name")}
            className="w-full px-3 py-2.5 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lila-500 focus:border-transparent"
            placeholder="Tu nombre"
          />
          {errors.client_name && (
            <p className="text-xs text-red-500 mt-1">{errors.client_name.message}</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-pizarra-700 mb-1">
            Teléfono <span className="text-red-500">*</span>
          </label>
          <input
            {...register("client_phone")}
            type="tel"
            className="w-full px-3 py-2.5 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lila-500 focus:border-transparent"
            placeholder="11 1234-5678"
          />
          {errors.client_phone && (
            <p className="text-xs text-red-500 mt-1">{errors.client_phone.message}</p>
          )}
        </div>

        {/* Email (opcional) */}
        <div>
          <label className="block text-sm font-medium text-pizarra-700 mb-1">
            Email <span className="text-pizarra-400 text-xs">(opcional)</span>
          </label>
          <input
            {...register("client_email")}
            type="email"
            className="w-full px-3 py-2.5 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lila-500 focus:border-transparent"
            placeholder="tu@email.com"
          />
          {errors.client_email && (
            <p className="text-xs text-red-500 mt-1">{errors.client_email.message}</p>
          )}
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-pizarra-700 mb-1">
            Notas <span className="text-pizarra-400 text-xs">(opcional)</span>
          </label>
          <textarea
            {...register("notes")}
            rows={2}
            className="w-full px-3 py-2.5 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lila-500 focus:border-transparent resize-none"
            placeholder="Alguna indicación para el profesional..."
          />
          {errors.notes && (
            <p className="text-xs text-red-500 mt-1">{errors.notes.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-lila-600 text-white text-sm font-semibold rounded-xl hover:bg-lila-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Confirmando..." : "Confirmar turno"}
        </button>
      </form>
    </div>
  );
}
