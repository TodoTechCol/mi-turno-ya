import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getAllOrganizations } from "@/services/organizations.service";

export default async function SuperAdminPage() {
  const organizations = await getAllOrganizations();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-pizarra-900">Organizaciones</h1>
        <p className="text-sm text-pizarra-400">
          {organizations.length} organización(es) registrada(s)
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
              {organizations.map((org) => (
                <tr key={org.id}>
                  <td className="px-4 py-3 font-medium text-pizarra-900">{org.name}</td>
                  <td className="px-4 py-3 text-pizarra-500">{org.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        org.is_active
                          ? "text-status-success font-medium"
                          : "text-pizarra-400 font-medium"
                      }
                    >
                      {org.is_active ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-pizarra-400">
                    {format(new Date(org.created_at), "d MMM yyyy", { locale: es })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
