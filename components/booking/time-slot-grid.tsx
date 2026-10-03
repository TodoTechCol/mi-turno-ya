"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { TimeSlot } from "@/lib/availability";

interface Props {
  professionalId: string;
  serviceId: string;
  date: Date;
  onSelect: (time: string) => void;
}

export default function TimeSlotGrid({
  professionalId,
  serviceId,
  date,
  onSelect,
}: Props) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const dateStr = format(date, "yyyy-MM-dd");

  useEffect(() => {
    setLoading(true);
    setSelected(null);

    const params = new URLSearchParams({
      professional_id: professionalId,
      service_id: serviceId,
      date: dateStr,
    });

    fetch(`/api/availability?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots ?? []);
      })
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [professionalId, serviceId, dateStr]);

  const availableSlots = slots.filter((s) => s.available);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-lila-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className="text-center py-8 text-pizarra-400">
        <p className="text-sm">No hay horarios disponibles para este día.</p>
        <p className="text-xs mt-1">Probá seleccionando otra fecha.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-pizarra-400 mb-3">
        {availableSlots.length} horario(s) disponible(s)
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {availableSlots.map((slot) => (
          <button
            key={slot.time}
            onClick={() => {
              setSelected(slot.time);
              onSelect(slot.time);
            }}
            className={cn(
              "py-2.5 rounded-xl text-sm font-medium border transition-all",
              selected === slot.time
                ? "bg-lila-600 border-lila-600 text-white"
                : "bg-white border-pizarra-100 text-pizarra-700 hover:border-lila-300 hover:text-lila-600"
            )}
          >
            {slot.time}
          </button>
        ))}
      </div>
    </div>
  );
}
