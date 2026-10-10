import { addMinutes } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrganizationById } from "./organizations.service";
import { getProfessionalById } from "./professionals.service";
import { getServiceById } from "./services.service";
import { notifyAppointmentCancelled, notifyAppointmentRescheduled } from "./notifications.service";
import type { Appointment, Organization, Professional, Service, Branch } from "@/types/app.types";

export interface AppointmentManageDetails {
  appointment: Appointment;
  organization: Organization;
  professional: Professional;
  service: Service;
  branch: Branch | null;
}

/**
 * Lectura pública por manage_token (RPC SECURITY DEFINER, igual criterio
 * que public_get_invitation_by_token): quien gestiona su turno no tiene
 * sesión, solo el link que le llegó por email.
 */
export async function getAppointmentByToken(token: string): Promise<AppointmentManageDetails | null> {
  const supabase = await createClient();
  const { data: appointment, error } = await supabase
    .rpc("public_get_appointment_by_token", { p_token: token })
    .maybeSingle();

  if (error || !appointment) return null;

  const [organization, professional, service] = await Promise.all([
    getOrganizationById(appointment.organization_id),
    getProfessionalById(appointment.professional_id),
    getServiceById(appointment.service_id),
  ]);

  if (!organization || !professional || !service) return null;

  let branch: Branch | null = null;
  if (appointment.branch_id) {
    const admin = createAdminClient();
    const { data } = await admin.from("branches").select("*").eq("id", appointment.branch_id).maybeSingle();
    branch = data ?? null;
  }

  return { appointment, organization, professional, service, branch };
}

// Estados desde los que el cliente todavía puede actuar sobre su turno.
const MANAGEABLE_STATUSES = ["pending", "confirmed"] as const;

export type ManageActionReason = "not_found" | "not_manageable" | "already_past" | "slot_taken" | "db_error";

export type ManageActionResult = { success: true } | { success: false; reason: ManageActionReason };

export const MANAGE_ACTION_ERROR_MESSAGES: Record<ManageActionReason, string> = {
  not_found: "No encontramos ese turno",
  not_manageable: "Este turno ya no se puede modificar",
  already_past: "Este turno ya pasó",
  slot_taken: "Ese horario ya no está disponible, elegí otro",
  db_error: "No se pudo completar la acción",
};

/**
 * Cancela un turno por su manage_token. Corre con la service role key:
 * quien cancela es anónimo y el token (no una sesión) es la única
 * autorización — el mismo criterio que acceptInvitation para el token
 * de invitaciones.
 */
export async function cancelAppointmentByToken(token: string): Promise<ManageActionResult> {
  const admin = createAdminClient();
  const { data: appointment } = await admin
    .from("appointments")
    .select("id, status, start_datetime, organization_id, professional_id, service_id, client_name")
    .eq("manage_token", token)
    .maybeSingle();

  if (!appointment) return { success: false, reason: "not_found" };
  if (!MANAGEABLE_STATUSES.includes(appointment.status as (typeof MANAGEABLE_STATUSES)[number])) {
    return { success: false, reason: "not_manageable" };
  }
  if (new Date(appointment.start_datetime) <= new Date()) {
    return { success: false, reason: "already_past" };
  }

  const { error } = await admin
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", appointment.id);

  if (error) return { success: false, reason: "db_error" };

  const organization = await getOrganizationById(appointment.organization_id);
  if (organization) {
    await notifyAppointmentCancelled(
      {
        organizationId: appointment.organization_id,
        professionalId: appointment.professional_id,
        serviceId: appointment.service_id,
        clientName: appointment.client_name,
      },
      new Date(appointment.start_datetime),
      organization
    );
  }

  return { success: true };
}

/**
 * Reprograma un turno a un nuevo start_datetime, validando que el
 * profesional siga libre en ese rango. Vuelve a "pending" tras el
 * cambio — el negocio ya había confirmado el horario VIEJO, no este
 * nuevo, así que conviene que lo revise de nuevo antes de darlo por
 * confirmado.
 */
export async function rescheduleAppointmentByToken(
  token: string,
  newStartISO: string
): Promise<ManageActionResult> {
  const admin = createAdminClient();
  const { data: appointment } = await admin
    .from("appointments")
    .select("id, status, start_datetime, organization_id, professional_id, service_id, client_name")
    .eq("manage_token", token)
    .maybeSingle();

  if (!appointment) return { success: false, reason: "not_found" };
  if (!MANAGEABLE_STATUSES.includes(appointment.status as (typeof MANAGEABLE_STATUSES)[number])) {
    return { success: false, reason: "not_manageable" };
  }
  if (new Date(appointment.start_datetime) <= new Date()) {
    return { success: false, reason: "already_past" };
  }

  const service = await getServiceById(appointment.service_id);
  if (!service) return { success: false, reason: "db_error" };

  const newStart = new Date(newStartISO);
  if (newStart <= new Date()) return { success: false, reason: "already_past" };
  const newEnd = addMinutes(newStart, service.duration_minutes);

  const { data: conflicts } = await admin
    .from("appointments")
    .select("id")
    .eq("professional_id", appointment.professional_id)
    .neq("id", appointment.id)
    .neq("status", "cancelled")
    .lte("start_datetime", newEnd.toISOString())
    .gte("end_datetime", newStart.toISOString());

  if (conflicts && conflicts.length > 0) {
    return { success: false, reason: "slot_taken" };
  }

  const oldStart = new Date(appointment.start_datetime);

  const { error } = await admin
    .from("appointments")
    .update({
      start_datetime: newStart.toISOString(),
      end_datetime: newEnd.toISOString(),
      status: "pending",
    })
    .eq("id", appointment.id);

  if (error) return { success: false, reason: "db_error" };

  const organization = await getOrganizationById(appointment.organization_id);
  if (organization) {
    await notifyAppointmentRescheduled(
      {
        organizationId: appointment.organization_id,
        professionalId: appointment.professional_id,
        serviceId: appointment.service_id,
        clientName: appointment.client_name,
      },
      oldStart,
      newStart,
      organization
    );
  }

  return { success: true };
}
