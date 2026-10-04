import Link from "next/link";
import { startOfWeek, addDays, addWeeks, subWeeks, format } from "date-fns";
import { es } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAppointmentsForDashboard, getAppointmentsForWeek } from "@/services/appointments.service";
import { getDashboardContext } from "@/lib/dashboard-context";
import AppointmentList from "@/components/dashboard/appointment-list";

interface Props {
  searchParams: Promise<{ week?: string }>;
}

export default async function AllAppointmentsPage({ searchParams }: Props) {
  const ctx = await getDashboardContext();
  const { week } = await searchParams;

  if (!ctx) {
    return (
      <div className="text-center py-12 text-pizarra-400">
        <p>No tenés un negocio asociado a tu cuenta.</p>
        <p className="text-sm mt-1">Contactá al administrador.</p>
      </div>
    );
  }

  const showAll = week === "all";

  // Lunes de la semana a mostrar: el de la URL, o el de "hoy" en la
  // zona horaria del negocio por defecto.
  const todayStr = formatInTimeZone(new Date(), ctx.timezone, "yyyy-MM-dd");
  const requestedMonday = week && week !== "all" ? new Date(`${week}T00:00:00`) : new Date(`${todayStr}T00:00:00`);
  const monday = startOfWeek(requestedMonday, { weekStartsOn: 1 });
  const mondayStr = format(monday, "yyyy-MM-dd");
  const sunday = addDays(monday, 6);

  const prevWeekStr = format(subWeeks(monday, 1), "yyyy-MM-dd");
  const nextWeekStr = format(addWeeks(monday, 1), "yyyy-MM-dd");

  const appointments = showAll
    ? await getAppointmentsForDashboard(ctx.organizationId, ctx.timezone, undefined, ctx.professionalId ?? undefined)
    : await getAppointmentsForWeek(ctx.organizationId, ctx.timezone, mondayStr, ctx.professionalId ?? undefined);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-pizarra-900">Todos los turnos</h1>
          <p className="text-sm text-pizarra-400">
            {showAll
              ? `${appointments.length} turno(s) en total`
              : `${format(monday, "d MMM", { locale: es })} – ${format(sunday, "d MMM yyyy", { locale: es })} · ${appointments.length} turno(s)`}
          </p>
          {ctx.role === "professional" && (
            <p className="text-xs text-lila-600 font-medium mt-1">Mostrando tu agenda personal</p>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {!showAll && (
            <>
              <Link
                href={`/dashboard/appointments?week=${prevWeekStr}`}
                className="p-1.5 rounded-lg border border-pizarra-200 text-pizarra-500 hover:bg-pizarra-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <Link
                href={`/dashboard/appointments?week=${nextWeekStr}`}
                className="p-1.5 rounded-lg border border-pizarra-200 text-pizarra-500 hover:bg-pizarra-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </>
          )}
          <Link
            href={showAll ? "/dashboard/appointments" : "/dashboard/appointments?week=all"}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showAll
                ? "bg-lila-50 text-lila-600 border-lila-200"
                : "border-pizarra-200 text-pizarra-500 hover:bg-pizarra-50"
            }`}
          >
            {showAll ? "Ver por semana" : "Ver todos"}
          </Link>
        </div>
      </div>

      <AppointmentList
        appointments={appointments}
        organizationId={ctx.organizationId}
        emptyMessage={showAll ? "No hay turnos registrados." : "No hay turnos esta semana."}
      />
    </div>
  );
}
