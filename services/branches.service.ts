import { createClient } from "@/lib/supabase/server";
import type { Branch } from "@/types/app.types";
import type { BranchFormValues } from "@/schemas/branch.schema";

/**
 * Lectura pública (reserva anónima): vía RPC acotada, mismo criterio
 * que professionals/services desde el cierre de enumeración pública.
 */
export async function getBranchesByOrganization(organizationId: string): Promise<Branch[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("public_list_branches", {
    p_organization_id: organizationId,
  });

  if (error || !data) return [];
  return [...data].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Gestión del organization_admin — cliente autenticado normal,
 * branches_admin_write es la que autoriza.
 */
export async function getAllBranchesForOrganization(organizationId: string): Promise<Branch[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .eq("organization_id", organizationId)
    .order("name");

  if (error || !data) return [];
  return data;
}

export interface BranchStats {
  professionalsCount: number;
  servicesCount: number;
  appointmentsTotal: number;
  appointmentsCompleted: number;
  revenueGenerated: number;
}

/**
 * Reporte simple de una sede: cuántos profesionales/servicios tiene
 * asignados, y un resumen de turnos (total, completados, valor
 * generado por los completados). "Valor generado" es la suma del
 * precio de los servicios — informativo, no un sistema de comisiones.
 */
export async function getBranchStats(branchId: string): Promise<BranchStats> {
  const supabase = await createClient();

  const [professionals, services, appointments] = await Promise.all([
    supabase.from("professionals").select("*", { count: "exact", head: true }).eq("branch_id", branchId),
    supabase.from("services").select("*", { count: "exact", head: true }).eq("branch_id", branchId),
    supabase
      .from("appointments")
      .select("status, service:services(price)")
      .eq("branch_id", branchId),
  ]);

  const appointmentRows = (appointments.data ?? []) as unknown as {
    status: string;
    service: { price: number } | null;
  }[];
  const completed = appointmentRows.filter((a) => a.status === "completed");

  return {
    professionalsCount: professionals.count ?? 0,
    servicesCount: services.count ?? 0,
    appointmentsTotal: appointmentRows.length,
    appointmentsCompleted: completed.length,
    revenueGenerated: completed.reduce((sum, a) => sum + (a.service?.price ?? 0), 0),
  };
}

export async function getBranchByIdForOrg(id: string, organizationId: string): Promise<Branch | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function createBranch(
  organizationId: string,
  input: BranchFormValues
): Promise<Branch | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("branches")
    .insert({
      organization_id: organizationId,
      name: input.name,
      address: input.address || null,
      phone: input.phone || null,
      sector: input.sector || null,
      opening_hours: input.opening_hours || null,
      is_active: true,
    })
    .select()
    .single();

  if (error || !data) return null;
  return data;
}

export async function updateBranch(
  id: string,
  input: Partial<BranchFormValues> & { is_active?: boolean }
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("branches")
    .update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.address !== undefined && { address: input.address || null }),
      ...(input.phone !== undefined && { phone: input.phone || null }),
      ...(input.sector !== undefined && { sector: input.sector || null }),
      ...(input.opening_hours !== undefined && { opening_hours: input.opening_hours || null }),
      ...(input.is_active !== undefined && { is_active: input.is_active }),
    })
    .eq("id", id);

  return !error;
}
