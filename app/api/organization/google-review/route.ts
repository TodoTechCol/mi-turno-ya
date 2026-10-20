import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDashboardContext } from "@/lib/dashboard-context";
import { updateGoogleReviewUrl } from "@/services/organizations.service";

const bodySchema = z.object({
  url: z.string().url().max(500).optional().or(z.literal("")),
});

// PATCH /api/organization/google-review — guardar o quitar el link de
// reseñas de Google del propio negocio (solo organization_admin).
export async function PATCH(request: NextRequest) {
  const ctx = await getDashboardContext();
  if (!ctx || ctx.role !== "organization_admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ese link no parece válido" }, { status: 400 });
  }

  const url = parsed.data.url || null;
  const success = await updateGoogleReviewUrl(ctx.organizationId, url);
  if (!success) {
    return NextResponse.json({ error: "No se pudo guardar el link" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
