import { NextRequest, NextResponse } from "next/server";
import { availabilityQuerySchema } from "@/schemas/booking.schema";
import { getScheduleForDay, getScheduleBlocksForDay } from "@/services/schedules.service";
import { getAppointmentsForProfessionalOnDate } from "@/services/appointments.service";
import { getServiceById } from "@/services/services.service";
import { getProfessionalById } from "@/services/professionals.service";
import { getOrganizationById } from "@/services/organizations.service";
import { generateAvailableSlots } from "@/lib/availability";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const parsed = availabilityQuerySchema.safeParse({
    professional_id: searchParams.get("professional_id"),
    service_id: searchParams.get("service_id"),
    date: searchParams.get("date"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Parámetros inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { professional_id, service_id, date } = parsed.data;

  // Obtener duración del servicio
  const service = await getServiceById(service_id);
  if (!service) {
    return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
  }

  // Zona horaria de la organización del profesional (para interpretar
  // correctamente el horario laboral, no la del servidor).
  const professional = await getProfessionalById(professional_id);
  if (!professional) {
    return NextResponse.json({ error: "Profesional no encontrado" }, { status: 404 });
  }
  const organization = await getOrganizationById(professional.organization_id);
  const timezone = organization?.timezone ?? "America/Argentina/Buenos_Aires";

  // Día de la semana (0=Dom ... 6=Sáb) — la fecha calendario elegida no
  // depende de zona horaria, por eso usamos mediodía UTC para evitar
  // corrimientos de día al parsear el string.
  const dayOfWeek = new Date(`${date}T12:00:00Z`).getUTCDay();

  // Obtener horario laboral, citas y bloques en paralelo
  const [schedule, appointments, blocks] = await Promise.all([
    getScheduleForDay(professional_id, dayOfWeek),
    getAppointmentsForProfessionalOnDate(professional_id, date, timezone),
    getScheduleBlocksForDay(professional_id, date, timezone),
  ]);

  const slots = generateAvailableSlots(
    date,
    timezone,
    service.duration_minutes,
    schedule,
    appointments,
    blocks
  );

  return NextResponse.json({ slots });
}
