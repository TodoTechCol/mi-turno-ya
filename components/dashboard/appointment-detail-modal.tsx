"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";
import { Phone, Clock, Scissors, MessageCircle } from "lucide-react";
import type { AppointmentWithDetails } from "@/types/app.types";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/calendar-links";
import StatusUpdater from "./status-updater";
import Modal from "./modal";
import DatePicker from "@/components/booking/date-picker";
import TimeSlotGrid from "@/components/booking/time-slot-grid";

interface Props {
  appointment: AppointmentWithDetails;
  timezone: string;
  onClose: () => void;
}

export default function AppointmentDetailModal({ appointment, timezone, onClose }: Props) {
  const router = useRouter();
  const [rescheduling, setRescheduling] = useState(false);
  const [pickedDate, setPickedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const dateLabel = formatInTimeZone(new Date(appointment.start_datetime), timezone, "EEEE d 'de' MMMM", {
    locale: es,
  });
  const timeLabel = formatInTimeZone(new Date(appointment.start_datetime), timezone, "HH:mm");

  const whatsappUrl = buildWhatsAppUrl(
    appointment.client_phone,
    `Hola ${appointment.client_name.split(" ")[0]}! Te escribo por tu turno del ${dateLabel} a las ${timeLabel}.`
  );

  async function handlePickTime(time: string) {
    if (!pickedDate) return;
    setLoading(true);
    try {
      const [hh, mm] = time.split(":");
      const dateStr = `${pickedDate.getFullYear()}-${String(pickedDate.getMonth() + 1).padStart(2, "0")}-${String(
        pickedDate.getDate()
      ).padStart(2, "0")}`;
      const startISO = fromZonedTime(`${dateStr}T${hh}:${mm}:00`, timezone).toISOString();

      const res = await fetch(`/api/appointments/${appointment.id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start_datetime: startISO }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "No se pudo reprogramar");
      }

      toast.success("Turno reprogramado");
      router.refresh();
      onClose();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "No se pudo reprogramar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Ficha del turno" onClose={onClose}>
      <div className="space-y-3 text-sm">
        <div>
          <p className="font-semibold text-pizarra-900">{appointment.client_name}</p>
          <div className="flex items-center gap-1.5 text-xs text-pizarra-500 mt-0.5">
            <Phone className="w-3.5 h-3.5" />
            {appointment.client_phone}
          </div>
        </div>

        <div className="flex items-center gap-2 text-pizarra-700">
          <Clock className="w-4 h-4 text-lila-500 shrink-0" />
          <span className="capitalize">{dateLabel}</span> · {timeLabel} hs
        </div>
        <div className="flex items-center gap-2 text-pizarra-700">
          <Scissors className="w-4 h-4 text-lila-500 shrink-0" />
          {appointment.service.name} · {formatDuration(appointment.service.duration_minutes)} ·{" "}
          {formatCurrency(appointment.service.price)}
        </div>

        {appointment.notes && (
          <p className="text-xs text-pizarra-400 italic bg-pizarra-50 rounded-lg p-2">"{appointment.notes}"</p>
        )}

        <StatusUpdater appointmentId={appointment.id} currentStatus={appointment.status} />

        <div className="flex gap-2 pt-1">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#25D366]/10 text-[#1a9e4e] text-xs font-medium rounded-lg hover:bg-[#25D366]/20 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </a>
          )}
          {!rescheduling && (
            <button
              onClick={() => setRescheduling(true)}
              className="flex-1 py-2 border border-pizarra-200 text-pizarra-700 text-xs font-medium rounded-lg hover:bg-pizarra-50 transition-colors"
            >
              Reprogramar
            </button>
          )}
        </div>

        {rescheduling && (
          <div className="pt-2 border-t border-pizarra-100">
            {!pickedDate ? (
              <DatePicker onSelect={setPickedDate} />
            ) : loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-lila-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <button
                  onClick={() => setPickedDate(null)}
                  className="text-xs text-pizarra-400 hover:text-pizarra-700 mb-2"
                >
                  ← Elegir otra fecha
                </button>
                <TimeSlotGrid
                  professionalId={appointment.professional_id}
                  serviceId={appointment.service_id}
                  date={pickedDate}
                  excludeAppointmentId={appointment.id}
                  onSelect={handlePickTime}
                />
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
