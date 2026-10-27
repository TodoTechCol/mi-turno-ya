"use client";

import { useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { Eye, CalendarClock } from "lucide-react";
import type { AppointmentWithDetails } from "@/types/app.types";
import { formatDuration, cn } from "@/lib/utils";
import StatusBadge from "./status-badge";
import AppointmentDetailModal from "./appointment-detail-modal";

interface Props {
  appointment: AppointmentWithDetails;
  timezone: string;
  showDate?: boolean;
}

// Color de servicio puramente cosmético (no hay un campo de color en
// la tabla services todavía) — determinístico por id para que el
// mismo servicio siempre se vea con el mismo punto de color.
const DOT_COLORS = [
  "bg-lila-500",
  "bg-status-info",
  "bg-status-success",
  "bg-status-warning",
  "bg-status-danger",
  "bg-pizarra-400",
];

function colorForService(serviceId: string) {
  let hash = 0;
  for (let i = 0; i < serviceId.length; i++) hash = (hash * 31 + serviceId.charCodeAt(i)) >>> 0;
  return DOT_COLORS[hash % DOT_COLORS.length];
}

export default function AppointmentRow({ appointment: apt, timezone, showDate = false }: Props) {
  const [modalMode, setModalMode] = useState<null | "view" | "reschedule">(null);

  const timeLabel = formatInTimeZone(new Date(apt.start_datetime), timezone, "HH:mm");
  const dateLabel = showDate
    ? formatInTimeZone(new Date(apt.start_datetime), timezone, "d MMM", { locale: es })
    : null;
  const isClosed = apt.status === "cancelled" || apt.status === "completed" || apt.status === "no_show";

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-3 sm:gap-4 bg-white rounded-xl border border-pizarra-100 px-3 sm:px-4 py-3 hover:shadow-sm transition-shadow",
          apt.status === "cancelled" && "opacity-60"
        )}
      >
        <div className="shrink-0 w-14 sm:w-16 text-center bg-lila-50 rounded-lg py-2">
          <p className="text-sm font-semibold text-lila-700 leading-tight">{timeLabel}</p>
          {dateLabel && <p className="text-[10px] text-lila-500 leading-tight capitalize">{dateLabel}</p>}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-pizarra-900 text-sm truncate">{apt.client_name}</p>
            <span className="inline-flex items-center gap-1 text-xs text-pizarra-500 min-w-0">
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", colorForService(apt.service.id))} />
              <span className="truncate">{apt.service.name}</span>
            </span>
          </div>
          <p className="text-xs text-pizarra-400 mt-0.5">
            {apt.professional.name} · {formatDuration(apt.service.duration_minutes)}
          </p>
        </div>

        <StatusBadge status={apt.status} className="shrink-0" />

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => setModalMode("view")}
            title="Ver ficha"
            className="p-2 rounded-lg text-pizarra-400 hover:text-lila-600 hover:bg-lila-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          {!isClosed && (
            <button
              onClick={() => setModalMode("reschedule")}
              title="Reprogramar"
              className="p-2 rounded-lg text-pizarra-400 hover:text-lila-600 hover:bg-lila-50 transition-colors"
            >
              <CalendarClock className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {modalMode && (
        <AppointmentDetailModal
          appointment={apt}
          timezone={timezone}
          initialRescheduling={modalMode === "reschedule"}
          onClose={() => setModalMode(null)}
        />
      )}
    </>
  );
}
