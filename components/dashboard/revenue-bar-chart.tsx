import { formatCurrency } from "@/lib/utils";

interface Row {
  name: string;
  revenue: number;
}

interface Props {
  rows: Row[];
}

/**
 * Comparación de magnitud (ingresos por profesional) — un solo hue
 * secuencial, el largo de la barra es lo único que codifica el valor
 * (ver skill de dataviz: "compare magnitude -> bar, sequential one hue").
 * Nombre y valor van afuera de la barra para no arriesgar que el texto
 * no entre.
 */
export default function RevenueBarChart({ rows }: Props) {
  if (rows.length === 0) {
    return <p className="text-sm text-pizarra-400 py-6 text-center">Sin datos en este período.</p>;
  }

  const max = Math.max(...rows.map((r) => r.revenue), 1);

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.name}>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-sm font-medium text-pizarra-700 truncate pr-2">{row.name}</span>
            <span className="text-sm font-semibold text-pizarra-900 shrink-0">{formatCurrency(row.revenue)}</span>
          </div>
          <div className="h-6 bg-pizarra-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-lila-500 rounded-full transition-all"
              style={{ width: `${Math.max((row.revenue / max) * 100, row.revenue > 0 ? 3 : 0)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
