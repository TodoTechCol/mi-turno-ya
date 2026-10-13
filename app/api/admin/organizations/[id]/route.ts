import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePlatformAdmin } from "@/lib/platform-admin";
import { setOrganizationActive, setOrganizationPlan, deleteOrganization } from "@/services/admin-organizations.service";

const patchSchema = z
  .object({
    is_active: z.boolean().optional(),
    plan: z.enum(["basico", "premium"]).optional(),
  })
  .refine((data) => data.is_active !== undefined || data.plan !== undefined, {
    message: "Nada para actualizar",
  });

// PATCH /api/admin/organizations/:id — activar/desactivar y/o cambiar
// el plan (solo platform_admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUserId = await requirePlatformAdmin();
  if (!adminUserId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  if (parsed.data.is_active !== undefined) {
    const success = await setOrganizationActive(id, parsed.data.is_active);
    if (!success) {
      return NextResponse.json({ error: "No se pudo actualizar la organización" }, { status: 500 });
    }
  }

  if (parsed.data.plan !== undefined) {
    const success = await setOrganizationPlan(id, parsed.data.plan);
    if (!success) {
      return NextResponse.json({ error: "No se pudo actualizar el plan" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/admin/organizations/:id — eliminar (solo platform_admin)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUserId = await requirePlatformAdmin();
  if (!adminUserId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const success = await deleteOrganization(id);
  if (!success) {
    return NextResponse.json({ error: "No se pudo eliminar la organización" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
