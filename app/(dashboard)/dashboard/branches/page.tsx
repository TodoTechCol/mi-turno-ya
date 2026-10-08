import { getDashboardContext } from "@/lib/dashboard-context";
import { getAllBranchesForOrganization } from "@/services/branches.service";
import BranchManager from "@/components/dashboard/branch-manager";

export default async function BranchesPage() {
  const ctx = await getDashboardContext();

  if (!ctx) {
    return (
      <div className="text-center py-12 text-pizarra-400">
        <p>No tenés un negocio asociado a tu cuenta.</p>
        <p className="text-sm mt-1">Contactá al administrador.</p>
      </div>
    );
  }

  if (ctx.role !== "organization_admin") {
    return (
      <div className="text-center py-12 text-pizarra-400">
        <p>No tenés permiso para gestionar sedes.</p>
      </div>
    );
  }

  const branches = await getAllBranchesForOrganization(ctx.organizationId);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-pizarra-900">Sedes</h1>
        <p className="text-sm text-pizarra-400">{branches.length} sede(s)</p>
      </div>

      <BranchManager branches={branches} />
    </div>
  );
}
