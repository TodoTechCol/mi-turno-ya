import { NextRequest, NextResponse } from "next/server";
import { acceptInvitationApiSchema } from "@/schemas/invitation.schema";
import { acceptInvitation } from "@/services/invitations.service";

// POST /api/invitations/accept — endpoint público (quien acepta todavía no
// tiene sesión): valida el token server-side antes de crear nada.
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = acceptInvitationApiSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { token, password } = parsed.data;
  const result = await acceptInvitation(token, password);

  if (!result.success) {
    const messages = {
      not_found: "Invitación no encontrada",
      expired: "Esta invitación venció o ya no es válida. Pedile al administrador que te envíe una nueva.",
      already_accepted: "Esta invitación ya fue aceptada. Iniciá sesión con tu contraseña.",
      email_taken: "Ya existe una cuenta con ese email. Iniciá sesión en vez de aceptar la invitación.",
      db_error: "No se pudo completar el registro",
    };
    const status = result.reason === "not_found" ? 404 : result.reason === "db_error" ? 500 : 409;
    return NextResponse.json({ error: messages[result.reason!] }, { status });
  }

  return NextResponse.json({ success: true });
}
