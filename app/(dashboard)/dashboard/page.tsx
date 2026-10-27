import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { getAppointmentsForDashboard } from "@/services/appointments.service";
import { getAllProfessionalsForOrganization } from "@/services/professionals.service";
import { getAllServicesForOrganization } from "@/services/services.service";
import { getDashboardContext } from "@/lib/dashboard-context";
import AppointmentList from "@/components/dashboard/appointment-list";
import TodayStats from "@/components/dashboard/today-stats";
import NewAppointmentLauncher from "@/components/dashboard/new-appointment-launcher";

export default async function DashboardPage() {
  const ctx = await getDashboardContext();

  if (!ctx) {
    return (
      <div className="text-center py-12 text-pizarra-400">
        <p>No tienes un negocio asociado a tu cuenta.</p>
        <p className="text-sm mt-1">Contacta al administrador.</p>
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

  const [professionals, services] =
    ctx.role === "organization_admin"
      ? await Promise.all([
          getAllProfessionalsForOrganization(ctx.organizationId),
          getAllServicesForOrganization(ctx.organizationId),
        ])
      : [[], []];

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-pizarra-900">Hoy</h1>
          <p className="text-sm text-pizarra-400 capitalize">
            {todayFormatted} · {appointments.length} turno{appointments.length === 1 ? "" : "s"}
          </p>
          {ctx.role === "professional" && (
            <p className="text-xs text-lila-600 font-medium mt-1">Mostrando tu agenda personal</p>
          )}
        </div>

        {ctx.role === "organization_admin" && (
          <NewAppointmentLauncher
            organizationId={ctx.organizationId}
            professionals={professionals}
            services={services}
            timezone={ctx.timezone}
          />
        )}
      </div>

      <TodayStats appointments={appointments} />

      <AppointmentList
        appointments={appointments}
        organizationId={ctx.organizationId}
        timezone={ctx.timezone}
        emptyMessage="No hay turnos para hoy."
      />
    </div>
  );
}
