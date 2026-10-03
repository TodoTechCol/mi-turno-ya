"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Schedule } from "@/types/app.types";

interface Props {
  professionalId: string;
  schedules: Schedule[];
}

const DAY_LABELS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

interface DayState {
  is_active: boolean;
  start_time: string;
  end_time: string;
}

export default function ScheduleEditor({ professionalId, schedules }: Props) {
  const [days, setDays] = useState<DayState[]>(() =>
    Array.from({ length: 7 }, (_, day) => {
      const existing = schedules.find((s) => s.day_of_week === day);
      return {
        is_active: existing?.is_active ?? false,
        start_time: existing?.start_time?.slice(0, 5) ?? "09:00",
        end_time: existing?.end_time?.slice(0, 5) ?? "18:00",
      };
    })
  );
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  function update(day: number, patch: Partial<DayState>) {
    setDays((prev) => prev.map((d, i) => (i === day ? { ...d, ...patch } : d)));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/professionals/${professionalId}/schedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          days: days.map((d, day_of_week) => ({ day_of_week, ...d })),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "No se pudo guardar el horario");
      }
      toast.success("Horario actualizado");
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar el horario");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-pizarra-100 p-4">
      <h2 className="font-medium text-pizarra-900 text-sm mb-3">Horario semanal</h2>
      <div className="space-y-2">
        {days.map((day, i) => (
          <div key={i} className="flex items-center gap-2 sm:gap-3">
            <label className="flex items-center gap-2 w-24 sm:w-28 text-xs sm:text-sm text-pizarra-700 shrink-0">
              <input
                type="checkbox"
                checked={day.is_active}
                onChange={(e) => update(i, { is_active: e.target.checked })}
                className="rounded border-pizarra-300 text-lila-600 focus:ring-lila-500 shrink-0"
              />
              {DAY_LABELS[i]}
            </label>
            <input
              type="time"
              value={day.start_time}
              onChange={(e) => update(i, { start_time: e.target.value })}
              disabled={!day.is_active}
              className="px-2 py-1.5 border border-pizarra-200 rounded-lg text-xs sm:text-sm disabled:opacity-40 disabled:bg-pizarra-50"
            />
            <span className="text-pizarra-400 text-xs sm:text-sm">a</span>
            <input
              type="time"
              value={day.end_time}
              onChange={(e) => update(i, { end_time: e.target.value })}
              disabled={!day.is_active}
              className="px-2 py-1.5 border border-pizarra-200 rounded-lg text-xs sm:text-sm disabled:opacity-40 disabled:bg-pizarra-50"
            />
          </div>
        ))}
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="mt-4 px-4 py-2 bg-lila-600 text-white text-sm font-medium rounded-lg hover:bg-lila-700 transition-colors disabled:opacity-50"
      >
        {saving ? "Guardando..." : "Guardar horario"}
      </button>
    </div>
  );
}
