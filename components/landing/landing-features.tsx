import {
  CalendarCheck,
  MapPin,
  Users,
  RefreshCw,
  Mail,
  ImagePlus,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "Reservas online 24/7",
    description: "Tus clientes reservan solos desde el navegador, sin llamadas ni mensajes de ida y vuelta.",
  },
  {
    icon: MapPin,
    title: "Multi-sede",
    description: "Gestioná varias sucursales, cada una con sus propios profesionales, servicios y horarios.",
  },
  {
    icon: Users,
    title: "Profesionales y servicios",
    description: "Cargá tu equipo, qué servicio ofrece cada uno y su horario de atención.",
  },
  {
    icon: RefreshCw,
    title: "Reprogramar y cancelar solos",
    description: "Cada cliente recibe un link propio para cambiar o cancelar su turno sin que vos hagas nada.",
  },
  {
    icon: Mail,
    title: "Notificaciones automáticas",
    description: "Vos y tu cliente reciben un email apenas se reserva, cancela o reprograma un turno.",
  },
  {
    icon: ImagePlus,
    title: "Tu marca, tu logo",
    description: "Subí el logo de tu negocio para que tus clientes lo reconozcan en la página de reserva.",
  },
  {
    icon: BarChart3,
    title: "Panel con reportes",
    description: "Mirá tus turnos por día, semana o mes, y el rendimiento de cada sede.",
  },
  {
    icon: ShieldCheck,
    title: "Cuentas verificadas",
    description: "Cada negocio nuevo pasa una revisión antes de salir a producción — nada de cuentas trucho.",
  },
];

export default function LandingFeatures() {
  return (
    <section id="funcionalidades" className="py-20 bg-pizarra-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-pizarra-900">
            Todo lo que necesitás para llenar tu agenda
          </h2>
          <p className="mt-3 text-pizarra-500">
            Sin planillas, sin cuadernos, sin perder turnos por no atender el teléfono a tiempo.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-pizarra-100 p-5 hover:shadow-md hover:border-lila-200 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-lila-50 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-lila-600" />
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
