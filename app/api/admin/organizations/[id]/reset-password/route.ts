import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePlatformAdmin } from "@/lib/platform-admin";
import { getOrganizationDetail, sendPasswordReset } from "@/services/admin-organizations.service";

const bodySchema = z.object({ email: z.string().email() });

// POST /api/admin/organizations/:id/reset-password — manda el link de
// recuperación al email indicado (solo platform_admin, y solo si ese
// email es efectivamente admin de ESA organización — defensa en
// profundidad para no convertir esto en un "resetear cualquier cuenta").
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUserId = await requirePlatformAdmin();
  if (!adminUserId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const detail = await getOrganizationDetail(id);
  const belongsToOrg = detail?.admins.some((a) => a.email === parsed.data.email);
  if (!belongsToOrg) {
    return NextResponse.json({ error: "Ese email no es admin de esta organización" }, { status: 400 });
  }

  const sent = await sendPasswordReset(parsed.data.email);
  if (!sent) {
    return NextResponse.json({ error: "No se pudo enviar el link" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
