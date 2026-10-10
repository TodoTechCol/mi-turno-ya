import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rescheduleAppointmentByToken, MANAGE_ACTION_ERROR_MESSAGES } from "@/services/appointment-management.service";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

interface Props {
  params: Promise<{ token: string }>;
}

const bodySchema = z.object({
  start_datetime: z.string().datetime({ offset: true }),
});

// POST /api/public/appointments/[token]/reschedule — endpoint público,
// mismo criterio de autorización que .../cancel: el token es el único
// requisito, no hace falta sesión.
export async function POST(request: NextRequest, { params }: Props) {
  const { token } = await params;

  const ip = getClientIp(request);
  if (!checkRateLimit(`appointment-reschedule:${ip}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Demasiados intentos. Probá de nuevo en un rato." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const result = await rescheduleAppointmentByToken(token, parsed.data.start_datetime);
  if (!result.success) {
    const status = result.reason === "not_found" ? 404 : result.reason === "slot_taken" ? 409 : 400;
    return NextResponse.json({ error: MANAGE_ACTION_ERROR_MESSAGES[result.reason] }, { status });
  }

  return NextResponse.json({ success: true });
}
