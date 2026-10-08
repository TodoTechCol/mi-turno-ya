import { NextRequest, NextResponse } from "next/server";
import { branchPatchSchema } from "@/schemas/branch.schema";
import { updateBranch } from "@/services/branches.service";
import { getDashboardContext } from "@/lib/dashboard-context";

// PATCH /api/branches/:id — editar o activar/desactivar (solo organization_admin)
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
  const parsed = branchPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // updateBranch confía en organization_id vía RLS (branches_admin_write),
  // no en un valor recibido del cliente.
  const success = await updateBranch(id, parsed.data);
  if (!success) {
    return NextResponse.json({ error: "No se pudo actualizar la sede" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
