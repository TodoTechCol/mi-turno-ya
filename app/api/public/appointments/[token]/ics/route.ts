import { NextResponse } from "next/server";
import { getAppointmentByToken } from "@/services/appointment-management.service";
import { buildAppointmentICS } from "@/lib/ics";

interface Props {
  params: Promise<{ token: string }>;
}

// GET /api/public/appointments/[token]/ics — descarga el turno como
// archivo .ics (Apple Calendar, Outlook). El link va en el email de
// confirmación; el token es la única autorización necesaria.
export async function GET(_request: Request, { params }: Props) {
  const { token } = await params;
  const details = await getAppointmentByToken(token);

  if (!details) {
    return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 });
  }

  const { appointment, organization, professional, service, branch } = details;

  const ics = buildAppointmentICS({
    uid: appointment.id,
    title: `${service.name} — ${organization.name}`,
    description: `Turno con ${professional.name} en ${organization.name}.`,
    location: branch?.address || organization.address || organization.name,
    start: new Date(appointment.start_datetime),
    end: new Date(appointment.end_datetime),
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="turno-${organization.slug}.ics"`,
    },
  });
}
