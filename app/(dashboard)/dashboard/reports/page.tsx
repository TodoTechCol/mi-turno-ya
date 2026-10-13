import { addDays, addMonths, addWeeks, format, startOfWeek, subMonths, subWeeks } from "date-fns";
import { es } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { Wallet, CheckCircle2, XCircle, Receipt } from "lucide-react";
import { getDashboardContext } from "@/lib/dashboard-context";
import { getOrganizationReport } from "@/services/reports.service";
import { getAllBranchesForOrganization } from "@/services/branches.service";
import { getDayBoundsUTC, getWeekBoundsUTC, getMonthBoundsUTC } from "@/lib/timezone";
import { formatCurrency } from "@/lib/utils";
import StatTile from "@/components/dashboard/stat-tile";
import RevenueBarChart from "@/components/dashboard/revenue-bar-chart";
import StatusBreakdownChart from "@/components/dashboard/status-breakdown-chart";
import ReportsTable from "@/components/dashboard/reports-table";
import ReportsNav from "@/components/dashboard/reports-nav";
import BranchFilter from "@/components/dashboard/branch-filter";

type Range = "day" | "week" | "month" | "all";
const RANGES: Range[] = ["day", "week", "month", "all"];

interface Props {
  searchParams: Promise<{ range?: string; date?: string; branch?: string }>;
}

export default async function ReportsPage({ searchParams }: Props) {
  const ctx = await getDashboardContext();
  const params = await searchParams;

  if (!ctx) {
    return (
      <div className="text-center py-12 text-pizarra-400">
        <p>No tenés un negocio asociado a tu cuenta.</p>
      </div>
    );
  }

  const range: Range = RANGES.includes(params.range as Range) ? (params.range as Range) : "month";
  const todayStr = formatInTimeZone(new Date(), ctx.timezone, "yyyy-MM-dd");
  const anchor = new Date(`${params.date || todayStr}T00:00:00`);
  const branchFilter = params.branch || "";
  const branchParam = branchFilter ? `&branch=${branchFilter}` : "";
  const BASE = "/dashboard/reports";

  let bounds: { start: string; end: string };
  let heading: string;
  let prevHref: string | null = null;
  let nextHref: string | null = null;

  if (range === "day") {
    const dateStr = format(anchor, "yyyy-MM-dd");
    bounds = getDayBoundsUTC(dateStr, ctx.timezone);
    heading = format(anchor, "EEEE d 'de' MMMM yyyy", { locale: es });
    prevHref = `${BASE}?range=day&date=${format(addDays(anchor, -1), "yyyy-MM-dd")}${branchParam}`;
    nextHref = `${BASE}?range=day&date=${format(addDays(anchor, 1), "yyyy-MM-dd")}${branchParam}`;
  } else if (range === "month") {
    bounds = getMonthBoundsUTC(format(anchor, "yyyy-MM-dd"), ctx.timezone);
    heading = format(anchor, "MMMM yyyy", { locale: es });
    prevHref = `${BASE}?range=month&date=${format(subMonths(anchor, 1), "yyyy-MM-dd")}${branchParam}`;
    nextHref = `${BASE}?range=month&date=${format(addMonths(anchor, 1), "yyyy-MM-dd")}${branchParam}`;
  } else if (range === "all") {
    // Sin límite inferior real: alcanza con una fecha muy vieja, ningún
    // negocio en esta plataforma tiene turnos de antes de 2020.
    bounds = { start: "2020-01-01T00:00:00.000Z", end: new Date().toISOString() };
    heading = "Historial completo";
  } else {
    const monday = startOfWeek(anchor, { weekStartsOn: 1 });
    const mondayStr = format(monday, "yyyy-MM-dd");
    const sunday = addDays(monday, 6);
    bounds = getWeekBoundsUTC(mondayStr, ctx.timezone);
    heading = `${format(monday, "d MMM", { locale: es })} – ${format(sunday, "d MMM yyyy", { locale: es })}`;
    prevHref = `${BASE}?range=week&date=${format(subWeeks(monday, 1), "yyyy-MM-dd")}${branchParam}`;
    nextHref = `${BASE}?range=week&date=${format(addWeeks(monday, 1), "yyyy-MM-dd")}${branchParam}`;
  }

  const branches = ctx.role === "organization_admin" ? await getAllBranchesForOrganization(ctx.organizationId) : [];

  const report = await getOrganizationReport(
    ctx.organizationId,
    bounds,
    branchFilter || undefined,
    ctx.role === "professional" ? ctx.professionalId ?? undefined : undefined
  );

  const currentUrlNoBranch = `${BASE}?range=${range}${range !== "all" ? `&date=${format(anchor, "yyyy-MM-dd")}` : ""}`;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-pizarra-900 capitalize">
            {range === "all" ? "Reportes" : heading}
          </h1>
          <p className="text-sm text-pizarra-400">
            {ctx.role === "professional" ? "Tus ingresos y turnos" : "Ingresos y turnos del negocio"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {ctx.role === "organization_admin" && (
            <BranchFilter branches={branches} selectedId={branchFilter} baseUrl={currentUrlNoBranch} />
          )}
          <ReportsNav
            range={range}
            prevHref={prevHref}
            nextHref={nextHref}
            switchHrefs={{
              day: `${BASE}?range=day&date=${todayStr}${branchParam}`,
              week: `${BASE}?range=week&date=${todayStr}${branchParam}`,
              month: `${BASE}?range=month&date=${todayStr}${branchParam}`,
              all: `${BASE}?range=all${branchParam}`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatTile label="Ingresos estimados" value={formatCurrency(report.totalRevenue)} icon={Wallet} accent />
        <StatTile label="Turnos completados" value={String(report.totalCompleted)} icon={CheckCircle2} />
        <StatTile label="Cancelados / no-show" value={`${report.totalCancelled} / ${report.totalNoShow}`} icon={XCircle} />
        <StatTile label="Ticket promedio" value={formatCurrency(report.averageTicket)} icon={Receipt} />
      </div>

      {report.byProfessional.length > 1 && (
        <div className="bg-white rounded-xl border border-pizarra-100 p-5 mb-5">
          <h2 className="text-sm font-semibold text-pizarra-900 mb-4">Ingresos por profesional</h2>
          <RevenueBarChart rows={report.byProfessional.map((p) => ({ name: p.professionalName, revenue: p.revenue }))} />
        </div>
      )}

      <div className="bg-white rounded-xl border border-pizarra-100 p-5 mb-5">
        <h2 className="text-sm font-semibold text-pizarra-900 mb-1">Turnos por estado</h2>
        <p className="text-xs text-pizarra-400 mb-4">Completados, cancelados y no-show de cada profesional en el período</p>
        <StatusBreakdownChart
          rows={report.byProfessional.map((p) => ({
            name: p.professionalName,
            completed: p.completed,
            cancelled: p.cancelled,
            noShow: p.noShow,
          }))}
        />
      </div>

      <div className="bg-white rounded-xl border border-pizarra-100 p-5">
        <h2 className="text-sm font-semibold text-pizarra-900 mb-4">Detalle por profesional</h2>
        <ReportsTable rows={report.byProfessional} />
      </div>

      <p className="text-xs text-pizarra-400 mt-4">
        Los ingresos son estimados a partir del precio de los servicios completados — Mi Turno Ya no procesa cobros, así
        que nunca reemplazan tu caja real.
      </p>
    </div>
  );
}
