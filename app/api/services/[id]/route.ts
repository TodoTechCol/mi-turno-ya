import { NextRequest, NextResponse } from "next/server";
import { servicePatchSchema } from "@/schemas/service.schema";
import { updateService } from "@/services/services.service";
import { getDashboardContext } from "@/lib/dashboard-context";

// PATCH /api/services/:id — editar o activar/desactivar (solo organization_admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getDashboardContext();
  if (!ctx || ctx.role !== "organization_admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = servicePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // updateService confía en organization_id vía RLS (services_admin_write),
  // no en un valor recibido del cliente: si el id no pertenece a la
  // organización del usuario, la policy bloquea el UPDATE sin error visible.
  const success = await updateService(id, parsed.data);
  if (!success) {
    return NextResponse.json({ error: "No se pudo actualizar el servicio" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
