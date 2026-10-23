import { NextRequest, NextResponse } from "next/server";
import { createAppointmentSchema, updateAppointmentStatusSchema } from "@/schemas/appointment.schema";
import { createAppointment, updateAppointmentStatus } from "@/services/appointments.service";
import { getServiceById } from "@/services/services.service";
import { getOrganizationById } from "@/services/organizations.service";
import { upsertCustomer } from "@/services/customers.service";
import { notifyNewAppointment, notifyAppointmentCompleted } from "@/services/notifications.service";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { hasReachedMonthlyAppointmentLimit, BASICO_MAX_APPOINTMENTS_PER_MONTH } from "@/services/plan-limits.service";

// POST /api/appointments — crear un turno (endpoint público, anónimo)
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`appointments:${ip}`, 15, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Demasiadas reservas seguidas. Espera unos minutos e intenta de nuevo." },
      { status: 429 }
    );
  }

  const body = await request.json();

  const parsed = createAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const input = parsed.data;

  const organization = await getOrganizationById(input.organization_id);
  if (!organization) {
    return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
  }

  if (await hasReachedMonthlyAppointmentLimit(organization.id, organization.plan, organization.timezone)) {
    return NextResponse.json(
      {
        error: `Este negocio alcanzó el límite de ${BASICO_MAX_APPOINTMENTS_PER_MONTH} reservas de este mes. Contáctalo directamente para coordinar tu turno.`,
      },
      { status: 403 }
    );
  }

  // Obtener duración del servicio para calcular end_datetime
  const service = await getServiceById(input.service_id);
  if (!service) {
    return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
  }

  // No bloquea la reserva si falla: es una deduplicación, no un requisito.
  const customerId = await upsertCustomer(
    input.organization_id,
    input.client_name,
    input.client_phone,
    input.client_email
  );

  const result = await createAppointment(input, service.duration_minutes, customerId);
  if (!result.success) {
    const message =
      result.reason === "slot_taken"
        ? "Ese horario ya no está disponible. Elige otro."
        : "No se pudo crear el turno.";
    return NextResponse.json({ error: message }, { status: result.reason === "slot_taken" ? 409 : 500 });
  }

  // Se espera (no "fire and forget") porque en un entorno serverless la
  // función puede cortarse apenas se devuelve la respuesta — pero nunca
  // puede fallar la reserva en sí (notifyNewAppointment nunca lanza).
  await notifyNewAppointment(input, service, result.manageToken);

  return NextResponse.json({ success: true }, { status: 201 });
}

// PATCH /api/appointments — actualizar estado
export async function PATCH(request: NextRequest) {
  const body = await request.json();

  const parsed = updateAppointmentStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { appointment_id, status } = parsed.data;
  const result = await updateAppointmentStatus(appointment_id, status);

  if (!result.success) {
    const messages = {
      not_found: "Turno no encontrado o sin permiso para modificarlo",
      invalid_transition: "Esa transición de estado no está permitida",
      db_error: "No se pudo actualizar el turno",
    };
    const statusCode = result.reason === "not_found" ? 404 : result.reason === "invalid_transition" ? 400 : 500;
    return NextResponse.json({ error: messages[result.reason] }, { status: statusCode });
  }

  // Pedido de reseña al cliente — best effort, nunca tumba la
  // respuesta aunque el negocio no tenga link de Google configurado
  // o el envío falle (notifyAppointmentCompleted nunca lanza).
  if (status === "completed") {
    await notifyAppointmentCompleted(appointment_id);
  }

  return NextResponse.json({ success: true });
}
