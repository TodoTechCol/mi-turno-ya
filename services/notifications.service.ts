import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import {
  appointmentConfirmationEmail,
  newAppointmentAdminNotificationEmail,
  appointmentCancelledAdminNotificationEmail,
  appointmentRescheduledAdminNotificationEmail,
} from "@/lib/email/templates";
import { buildGoogleCalendarUrl, buildWhatsAppUrl } from "@/lib/calendar-links";
import { getOrganizationById } from "./organizations.service";
import { getProfessionalById } from "./professionals.service";
import { getServiceById } from "./services.service";
import type { CreateAppointmentInput } from "@/schemas/appointment.schema";
import type { Service, Organization } from "@/types/app.types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Emails de los organization_admin de una organización — requiere la
 * service role key porque el email vive en auth.users, no en una tabla
 * pública, y quien reserva (anon) no tiene ninguna policy para leer
 * organization_members.
 */
export async function getOrganizationAdminEmails(organizationId: string): Promise<string[]> {
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
 * Admins del negocio + la profesional asignada (si tiene su propio
 * login) — Set para no mandar el mismo email dos veces si una persona
 * es ambas cosas a la vez. Compartido entre los tres flujos de
 * notificación (nuevo turno, cancelado, reprogramado).
 */
async function getRecipientEmails(organizationId: string, professionalUserId: string | null): Promise<Set<string>> {
  const recipientEmails = new Set(await getOrganizationAdminEmails(organizationId));
  if (professionalUserId) {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.getUserById(professionalUserId);
    if (data?.user?.email) recipientEmails.add(data.user.email);
  }
  return recipientEmails;
}

function formatDateTimeLabels(start: Date, timezone: string) {
  return {
    dateLabel: formatInTimeZone(start, timezone, "EEEE d 'de' MMMM", { locale: es }),
    timeLabel: formatInTimeZone(start, timezone, "HH:mm"),
  };
}

/**
 * Dispara los emails de confirmación (cliente) y aviso (admin) tras crear
 * un turno. "Best effort" de punta a punta: nunca lanza, así que jamás
 * puede tumbar la respuesta 201 de POST /api/appointments aunque el
 * proveedor de email esté caído o mal configurado.
 */
export async function notifyNewAppointment(
  input: CreateAppointmentInput,
  service: Service,
  manageToken: string
): Promise<void> {
  try {
    const organization = await getOrganizationById(input.organization_id);
    if (!organization) return;

    const professional = await getProfessionalById(input.professional_id);
    const start = new Date(input.start_datetime);
    const { dateLabel, timeLabel } = formatDateTimeLabels(start, organization.timezone);

    const tasks: Promise<boolean>[] = [];

    if (input.client_email) {
      const manageUrl = `${APP_URL}/manage/${manageToken}`;
      const { subject, html } = appointmentConfirmationEmail({
        clientName: input.client_name,
        organizationName: organization.name,
        professionalName: professional?.name ?? "Profesional",
        serviceName: service.name,
        servicePrice: service.price,
        serviceDuration: service.duration_minutes,
        dateLabel,
        timeLabel,
        address: organization.address,
        manageUrl,
        icsUrl: `${APP_URL}/api/public/appointments/${manageToken}/ics`,
        googleCalendarUrl: buildGoogleCalendarUrl({
          title: `${service.name} — ${organization.name}`,
          description: `Turno con ${professional?.name ?? "tu profesional"} en ${organization.name}. Gestioná tu turno: ${manageUrl}`,
          location: organization.address || organization.name,
          start,
          end: new Date(start.getTime() + service.duration_minutes * 60 * 1000),
        }),
        whatsappUrl: buildWhatsAppUrl(
          organization.phone,
          `Hola! Te escribo por mi turno del ${dateLabel} a las ${timeLabel} en ${organization.name}.`
        ),
      });
      tasks.push(sendEmail({ to: input.client_email, subject, html }));
    }

    const recipientEmails = await getRecipientEmails(input.organization_id, professional?.user_id ?? null);
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

interface AppointmentContext {
  organizationId: string;
  professionalId: string;
  serviceId: string;
  clientName: string;
}

/**
 * Avisa a los admins del negocio (+ la profesional asignada) que un
 * cliente canceló su turno por su cuenta — si no, el negocio nunca se
 * entera de que ese horario quedó libre. Best effort, igual que el resto.
 */
export async function notifyAppointmentCancelled(
  ctx: AppointmentContext,
  start: Date,
  organization: Organization
): Promise<void> {
  try {
    const [professional, service] = await Promise.all([
      getProfessionalById(ctx.professionalId),
      getServiceById(ctx.serviceId),
    ]);
    const { dateLabel, timeLabel } = formatDateTimeLabels(start, organization.timezone);

    const recipientEmails = await getRecipientEmails(ctx.organizationId, professional?.user_id ?? null);
    const tasks = [...recipientEmails].map((email) => {
      const { subject, html } = appointmentCancelledAdminNotificationEmail({
        organizationName: organization.name,
        clientName: ctx.clientName,
        serviceName: service?.name ?? "Servicio",
        professionalName: professional?.name ?? "Profesional",
        dateLabel,
        timeLabel,
      });
      return sendEmail({ to: email, subject, html });
    });

    await Promise.allSettled(tasks);
  } catch (err) {
    console.error("[notifications] No se pudo avisar la cancelación del turno", err);
  }
}

/**
 * Avisa a los admins del negocio que un cliente reprogramó su turno —
 * vuelve a quedar "pending" (ver appointment-management.service.ts),
 * así que conviene que el negocio se entere para revisarlo de nuevo.
 */
export async function notifyAppointmentRescheduled(
  ctx: AppointmentContext,
  oldStart: Date,
  newStart: Date,
  organization: Organization
): Promise<void> {
  try {
    const [professional, service] = await Promise.all([
      getProfessionalById(ctx.professionalId),
      getServiceById(ctx.serviceId),
    ]);
    const oldLabels = formatDateTimeLabels(oldStart, organization.timezone);
    const newLabels = formatDateTimeLabels(newStart, organization.timezone);

    const recipientEmails = await getRecipientEmails(ctx.organizationId, professional?.user_id ?? null);
    const tasks = [...recipientEmails].map((email) => {
      const { subject, html } = appointmentRescheduledAdminNotificationEmail({
        organizationName: organization.name,
        clientName: ctx.clientName,
        serviceName: service?.name ?? "Servicio",
        professionalName: professional?.name ?? "Profesional",
        oldDateLabel: oldLabels.dateLabel,
        oldTimeLabel: oldLabels.timeLabel,
        newDateLabel: newLabels.dateLabel,
        newTimeLabel: newLabels.timeLabel,
      });
      return sendEmail({ to: email, subject, html });
    });

    await Promise.allSettled(tasks);
  } catch (err) {
    console.error("[notifications] No se pudo avisar la reprogramación del turno", err);
  }
}
