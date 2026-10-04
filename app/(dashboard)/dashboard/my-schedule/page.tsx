import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarOff } from "lucide-react";
import { getDashboardContext } from "@/lib/dashboard-context";
import { getOwnWeekSchedule, getOwnUpcomingBlocks } from "@/services/schedules.service";

const DAY_LABELS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default async function MySchedulePage() {
  const ctx = await getDashboardContext();

  if (!ctx || ctx.role !== "professional" || !ctx.professionalId) {
    return (
      <div className="text-center py-12 text-pizarra-400">
        <p>Esta sección es solo para profesionales.</p>
      </div>
    );
  }

  const [schedules, blocks] = await Promise.all([
    getOwnWeekSchedule(ctx.professionalId),
    getOwnUpcomingBlocks(ctx.professionalId),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-pizarra-900">Mi horario</h1>
        <p className="text-sm text-pizarra-400">Tu disponibilidad configurada por el negocio.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white rounded-xl border border-pizarra-100 p-5">
          <h2 className="text-sm font-semibold text-pizarra-900 mb-3">Horario semanal</h2>
          <div className="space-y-2">
            {DAY_LABELS.map((label, day) => {
              const schedule = schedules.find((s) => s.day_of_week === day);
              const isActive = schedule?.is_active ?? false;
              return (
                <div
                  key={day}
                  className="flex items-center justify-between py-1.5 border-b border-pizarra-50 last:border-0"
                >
                  <span className="text-sm text-pizarra-700">{label}</span>
                  {isActive ? (
                    <span className="text-sm font-medium text-pizarra-900">
                      {schedule!.start_time.slice(0, 5)} – {schedule!.end_time.slice(0, 5)}
                    </span>
                  ) : (
                    <span className="text-sm text-pizarra-300">Sin turnos</span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-pizarra-400 mt-3">
            ¿Necesitás cambiar tu horario? Pedíselo al administrador del negocio.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-pizarra-100 p-5">
          <h2 className="text-sm font-semibold text-pizarra-900 mb-3">Próximos bloqueos</h2>
          {blocks.length === 0 ? (
            <div className="text-center py-8">
              <CalendarOff className="w-8 h-8 text-pizarra-200 mx-auto mb-2" />
              <p className="text-sm text-pizarra-400">No tenés bloqueos próximos cargados.</p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {blocks.map((block) => (
                <li key={block.id} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <p className="text-pizarra-900 font-medium">
                      {format(new Date(block.start_datetime), "EEEE d 'de' MMMM", { locale: es })}
                    </p>
                    <p className="text-pizarra-400 text-xs">
                      {format(new Date(block.start_datetime), "HH:mm")} –{" "}
                      {format(new Date(block.end_datetime), "HH:mm")}
                    </p>
                  </div>
                  {block.reason && (
                    <span className="text-xs text-pizarra-400 italic text-right">{block.reason}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
