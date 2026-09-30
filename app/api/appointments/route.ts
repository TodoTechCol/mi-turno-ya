import { NextRequest, NextResponse } from "next/server";
import { createAppointmentSchema, updateAppointmentStatusSchema } from "@/schemas/appointment.schema";
import { createAppointment, updateAppointmentStatus } from "@/services/appointments.service";
import { getServiceById } from "@/services/services.service";
import { upsertCustomer } from "@/services/customers.service";
import { notifyNewAppointment } from "@/services/notifications.service";

// POST /api/appointments — crear un turno
export async function POST(request: NextRequest) {
  const body = await request.json();

  const parsed = createAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const input = parsed.data;

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

  const created = await createAppointment(input, service.duration_minutes, customerId);
  if (!created) {
    return NextResponse.json(
      { error: "No se pudo crear el turno. Puede que el horario ya no esté disponible." },
      { status: 409 }
    );
  }

  // Se espera (no "fire and forget") porque en un entorno serverless la
  // función puede cortarse apenas se devuelve la respuesta — pero nunca
  // puede fallar la reserva en sí (notifyNewAppointment nunca lanza).
  await notifyNewAppointment(input, service);

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

  return NextResponse.json({ success: true });
}
