import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDashboardContext } from "@/lib/dashboard-context";
import { setProfessionalServices } from "@/services/professional-services.service";

const bodySchema = z.object({ service_ids: z.array(z.string().uuid()) });

// PUT /api/professionals/:id/services — reemplaza el set de servicios vinculados
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getDashboardContext();
  if (!ctx || ctx.role !== "organization_admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // La policy professional_services_admin_write verifica que el
  // profesional y cada servicio pertenezcan a la organización del
  // usuario — si alguien manipulara el id de la URL, el insert
  // simplemente no matchea ninguna fila.
  const success = await setProfessionalServices(id, parsed.data.service_ids);
  if (!success) {
    return NextResponse.json({ error: "No se pudieron guardar los servicios" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
