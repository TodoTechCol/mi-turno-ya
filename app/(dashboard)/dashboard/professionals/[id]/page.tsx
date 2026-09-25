import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getDashboardContext } from "@/lib/dashboard-context";
import { getProfessionalByIdForOrg } from "@/services/professionals.service";
import { getAllServicesForOrganization } from "@/services/services.service";
import { getServiceIdsForProfessional } from "@/services/professional-services.service";
import { getSchedulesForProfessional } from "@/services/schedules.service";
import ProfessionalServicesEditor from "@/components/dashboard/professional-services-editor";
import ScheduleEditor from "@/components/dashboard/schedule-editor";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProfessionalDetailPage({ params }: Props) {
  const { id } = await params;
  const ctx = await getDashboardContext();

  if (!ctx || ctx.role !== "organization_admin") {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No tenés permiso para ver esta página.</p>
      </div>
    );
  }

  const professional = await getProfessionalByIdForOrg(id, ctx.organizationId);
  if (!professional) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Profesional no encontrado.</p>
      </div>
    );
  }

  const [services, linkedServiceIds, schedules] = await Promise.all([
    getAllServicesForOrganization(ctx.organizationId),
    getServiceIdsForProfessional(id),
    getSchedulesForProfessional(id),
  ]);

  return (
    <div>
      <Link
        href="/dashboard/professionals"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver a profesionales
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{professional.name}</h1>
        {professional.bio && <p className="text-sm text-gray-400 mt-1">{professional.bio}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ProfessionalServicesEditor
          professionalId={id}
          allServices={services}
          linkedServiceIds={linkedServiceIds}
        />
        <ScheduleEditor professionalId={id} schedules={schedules} />
      </div>
    </div>
  );
}
