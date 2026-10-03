import { getDashboardContext } from "@/lib/dashboard-context";
import { getAllServicesForOrganization } from "@/services/services.service";
import ServiceManager from "@/components/dashboard/service-manager";

export default async function ServicesPage() {
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
        <p>No tenés permiso para gestionar servicios.</p>
      </div>
    );
  }

  const services = await getAllServicesForOrganization(ctx.organizationId);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-pizarra-900">Servicios</h1>
        <p className="text-sm text-pizarra-400">{services.length} servicio(s)</p>
      </div>

      <ServiceManager services={services} />
    </div>
  );
}
