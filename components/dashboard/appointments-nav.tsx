"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type View = "day" | "week" | "month" | "all";

const VIEW_LABELS: Record<View, string> = { day: "Día", week: "Semana", month: "Mes", all: "Todos" };
const VIEWS: View[] = ["day", "week", "month", "all"];

interface Props {
  view: View;
  prevHref: string | null;
  nextHref: string | null;
  switchHrefs: Record<View, string>;
}

/**
 * Navegación de día/semana/mes/todos. Client component con
 * router.push() en vez de <Link> — con <Link> plano, clicks entre
 * URLs que solo difieren en searchParams se quedaban pegados en la
 * vista anterior (el server respondía bien, pero el router de Next no
 * aplicaba la transición). router.push + router.refresh es el camino
 * confiable para este patrón.
 */
export default function AppointmentsNav({ view, prevHref, nextHref, switchHrefs }: Props) {
  // Navegación "dura" (recarga completa) a propósito: el router
  // cliente de Next en esta versión se queda pegado en la URL
  // anterior cuando solo cambian searchParams (confirmado: el server
  // responde bien, pero el router no aplica la transición ni con
  // <Link> ni con router.push). window.location es más lento pero
  // 100% confiable para este caso.
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
        {VIEWS.map((v) => (
          <button
            key={v}
            onClick={() => go(switchHrefs[v])}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              view === v ? "bg-lila-50 text-lila-600" : "text-pizarra-500 hover:bg-pizarra-50"
            } ${v !== "day" ? "border-l border-pizarra-200" : ""}`}
          >
            {VIEW_LABELS[v]}
          </button>
        ))}
      </div>
    </div>
  );
}
