import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingCta() {
  return (
    <section className="py-20 bg-gradient-to-b from-lila-600 to-lila-900 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] bg-white/10 rounded-full blur-[100px]" />
      <div className="relative max-w-2xl mx-auto px-4 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-white">
          Empieza a gestionar y crecer tu negocio hoy
        </h2>
        <p className="mt-3 text-lila-100">
          Mi Turno Ya cuida tu tiempo, gestiona tus clientes y te da reportes de ingresos, para que tú te dediques a atenderlos.
        </p>
        <Link
          href="/auth/signup"
          className="group mt-7 inline-flex items-center justify-center gap-1.5 px-7 py-3 bg-white text-lila-700 font-medium rounded-xl hover:bg-lila-50 hover:shadow-lg transition-all"
        >
          Crear mi cuenta gratis
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
