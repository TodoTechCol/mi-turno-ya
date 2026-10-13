import { createAdminClient } from "@/lib/supabase/admin";
import { formatInTimeZone } from "date-fns-tz";
import { getMonthBoundsUTC } from "@/lib/timezone";
import type { Organization } from "@/types/app.types";

export const BASICO_MAX_APPOINTMENTS_PER_MONTH = 30;
export const BASICO_MAX_BRANCHES = 1;

/**
 * Único plan que puede subir/cambiar su logo — ver landing (sección
 * de precios). No afecta un logo que ya exista: solo bloquea subir
 * uno NUEVO (ver comentario en app/api/organization/logo/route.ts).
 */
export function canUploadCustomLogo(plan: Organization["plan"]): boolean {
  return plan === "premium";
}

/**
 * Turnos creados este mes calendario (zona horaria del negocio), sin
 * importar su estado — el límite del plan Básico es de USO de la
 * reserva, no de turnos "válidos", y cuenta tanto la reserva pública
 * como los turnos cargados a mano desde el panel. Admin client porque
 * quien dispara este chequeo muchas veces es anónimo (reserva pública)
 * y no tiene ningún permiso de lectura sobre appointments.
 */
export async function countAppointmentsThisMonth(organizationId: string, timezone: string): Promise<number> {
  const admin = createAdminClient();
  const todayStr = formatInTimeZone(new Date(), timezone, "yyyy-MM-dd");
  const { start, end } = getMonthBoundsUTC(todayStr, timezone);

  const { count } = await admin
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .gte("created_at", start)
    .lte("created_at", end);

  return count ?? 0;
}

export async function hasReachedMonthlyAppointmentLimit(
  organizationId: string,
  plan: Organization["plan"],
  timezone: string
): Promise<boolean> {
  if (plan !== "basico") return false;
  const count = await countAppointmentsThisMonth(organizationId, timezone);
  return count >= BASICO_MAX_APPOINTMENTS_PER_MONTH;
}

/**
 * No retroactivo a propósito: si una organización Básico ya tiene más
 * de 1 sede de antes de activar este límite, no se le desactiva
 * ninguna — esto solo bloquea CREAR una sede nueva estando ya en el
 * límite (o por encima).
 */
export async function hasReachedBranchLimit(organizationId: string, plan: Organization["plan"]): Promise<boolean> {
  if (plan !== "basico") return false;
  const admin = createAdminClient();
  const { count } = await admin
    .from("branches")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  return (count ?? 0) >= BASICO_MAX_BRANCHES;
}
