import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { getDayBoundsUTC, getWeekBoundsUTC, getMonthBoundsUTC } from "@/lib/timezone";
import type { Appointment, AppointmentWithDetails, AppointmentStatus } from "@/types/app.types";
import { APPOINTMENT_NEXT_STATUSES } from "@/types/app.types";
import type { Database } from "@/types/database.types";
import type { CreateAppointmentInput, ManualAppointmentInput } from "@/schemas/appointment.schema";
import { addMinutes } from "date-fns";

type DbClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Turnos ya ocupados de un profesional, para el chequeo de
 * disponibilidad de la reserva pública. Va por RPC (no por lectura
 * directa de appointments) porque un visitante anónimo no tiene ni
 * debe tener permiso de leer la tabla de turnos — solo necesita
 * saber qué horarios están tomados, nunca el nombre/teléfono del
 * cliente. La función devuelve exclusivamente start/end.
 */
export async function getAppointmentsForProfessionalOnDate(
  professionalId: string,
  dateStr: string,
  timezone: string
): Promise<Pick<Appointment, "id" | "start_datetime" | "end_datetime">[]> {
  const supabase = await createClient();
  const { start, end } = getDayBoundsUTC(dateStr, timezone);

  const { data, error } = await supabase.rpc("public_list_busy_slots", {
    p_professional_id: professionalId,
    p_range_start: start,
    p_range_end: end,
  });

  if (error || !data) return [];
  return data;
}

export async function getAppointmentsForDashboard(
  organizationId: string,
  timezone: string,
  dateStr?: string,
  professionalId?: string
): Promise<AppointmentWithDetails[]> {
  const supabase = await createClient();

  let query = supabase
    .from("appointments")
    .select(
      `*,
       professional:professionals(id, name, avatar_url),
       service:services(id, name, duration_minutes, price)`
    )
    .eq("organization_id", organizationId)
    .order("start_datetime", { ascending: true });

  if (dateStr) {
    const { start, end } = getDayBoundsUTC(dateStr, timezone);
    query = query.gte("start_datetime", start).lte("start_datetime", end);
  }

  if (professionalId) {
    query = query.eq("professional_id", professionalId);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as unknown as AppointmentWithDetails[];
}

export async function getAppointmentsForWeek(
  organizationId: string,
  timezone: string,
  mondayDateStr: string,
  professionalId?: string
): Promise<AppointmentWithDetails[]> {
  const supabase = await createClient();
  const { start, end } = getWeekBoundsUTC(mondayDateStr, timezone);

  let query = supabase
    .from("appointments")
    .select(
      `*,
       professional:professionals(id, name, avatar_url),
       service:services(id, name, duration_minutes, price)`
    )
    .eq("organization_id", organizationId)
    .gte("start_datetime", start)
    .lte("start_datetime", end)
    .order("start_datetime", { ascending: true });

  if (professionalId) {
    query = query.eq("professional_id", professionalId);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as unknown as AppointmentWithDetails[];
}

export async function getAppointmentsForMonth(
  organizationId: string,
  timezone: string,
  anyDateInMonthStr: string,
  professionalId?: string
): Promise<AppointmentWithDetails[]> {
  const supabase = await createClient();
  const { start, end } = getMonthBoundsUTC(anyDateInMonthStr, timezone);

  let query = supabase
    .from("appointments")
    .select(
      `*,
       professional:professionals(id, name, avatar_url),
       service:services(id, name, duration_minutes, price)`
    )
    .eq("organization_id", organizationId)
    .gte("start_datetime", start)
    .lte("start_datetime", end)
    .order("start_datetime", { ascending: true });

  if (professionalId) {
    query = query.eq("professional_id", professionalId);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as unknown as AppointmentWithDetails[];
}

/**
 * Devuelve el manage_token del turno creado (null si falló). Se
 * genera en código — igual patrón que organization_invitations.token
 * — en vez de pedirlo de vuelta con .select(): quien reserva es
 * anónimo y no tiene permiso de lectura sobre appointments, así que
 * un RETURNING haría fallar la operación por RLS.
 */
export async function createAppointment(
  input: CreateAppointmentInput,
  durationMinutes: number,
  customerId: string | null
): Promise<string | null> {
  const supabase = await createClient();

  const startDt = new Date(input.start_datetime);
  const endDt = addMinutes(startDt, durationMinutes);
  const manageToken = crypto.randomBytes(32).toString("hex");

  const { error } = await supabase.from("appointments").insert({
    organization_id: input.organization_id,
    branch_id: input.branch_id || null,
    customer_id: customerId,
    professional_id: input.professional_id,
    service_id: input.service_id,
    client_name: input.client_name,
    client_phone: input.client_phone,
    client_email: input.client_email || null,
    start_datetime: startDt.toISOString(),
    end_datetime: endDt.toISOString(),
    status: "pending",
    notes: input.notes || null,
    manage_token: manageToken,
  });

  return error ? null : manageToken;
}

export type UpdateStatusResult =
  | { success: true }
  | { success: false; reason: "not_found" | "invalid_transition" | "db_error" };

/**
 * Valida la transición de estado server-side antes de escribir —
 * antes solo se validaba en el componente cliente, así que llamar al
 * API directamente (sin pasar por la UI) permitía cualquier
 * transición del enum, incluso reabrir un turno cancelado.
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
): Promise<UpdateStatusResult> {
  const supabase = await createClient();

  const { data: current } = await supabase
    .from("appointments")
    .select("status")
    .eq("id", appointmentId)
    .maybeSingle();

  if (!current) return { success: false, reason: "not_found" };

  const allowed = APPOINTMENT_NEXT_STATUSES[current.status];
  if (!allowed.includes(status)) {
    return { success: false, reason: "invalid_transition" };
  }

  // updated_at no se setea a mano: el trigger trg_appointments_updated_at
  // ya lo actualiza automáticamente en cada UPDATE.
  const updatePayload: Database["public"]["Tables"]["appointments"]["Update"] = {
    status,
  };
  const { error } = await supabase
    .from("appointments")
    .update(updatePayload)
    .eq("id", appointmentId);

  return error ? { success: false, reason: "db_error" } : { success: true };
}

/**
 * Chequeo de superposición compartido entre el alta manual y el
 * reagendado desde el panel admin — mismo criterio que
 * appointment-management.service.ts (status != cancelled, rangos
 * que se cruzan), pero acá con el cliente autenticado normal (RLS)
 * en vez de la service role key, porque corre dentro de una sesión
 * de organization_admin real.
 */
async function hasConflictingAppointment(
  supabase: DbClient,
  professionalId: string,
  excludeAppointmentId: string | null,
  startISO: string,
  endISO: string
): Promise<boolean> {
  let query = supabase
    .from("appointments")
    .select("id")
    .eq("professional_id", professionalId)
    .neq("status", "cancelled")
    .lte("start_datetime", endISO)
    .gte("end_datetime", startISO);

  if (excludeAppointmentId) {
    query = query.neq("id", excludeAppointmentId);
  }

  const { data } = await query;
  return (data?.length ?? 0) > 0;
}

export type ManualAppointmentResult =
  | { success: true; manageToken: string }
  | { success: false; reason: "slot_taken" | "db_error" };

/**
 * Turno cargado a mano por el organization_admin (walk-in) desde la
 * vista "Por profesional" del panel. A diferencia de createAppointment
 * (reserva pública, siempre "pending"), este arranca en "confirmed":
 * quien lo carga es el propio negocio, no hace falta un paso de
 * revisión aparte.
 */
export async function createManualAppointment(
  organizationId: string,
  input: ManualAppointmentInput,
  durationMinutes: number,
  customerId: string | null
): Promise<ManualAppointmentResult> {
  const supabase = await createClient();

  const startDt = new Date(input.start_datetime);
  const endDt = addMinutes(startDt, durationMinutes);

  const conflict = await hasConflictingAppointment(
    supabase,
    input.professional_id,
    null,
    startDt.toISOString(),
    endDt.toISOString()
  );
  if (conflict) return { success: false, reason: "slot_taken" };

  const manageToken = crypto.randomBytes(32).toString("hex");

  const { error } = await supabase.from("appointments").insert({
    organization_id: organizationId,
    branch_id: input.branch_id || null,
    customer_id: customerId,
    professional_id: input.professional_id,
    service_id: input.service_id,
    client_name: input.client_name,
    client_phone: input.client_phone,
    client_email: input.client_email || null,
    start_datetime: startDt.toISOString(),
    end_datetime: endDt.toISOString(),
    status: "confirmed",
    notes: input.notes || null,
    manage_token: manageToken,
  });

  return error ? { success: false, reason: "db_error" } : { success: true, manageToken };
}

export type AdminRescheduleResult =
  | { success: true }
  | { success: false; reason: "not_found" | "not_manageable" | "slot_taken" | "db_error" };

const RESCHEDULABLE: AppointmentStatus[] = ["pending", "confirmed"];

/**
 * Reagendar desde el panel admin (distinto del reagendado por token
 * que usa el cliente desde /manage/[token]): acá el admin ya está
 * autenticado y puede tocar cualquier turno de su organización, así
 * que no hace falta un token — la policy appointments_organization_update
 * (RLS) es la que autoriza.
 */
export async function rescheduleAppointmentByAdmin(
  appointmentId: string,
  newStartISO: string
): Promise<AdminRescheduleResult> {
  const supabase = await createClient();

  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, status, professional_id, service_id")
    .eq("id", appointmentId)
    .maybeSingle();

  if (!appointment) return { success: false, reason: "not_found" };
  if (!RESCHEDULABLE.includes(appointment.status)) {
    return { success: false, reason: "not_manageable" };
  }

  const { data: service } = await supabase
    .from("services")
    .select("duration_minutes")
    .eq("id", appointment.service_id)
    .maybeSingle();
  if (!service) return { success: false, reason: "db_error" };

  const newStart = new Date(newStartISO);
  const newEnd = addMinutes(newStart, service.duration_minutes);

  const conflict = await hasConflictingAppointment(
    supabase,
    appointment.professional_id,
    appointment.id,
    newStart.toISOString(),
    newEnd.toISOString()
  );
  if (conflict) return { success: false, reason: "slot_taken" };

  const { error } = await supabase
    .from("appointments")
    .update({ start_datetime: newStart.toISOString(), end_datetime: newEnd.toISOString() })
    .eq("id", appointmentId);

  return error ? { success: false, reason: "db_error" } : { success: true };
}
