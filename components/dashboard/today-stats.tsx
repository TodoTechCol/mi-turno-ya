import { format } from "date-fns";
import { CalendarClock, CircleDot, CheckCircle2 } from "lucide-react";
import type { AppointmentWithDetails } from "@/types/app.types";

interface Props {
  appointments: AppointmentWithDetails[];
}

/**
 * Resumen rápido del día — calculado en el server a partir de los
 * turnos que la página "Hoy" ya trae (sin pegarle otra vez a la base).
 */
export default function TodayStats({ appointments }: Props) {
  const pending = appointments.filter((a) => a.status === "pending").length;
  const confirmed = appointments.filter((a) => a.status === "confirmed").length;

  const now = new Date();
  const next = appointments
    .filter((a) => new Date(a.start_datetime) >= now && (a.status === "pending" || a.status === "confirmed"))
    .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())[0];

  const stats = [
    { label: "Turnos hoy", value: appointments.length, icon: CalendarClock },
    { label: "Pendientes", value: pending, icon: CircleDot },
    { label: "Confirmados", value: confirmed, icon: CheckCircle2 },
  ];

  if (appointments.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label} className="bg-white rounded-xl border border-pizarra-100 p-3.5">
          <Icon className="w-4 h-4 text-lila-500 mb-1.5" />
          <p className="text-xl font-semibold text-pizarra-900">{value}</p>
          <p className="text-xs text-pizarra-400">{label}</p>
        </div>
      ))}
      {next && (
        <div className="col-span-3 bg-lila-50 rounded-xl border border-lila-100 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-lila-600 font-medium">Próximo turno</p>
            <p className="text-sm text-pizarra-900 font-medium">
              {next.client_name} · {next.service.name}
            </p>
          </div>
          <p className="text-lg font-semibold text-lila-600">{format(new Date(next.start_datetime), "HH:mm")}</p>
        </div>
      )}
    </div>
  );
}
