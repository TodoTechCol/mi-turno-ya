import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOrganizationBySlug } from "@/services/organizations.service";
import { getServicesByOrganization } from "@/services/services.service";
import { getProfessionalsByOrganization } from "@/services/professionals.service";
import { getBranchesByOrganization } from "@/services/branches.service";
import BookingWizard from "@/components/booking/booking-wizard";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ service?: string }>;
}

// Flujo de varios pasos sin contenido propio que indexar — la página
// que sí vale la pena rankear es /[slug].
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default async function BookingPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const organization = await getOrganizationBySlug(slug);
  if (!organization) notFound();

  const [services, professionals, branches] = await Promise.all([
    getServicesByOrganization(organization.id),
    getProfessionalsByOrganization(organization.id),
    getBranchesByOrganization(organization.id),
  ]);

  return (
    <div className="min-h-screen bg-pizarra-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <BookingWizard
          organization={organization}
          services={services}
          professionals={professionals}
          branches={branches}
          initialServiceId={sp.service ?? null}
        />
      </div>
    </div>
  );
}
