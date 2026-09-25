import { createClient } from "@/lib/supabase/server";
import { getDayBoundsUTC } from "@/lib/timezone";
import type { Appointment, AppointmentWithDetails, AppointmentStatus } from "@/types/app.types";
import { APPOINTMENT_NEXT_STATUSES } from "@/types/app.types";
import type { Database } from "@/types/database.types";
import type { CreateAppointmentInput } from "@/schemas/appointment.schema";
import { addMinutes } from "date-fns";

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
): Promise<Pick<Appointment, "start_datetime" | "end_datetime">[]> {
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

export async function createAppointment(
  input: CreateAppointmentInput,
  durationMinutes: number,
  customerId: string | null
): Promise<boolean> {
  const supabase = await createClient();

  const startDt = new Date(input.start_datetime);
  const endDt = addMinutes(startDt, durationMinutes);

  // Sin .select() a propósito: quien reserva es anónimo y no tiene
  // permiso de lectura sobre appointments, así que pedir de vuelta
  // la fila insertada (RETURNING) hace fallar toda la operación por RLS.
  const { error } = await supabase.from("appointments").insert({
    organization_id: input.organization_id,
    branch_id: null,
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
  });

  return !error;
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
