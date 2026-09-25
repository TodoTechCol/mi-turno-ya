import { getAppointmentsForDashboard } from "@/services/appointments.service";
import { getDashboardContext } from "@/lib/dashboard-context";
import AppointmentList from "@/components/dashboard/appointment-list";

export default async function AllAppointmentsPage() {
  const ctx = await getDashboardContext();

  if (!ctx) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No tenés un negocio asociado a tu cuenta.</p>
        <p className="text-sm mt-1">Contactá al administrador.</p>
      </div>
    );
  }

  // Sin filtro de fecha — trae todos los turnos (propios si es professional)
  const appointments = await getAppointmentsForDashboard(
    ctx.organizationId,
    ctx.timezone,
    undefined,
    ctx.professionalId ?? undefined
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Todos los turnos</h1>
        <p className="text-sm text-gray-400">{appointments.length} turno(s) en total</p>
        {ctx.role === "professional" && (
          <p className="text-xs text-cyan-600 font-medium mt-1">Mostrando tu agenda personal</p>
        )}
      </div>

      <AppointmentList
        appointments={appointments}
        organizationId={ctx.organizationId}
        emptyMessage="No hay turnos registrados."
      />
    </div>
  );
}
