import { NextRequest, NextResponse } from "next/server";
import { professionalSchema } from "@/schemas/professional.schema";
import { createProfessional } from "@/services/professionals.service";
import { getDashboardContext } from "@/lib/dashboard-context";

// POST /api/professionals — crear un profesional (solo organization_admin)
export async function POST(request: NextRequest) {
  const ctx = await getDashboardContext();
  if (!ctx || ctx.role !== "organization_admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = professionalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const professional = await createProfessional(ctx.organizationId, parsed.data);
  if (!professional) {
    return NextResponse.json({ error: "No se pudo crear el profesional" }, { status: 500 });
  }

  return NextResponse.json({ professional }, { status: 201 });
}
