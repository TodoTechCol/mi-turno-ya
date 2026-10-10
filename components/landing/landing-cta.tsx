import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingCta() {
  return (
    <section className="py-20 bg-pizarra-950 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] bg-lila-500/10 rounded-full blur-[100px]" />
      <div className="relative max-w-2xl mx-auto px-4 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-white">
          Empezá a recibir reservas hoy
        </h2>
        <p className="mt-3 text-pizarra-300">
          Creá tu cuenta gratis. No necesitás tarjeta para probarlo.
        </p>
        <Link
          href="/auth/signup"
          className="group mt-7 inline-flex items-center justify-center gap-1.5 px-7 py-3 bg-lila-600 text-white font-medium rounded-xl hover:bg-lila-700 hover:shadow-lg transition-all"
        >
          Crear mi cuenta gratis
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
