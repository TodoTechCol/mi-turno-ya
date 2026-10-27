import { UserPlus, Users2, Link2, LayoutDashboard } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    title: "Crea tu cuenta",
    description: "Registra tu negocio en minutos. Queda pendiente de una revisión rápida antes de activarse.",
  },
  {
    icon: Users2,
    title: "Carga tu equipo",
    description: "Agrega tus profesionales, servicios, horarios y sedes.",
  },
  {
    icon: Link2,
    title: "Comparte tu link",
    description: "Tu página de reserva queda lista en miturnoya.org/tu-negocio.",
  },
  {
    icon: LayoutDashboard,
    title: "Gestiona todo",
    description: "Mira y administra tus turnos del día, la semana o el mes desde tu panel.",
  },
];

export default function LandingHowItWorks() {
  return (
    <section id="como-funciona" className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-pizarra-900">Cómo funciona</h2>
          <p className="mt-3 text-pizarra-500">De cero a recibiendo reservas en el mismo día.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map(({ icon: Icon, title, description }, i) => (
            <div key={title} className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-lila-500 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-display text-2xl font-semibold text-pizarra-200">
                  0{i + 1}
                </span>
              </div>
              <h3 className="font-semibold text-pizarra-900 text-sm">{title}</h3>
              <p className="mt-1.5 text-xs text-pizarra-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
