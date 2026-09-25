"use client";

import { useState } from "react";
import type { CreateAppointmentInput } from "@/schemas/appointment.schema";
import type { Appointment } from "@/types/app.types";

interface UseAppointmentResult {
  createAppointment: (input: CreateAppointmentInput) => Promise<Appointment | null>;
  loading: boolean;
  error: string | null;
}

export function useAppointment(): UseAppointmentResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createAppointment(
    input: CreateAppointmentInput
  ): Promise<Appointment | null> {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Error al crear el turno");
      }

      return data.appointment as Appointment;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { createAppointment, loading, error };
}
