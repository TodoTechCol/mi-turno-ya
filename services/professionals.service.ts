import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Professional } from "@/types/app.types";
import type { ProfessionalFormValues } from "@/schemas/professional.schema";

/**
 * Lecturas públicas (usadas por la página de reserva anónima): pasan
 * por funciones RPC que exigen organization_id, nunca por una lectura
 * directa de la tabla — así nunca es posible pedir "todos los
 * profesionales de todas las organizaciones" en una sola consulta.
 */
export async function getProfessionalsByOrganization(
  organizationId: string
): Promise<Professional[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("public_list_professionals", {
    p_organization_id: organizationId,
  });

  if (error || !data) return [];
  return [...data].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getProfessionalsByService(
  organizationId: string,
  serviceId: string
): Promise<Professional[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("public_list_professionals_for_service", {
    p_organization_id: organizationId,
    p_service_id: serviceId,
  });

  if (error || !data) return [];
  return [...data].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Solo para uso interno server-side (API routes de confianza) que ya
 * conocen el id exacto y necesitan resolver su organización — no es
 * una lectura "pública" de listado, por eso usa la service role key
 * en vez de depender de una policy pública.
 */
export async function getProfessionalById(id: string): Promise<Professional | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("professionals")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Gestión del organization_admin sobre sus propios profesionales —
 * mismo criterio que en services.service.ts: cliente autenticado
 * normal, la policy professionals_admin_write es la que autoriza.
 */
export async function getAllProfessionalsForOrganization(
  organizationId: string
): Promise<Professional[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professionals")
    .select("*")
    .eq("organization_id", organizationId)
    .order("name");

  if (error || !data) return [];
  return data;
}

export async function createProfessional(
  organizationId: string,
  input: ProfessionalFormValues
): Promise<Professional | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professionals")
    .insert({
      organization_id: organizationId,
      branch_id: null,
      user_id: null,
      name: input.name,
      bio: input.bio || null,
      avatar_url: null,
      is_active: true,
    })
    .select()
    .single();

  if (error || !data) return null;
  return data;
}

export async function getProfessionalByIdForOrg(
  id: string,
  organizationId: string
): Promise<Professional | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professionals")
    .select("*")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function updateProfessional(
  id: string,
  input: Partial<ProfessionalFormValues> & { is_active?: boolean }
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("professionals")
    .update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.bio !== undefined && { bio: input.bio || null }),
      ...(input.is_active !== undefined && { is_active: input.is_active }),
    })
    .eq("id", id);

  return !error;
}
