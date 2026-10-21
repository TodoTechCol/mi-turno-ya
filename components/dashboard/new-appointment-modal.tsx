"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";
import type { Service } from "@/types/app.types";
import { formatCurrency, formatDuration } from "@/lib/utils";
import Modal from "./modal";
import DatePicker from "@/components/booking/date-picker";
import TimeSlotGrid from "@/components/booking/time-slot-grid";

interface Props {
  organizationId: string;
  professionalId: string;
  professionalName: string;
  startISO: string;
  timezone: string;
  services: Service[];
  onClose: () => void;
}

export default function NewAppointmentModal({
  organizationId,
  professionalId,
  professionalName,
  startISO,
  timezone,
  services,
  onClose,
}: Props) {
  const router = useRouter();
  const [proServices, setProServices] = useState<Service[] | null>(null);
  const [loadingServices, setLoadingServices] = useState(true);
  const [serviceId, setServiceId] = useState<string>("");
  const [selectedStartISO, setSelectedStartISO] = useState(startISO);
  const [pickingTime, setPickingTime] = useState(false);
  const [pickedDate, setPickedDate] = useState<Date | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams({ organization_id: organizationId, professional_id: professionalId });
    fetch(`/api/public/services-for-professional?${params}`)
      .then((r) => r.json())
      .then((data: { services?: Service[] }) => setProServices(data.services ?? []))
      .catch(() => setProServices([]))
      .finally(() => setLoadingServices(false));
  }, [professionalId, organizationId]);

  const servicesForSelect = proServices && proServices.length > 0 ? proServices : services;

  useEffect(() => {
    if (!serviceId && servicesForSelect.length > 0) setServiceId(servicesForSelect[0].id);
  }, [servicesForSelect, serviceId]);

  const dateLabel = formatInTimeZone(new Date(selectedStartISO), timezone, "EEEE d 'de' MMMM", { locale: es });
  const timeLabel = formatInTimeZone(new Date(selectedStartISO), timezone, "HH:mm");

  function handlePickTime(time: string) {
    if (!pickedDate) return;
    const [hh, mm] = time.split(":");
    const dateStr = `${pickedDate.getFullYear()}-${String(pickedDate.getMonth() + 1).padStart(2, "0")}-${String(
      pickedDate.getDate()
    ).padStart(2, "0")}`;
    setSelectedStartISO(fromZonedTime(`${dateStr}T${hh}:${mm}:00`, timezone).toISOString());
    setPickingTime(false);
    setPickedDate(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!serviceId) {
      toast.error("Elige un servicio");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professional_id: professionalId,
          service_id: serviceId,
          client_name: clientName,
          client_phone: clientPhone,
          client_email: clientEmail || undefined,
          start_datetime: selectedStartISO,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "No se pudo crear el turno");
      }

      toast.success("Turno cargado");
      router.refresh();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "No se pudo crear el turno");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Nuevo turno" onClose={onClose}>
      {pickingTime ? (
        <div>
          {!pickedDate ? (
            <DatePicker onSelect={setPickedDate} />
          ) : (
            <>
              <button
                onClick={() => setPickedDate(null)}
                className="text-xs text-pizarra-400 hover:text-pizarra-700 mb-2"
              >
                ← Elegir otra fecha
              </button>
              <TimeSlotGrid professionalId={professionalId} serviceId={serviceId} date={pickedDate} onSelect={handlePickTime} />
            </>
          )}
          <button
            onClick={() => setPickingTime(false)}
            className="mt-3 w-full py-2 text-xs text-pizarra-500 hover:text-pizarra-900"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="bg-lila-50 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-pizarra-500">{professionalName}</p>
              <p className="text-sm font-medium text-pizarra-900 capitalize">
                {dateLabel} · {timeLabel} hs
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPickingTime(true)}
              className="text-xs text-lila-600 font-medium hover:underline"
            >
              Cambiar
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-pizarra-700 mb-1">Servicio</label>
            {loadingServices ? (
              <div className="h-9 rounded-lg bg-pizarra-50 animate-pulse" />
            ) : (
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full px-3 py-2 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lila-500"
              >
                {servicesForSelect.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {formatDuration(s.duration_minutes)} · {formatCurrency(s.price)}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-pizarra-700 mb-1">Nombre del cliente</label>
            <input
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lila-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-pizarra-700 mb-1">Teléfono</label>
            <input
              required
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full px-3 py-2 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lila-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-pizarra-700 mb-1">Email (opcional)</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full px-3 py-2 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lila-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-lila-600 text-white text-sm font-medium rounded-lg hover:bg-lila-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Guardando..." : "Cargar turno"}
          </button>
        </form>
      )}
    </Modal>
  );
}
