import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrganizationInvitation } from "@/types/app.types";

const INVITATION_TTL_DAYS = 7;

/**
 * Invitaciones pendientes de la organización — cliente autenticado normal,
 * la policy organization_invitations_admin_read es la que autoriza.
 */
export async function getPendingInvitationsForOrganization(
  organizationId: string
): Promise<OrganizationInvitation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_invitations")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data;
}

interface CreateInvitationResult {
  invitation: OrganizationInvitation | null;
  error: "already_has_access" | "already_invited" | "db_error" | null;
}

/**
 * Crea (o renueva) la invitación de un profesional puntual. Si ya existe
 * una invitación pendiente para ese professional_id, la renueva en vez de
 * duplicarla (mismo token, nueva expiración) — permite "reenviar".
 */
export async function createOrRenewInvitation(
  organizationId: string,
  professionalId: string,
  email: string,
  invitedByUserId: string
): Promise<CreateInvitationResult> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("organization_invitations")
    .select("*")
    .eq("professional_id", professionalId)
    .eq("status", "pending")
    .maybeSingle();

  const expiresAt = new Date(Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  if (existing) {
    const { data, error } = await supabase
      .from("organization_invitations")
      .update({ email, expires_at: expiresAt })
      .eq("id", existing.id)
      .select()
      .single();

    if (error || !data) return { invitation: null, error: "db_error" };
    return { invitation: data, error: null };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const { data, error } = await supabase
    .from("organization_invitations")
    .insert({
      organization_id: organizationId,
      professional_id: professionalId,
      email,
      role: "professional",
      token,
      invited_by: invitedByUserId,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error || !data) return { invitation: null, error: "db_error" };
  return { invitation: data, error: null };
}

export async function revokeInvitation(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("organization_invitations")
    .update({ status: "revoked" })
    .eq("id", id);

  return !error;
}

/**
 * Lectura pública puntual por token exacto (RPC SECURITY DEFINER) — usada
 * por la pantalla de aceptar invitación, que corre sin sesión.
 */
export async function getInvitationByToken(token: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("public_get_invitation_by_token", { p_token: token })
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

interface AcceptInvitationResult {
  success: boolean;
  reason?: "not_found" | "expired" | "already_accepted" | "email_taken" | "db_error";
}

/**
 * Acepta una invitación: crea el usuario de auth, lo vincula como
 * organization_member y, si la invitación estaba atada a un professional_id,
 * conecta professionals.user_id. Corre enteramente con la service role key
 * por la misma razón que /api/signup — es, por definición, la única
 * operación que "bootstrapea" acceso desde cero.
 */
export async function acceptInvitation(
  token: string,
  password: string
): Promise<AcceptInvitationResult> {
  const admin = createAdminClient();

  const { data: invitation, error: invError } = await admin
    .from("organization_invitations")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (invError || !invitation) return { success: false, reason: "not_found" };
  if (invitation.status === "accepted") return { success: false, reason: "already_accepted" };
  if (invitation.status !== "pending" || new Date(invitation.expires_at) < new Date()) {
    return { success: false, reason: "expired" };
  }

  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email: invitation.email,
    password,
    email_confirm: true,
  });

  if (userError || !userData.user) {
    const alreadyExists = userError?.message?.toLowerCase().includes("already");
    return { success: false, reason: alreadyExists ? "email_taken" : "db_error" };
  }

  const userId = userData.user.id;

  const { error: memberError } = await admin
    .from("organization_members")
    .insert({ user_id: userId, organization_id: invitation.organization_id, role: invitation.role });

  if (memberError) {
    await admin.auth.admin.deleteUser(userId);
    return { success: false, reason: "db_error" };
  }

  if (invitation.professional_id) {
    await admin.from("professionals").update({ user_id: userId }).eq("id", invitation.professional_id);
  }

  await admin
    .from("organization_invitations")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", invitation.id);

  return { success: true };
}
