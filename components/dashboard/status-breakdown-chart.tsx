interface Row {
  name: string;
  completed: number;
  cancelled: number;
  noShow: number;
}

interface Props {
  rows: Row[];
}

const SEGMENTS: { key: keyof Pick<Row, "completed" | "cancelled" | "noShow">; label: string; className: string }[] = [
  { key: "completed", label: "Completados", className: "bg-status-success" },
  { key: "cancelled", label: "Cancelados", className: "bg-status-danger" },
  { key: "noShow", label: "No-show", className: "bg-status-warning" },
];

/**
 * Parte-del-todo por profesional, coloreado por ESTADO (no por serie) —
 * reusa los mismos colores de estado que ya están en toda la app
 * (APPOINTMENT_STATUS_COLORS), nunca "serie 4 de 8". Leyenda siempre
 * presente porque son 3 series.
 */
export default function StatusBreakdownChart({ rows }: Props) {
  const withActivity = rows.filter((r) => r.completed + r.cancelled + r.noShow > 0);

  if (withActivity.length === 0) {
    return <p className="text-sm text-pizarra-400 py-6 text-center">Sin turnos resueltos en este período.</p>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        {SEGMENTS.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 text-xs text-pizarra-500">
            <span className={`w-2.5 h-2.5 rounded-full ${s.className}`} />
            {s.label}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {withActivity.map((row) => {
          const total = row.completed + row.cancelled + row.noShow;
          return (
            <div key={row.name}>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-sm font-medium text-pizarra-700 truncate pr-2">{row.name}</span>
                <span className="text-xs text-pizarra-400 shrink-0">{total} turno(s)</span>
              </div>
              <div className="h-5 flex gap-0.5 rounded-full overflow-hidden bg-pizarra-50">
                {SEGMENTS.map((s) => {
                  const value = row[s.key];
                  if (value === 0) return null;
                  return (
                    <div
                      key={s.key}
                      className={`h-full ${s.className}`}
                      style={{ width: `${(value / total) * 100}%` }}
                      title={`${s.label}: ${value}`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
