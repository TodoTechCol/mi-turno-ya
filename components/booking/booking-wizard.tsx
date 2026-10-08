"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Organization, Service, Professional, Branch } from "@/types/app.types";
import BranchSelector from "./branch-selector";
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
  branches: Branch[];
  initialServiceId: string | null;
}

type Step = "branch" | "service" | "professional" | "date" | "time" | "client" | "confirm";

const STEP_LABELS: Record<Step, string> = {
  branch: "Sede",
  service: "Servicio",
  professional: "Profesional",
  date: "Fecha",
  time: "Horario",
  client: "Tus datos",
  confirm: "Confirmando...",
};

export default function BookingWizard({
  organization,
  services,
  professionals,
  branches,
  initialServiceId,
}: Props) {
  const router = useRouter();

  // El paso de sede solo existe si hay más de una — un negocio de una
  // sola ubicación no ve ningún cambio respecto a como funcionaba antes.
  // Si además ya venimos de un link directo a UN servicio puntual (desde
  // la portada) y ese servicio pertenece a una sede específica, tampoco
  // hace falta preguntar: se infiere solo (antes esto se saltaba
  // directo a "profesional" SIN resolver la sede en absoluto, bug real
  // reportado por el usuario).
  const hasMultipleBranches = branches.length > 1;
  const initialService = services.find((s) => s.id === initialServiceId) ?? null;
  const needsBranchStep = hasMultipleBranches && !(initialServiceId && initialService?.branch_id);

  const STEPS: Step[] = needsBranchStep
    ? ["branch", "service", "professional", "date", "time", "client"]
    : ["service", "professional", "date", "time", "client"];

  const [step, setStep] = useState<Step>(
    needsBranchStep ? "branch" : initialServiceId ? "professional" : "service"
  );
  const [branchId, setBranchId] = useState<string | null>(
    initialService?.branch_id || (needsBranchStep ? null : branches[0]?.id ?? null)
  );
  const [serviceId, setServiceId] = useState<string | null>(initialServiceId);
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Un servicio/profesional sin sede asignada está disponible en
  // todas — solo se filtra cuando SÍ tiene una sede puntual distinta
  // a la elegida.
  const filteredServices = branchId
    ? services.filter((s) => !s.branch_id || s.branch_id === branchId)
    : services;
  const filteredProfessionals = branchId
    ? professionals.filter((p) => !p.branch_id || p.branch_id === branchId)
    : professionals;

  const selectedService = filteredServices.find((s) => s.id === serviceId) ?? null;
  const selectedProfessional = filteredProfessionals.find((p) => p.id === professionalId) ?? null;

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
        branch_id: branchId || undefined,
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
          {step !== STEPS[0] && step !== "confirm" && (
            <button
              onClick={handleBack}
              className="p-1 -ml-1 rounded-lg text-pizarra-400 hover:text-pizarra-700 hover:bg-pizarra-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-lg font-semibold text-pizarra-900">
            {STEP_LABELS[step]}
          </h2>
        </div>
        <p className="text-xs text-pizarra-400">{organization.name}</p>

        {/* Barra de progreso */}
        {step !== "confirm" && (
          <div className="mt-3 h-1 bg-pizarra-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-lila-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Pasos */}
      {step === "branch" && (
        <BranchSelector
          branches={branches}
          selectedId={branchId}
          onSelect={(id) => {
            setBranchId(id);
            setStep(initialServiceId ? "professional" : "service");
          }}
        />
      )}

      {step === "service" && (
        <ServiceSelector
          services={filteredServices}
          selectedId={serviceId}
          onSelect={(id) => {
            setServiceId(id);
            setStep("professional");
          }}
        />
      )}

      {step === "professional" && selectedService && (
        <ProfessionalSelector
          professionals={filteredProfessionals}
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
        <div className="flex flex-col items-center py-12 text-pizarra-400">
          <div className="w-10 h-10 border-2 border-lila-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm">Confirmando tu turno...</p>
        </div>
      )}
    </div>
  );
}
