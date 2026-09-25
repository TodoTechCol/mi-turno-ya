import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface DashboardContext {
  organizationId: string;
  timezone: string;
  role: "organization_admin" | "professional";
  professionalId: string | null;
}

/**
 * Resuelve la organización, su zona horaria, el rol y (si el usuario es
 * "professional") el id de professionals vinculado, para que cada pantalla
 * del dashboard filtre los datos según corresponda. Devuelve null si el
 * usuario está logueado pero no tiene ninguna organización asociada.
 */
export async function getDashboardContext(): Promise<DashboardContext | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // .limit(1) en vez de .single(): la arquitectura ya soporta que un
  // usuario pertenezca a más de una organización (Fase 2), y .single()
  // lanza un error si encuentra más de una fila en vez de simplemente
  // elegir una. Hasta que exista un selector de organización, se usa
  // la membresía más antigua de forma determinística.
  const { data: orgMembers } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  const orgMember = orgMembers?.[0];
  if (!orgMember) return null;

  const { data: organization } = await supabase
    .from("organizations")
    .select("timezone")
    .eq("id", orgMember.organization_id)
    .single();

  let professionalId: string | null = null;
  if (orgMember.role === "professional") {
    const { data: professional } = await supabase
      .from("professionals")
      .select("id")
      .eq("user_id", user.id)
      .eq("organization_id", orgMember.organization_id)
      .maybeSingle();
    professionalId = professional?.id ?? null;
  }

  return {
    organizationId: orgMember.organization_id,
    timezone: organization?.timezone ?? "America/Argentina/Buenos_Aires",
    role: orgMember.role,
    professionalId,
  };
}
