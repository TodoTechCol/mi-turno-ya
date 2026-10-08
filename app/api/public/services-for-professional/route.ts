import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServicesByProfessional } from "@/services/services.service";

const querySchema = z.object({
  organization_id: z.string().uuid(),
  professional_id: z.string().uuid(),
});

// GET /api/public/services-for-professional — usado por el paso
// "Servicio" del wizard de reserva una vez elegido el profesional
// (flujo Sede → Profesional → Servicio). Endpoint público: va por la
// misma RPC acotada que usa el resto de la reserva anónima.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    organization_id: searchParams.get("organization_id"),
    professional_id: searchParams.get("professional_id"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const services = await getServicesByProfessional(
    parsed.data.organization_id,
    parsed.data.professional_id
  );

  return NextResponse.json({ services });
}
