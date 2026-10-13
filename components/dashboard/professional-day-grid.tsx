"use client";

import { useState } from "react";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { User } from "lucide-react";
import type { AppointmentWithDetails, Professional, Schedule, ScheduleBlock, Service } from "@/types/app.types";
import { APPOINTMENT_STATUS_COLORS } from "@/types/app.types";
import { formatCurrency, cn } from "@/lib/utils";
import AppointmentDetailModal from "./appointment-detail-modal";
import NewAppointmentModal from "./new-appointment-modal";

interface Props {
  organizationId: string;
  dateStr: string; // "YYYY-MM-DD"
  timezone: string;
  professionals: Professional[];
  schedules: Schedule[]; // una fila por profesional, ya filtradas al día elegido
  blocks: ScheduleBlock[];
  appointments: AppointmentWithDetails[];
  services: Service[];
}

const PX_PER_MIN = 1.1;
const DEFAULT_RANGE: [number, number] = [8 * 60, 20 * 60]; // 08:00–20:00, fallback si nadie tiene horario cargado

function hhmmToMinutes(hhmmss: string): number {
  const [h, m] = hhmmss.split(":").map(Number);
  return h * 60 + m;
}

function minutesInTz(iso: string, tz: string): number {
  const [h, m] = formatInTimeZone(new Date(iso), tz, "HH:mm").split(":").map(Number);
  return h * 60 + m;
}

export default function ProfessionalDayGrid({
  organizationId,
  dateStr,
  timezone,
  professionals,
  schedules,
  blocks,
  appointments,
  services,
}: Props) {
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [draft, setDraft] = useState<{ professionalId: string; startISO: string } | null>(null);

  const schedulesByPro = new Map(schedules.map((s) => [s.professional_id, s]));
  const scheduledMinutes = schedules.map((s) => [hhmmToMinutes(s.start_time), hhmmToMinutes(s.end_time)]);

  const rangeStart = scheduledMinutes.length ? Math.min(...scheduledMinutes.map((r) => r[0])) : DEFAULT_RANGE[0];
  const rangeEnd = scheduledMinutes.length ? Math.max(...scheduledMinutes.map((r) => r[1])) : DEFAULT_RANGE[1];
  const totalMinutes = Math.max(rangeEnd - rangeStart, 60);
  const gridHeight = totalMinutes * PX_PER_MIN;

  const hourMarks: number[] = [];
  for (let t = Math.ceil(rangeStart / 60) * 60; t <= rangeEnd; t += 60) hourMarks.push(t);

  function minutesToY(minutes: number) {
    return (minutes - rangeStart) * PX_PER_MIN;
  }

  function handleColumnClick(professionalId: string, e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const rawMinutes = rangeStart + offsetY / PX_PER_MIN;
    const snapped = Math.round(rawMinutes / 15) * 15;
    const hh = String(Math.floor(snapped / 60)).padStart(2, "0");
    const mm = String(snapped % 60).padStart(2, "0");
    const startISO = fromZonedTime(`${dateStr}T${hh}:${mm}:00`, timezone).toISOString();
    setDraft({ professionalId, startISO });
  }

  if (professionals.length === 0) {
    return (
      <p className="text-center text-pizarra-400 text-sm py-12">
        No hay profesionales activos para mostrar.
      </p>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-pizarra-100 overflow-hidden">
      {scheduledMinutes.length === 0 && (
        <div className="bg-status-warning/10 text-status-warning text-xs px-4 py-2 border-b border-status-warning/20">
          Ningún profesional tiene horario cargado para este día — mostrando un rango por defecto (08:00–20:00).
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="flex min-w-max">
          {/* Eje de horas */}
          <div className="w-14 shrink-0 border-r border-pizarra-100 pt-12">
            <div className="relative" style={{ height: gridHeight }}>
              {hourMarks.map((t) => (
                <div
                  key={t}
                  className="absolute -translate-y-1/2 text-[11px] text-pizarra-400 pr-2 text-right w-14"
                  style={{ top: minutesToY(t) }}
                >
                  {String(Math.floor(t / 60)).padStart(2, "0")}:00
                </div>
              ))}
            </div>
          </div>

          {/* Columnas por profesional */}
          {professionals.map((pro) => {
            const schedule = schedulesByPro.get(pro.id) ?? null;
            const proStart = schedule ? hhmmToMinutes(schedule.start_time) : null;
            const proEnd = schedule ? hhmmToMinutes(schedule.end_time) : null;
            const proBlocks = blocks.filter((b) => b.professional_id === pro.id);
            const proAppointments = appointments.filter((a) => a.professional_id === pro.id);

            return (
              <div key={pro.id} className="w-56 shrink-0 border-r border-pizarra-100 last:border-r-0">
                {/* Header de la columna */}
                <div className="h-12 flex items-center gap-2 px-3 border-b border-pizarra-100 sticky top-0 bg-white z-10">
                  <div className="w-7 h-7 rounded-full bg-pizarra-100 flex items-center justify-center shrink-0">
                    {pro.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pro.avatar_url} alt={pro.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-pizarra-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-pizarra-900 truncate">{pro.name}</p>
                    {!schedule && <p className="text-[10px] text-status-warning">Sin horario cargado</p>}
                  </div>
                </div>

                {/* Área clickeable del día */}
                <div
                  className="relative cursor-pointer"
                  style={{ height: gridHeight, backgroundSize: `100% ${60 * PX_PER_MIN}px` }}
                  onClick={(e) => handleColumnClick(pro.id, e)}
                >
                  {/* Líneas de hora */}
                  {hourMarks.map((t) => (
                    <div
                      key={t}
                      className="absolute left-0 right-0 border-t border-pizarra-50"
                      style={{ top: minutesToY(t) }}
                    />
                  ))}

                  {/* Fuera de horario laboral */}
                  {schedule && proStart !== null && proStart > rangeStart && (
                    <div
                      className="absolute left-0 right-0 top-0 bg-pizarra-50/70 pointer-events-none"
                      style={{ height: minutesToY(proStart) }}
                    />
                  )}
                  {schedule && proEnd !== null && proEnd < rangeEnd && (
                    <div
                      className="absolute left-0 right-0 bottom-0 bg-pizarra-50/70 pointer-events-none"
                      style={{ height: gridHeight - minutesToY(proEnd) }}
                    />
                  )}

                  {/* Bloqueos (vacaciones, descansos) */}
                  {proBlocks.map((block) => {
                    const start = minutesInTz(block.start_datetime, timezone);
                    const end = minutesInTz(block.end_datetime, timezone);
                    return (
                      <div
                        key={block.id}
                        className="absolute left-0.5 right-0.5 rounded bg-pizarra-200/60 border border-pizarra-300 flex items-center justify-center pointer-events-none"
                        style={{ top: minutesToY(Math.max(start, rangeStart)), height: Math.max(minutesToY(end) - minutesToY(Math.max(start, rangeStart)), 18) }}
                      >
                        <span className="text-[10px] text-pizarra-500 px-1 truncate">{block.reason || "Bloqueado"}</span>
                      </div>
                    );
                  })}

                  {/* Turnos */}
                  {proAppointments.map((apt) => {
                    const start = minutesInTz(apt.start_datetime, timezone);
                    const end = minutesInTz(apt.end_datetime, timezone);
                    const top = minutesToY(start);
                    const height = Math.max(minutesToY(end) - top, 30);
                    const isCancelled = apt.status === "cancelled";

                    return (
                      <button
                        key={apt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppointment(apt);
                        }}
                        className={cn(
                          "absolute left-1 right-1 rounded-lg border px-2 py-1 text-left overflow-hidden transition-shadow hover:shadow-md",
                          APPOINTMENT_STATUS_COLORS[apt.status],
                          isCancelled && "opacity-50 line-through"
                        )}
                        style={{ top, height }}
                      >
                        <p className="text-[11px] font-semibold truncate leading-tight">{apt.client_name}</p>
                        <p className="text-[10px] truncate leading-tight opacity-80">
                          {apt.service.name} · {formatCurrency(apt.service.price)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          timezone={timezone}
          onClose={() => setSelectedAppointment(null)}
        />
      )}

      {draft && (
        <NewAppointmentModal
          organizationId={organizationId}
          professionalId={draft.professionalId}
          professionalName={professionals.find((p) => p.id === draft.professionalId)?.name ?? ""}
          startISO={draft.startISO}
          timezone={timezone}
          services={services}
          onClose={() => setDraft(null)}
        />
      )}
    </div>
  );
}
