import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { passwordResetEmail } from "@/lib/email/templates";
import type { Organization } from "@/types/app.types";

export interface OrganizationAdminSummary {
  userId: string;
  email: string | null;
}

export interface OrganizationDetail {
  organization: Organization;
  admins: OrganizationAdminSummary[];
  counts: {
    professionals: number;
    services: number;
    appointments: number;
    branches: number;
    customers: number;
  };
}

/**
 * Detalle completo de una organización para el panel de Super Admin —
 * corre con la service role key porque agrega datos de varias tablas
 * (incluido el email de auth.users de sus admins) que ninguna policy
 * pública ni de organization_admin normal expone, y acá el que pregunta
 * es, por definición, un platform_admin ya verificado por el caller.
 */
export async function getOrganizationDetail(id: string): Promise<OrganizationDetail | null> {
  const admin = createAdminClient();

  const { data: organization, error } = await admin
    .from("organizations")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !organization) return null;

  const { data: members } = await admin
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", id)
    .eq("role", "organization_admin");

  const admins: OrganizationAdminSummary[] = [];
  for (const member of members || []) {
    const { data } = await admin.auth.admin.getUserById(member.user_id);
    admins.push({ userId: member.user_id, email: data?.user?.email ?? null });
  }

  const [professionals, services, appointments, branches, customers] = await Promise.all([
    admin.from("professionals").select("*", { count: "exact", head: true }).eq("organization_id", id),
    admin.from("services").select("*", { count: "exact", head: true }).eq("organization_id", id),
    admin.from("appointments").select("*", { count: "exact", head: true }).eq("organization_id", id),
    admin.from("branches").select("*", { count: "exact", head: true }).eq("organization_id", id),
    admin.from("customers").select("*", { count: "exact", head: true }).eq("organization_id", id),
  ]);

  return {
    organization,
    admins,
    counts: {
      professionals: professionals.count ?? 0,
      services: services.count ?? 0,
      appointments: appointments.count ?? 0,
      branches: branches.count ?? 0,
      customers: customers.count ?? 0,
    },
  };
}

/**
 * Dispara el flujo de "restablecer contraseña" para un admin de una
 * organización, iniciado por un platform_admin desde el panel. NUNCA
 * vemos ni seteamos la contraseña nosotros — generamos el link de
 * recuperación nativo de Supabase y lo mandamos con nuestro propio
 * template de Resend (en vez del envío interno de Supabase, mismo
 * criterio que signup/invitaciones).
 */
export async function sendPasswordReset(email: string): Promise<boolean> {
  const admin = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${appUrl}/auth/reset-password` },
  });

  if (error || !data.properties.action_link) return false;

  const { subject, html } = passwordResetEmail({ resetUrl: data.properties.action_link });
  return sendEmail({ to: email, subject, html });
}

export async function setOrganizationActive(id: string, isActive: boolean): Promise<boolean> {
  const admin = createAdminClient();
  const { error } = await admin.from("organizations").update({ is_active: isActive }).eq("id", id);
  return !error;
}

/**
 * Elimina la organización. Todas las tablas que cuelgan de
 * organization_id tienen ON DELETE CASCADE, así que el DELETE sobre
 * organizations se lleva turnos, profesionales, servicios, horarios,
 * sucursales, clientes e invitaciones solo. Lo único que NO cae en
 * cascada son las cuentas de auth.users de sus admins — esas se borran
 * acá aparte, y solo si no quedan huérfanas de otra organización (un
 * admin real podría administrar más de un negocio).
 */
export async function deleteOrganization(id: string): Promise<boolean> {
  const admin = createAdminClient();

  const { data: members } = await admin
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", id)
    .eq("role", "organization_admin");

  const { error } = await admin.from("organizations").delete().eq("id", id);
  if (error) return false;

  for (const member of members || []) {
    const { data: remaining } = await admin
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", member.user_id)
      .limit(1);

    if (!remaining || remaining.length === 0) {
      await admin.auth.admin.deleteUser(member.user_id);
    }
  }

  return true;
}
