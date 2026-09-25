"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { TimeSlot } from "@/lib/availability";

interface UseAvailabilityOptions {
  professionalId: string | null;
  serviceId: string | null;
  date: Date | null;
}

export function useAvailability({
  professionalId,
  serviceId,
  date,
}: UseAvailabilityOptions) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!professionalId || !serviceId || !date) {
      setSlots([]);
      return;
    }

    setLoading(true);
    setError(null);

    const dateStr = format(date, "yyyy-MM-dd");
    const params = new URLSearchParams({
      professional_id: professionalId,
      service_id: serviceId,
      date: dateStr,
    });

    fetch(`/api/availability?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error("Error al obtener disponibilidad");
        return r.json();
      })
      .then((data) => setSlots(data.slots ?? []))
      .catch((e) => {
        setError(e.message);
        setSlots([]);
      })
      .finally(() => setLoading(false));
  }, [professionalId, serviceId, date]);

  const availableSlots = slots.filter((s) => s.available);

  return { slots, availableSlots, loading, error };
}
