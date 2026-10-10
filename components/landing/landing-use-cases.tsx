import { Scissors, Sparkles, Stethoscope, Dumbbell } from "lucide-react";

const USE_CASES = [
  { icon: Scissors, label: "Barberías y peluquerías" },
  { icon: Sparkles, label: "Spas y centros de estética" },
  { icon: Stethoscope, label: "Consultorios y profesionales" },
  { icon: Dumbbell, label: "Estudios y entrenadores" },
];

export default function LandingUseCases() {
  return (
    <section className="py-14 border-b border-pizarra-100">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-center text-sm font-medium text-pizarra-400 mb-8">
          Pensado para cualquier negocio que agenda turnos
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {USE_CASES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center text-center gap-2.5 p-5 rounded-xl hover:bg-pizarra-50 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-lila-50 flex items-center justify-center">
                <Icon className="w-5 h-5 text-lila-600" />
              </div>
              <p className="text-sm font-medium text-pizarra-700">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
