import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Phone, Clock, Scissors } from "lucide-react";
import { getOrganizationBySlug } from "@/services/organizations.service";
import { getServicesByOrganization } from "@/services/services.service";
import { formatCurrency, formatDuration } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function OrganizationPublicPage({ params }: Props) {
  const { slug } = await params;
  const organization = await getOrganizationBySlug(slug);

  if (!organization) notFound();

  const services = await getServicesByOrganization(organization.id);

  return (
    <div className="min-h-screen bg-pizarra-50">
      {/* Hero */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-10 text-center">
          {organization.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={organization.logo_url}
              alt={organization.name}
              className="w-16 h-16 rounded-2xl object-cover mx-auto mb-4"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-lila-600 flex items-center justify-center mx-auto mb-4">
              <Scissors className="w-8 h-8 text-white" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-pizarra-900">{organization.name}</h1>
          {organization.description && (
            <p className="mt-2 text-pizarra-500 text-sm">{organization.description}</p>
          )}
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-pizarra-500">
            {organization.address && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {organization.address}
              </span>
            )}
            {organization.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" /> {organization.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Servicios */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-lg font-semibold text-pizarra-900 mb-4">Servicios disponibles</h2>

        {services.length === 0 ? (
          <p className="text-pizarra-400 text-sm">No hay servicios disponibles por el momento.</p>
        ) : (
          <div className="grid gap-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-xl border border-pizarra-100 p-4 flex items-center justify-between shadow-sm"
              >
                <div>
                  <p className="font-medium text-pizarra-900">{service.name}</p>
                  {service.description && (
                    <p className="text-sm text-pizarra-400 mt-0.5">{service.description}</p>
                  )}
                  <div className="flex gap-3 mt-2 text-xs text-pizarra-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDuration(service.duration_minutes)}
                    </span>
                    <span className="font-medium text-lila-600">
                      {formatCurrency(service.price)}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/${slug}/booking?service=${service.id}`}
                  className="px-4 py-2 bg-lila-600 text-white text-sm font-medium rounded-lg hover:bg-lila-700 transition-colors whitespace-nowrap"
                >
                  Reservar
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* CTA general */}
        <div className="mt-8 text-center">
          <Link
            href={`/${slug}/booking`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-lila-600 text-white font-medium rounded-xl hover:bg-lila-700 transition-colors"
          >
            <Scissors className="w-5 h-5" />
            Reservar turno
          </Link>
        </div>
      </div>
    </div>
  );
}
