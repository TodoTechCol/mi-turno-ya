import type { ProfessionalReportRow } from "@/services/reports.service";
import { formatCurrency } from "@/lib/utils";

interface Props {
  rows: ProfessionalReportRow[];
}

export default function ReportsTable({ rows }: Props) {
  if (rows.length === 0) {
    return <p className="text-sm text-pizarra-400 py-6 text-center">Sin datos en este período.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-pizarra-400 border-b border-pizarra-100">
            <th className="font-medium py-2 pr-3">Profesional</th>
            <th className="font-medium py-2 px-3 text-right">Completados</th>
            <th className="font-medium py-2 px-3 text-right">Cancelados</th>
            <th className="font-medium py-2 px-3 text-right">No-show</th>
            <th className="font-medium py-2 px-3 text-right">Ticket promedio</th>
            <th className="font-medium py-2 pl-3 text-right">Ingresos estimados</th>
          </tr>
        </thead>
        <tbody className="[font-variant-numeric:tabular-nums]">
          {rows.map((row) => (
            <tr key={row.professionalId} className="border-b border-pizarra-50 last:border-0">
              <td className="py-2.5 pr-3 font-medium text-pizarra-900">{row.professionalName}</td>
              <td className="py-2.5 px-3 text-right text-status-success">{row.completed}</td>
              <td className="py-2.5 px-3 text-right text-status-danger">{row.cancelled}</td>
              <td className="py-2.5 px-3 text-right text-status-warning">{row.noShow}</td>
              <td className="py-2.5 px-3 text-right text-pizarra-600">
                {row.completed > 0 ? formatCurrency(row.revenue / row.completed) : "—"}
              </td>
              <td className="py-2.5 pl-3 text-right font-semibold text-pizarra-900">{formatCurrency(row.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
