import { NextRequest, NextResponse } from "next/server";
import { professionalPatchSchema } from "@/schemas/professional.schema";
import { updateProfessional } from "@/services/professionals.service";
import { getDashboardContext } from "@/lib/dashboard-context";

// PATCH /api/professionals/:id — editar o activar/desactivar (solo organization_admin)
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
  const parsed = professionalPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const success = await updateProfessional(id, parsed.data);
  if (!success) {
    return NextResponse.json({ error: "No se pudo actualizar el profesional" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
