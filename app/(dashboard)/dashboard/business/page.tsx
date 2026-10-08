import { getDashboardContext } from "@/lib/dashboard-context";
import { getOrganizationById } from "@/services/organizations.service";
import BusinessLogoManager from "@/components/dashboard/business-logo-manager";

export default async function BusinessPage() {
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
        <p>No tenés permiso para editar los datos del negocio.</p>
      </div>
    );
  }

  const organization = await getOrganizationById(ctx.organizationId);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-pizarra-900">Mi negocio</h1>
        <p className="text-sm text-pizarra-400">{ctx.organizationName}</p>
      </div>

      <div className="bg-white rounded-xl border border-pizarra-100 p-6">
        <h2 className="text-sm font-medium text-pizarra-700 mb-3">Logo</h2>
        <BusinessLogoManager
          organizationName={ctx.organizationName}
          initialLogoUrl={organization?.logo_url ?? null}
        />
        <p className="text-xs text-pizarra-400 mt-4">
          Aparece en tu página de reserva y en la pantalla donde tus clientes eligen el turno.
        </p>
      </div>
    </div>
  );
}
