import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getAllOrganizations } from "@/services/organizations.service";

function statusOf(org: { is_active: boolean; approved_at: string | null }) {
  if (org.is_active) return { label: "Activa", className: "text-status-success" };
  if (!org.approved_at) return { label: "Pendiente de aprobación", className: "text-status-warning" };
  return { label: "Inactiva", className: "text-pizarra-400" };
}

export default async function SuperAdminPage() {
  const organizations = await getAllOrganizations();
  const pendingCount = organizations.filter((o) => !o.is_active && !o.approved_at).length;

  // Pendientes de aprobación primero — es la cola accionable real del panel.
  const sorted = [...organizations].sort((a, b) => {
    const aPending = !a.is_active && !a.approved_at ? 0 : 1;
    const bPending = !b.is_active && !b.approved_at ? 0 : 1;
    return aPending - bPending;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-pizarra-900">Organizaciones</h1>
        <p className="text-sm text-pizarra-400">
          {organizations.length} organización(es) registrada(s)
          {pendingCount > 0 && (
            <span className="text-status-warning font-medium"> · {pendingCount} pendiente(s) de aprobación</span>
          )}
        </p>
      </div>

      {organizations.length === 0 ? (
        <p className="text-pizarra-400 text-sm">No hay organizaciones registradas todavía.</p>
      ) : (
        <div className="bg-white rounded-xl border border-pizarra-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-pizarra-50 text-pizarra-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 font-medium">Slug</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="text-left px-4 py-3 font-medium">Creada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pizarra-50">
              {sorted.map((org) => {
                const status = statusOf(org);
                return (
                  <tr key={org.id} className="hover:bg-pizarra-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-pizarra-900">
                      <Link
                        href={`/super-admin/organizations/${org.id}`}
                        className="hover:text-lila-600 block"
                      >
                        {org.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-pizarra-500">{org.slug}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${status.className}`}>{status.label}</span>
                    </td>
                    <td className="px-4 py-3 text-pizarra-400">
                      {format(new Date(org.created_at), "d MMM yyyy", { locale: es })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
