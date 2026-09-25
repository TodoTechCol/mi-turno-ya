import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Da de alta (o actualiza) el cliente que reserva, deduplicado por
 * teléfono dentro de la organización. Corre con la service role key
 * porque un visitante anónimo no tiene (ni debe tener) permiso de
 * lectura sobre la tabla customers.
 */
export async function upsertCustomer(
  organizationId: string,
  name: string,
  phone: string,
  email?: string | null
): Promise<string | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("customers")
    .upsert(
      { organization_id: organizationId, name, phone, email: email || null },
      { onConflict: "organization_id,phone" }
    )
    .select("id")
    .single();

  if (error || !data) return null;
  return data.id;
}
