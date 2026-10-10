"use client";

import { useState } from "react";
import { toast } from "sonner";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { Calendar, Clock, MapPin, User, Scissors } from "lucide-react";
import type { AppointmentStatus } from "@/types/app.types";
import { formatCurrency, formatDuration } from "@/lib/utils";
import StatusBadge from "@/components/dashboard/status-badge";
import DatePicker from "@/components/booking/date-picker";
import TimeSlotGrid from "@/components/booking/time-slot-grid";

interface Props {
  token: string;
  appointmentId: string;
  organizationName: string;
  organizationTimezone: string;
  professionalId: string;
  professionalName: string;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  servicePrice: number;
  branchName: string | null;
  address: string | null;
  initialStatus: AppointmentStatus;
  initialStartISO: string;
  initialDateLabel: string;
  initialTimeLabel: string;
}

type Mode = "view" | "confirm-cancel" | "pick-date" | "pick-time";

const MANAGEABLE: AppointmentStatus[] = ["pending", "confirmed"];

export default function AppointmentManagePanel({
  token,
  appointmentId,
  organizationName,
  organizationTimezone,
  professionalId,
  professionalName,
  serviceId,
  serviceName,
  serviceDuration,
  servicePrice,
  branchName,
  address,
  initialStatus,
  initialStartISO,
  initialDateLabel,
  initialTimeLabel,
}: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [dateLabel, setDateLabel] = useState(initialDateLabel);
  const [timeLabel, setTimeLabel] = useState(initialTimeLabel);
  const [mode, setMode] = useState<Mode>("view");
  const [pickedDate, setPickedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const canManage = MANAGEABLE.includes(status);

  async function handleCancel() {
    setLoading(true);
    try {
      const res = await fetch(`/api/public/appointments/${token}/cancel`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "No se pudo cancelar el turno");
      }
      setStatus("cancelled");
      setMode("view");
      toast.success("Turno cancelado");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "No se pudo cancelar el turno");
    } finally {
      setLoading(false);
    }
  }

  async function handlePickTime(time: string) {
    if (!pickedDate) return;
    setLoading(true);
    try {
      const [hh, mm] = time.split(":").map(Number);
      const newStart = new Date(pickedDate);
      newStart.setHours(hh, mm, 0, 0);

      const res = await fetch(`/api/public/appointments/${token}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start_datetime: newStart.toISOString() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "No se pudo reprogramar el turno");
      }

      setDateLabel(formatInTimeZone(newStart, organizationTimezone, "EEEE d 'de' MMMM", { locale: es }));
      setTimeLabel(formatInTimeZone(newStart, organizationTimezone, "HH:mm"));
      setStatus("pending");
      setMode("view");
      toast.success("Turno reprogramado — el negocio lo va a revisar de nuevo");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "No se pudo reprogramar el turno");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-pizarra-100 shadow-sm p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-xs text-pizarra-400">{organizationName}</p>
          <h1 className="text-lg font-semibold text-pizarra-900">Tu turno</h1>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-pizarra-700">
          <Calendar className="w-4 h-4 text-lila-500 shrink-0" />
          <span className="capitalize">{dateLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-pizarra-700">
          <Clock className="w-4 h-4 text-lila-500 shrink-0" />
          {timeLabel} hs · {formatDuration(serviceDuration)}
        </div>
        <div className="flex items-center gap-2 text-pizarra-700">
          <Scissors className="w-4 h-4 text-lila-500 shrink-0" />
          {serviceName} · {formatCurrency(servicePrice)}
        </div>
        <div className="flex items-center gap-2 text-pizarra-700">
          <User className="w-4 h-4 text-lila-500 shrink-0" />
          {professionalName}
        </div>
        {(branchName || address) && (
          <div className="flex items-center gap-2 text-pizarra-700">
            <MapPin className="w-4 h-4 text-lila-500 shrink-0" />
            {branchName ? `${branchName}${address ? ` — ${address}` : ""}` : address}
          </div>
        )}
      </div>

      {!canManage && (
        <p className="mt-5 text-sm text-pizarra-400 text-center">
          {status === "cancelled" && "Este turno fue cancelado."}
          {status === "completed" && "Este turno ya se completó."}
          {status === "no_show" && "Este turno quedó registrado como no asistido."}
        </p>
      )}

      {canManage && mode === "view" && (
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => setMode("pick-date")}
            className="flex-1 py-2.5 border border-pizarra-200 text-pizarra-700 text-sm font-medium rounded-lg hover:bg-pizarra-50 transition-colors"
          >
            Reprogramar
          </button>
          <button
            onClick={() => setMode("confirm-cancel")}
            className="flex-1 py-2.5 border border-status-danger/30 text-status-danger text-sm font-medium rounded-lg hover:bg-status-danger/5 transition-colors"
          >
            Cancelar turno
          </button>
        </div>
      )}

      {mode === "confirm-cancel" && (
        <div className="mt-5 bg-status-danger/5 border border-status-danger/20 rounded-xl p-4">
          <p className="text-sm text-pizarra-700 mb-3">¿Seguro que querés cancelar este turno?</p>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 py-2 bg-status-danger text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Cancelando..." : "Sí, cancelar"}
            </button>
            <button
              onClick={() => setMode("view")}
              disabled={loading}
              className="px-4 py-2 text-sm text-pizarra-500 hover:text-pizarra-900"
            >
              Volver
            </button>
          </div>
        </div>
      )}

      {mode === "pick-date" && (
        <div className="mt-5">
          <button onClick={() => setMode("view")} className="text-xs text-pizarra-400 hover:text-pizarra-700 mb-2">
            ← Volver
          </button>
          <DatePicker
            onSelect={(d) => {
              setPickedDate(d);
              setMode("pick-time");
            }}
          />
        </div>
      )}

      {mode === "pick-time" && pickedDate && (
        <div className="mt-5">
          <button onClick={() => setMode("pick-date")} className="text-xs text-pizarra-400 hover:text-pizarra-700 mb-2">
            ← Elegir otra fecha
          </button>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-lila-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <TimeSlotGrid
              professionalId={professionalId}
              serviceId={serviceId}
              date={pickedDate}
              excludeAppointmentId={appointmentId}
              onSelect={handlePickTime}
            />
          )}
        </div>
      )}
    </div>
  );
}
