import { NextRequest, NextResponse } from "next/server";
import { weekScheduleSchema } from "@/schemas/schedule.schema";
import { getDashboardContext } from "@/lib/dashboard-context";
import { saveWeekSchedule } from "@/services/schedules.service";

// PUT /api/professionals/:id/schedule — guarda el horario semanal completo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getDashboardContext();
  if (!ctx || ctx.role !== "organization_admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = weekScheduleSchema.safeParse(body.days);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const success = await saveWeekSchedule(ctx.organizationId, id, parsed.data);
  if (!success) {
    return NextResponse.json({ error: "No se pudo guardar el horario" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
