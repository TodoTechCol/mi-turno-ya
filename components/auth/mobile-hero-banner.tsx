"use client";

import { motion } from "framer-motion";
import { CalendarCheck, Clock } from "lucide-react";

/**
 * Versión mobile del panel de marca — en desktop el hero vive en el
 * panel oscuro de la izquierda (hidden en mobile), así que acá armamos
 * un banner superior equivalente: logo + tagline + un par de chips
 * flotantes a escala reducida, con el mismo lenguaje visual.
 */
export default function MobileHeroBanner() {
  return (
    <div className="lg:hidden relative overflow-hidden bg-pizarra-950 rounded-b-[2.5rem] pt-10 pb-14 px-6">
      {/* Glow decorativo */}
      <div className="absolute -top-16 -left-16 w-56 h-56 bg-lila-500/25 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-10 w-56 h-56 bg-lila-400/15 rounded-full blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Chips flotantes — a escala mobile */}
      <motion.div
        className="absolute top-6 right-6"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="bg-white rounded-xl shadow-lg px-2.5 py-1.5 flex items-center gap-1.5">
          <CalendarCheck className="w-3.5 h-3.5 text-status-success" />
          <span className="text-[11px] font-semibold text-pizarra-900 whitespace-nowrap">Listo ✓</span>
        </div>
      </motion.div>
      <motion.div
        className="absolute bottom-7 left-6"
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      >
        <div className="bg-lila-500/90 backdrop-blur-sm rounded-full shadow-lg px-3 py-1.5 flex items-center gap-1">
          <Clock className="w-3 h-3 text-white" />
          <span className="text-[11px] font-semibold text-white">15:30</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative flex flex-col items-center text-center"
      >
        <div className="w-16 h-16 bg-white rounded-2xl p-3 mb-4 shadow-[0_0_30px_rgba(124,102,220,0.4)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mi-turno-ya-icon.png" alt="Mi Turno Ya" className="w-full h-full object-contain" />
        </div>
        <h2 className="font-display text-xl font-semibold text-white mb-1">Tu tiempo manda.</h2>
        <p className="text-pizarra-400 text-xs max-w-[220px]">
          Te agendás, te recuerdan y te atienden sin esperar.
        </p>
      </motion.div>
    </div>
  );
}
