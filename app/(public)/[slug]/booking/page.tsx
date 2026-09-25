import { notFound } from "next/navigation";
import { getOrganizationBySlug } from "@/services/organizations.service";
import { getServicesByOrganization } from "@/services/services.service";
import { getProfessionalsByOrganization } from "@/services/professionals.service";
import BookingWizard from "@/components/booking/booking-wizard";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ service?: string }>;
}

export default async function BookingPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const organization = await getOrganizationBySlug(slug);
  if (!organization) notFound();

  const [services, professionals] = await Promise.all([
    getServicesByOrganization(organization.id),
    getProfessionalsByOrganization(organization.id),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <BookingWizard
          organization={organization}
          services={services}
          professionals={professionals}
          initialServiceId={sp.service ?? null}
        />
      </div>
    </div>
  );
}
