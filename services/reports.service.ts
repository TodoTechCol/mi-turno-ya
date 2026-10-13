import { createClient } from "@/lib/supabase/server";

export interface ProfessionalReportRow {
  professionalId: string;
  professionalName: string;
  completed: number;
  cancelled: number;
  noShow: number;
  upcoming: number; // pending + confirmed, todavía no resueltos
  revenue: number; // suma del precio del servicio en turnos "completed"
}

export interface OrganizationReport {
  totalRevenue: number;
  totalCompleted: number;
  totalCancelled: number;
  totalNoShow: number;
  totalUpcoming: number;
  totalAppointments: number;
  averageTicket: number;
  cancellationRate: number; // 0-100
  byProfessional: ProfessionalReportRow[];
}

const EMPTY_REPORT: OrganizationReport = {
  totalRevenue: 0,
  totalCompleted: 0,
  totalCancelled: 0,
  totalNoShow: 0,
  totalUpcoming: 0,
  totalAppointments: 0,
  averageTicket: 0,
  cancellationRate: 0,
  byProfessional: [],
};

/**
 * Reporte agregado de turnos/ingresos para un rango de fechas. "Ingresos"
 * es siempre ESTIMADO (precio del servicio de los turnos "completed") —
 * la plataforma no procesa cobros, así que nunca es un número de caja
 * real, solo una proyección en base a lo efectivamente atendido.
 *
 * Agrega en JS en vez de en SQL porque el volumen por organización es
 * chico (los turnos de un rango de fechas de un solo negocio) y así se
 * puede reusar el mismo join ya tipado que el resto del dashboard.
 */
export async function getOrganizationReport(
  organizationId: string,
  range: { start: string; end: string },
  branchId?: string,
  onlyProfessionalId?: string
): Promise<OrganizationReport> {
  const supabase = await createClient();

  let query = supabase
    .from("appointments")
    .select(
      `status, branch_id, professional_id,
       professional:professionals(id, name),
       service:services(price)`
    )
    .eq("organization_id", organizationId)
    .gte("start_datetime", range.start)
    .lte("start_datetime", range.end);

  if (onlyProfessionalId) {
    query = query.eq("professional_id", onlyProfessionalId);
  }

  const { data, error } = await query;
  if (error || !data) return EMPTY_REPORT;

  type Row = {
    status: string;
    branch_id: string | null;
    professional_id: string;
    professional: { id: string; name: string } | null;
    service: { price: number } | null;
  };

  const rows = (data as unknown as Row[]).filter((r) => !branchId || r.branch_id === branchId);

  const byProfessionalMap = new Map<string, ProfessionalReportRow>();

  let totalRevenue = 0;
  let totalCompleted = 0;
  let totalCancelled = 0;
  let totalNoShow = 0;
  let totalUpcoming = 0;

  for (const row of rows) {
    const proId = row.professional_id;
    const proName = row.professional?.name ?? "Profesional";
    if (!byProfessionalMap.has(proId)) {
      byProfessionalMap.set(proId, {
        professionalId: proId,
        professionalName: proName,
        completed: 0,
        cancelled: 0,
        noShow: 0,
        upcoming: 0,
        revenue: 0,
      });
    }
    const entry = byProfessionalMap.get(proId)!;
    const price = row.service?.price ?? 0;

    if (row.status === "completed") {
      entry.completed++;
      entry.revenue += price;
      totalCompleted++;
      totalRevenue += price;
    } else if (row.status === "cancelled") {
      entry.cancelled++;
      totalCancelled++;
    } else if (row.status === "no_show") {
      entry.noShow++;
      totalNoShow++;
    } else {
      entry.upcoming++;
      totalUpcoming++;
    }
  }

  const totalAppointments = rows.length;
  const resolvedCount = totalCompleted + totalCancelled + totalNoShow;

  return {
    totalRevenue,
    totalCompleted,
    totalCancelled,
    totalNoShow,
    totalUpcoming,
    totalAppointments,
    averageTicket: totalCompleted > 0 ? totalRevenue / totalCompleted : 0,
    cancellationRate: resolvedCount > 0 ? (totalCancelled / resolvedCount) * 100 : 0,
    byProfessional: [...byProfessionalMap.values()].sort((a, b) => b.revenue - a.revenue),
  };
}
