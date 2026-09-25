import { createClient } from "@/lib/supabase/server";

/**
 * Gestión del vínculo profesional↔servicio para el organization_admin.
 * Corre con el cliente autenticado normal — professional_services_admin_write
 * es la que autoriza, verificando que ambos pertenezcan a su organización.
 */
export async function getServiceIdsForProfessional(professionalId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professional_services")
    .select("service_id")
    .eq("professional_id", professionalId);

  if (error || !data) return [];
  return data.map((row) => row.service_id);
}

/**
 * Reemplaza el set completo de servicios vinculados a un profesional
 * (borra los vínculos actuales y crea los nuevos) — más simple y
 * seguro que diffear altas/bajas individuales para una lista de
 * checkboxes.
 */
export async function setProfessionalServices(
  professionalId: string,
  serviceIds: string[]
): Promise<boolean> {
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("professional_services")
    .delete()
    .eq("professional_id", professionalId);
  if (deleteError) return false;

  if (serviceIds.length === 0) return true;

  const { error: insertError } = await supabase
    .from("professional_services")
    .insert(serviceIds.map((service_id) => ({ professional_id: professionalId, service_id })));

  return !insertError;
}
