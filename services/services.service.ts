import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Service } from "@/types/app.types";
import type { ServiceFormValues } from "@/schemas/service.schema";

/**
 * Lectura pública (página de reserva anónima): vía RPC que exige
 * organization_id — ver professionals.service.ts para el porqué.
 */
export async function getServicesByOrganization(organizationId: string): Promise<Service[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("public_list_services", {
    p_organization_id: organizationId,
  });

  if (error || !data) return [];
  return [...data].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Solo para uso interno server-side (API routes de confianza) que ya
 * conocen el id exacto — ver professionals.service.ts para el porqué
 * de usar la service role key acá en vez de una policy pública.
 */
export async function getServiceById(id: string): Promise<Service | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Gestión del organization_admin sobre sus propios servicios — corre
 * con el cliente autenticado normal (no la service role), así que la
 * policy services_admin_write es la que realmente autoriza cada
 * operación, scoped a la organización del usuario.
 */
export async function getAllServicesForOrganization(organizationId: string): Promise<Service[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("organization_id", organizationId)
    .order("name");

  if (error || !data) return [];
  return data;
}

export async function createService(
  organizationId: string,
  input: ServiceFormValues
): Promise<Service | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .insert({
      organization_id: organizationId,
      branch_id: input.branch_id || null,
      name: input.name,
      description: input.description || null,
      duration_minutes: input.duration_minutes,
      price: input.price,
      is_active: true,
    })
    .select()
    .single();

  if (error || !data) return null;
  return data;
}

export async function updateService(
  id: string,
  input: Partial<ServiceFormValues> & { is_active?: boolean }
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description || null }),
      ...(input.duration_minutes !== undefined && { duration_minutes: input.duration_minutes }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.branch_id !== undefined && { branch_id: input.branch_id || null }),
      ...(input.is_active !== undefined && { is_active: input.is_active }),
    })
    .eq("id", id);

  return !error;
}
