import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { appointmentConfirmationEmail, newAppointmentAdminNotificationEmail } from "@/lib/email/templates";
import { getOrganizationById } from "./organizations.service";
import { getProfessionalById } from "./professionals.service";
import type { CreateAppointmentInput } from "@/schemas/appointment.schema";
import type { Service } from "@/types/app.types";

/**
 * Emails de los organization_admin de una organización — requiere la
 * service role key porque el email vive en auth.users, no en una tabla
 * pública, y quien reserva (anon) no tiene ninguna policy para leer
 * organization_members.
 */
async function getOrganizationAdminEmails(organizationId: string): Promise<string[]> {
  const admin = createAdminClient();
  const { data: members } = await admin
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", organizationId)
    .eq("role", "organization_admin");

  if (!members || members.length === 0) return [];

  const emails: string[] = [];
  for (const member of members) {
    const { data } = await admin.auth.admin.getUserById(member.user_id);
    if (data?.user?.email) emails.push(data.user.email);
  }
  return emails;
}

/**
 * Dispara los emails de confirmación (cliente) y aviso (admin) tras crear
 * un turno. "Best effort" de punta a punta: nunca lanza, así que jamás
 * puede tumbar la respuesta 201 de POST /api/appointments aunque el
 * proveedor de email esté caído o mal configurado.
 */
export async function notifyNewAppointment(
  input: CreateAppointmentInput,
  service: Service
): Promise<void> {
  try {
    const organization = await getOrganizationById(input.organization_id);
    if (!organization) return;

    const professional = await getProfessionalById(input.professional_id);
    const timezone = organization.timezone;
    const start = new Date(input.start_datetime);
    const dateLabel = formatInTimeZone(start, timezone, "EEEE d 'de' MMMM", { locale: es });
    const timeLabel = formatInTimeZone(start, timezone, "HH:mm");

    const tasks: Promise<boolean>[] = [];

    if (input.client_email) {
      const { subject, html } = appointmentConfirmationEmail({
        clientName: input.client_name,
        organizationName: organization.name,
        professionalName: professional?.name ?? "Profesional",
        serviceName: service.name,
        dateLabel,
        timeLabel,
      });
      tasks.push(sendEmail({ to: input.client_email, subject, html }));
    }

    // Admins del negocio + la profesional asignada (si tiene su propio
    // login) — Set para no mandar el mismo email dos veces si una
    // persona es ambas cosas a la vez.
    const recipientEmails = new Set(await getOrganizationAdminEmails(input.organization_id));
    if (professional?.user_id) {
      const admin = createAdminClient();
      const { data } = await admin.auth.admin.getUserById(professional.user_id);
      if (data?.user?.email) recipientEmails.add(data.user.email);
    }

    for (const email of recipientEmails) {
      const { subject, html } = newAppointmentAdminNotificationEmail({
        organizationName: organization.name,
        clientName: input.client_name,
        clientPhone: input.client_phone,
        professionalName: professional?.name ?? "Profesional",
        serviceName: service.name,
        dateLabel,
        timeLabel,
      });
      tasks.push(sendEmail({ to: email, subject, html }));
    }

    await Promise.allSettled(tasks);
  } catch (err) {
    console.error("[notifications] No se pudieron enviar los emails del turno", err);
  }
}
