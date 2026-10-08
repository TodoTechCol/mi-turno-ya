import { startOfWeek, addDays, addWeeks, subWeeks, addMonths, subMonths, format } from "date-fns";
import { es } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import {
  getAppointmentsForDashboard,
  getAppointmentsForWeek,
  getAppointmentsForMonth,
} from "@/services/appointments.service";
import { getAllBranchesForOrganization } from "@/services/branches.service";
import { getDashboardContext } from "@/lib/dashboard-context";
import AppointmentList from "@/components/dashboard/appointment-list";
import AppointmentsNav from "@/components/dashboard/appointments-nav";
import BranchFilter from "@/components/dashboard/branch-filter";

type View = "day" | "week" | "month" | "all";

interface Props {
  searchParams: Promise<{ view?: string; date?: string; branch?: string }>;
}

const VIEWS: View[] = ["day", "week", "month", "all"];

export default async function AllAppointmentsPage({ searchParams }: Props) {
  const ctx = await getDashboardContext();
  const params = await searchParams;

  if (!ctx) {
    return (
      <div className="text-center py-12 text-pizarra-400">
        <p>No tenés un negocio asociado a tu cuenta.</p>
        <p className="text-sm mt-1">Contactá al administrador.</p>
      </div>
    );
  }

  const view: View = VIEWS.includes(params.view as View) ? (params.view as View) : "week";
  const todayStr = formatInTimeZone(new Date(), ctx.timezone, "yyyy-MM-dd");
  const anchor = new Date(`${params.date || todayStr}T00:00:00`);
  const branchFilter = params.branch || "";
  const branchParam = branchFilter ? `&branch=${branchFilter}` : "";
  const branches = await getAllBranchesForOrganization(ctx.organizationId);

  let appointments;
  let heading: string;
  let prevHref: string | null = null;
  let nextHref: string | null = null;
  let emptyMessage = "No hay turnos.";

  const BASE = "/dashboard/appointments";

  if (view === "day") {
    const dateStr = format(anchor, "yyyy-MM-dd");
    appointments = await getAppointmentsForDashboard(ctx.organizationId, ctx.timezone, dateStr, ctx.professionalId ?? undefined);
    heading = format(anchor, "EEEE d 'de' MMMM yyyy", { locale: es });
    prevHref = `${BASE}?view=day&date=${format(addDays(anchor, -1), "yyyy-MM-dd")}${branchParam}`;
    nextHref = `${BASE}?view=day&date=${format(addDays(anchor, 1), "yyyy-MM-dd")}${branchParam}`;
    emptyMessage = "No hay turnos ese día.";
  } else if (view === "month") {
    appointments = await getAppointmentsForMonth(ctx.organizationId, ctx.timezone, format(anchor, "yyyy-MM-dd"), ctx.professionalId ?? undefined);
    heading = format(anchor, "MMMM yyyy", { locale: es });
    prevHref = `${BASE}?view=month&date=${format(subMonths(anchor, 1), "yyyy-MM-dd")}${branchParam}`;
    nextHref = `${BASE}?view=month&date=${format(addMonths(anchor, 1), "yyyy-MM-dd")}${branchParam}`;
    emptyMessage = "No hay turnos ese mes.";
  } else if (view === "all") {
    appointments = await getAppointmentsForDashboard(ctx.organizationId, ctx.timezone, undefined, ctx.professionalId ?? undefined);
    heading = "";
    emptyMessage = "No hay turnos registrados.";
  } else {
    const monday = startOfWeek(anchor, { weekStartsOn: 1 });
    const mondayStr = format(monday, "yyyy-MM-dd");
    const sunday = addDays(monday, 6);
    appointments = await getAppointmentsForWeek(ctx.organizationId, ctx.timezone, mondayStr, ctx.professionalId ?? undefined);
    heading = `${format(monday, "d MMM", { locale: es })} – ${format(sunday, "d MMM yyyy", { locale: es })}`;
    prevHref = `${BASE}?view=week&date=${format(subWeeks(monday, 1), "yyyy-MM-dd")}${branchParam}`;
    nextHref = `${BASE}?view=week&date=${format(addWeeks(monday, 1), "yyyy-MM-dd")}${branchParam}`;
    emptyMessage = "No hay turnos esta semana.";
  }

  if (branchFilter) {
    appointments = appointments.filter((a) => a.branch_id === branchFilter);
  }
  if (view === "all") {
    heading = `${appointments.length} turno(s) en total`;
  }

  const currentUrlNoBranch = `${BASE}?view=${view}${view !== "all" ? `&date=${format(anchor, "yyyy-MM-dd")}` : ""}`;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-pizarra-900 capitalize">
            {view === "all" ? "Todos los turnos" : heading}
          </h1>
          <p className="text-sm text-pizarra-400">
            {view === "all" ? "Sin filtro de fecha" : `${appointments.length} turno(s)`}
          </p>
          {ctx.role === "professional" && (
            <p className="text-xs text-lila-600 font-medium mt-1">Mostrando tu agenda personal</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <BranchFilter branches={branches} selectedId={branchFilter} baseUrl={currentUrlNoBranch} />
          <AppointmentsNav
            view={view}
            prevHref={prevHref}
            nextHref={nextHref}
            switchHrefs={{
              day: `${BASE}?view=day&date=${todayStr}${branchParam}`,
              week: `${BASE}?view=week&date=${todayStr}${branchParam}`,
              month: `${BASE}?view=month&date=${todayStr}${branchParam}`,
              all: `${BASE}?view=all${branchParam}`,
            }}
          />
        </div>
      </div>

      <AppointmentList
        appointments={appointments}
        organizationId={ctx.organizationId}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}
