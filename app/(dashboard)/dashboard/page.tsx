import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { getAppointmentsForDashboard } from "@/services/appointments.service";
import { getDashboardContext } from "@/lib/dashboard-context";
import AppointmentList from "@/components/dashboard/appointment-list";

export default async function DashboardPage() {
  const ctx = await getDashboardContext();

  if (!ctx) {
    return (
      <div className="text-center py-12 text-pizarra-400">
        <p>No tenés un negocio asociado a tu cuenta.</p>
        <p className="text-sm mt-1">Contactá al administrador.</p>
      </div>
    );
  }

  // "Hoy" según la zona horaria del negocio, no la del servidor.
  const today = formatInTimeZone(new Date(), ctx.timezone, "yyyy-MM-dd");
  const appointments = await getAppointmentsForDashboard(
    ctx.organizationId,
    ctx.timezone,
    today,
    ctx.professionalId ?? undefined
  );

  const todayFormatted = formatInTimeZone(new Date(), ctx.timezone, "EEEE d 'de' MMMM", {
    locale: es,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-pizarra-900">Hoy</h1>
        <p className="text-sm text-pizarra-400 capitalize">{todayFormatted}</p>
        {ctx.role === "professional" && (
          <p className="text-xs text-lila-600 font-medium mt-1">Mostrando tu agenda personal</p>
        )}
      </div>

      <AppointmentList
        appointments={appointments}
        organizationId={ctx.organizationId}
        emptyMessage="No hay turnos para hoy."
      />
    </div>
  );
}
