"use client";

import type { Branch } from "@/types/app.types";

interface Props {
  branches: Branch[];
  selectedId: string;
  baseUrl: string;
}

/**
 * Mismo criterio que AppointmentsNav: navegación dura
 * (window.location) en vez de router — el router cliente de Next en
 * esta versión no aplica bien las transiciones cuando solo cambian
 * searchParams (ver memoria del proyecto).
 */
export default function BranchFilter({ branches, selectedId, baseUrl }: Props) {
  if (branches.length === 0) return null;

  return (
    <select
      value={selectedId}
      onChange={(e) => {
        const url = new URL(baseUrl, window.location.origin);
        if (e.target.value) {
          url.searchParams.set("branch", e.target.value);
        } else {
          url.searchParams.delete("branch");
        }
        window.location.href = url.pathname + url.search;
      }}
      className="px-3 py-1.5 rounded-lg border border-pizarra-200 text-xs font-medium text-pizarra-600 bg-white focus:outline-none focus:ring-2 focus:ring-lila-500"
    >
      <option value="">Todas las sedes</option>
      {branches.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name}
        </option>
      ))}
    </select>
  );
}
