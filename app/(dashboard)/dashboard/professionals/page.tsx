import { getDashboardContext } from "@/lib/dashboard-context";
import { getAllProfessionalsForOrganization } from "@/services/professionals.service";
import { getPendingInvitationsForOrganization } from "@/services/invitations.service";
import ProfessionalManager from "@/components/dashboard/professional-manager";

export default async function ProfessionalsPage() {
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
        <p>No tenés permiso para gestionar profesionales.</p>
      </div>
    );
  }

  const [professionals, invitations] = await Promise.all([
    getAllProfessionalsForOrganization(ctx.organizationId),
    getPendingInvitationsForOrganization(ctx.organizationId),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-pizarra-900">Profesionales</h1>
        <p className="text-sm text-pizarra-400">{professionals.length} profesional(es)</p>
      </div>

      <ProfessionalManager professionals={professionals} invitations={invitations} />
    </div>
  );
}
