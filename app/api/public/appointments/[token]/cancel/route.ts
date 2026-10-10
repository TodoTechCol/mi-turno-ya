import { NextRequest, NextResponse } from "next/server";
import { cancelAppointmentByToken, MANAGE_ACTION_ERROR_MESSAGES } from "@/services/appointment-management.service";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

interface Props {
  params: Promise<{ token: string }>;
}

// POST /api/public/appointments/[token]/cancel — endpoint público
// (quien cancela no tiene sesión): el token del link es la única
// autorización, igual criterio que /api/invitations/accept.
export async function POST(request: NextRequest, { params }: Props) {
  const { token } = await params;

  const ip = getClientIp(request);
  if (!checkRateLimit(`appointment-cancel:${ip}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Demasiados intentos. Probá de nuevo en un rato." }, { status: 429 });
  }

  const result = await cancelAppointmentByToken(token);
  if (!result.success) {
    const status = result.reason === "not_found" ? 404 : 400;
    return NextResponse.json({ error: MANAGE_ACTION_ERROR_MESSAGES[result.reason] }, { status });
  }

  return NextResponse.json({ success: true });
}
