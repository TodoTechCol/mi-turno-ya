import Link from "next/link";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanFeature {
  label: string;
  included: boolean;
}

const BASICO: PlanFeature[] = [
  { label: "30 reservas mensuales", included: true },
  { label: "Profesionales ilimitados", included: true },
  { label: "1 sede", included: true },
  { label: "0% comisión de ventas", included: true },
  { label: "Notificaciones por email", included: true },
  { label: "Agregar a Google Calendar / .ics", included: true },
  { label: "Reprogramar y cancelar sin llamar", included: true },
  { label: "Logo y marca propia", included: false },
  { label: "Sedes ilimitadas", included: false },
  { label: "Soporte prioritario", included: false },
];

const PREMIUM: PlanFeature[] = [
  { label: "Reservas ilimitadas", included: true },
  { label: "Profesionales ilimitados", included: true },
  { label: "Sedes ilimitadas", included: true },
  { label: "0% comisión de ventas", included: true },
  { label: "Todo lo del plan Básico", included: true },
  { label: "Logo y marca propia del negocio", included: true },
  { label: "Reportes por sede", included: true },
  { label: "Soporte prioritario", included: true },
];

export default function LandingPricing() {
  return (
    <section id="precios" className="py-20 bg-pizarra-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-pizarra-900">
            Precios simples, sin comisión
          </h2>
          <p className="mt-3 text-pizarra-500">
            Empezá gratis. Pasá a Premium cuando tu negocio lo necesite.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Básico */}
          <div className="bg-white rounded-2xl border border-pizarra-100 p-7">
            <h3 className="font-semibold text-pizarra-900">Básico</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-4xl font-semibold text-pizarra-900">$0</span>
              <span className="text-sm text-pizarra-400">/mes</span>
            </div>
            <p className="mt-2 text-sm text-pizarra-500">Perfecto para empezar y probar sin riesgo.</p>

            <ul className="mt-6 space-y-3">
              {BASICO.map(({ label, included }) => (
                <PlanFeatureRow key={label} label={label} included={included} />
              ))}
            </ul>

            <Link
              href="/auth/signup"
              className="mt-7 block text-center py-2.5 border border-pizarra-200 text-pizarra-700 font-medium rounded-lg hover:bg-pizarra-50 transition-colors"
            >
              Empezar gratis
            </Link>
          </div>

          {/* Premium */}
          <div className="bg-pizarra-950 rounded-2xl p-7 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-lila-500/20 rounded-full blur-3xl" />
            <span className="relative inline-block bg-lila-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3">
              Más elegido
            </span>
            <h3 className="relative font-semibold text-white">Premium</h3>
            <div className="relative mt-3 flex items-baseline gap-1">
              <span className="font-display text-4xl font-semibold text-white">$13.99</span>
              <span className="text-sm text-pizarra-400">USD/mes</span>
            </div>
            <p className="relative mt-2 text-sm text-pizarra-300">
              Todo lo que necesitás para llenar tu agenda todos los días.
            </p>

            <ul className="relative mt-6 space-y-3">
              {PREMIUM.map(({ label, included }) => (
                <PlanFeatureRow key={label} label={label} included={included} dark />
              ))}
            </ul>

            <Link
              href="/auth/signup"
              className="relative mt-7 block text-center py-2.5 bg-lila-600 text-white font-medium rounded-lg hover:bg-lila-700 transition-colors"
            >
              Empezar con Premium
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}

function PlanFeatureRow({ label, included, dark }: { label: string; included: boolean; dark?: boolean }) {
  return (
    <li className="flex items-center gap-2.5 text-sm">
      {included ? (
        <Check className={cn("w-4 h-4 shrink-0", dark ? "text-lila-400" : "text-lila-600")} />
      ) : (
        <X className="w-4 h-4 shrink-0 text-pizarra-300" />
      )}
      <span
        className={cn(
          included ? (dark ? "text-pizarra-100" : "text-pizarra-700") : dark ? "text-pizarra-500" : "text-pizarra-300"
        )}
      >
        {label}
      </span>
    </li>
  );
}
