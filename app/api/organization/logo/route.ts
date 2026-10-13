import { NextRequest, NextResponse } from "next/server";
import { getDashboardContext } from "@/lib/dashboard-context";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationById } from "@/services/organizations.service";
import { validateLogoFile } from "@/lib/logo-validation";
import { uploadOrganizationLogo, deleteOrganizationLogo } from "@/services/storage.service";
import { canUploadCustomLogo } from "@/services/plan-limits.service";

// POST /api/organization/logo — subir o reemplazar el logo (solo
// organization_admin, y solo plan Premium — ver landing). La escritura
// a Storage usa la service role key (services/storage.service.ts); el
// UPDATE sobre organizations pasa por el cliente autenticado normal
// para quedar gateado también por la policy organizations_admin_write,
// en línea con el resto del repo.
export async function POST(request: NextRequest) {
  const ctx = await getDashboardContext();
  if (!ctx || ctx.role !== "organization_admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const organization = await getOrganizationById(ctx.organizationId);
  if (!organization) {
    return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
  }

  if (!canUploadCustomLogo(organization.plan)) {
    return NextResponse.json(
      { error: "Subir tu propio logo es exclusivo del plan Premium." },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const logoFile = formData.get("logo");
  if (!(logoFile instanceof File) || logoFile.size === 0) {
    return NextResponse.json({ error: "Falta el archivo del logo" }, { status: 400 });
  }

  const logoError = validateLogoFile(logoFile);
  if (logoError) {
    return NextResponse.json({ error: logoError }, { status: 400 });
  }

  const logoUrl = await uploadOrganizationLogo(ctx.organizationId, logoFile);
  if (!logoUrl) {
    return NextResponse.json({ error: "No se pudo subir el logo" }, { status: 500 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({ logo_url: logoUrl })
    .eq("id", ctx.organizationId);

  if (error) {
    return NextResponse.json({ error: "No se pudo guardar el logo" }, { status: 500 });
  }

  return NextResponse.json({ logo_url: logoUrl });
}

// DELETE /api/organization/logo — quitar el logo actual
export async function DELETE() {
  const ctx = await getDashboardContext();
  if (!ctx || ctx.role !== "organization_admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  await deleteOrganizationLogo(ctx.organizationId);

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({ logo_url: null })
    .eq("id", ctx.organizationId);

  if (error) {
    return NextResponse.json({ error: "No se pudo quitar el logo" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
