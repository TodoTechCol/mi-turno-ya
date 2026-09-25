import { getDashboardContext } from "@/lib/dashboard-context";
import { getAllProfessionalsForOrganization } from "@/services/professionals.service";
import ProfessionalManager from "@/components/dashboard/professional-manager";

export default async function ProfessionalsPage() {
  const ctx = await getDashboardContext();

  if (!ctx) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No tenés un negocio asociado a tu cuenta.</p>
        <p className="text-sm mt-1">Contactá al administrador.</p>
      </div>
    );
  }

  if (ctx.role !== "organization_admin") {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No tenés permiso para gestionar profesionales.</p>
      </div>
    );
  }

  const professionals = await getAllProfessionalsForOrganization(ctx.organizationId);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profesionales</h1>
        <p className="text-sm text-gray-400">{professionals.length} profesional(es)</p>
      </div>

      <ProfessionalManager professionals={professionals} />
    </div>
  );
}
