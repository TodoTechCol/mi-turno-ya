"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    question: "¿Necesito tarjeta para el plan gratis?",
    answer: "No. El plan Básico es gratis y no vence — podés usarlo todo el tiempo que quieras.",
  },
  {
    question: "¿Mis clientes necesitan instalar una app?",
    answer: "No. Reservan desde el navegador, en la página de tu negocio, sin descargar nada.",
  },
  {
    question: "¿Puedo tener más de una sede?",
    answer: "Sí. En el plan Básico podés tener 1 sede; en Premium, todas las que necesites.",
  },
  {
    question: "¿Cómo paso del plan Básico a Premium?",
    answer: "Todavía no hay upgrade automático desde el panel — contactanos y lo activamos en tu cuenta.",
  },
  {
    question: "¿Qué pasa si un cliente quiere cambiar su turno?",
    answer:
      "Cada confirmación de turno incluye un link donde el cliente puede reprogramar o cancelar por su cuenta, sin que vos tengas que hacer nada.",
  },
  {
    question: "¿Cuánto tarda en activarse mi cuenta?",
    answer:
      "Cada negocio nuevo pasa por una revisión rápida de nuestro equipo antes de poder recibir reservas — te avisamos por email apenas quede aprobada.",
  },
];

export default function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-pizarra-900">
            Preguntas frecuentes
          </h2>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={faq.question} className="border border-pizarra-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-pizarra-50 transition-colors"
                >
                  <span className="text-sm font-medium text-pizarra-900">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-pizarra-400 shrink-0 transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-pizarra-500 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
