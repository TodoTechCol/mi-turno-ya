"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { AppointmentStatus } from "@/types/app.types";
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_NEXT_STATUSES } from "@/types/app.types";

interface Props {
  appointmentId: string;
  currentStatus: AppointmentStatus;
}

export default function StatusUpdater({ appointmentId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const nextStatuses = APPOINTMENT_NEXT_STATUSES[currentStatus];
  if (nextStatuses.length === 0) return null;

  async function handleUpdate(status: AppointmentStatus) {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointment_id: appointmentId, status }),
      });

      if (!res.ok) throw new Error("Error al actualizar");

      toast.success(`Turno marcado como ${APPOINTMENT_STATUS_LABELS[status]}`);
      router.refresh();
    } catch {
      toast.error("No se pudo actualizar el turno");
    } finally {
      setLoading(false);
    }
  }

  const buttonStyles: Record<string, string> = {
    confirmed: "bg-status-info/10 text-status-info hover:bg-status-info/20",
    completed: "bg-status-success/10 text-status-success hover:bg-status-success/20",
    cancelled: "bg-pizarra-50 text-pizarra-600 hover:bg-pizarra-100",
    no_show: "bg-status-danger/10 text-status-danger hover:bg-status-danger/20",
  };

  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {nextStatuses.map((status) => (
        <button
          key={status}
          onClick={() => handleUpdate(status)}
          disabled={loading}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${buttonStyles[status] ?? "bg-pizarra-50 text-pizarra-600 hover:bg-pizarra-100"}`}
        >
          {APPOINTMENT_STATUS_LABELS[status]}
        </button>
      ))}
    </div>
  );
}
