"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck, RefreshCw, MapPin } from "lucide-react";

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-pizarra-950">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-lila-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-16 w-96 h-96 bg-lila-400/10 rounded-full blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-24 md:pt-28 md:pb-32 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight max-w-3xl mx-auto"
        >
          La agenda online para tu negocio de turnos
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="mt-5 text-base md:text-lg text-pizarra-300 max-w-xl mx-auto"
        >
          Reservas 24/7, varias sedes y profesionales, y tus clientes pueden reprogramar o
          cancelar solos — sin que atiendas el teléfono.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/auth/signup"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3 bg-lila-600 text-white font-medium rounded-xl hover:bg-lila-700 hover:shadow-lg transition-all"
          >
            Empezar gratis
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/auth/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-pizarra-700 text-white font-medium rounded-xl hover:bg-white/5 transition-colors"
          >
            Iniciar sesión
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3, ease: "easeOut" }}
          className="mt-14 flex flex-wrap items-center justify-center gap-3"
        >
          {[
            { icon: CalendarCheck, label: "Reservas 24/7" },
            { icon: MapPin, label: "Multi-sede" },
            { icon: RefreshCw, label: "Reprogramar sin llamar" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-pizarra-200"
            >
              <Icon className="w-4 h-4 text-lila-400" />
              {label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
