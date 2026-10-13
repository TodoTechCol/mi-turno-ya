"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Range = "day" | "week" | "month" | "all";

const LABELS: Record<Range, string> = { day: "Hoy", week: "Semana", month: "Mes", all: "Todo" };
const RANGES: Range[] = ["day", "week", "month", "all"];

interface Props {
  range: Range;
  prevHref: string | null;
  nextHref: string | null;
  switchHrefs: Record<Range, string>;
}

/**
 * Mismo patrón que AppointmentsNav: navegación "dura" a propósito —
 * el router cliente de Next en esta versión no aplica la transición
 * cuando solo cambian searchParams.
 */
export default function ReportsNav({ range, prevHref, nextHref, switchHrefs }: Props) {
  function go(href: string) {
    window.location.href = href;
  }

  return (
    <div className="flex items-center gap-1.5">
      {prevHref && (
        <button
          onClick={() => go(prevHref)}
          className="p-1.5 rounded-lg border border-pizarra-200 text-pizarra-500 hover:bg-pizarra-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      {nextHref && (
        <button
          onClick={() => go(nextHref)}
          className="p-1.5 rounded-lg border border-pizarra-200 text-pizarra-500 hover:bg-pizarra-50 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      <div className="flex rounded-lg border border-pizarra-200 overflow-hidden ml-1">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => go(switchHrefs[r])}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              range === r ? "bg-lila-50 text-lila-600" : "text-pizarra-500 hover:bg-pizarra-50"
            } ${r !== "day" ? "border-l border-pizarra-200" : ""}`}
          >
            {LABELS[r]}
          </button>
        ))}
      </div>
    </div>
  );
}
