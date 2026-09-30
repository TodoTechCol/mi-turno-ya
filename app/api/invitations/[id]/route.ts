import { NextRequest, NextResponse } from "next/server";
import { revokeInvitation } from "@/services/invitations.service";
import { getDashboardContext } from "@/lib/dashboard-context";

// DELETE /api/invitations/:id — revocar una invitación pendiente
// (RLS organization_invitations_admin_write ya scopea a la propia organización)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getDashboardContext();
  if (!ctx || ctx.role !== "organization_admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const success = await revokeInvitation(id);
  if (!success) {
    return NextResponse.json({ error: "No se pudo revocar la invitación" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
