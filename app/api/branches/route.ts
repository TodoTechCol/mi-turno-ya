import { NextRequest, NextResponse } from "next/server";
import { branchSchema } from "@/schemas/branch.schema";
import { createBranch } from "@/services/branches.service";
import { getDashboardContext } from "@/lib/dashboard-context";

// POST /api/branches — crear una sede (solo organization_admin)
export async function POST(request: NextRequest) {
  const ctx = await getDashboardContext();
  if (!ctx || ctx.role !== "organization_admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = branchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const branch = await createBranch(ctx.organizationId, parsed.data);
  if (!branch) {
    return NextResponse.json({ error: "No se pudo crear la sede" }, { status: 500 });
  }

  return NextResponse.json({ branch }, { status: 201 });
}
