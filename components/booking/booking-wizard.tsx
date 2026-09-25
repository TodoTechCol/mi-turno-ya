"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Organization, Service, Professional } from "@/types/app.types";
import ServiceSelector from "./service-selector";
import ProfessionalSelector from "./professional-selector";
import DatePicker from "./date-picker";
import TimeSlotGrid from "./time-slot-grid";
import ClientForm from "./client-form";
import type { ClientFormValues } from "@/schemas/booking.schema";
import { format, addMinutes } from "date-fns";
import { ChevronLeft } from "lucide-react";

interface Props {
  organization: Organization;
  services: Service[];
  professionals: Professional[];
  initialServiceId: string | null;
}

type Step = "service" | "professional" | "date" | "time" | "client" | "confirm";

const STEP_LABELS: Record<Step, string> = {
  service: "Servicio",
  professional: "Profesional",
  date: "Fecha",
  time: "Horario",
  client: "Tus datos",
  confirm: "Confirmando...",
};

const STEPS: Step[] = ["service", "professional", "date", "time", "client"];

export default function BookingWizard({
  organization,
  services,
  professionals,
  initialServiceId,
}: Props) {
  const router = useRouter();

  const [step, setStep] = useState<Step>(initialServiceId ? "professional" : "service");
  const [serviceId, setServiceId] = useState<string | null>(initialServiceId);
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedService = services.find((s) => s.id === serviceId) ?? null;
  const selectedProfessional = professionals.find((p) => p.id === professionalId) ?? null;

  const currentStepIndex = STEPS.indexOf(step);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  function handleBack() {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }

  async function handleSubmit(clientData: ClientFormValues) {
    if (!serviceId || !professionalId || !date || !time || !selectedService) return;

    setSubmitting(true);
    setStep("confirm");

    try {
      const [hh, mm] = time.split(":").map(Number);
      const startDt = new Date(date);
      startDt.setHours(hh, mm, 0, 0);

      const body = {
        organization_id: organization.id,
        professional_id: professionalId,
        service_id: serviceId,
        client_name: clientData.client_name,
        client_phone: clientData.client_phone,
        client_email: clientData.client_email || undefined,
        start_datetime: startDt.toISOString(),
        notes: clientData.notes || undefined,
      };

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Error al reservar");
      }

      const dateStr = format(date, "yyyy-MM-dd");
      router.push(
        `/${organization.slug}/confirmation?date=${dateStr}&time=${time}&service=${encodeURIComponent(selectedService.name)}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo confirmar el turno";
      toast.error(msg);
      setStep("client");
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Header con progreso */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          {step !== "service" && step !== "confirm" && (
            <button
              onClick={handleBack}
              className="p-1 -ml-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-lg font-semibold text-gray-900">
            {STEP_LABELS[step]}
          </h2>
        </div>
        <p className="text-xs text-gray-400">{organization.name}</p>

        {/* Barra de progreso */}
        {step !== "confirm" && (
          <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Pasos */}
      {step === "service" && (
        <ServiceSelector
          services={services}
          selectedId={serviceId}
          onSelect={(id) => {
            setServiceId(id);
            setStep("professional");
          }}
        />
      )}

      {step === "professional" && selectedService && (
        <ProfessionalSelector
          professionals={professionals}
          serviceId={selectedService.id}
          organizationId={organization.id}
          selectedId={professionalId}
          onSelect={(id) => {
            setProfessionalId(id);
            setStep("date");
          }}
        />
      )}

      {step === "date" && (
        <DatePicker
          onSelect={(d) => {
            setDate(d);
            setStep("time");
          }}
        />
      )}

      {step === "time" && selectedService && professionalId && date && (
        <TimeSlotGrid
          professionalId={professionalId}
          serviceId={selectedService.id}
          date={date}
          onSelect={(t) => {
            setTime(t);
            setStep("client");
          }}
        />
      )}

      {step === "client" && (
        <ClientForm
          service={selectedService}
          professional={selectedProfessional}
          date={date}
          time={time}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}

      {step === "confirm" && (
        <div className="flex flex-col items-center py-12 text-gray-400">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm">Confirmando tu turno...</p>
        </div>
      )}
    </div>
  );
}
