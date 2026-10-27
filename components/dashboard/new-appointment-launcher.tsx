"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Professional, Service } from "@/types/app.types";
import Modal from "./modal";
import NewAppointmentModal from "./new-appointment-modal";

interface Props {
  organizationId: string;
  professionals: Professional[];
  services: Service[];
  timezone: string;
}

// Hora de inicio por defecto al abrir el modal: ahora, redondeada a
// los próximos 15 min — el admin igual puede cambiarla desde
// "Cambiar" dentro de NewAppointmentModal.
function defaultStartISO(): string {
  const now = new Date();
  const roundedMs = Math.ceil(now.getTime() / (15 * 60 * 1000)) * 15 * 60 * 1000;
  return new Date(roundedMs).toISOString();
}

export default function NewAppointmentLauncher({ organizationId, professionals, services, timezone }: Props) {
  const [picking, setPicking] = useState(false);
  const [professionalId, setProfessionalId] = useState<string | null>(null);

  const activePros = professionals.filter((p) => p.is_active);
  if (activePros.length === 0) return null;

  function openPicker() {
    setProfessionalId(activePros.length === 1 ? activePros[0].id : null);
    setPicking(true);
  }

  function closeAll() {
    setPicking(false);
    setProfessionalId(null);
  }

  const chosenPro = activePros.find((p) => p.id === professionalId);

  return (
    <>
      <button
        onClick={openPicker}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-lila-600 text-white text-sm font-medium rounded-lg hover:bg-lila-700 transition-colors shrink-0"
      >
        <Plus className="w-4 h-4" />
        Nuevo turno
      </button>

      {picking && !chosenPro && (
        <Modal title="¿Para qué profesional?" onClose={closeAll}>
          <div className="space-y-1.5">
            {activePros.map((p) => (
              <button
                key={p.id}
                onClick={() => setProfessionalId(p.id)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-pizarra-700 hover:bg-lila-50 hover:text-lila-700 transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {picking && chosenPro && (
        <NewAppointmentModal
          organizationId={organizationId}
          professionalId={chosenPro.id}
          professionalName={chosenPro.name}
          startISO={defaultStartISO()}
          timezone={timezone}
          services={services}
          onClose={closeAll}
        />
      )}
    </>
  );
}
