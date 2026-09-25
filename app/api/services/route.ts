import { NextRequest, NextResponse } from "next/server";
import { serviceSchema } from "@/schemas/service.schema";
import { createService } from "@/services/services.service";
import { getDashboardContext } from "@/lib/dashboard-context";

// POST /api/services — crear un servicio (solo organization_admin)
export async function POST(request: NextRequest) {
  const ctx = await getDashboardContext();
  if (!ctx || ctx.role !== "organization_admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const service = await createService(ctx.organizationId, parsed.data);
  if (!service) {
    return NextResponse.json({ error: "No se pudo crear el servicio" }, { status: 500 });
  }

  return NextResponse.json({ service }, { status: 201 });
}
