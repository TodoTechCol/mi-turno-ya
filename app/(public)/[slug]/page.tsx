import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Phone, Scissors, CalendarCheck } from "lucide-react";
import { getOrganizationBySlug } from "@/services/organizations.service";
import { getServicesByOrganization } from "@/services/services.service";
import { formatCurrency } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function OrganizationPublicPage({ params }: Props) {
  const { slug } = await params;
  const organization = await getOrganizationBySlug(slug);

  if (!organization) notFound();

  // Solo para el "desde $X" de abajo — no se lista el catálogo completo
  // acá, eso se ve adentro del flujo de reserva una vez elegida la sede
  // y el profesional.
  const services = await getServicesByOrganization(organization.id);
  const fromPrice = services.length > 0 ? Math.min(...services.map((s) => s.price)) : null;

  return (
    <div className="min-h-screen bg-pizarra-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl border border-pizarra-100 shadow-sm p-8">
          {organization.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={organization.logo_url}
              alt={organization.name}
              className="w-20 h-20 rounded-2xl object-cover mx-auto mb-5"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-lila-600 flex items-center justify-center mx-auto mb-5">
              <Scissors className="w-9 h-9 text-white" />
            </div>
          )}

          <h1 className="text-2xl font-display font-bold text-pizarra-900">{organization.name}</h1>
          {organization.description && (
            <p className="mt-2 text-pizarra-500 text-sm">{organization.description}</p>
          )}

          <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-pizarra-400">
            {organization.address && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {organization.address}
              </span>
            )}
            {organization.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> {organization.phone}
              </span>
            )}
          </div>

          <Link
            href={`/${slug}/booking`}
            className="mt-7 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-lila-600 text-white font-medium rounded-xl hover:bg-lila-700 hover:shadow-md transition-all"
          >
            <CalendarCheck className="w-5 h-5" />
            Reservar turno
          </Link>

          {fromPrice !== null && (
            <p className="mt-3 text-xs text-pizarra-400">Servicios desde {formatCurrency(fromPrice)}</p>
          )}
        </div>

        <p className="mt-6 text-xs text-pizarra-400">Gestionado con Mi Turno Ya</p>
      </div>
    </div>
  );
}
