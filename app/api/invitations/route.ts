import { NextRequest, NextResponse } from "next/server";
import { inviteProfessionalSchema } from "@/schemas/invitation.schema";
import { createOrRenewInvitation } from "@/services/invitations.service";
import { getProfessionalByIdForOrg } from "@/services/professionals.service";
import { getOrganizationById } from "@/services/organizations.service";
import { getDashboardContext } from "@/lib/dashboard-context";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/resend";
import { invitationEmail } from "@/lib/email/templates";

// POST /api/invitations — invitar a un profesional a tener acceso al panel
// (solo organization_admin, y solo sobre profesionales de su propia organización)
export async function POST(request: NextRequest) {
  const ctx = await getDashboardContext();
  if (!ctx || ctx.role !== "organization_admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = inviteProfessionalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { professional_id, email } = parsed.data;

  const professional = await getProfessionalByIdForOrg(professional_id, ctx.organizationId);
  if (!professional) {
    return NextResponse.json({ error: "Profesional no encontrado" }, { status: 404 });
  }
  if (professional.user_id) {
    return NextResponse.json({ error: "Ese profesional ya tiene acceso activo" }, { status: 409 });
  }

  const { invitation, error } = await createOrRenewInvitation(
    ctx.organizationId,
    professional_id,
    email,
    ctx.userId
  );

  if (error || !invitation) {
    return NextResponse.json({ error: "No se pudo crear la invitación" }, { status: 500 });
  }

  // El envío de email es "best effort": la invitación ya quedó creada en
  // la base, así que aunque el correo falle el admin puede reenviarla.
  const organization = await getOrganizationById(ctx.organizationId);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const acceptUrl = `${appUrl}/auth/accept-invite?token=${invitation.token}`;

  const { subject, html } = invitationEmail({
    organizationName: organization?.name ?? "tu organización",
    acceptUrl,
    invitedByEmail: user?.email ?? "Un administrador",
  });

  const emailSent = await sendEmail({ to: email, subject, html });

  return NextResponse.json({ invitation, emailSent }, { status: 201 });
}
