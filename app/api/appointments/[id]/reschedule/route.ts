import { NextRequest, NextResponse } from "next/server";
import { adminRescheduleSchema } from "@/schemas/appointment.schema";
import { rescheduleAppointmentByAdmin } from "@/services/appointments.service";
import { getDashboardContext } from "@/lib/dashboard-context";

interface Props {
  params: Promise<{ id: string }>;
}

// POST /api/appointments/[id]/reschedule — reagendar desde el panel
// admin (distinto del reagendado por token que usa el cliente desde
// /manage/[token]). La policy appointments_organization_update (RLS)
// es la que en el fondo evita que un admin toque turnos de otra
// organización, aunque adivine un id.
export async function POST(request: NextRequest, { params }: Props) {
  const ctx = await getDashboardContext();
  if (!ctx || ctx.role !== "organization_admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = adminRescheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const result = await rescheduleAppointmentByAdmin(id, parsed.data.start_datetime);
  if (!result.success) {
    const messages = {
      not_found: "Turno no encontrado",
      not_manageable: "Ese turno ya no se puede reprogramar",
      slot_taken: "Ese horario ya está ocupado para ese profesional",
      db_error: "No se pudo reprogramar el turno",
    };
    const status = result.reason === "not_found" ? 404 : result.reason === "slot_taken" ? 409 : 400;
    return NextResponse.json({ error: messages[result.reason] }, { status });
  }

  return NextResponse.json({ success: true });
}
