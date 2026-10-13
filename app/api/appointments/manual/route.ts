import { NextRequest, NextResponse } from "next/server";
import { manualAppointmentSchema } from "@/schemas/appointment.schema";
import { createManualAppointment } from "@/services/appointments.service";
import { getServiceById } from "@/services/services.service";
import { upsertCustomer } from "@/services/customers.service";
import { notifyNewAppointment } from "@/services/notifications.service";
import { getDashboardContext } from "@/lib/dashboard-context";

// POST /api/appointments/manual — turno cargado a mano por el
// organization_admin desde la vista "Por profesional" (walk-in o
// reserva telefónica). Arranca "confirmed", no "pending".
export async function POST(request: NextRequest) {
  const ctx = await getDashboardContext();
  if (!ctx || ctx.role !== "organization_admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = manualAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const input = parsed.data;

  const service = await getServiceById(input.service_id);
  if (!service) {
    return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
  }

  const customerId = await upsertCustomer(
    ctx.organizationId,
    input.client_name,
    input.client_phone,
    input.client_email
  );

  const result = await createManualAppointment(ctx.organizationId, input, service.duration_minutes, customerId);
  if (!result.success) {
    const message =
      result.reason === "slot_taken"
        ? "Ese horario ya está ocupado para ese profesional"
        : "No se pudo crear el turno";
    return NextResponse.json({ error: message }, { status: result.reason === "slot_taken" ? 409 : 500 });
  }

  // Solo le llega confirmación al cliente (si dejó email) — al admin no,
  // porque lo acaba de cargar él mismo.
  await notifyNewAppointment(
    { ...input, organization_id: ctx.organizationId },
    service,
    result.manageToken,
    false
  );

  return NextResponse.json({ success: true }, { status: 201 });
}
