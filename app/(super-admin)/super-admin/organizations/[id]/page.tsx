import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Users, Tag, CalendarDays, Building2, Contact } from "lucide-react";
import { getOrganizationDetail } from "@/services/admin-organizations.service";
import OrganizationActions from "@/components/super-admin/organization-actions";
import AdminResetPassword from "@/components/super-admin/admin-reset-password";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrganizationDetailPage({ params }: Props) {
  const { id } = await params;
  const detail = await getOrganizationDetail(id);

  if (!detail) notFound();

  const { organization: org, admins, counts } = detail;

  const countCards = [
    { label: "Profesionales", value: counts.professionals, icon: Users },
    { label: "Servicios", value: counts.services, icon: Tag },
    { label: "Turnos", value: counts.appointments, icon: CalendarDays },
    { label: "Sucursales", value: counts.branches, icon: Building2 },
    { label: "Clientes", value: counts.customers, icon: Contact },
  ];

  return (
    <div>
      <Link
        href="/super-admin"
        className="inline-flex items-center gap-1.5 text-sm text-pizarra-500 hover:text-pizarra-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Organizaciones
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-pizarra-900">{org.name}</h1>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                org.is_active ? "bg-status-success/10 text-status-success" : "bg-pizarra-100 text-pizarra-500"
              }`}
            >
              {org.is_active ? "Activa" : "Inactiva"}
            </span>
          </div>
          <p className="text-sm text-pizarra-400 mt-0.5">/{org.slug}</p>
        </div>
        <OrganizationActions organizationId={org.id} isActive={org.is_active} organizationName={org.name} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5 mb-6">
        {countCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-pizarra-100 p-4">
            <Icon className="w-4 h-4 text-lila-500 mb-2" />
            <p className="text-xl font-semibold text-pizarra-900">{value}</p>
            <p className="text-xs text-pizarra-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white rounded-xl border border-pizarra-100 p-5">
          <h2 className="text-sm font-semibold text-pizarra-900 mb-3">Datos del registro</h2>
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-pizarra-400">Zona horaria</dt>
              <dd className="text-pizarra-700 text-right">{org.timezone}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-pizarra-400">Teléfono</dt>
              <dd className="text-pizarra-700 text-right">{org.phone || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-pizarra-400">Dirección</dt>
              <dd className="text-pizarra-700 text-right">{org.address || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-pizarra-400">Descripción</dt>
              <dd className="text-pizarra-700 text-right">{org.description || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-pizarra-400">Registrada</dt>
              <dd className="text-pizarra-700 text-right">
                {format(new Date(org.created_at), "d MMM yyyy, HH:mm", { locale: es })}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-pizarra-100 p-5">
          <h2 className="text-sm font-semibold text-pizarra-900 mb-3">
            Administradores ({admins.length})
          </h2>
          {admins.length === 0 ? (
            <p className="text-sm text-pizarra-400">Sin administradores vinculados.</p>
          ) : (
            <ul className="space-y-3">
              {admins.map((a) => (
                <li key={a.userId} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-pizarra-700 truncate">{a.email || "(sin email)"}</span>
                  {a.email && (
                    <AdminResetPassword organizationId={org.id} email={a.email} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
